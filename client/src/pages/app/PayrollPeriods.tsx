// ============================================================================
// PayrollHub — Payroll Periods Page
// List all pay periods, create new ones, navigate to details
// ============================================================================

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { payrollApi } from "@/lib/api";
import type { PeriodePaie } from "@shared/types";
import { PayPeriodStatus } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Calendar,
  Loader2,
  ChevronRight,
  Wallet,
  Clock,
  CheckCircle2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const statusConfig: Record<PayPeriodStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  [PayPeriodStatus.EN_COURS]: { label: "En cours", variant: "secondary", icon: <Clock size={14} /> },
  [PayPeriodStatus.CALCULEE]: { label: "Calculée", variant: "default", icon: <AlertCircle size={14} /> },
  [PayPeriodStatus.VALIDEE]: { label: "Validée", variant: "outline", icon: <CheckCircle2 size={14} /> },
  [PayPeriodStatus.FINALISEE]: { label: "Finalisée", variant: "destructive", icon: <Lock size={14} /> },
};

export default function PayrollPeriods() {
  const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMois, setNewMois] = useState<number>(new Date().getMonth() + 1);
  const [newAnnee, setNewAnnee] = useState<number>(new Date().getFullYear());
  const [, navigate] = useLocation();

  const fetchPeriodes = async () => {
    try {
      const { data } = await payrollApi.listPeriodes();
      if (data.success && data.data) setPeriodes(data.data);
    } catch {
      toast.error("Erreur lors du chargement des périodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPeriodes(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      // Calculate dates
      const dateDebut = `${newAnnee}-${String(newMois).padStart(2, "0")}-01`;
      const lastDay = new Date(newAnnee, newMois, 0).getDate();
      const dateFin = `${newAnnee}-${String(newMois).padStart(2, "0")}-${lastDay}`;

      const { data } = await payrollApi.createPeriode({
        mois: newMois,
        annee: newAnnee,
        dateDebut,
        dateFin,
      });

      if (data.success && data.data) {
        toast.success(`Période ${MOIS_LABELS[newMois - 1]} ${newAnnee} créée`);
        setDialogOpen(false);
        fetchPeriodes();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-blue-600" size={28} />
            Gestion de la Paie
          </h1>
          <p className="text-slate-500 mt-1">Périodes de paie, calcul et bulletins</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Nouvelle Période
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Période de Paie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mois</Label>
                  <Select value={String(newMois)} onValueChange={(v) => setNewMois(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOIS_LABELS.map((m, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Année</Label>
                  <Input
                    type="number"
                    value={newAnnee}
                    onChange={(e) => setNewAnnee(Number(e.target.value))}
                    min={2020}
                    max={2100}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {creating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                Créer la période
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Périodes", value: periodes.length, color: "blue" },
          { label: "En Cours", value: periodes.filter((p) => p.statut === PayPeriodStatus.EN_COURS).length, color: "amber" },
          { label: "Calculées", value: periodes.filter((p) => p.statut === PayPeriodStatus.CALCULEE).length, color: "indigo" },
          { label: "Finalisées", value: periodes.filter((p) => p.statut === PayPeriodStatus.FINALISEE).length, color: "green" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period list */}
      {periodes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-slate-300" size={48} />
            <p className="text-slate-500 mt-4">Aucune période de paie</p>
            <p className="text-sm text-slate-400">Créez votre première période pour commencer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {periodes.map((p) => {
            const cfg = statusConfig[p.statut];
            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
                onClick={() => navigate(`/app/paie/${p.id}`)}
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Calendar className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {MOIS_LABELS[p.mois - 1]} {p.annee}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {p.dateDebut} → {p.dateFin}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={cfg.variant} className="flex items-center gap-1">
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                    <ChevronRight className="text-slate-400" size={20} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
