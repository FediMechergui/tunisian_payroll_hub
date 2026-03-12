// ============================================================================
// PayrollHub — Loans Management Page
// Create, track and manage employee loans
// ============================================================================

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { loansApi, employeesApi } from "@/lib/api";
import type { Loan, Employe } from "@shared/types";
import { LoanStatus, UserRole } from "@shared/types";
import { LOAN_MOTIFS, ROLE_HIERARCHY } from "@shared/const";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  Plus,
  Ban,
  Loader2,
  Users,
  TrendingDown,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  [LoanStatus.EN_ATTENTE]: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  [LoanStatus.EN_COURS]: { label: "En cours", color: "bg-blue-100 text-blue-700" },
  [LoanStatus.REMBOURSE]: { label: "Remboursé", color: "bg-emerald-100 text-emerald-700" },
  [LoanStatus.ANNULE]: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

function fmt(n: number): string {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const userLevel = ROLE_HIERARCHY[user?.role as keyof typeof ROLE_HIERARCHY] || 0;
  const isAdmin = userLevel >= ROLE_HIERARCHY[UserRole.ADMIN_RH];

  const [form, setForm] = useState({
    employeId: "",
    montantTotal: "",
    nbMensualites: "",
    motif: LOAN_MOTIFS[0] as string,
    dateDebut: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loansRes, empsRes] = await Promise.all([
        loansApi.list(),
        isAdmin ? employeesApi.list() : Promise.resolve(null),
      ]);
      if (loansRes.data.success && loansRes.data.data) {
        setLoans(loansRes.data.data as Loan[]);
      }
      if (empsRes?.data?.success && empsRes.data.data) {
        const empData = empsRes.data.data;
        setEmployees(Array.isArray(empData) ? empData : (empData as any).items || []);
      }
    } catch (err) {
      console.error("Failed to load loans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.employeId || !form.montantTotal || !form.nbMensualites) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setCreating(true);
    try {
      const res = await loansApi.create({
        employeId: form.employeId,
        montantTotal: parseFloat(form.montantTotal),
        nbMensualites: parseInt(form.nbMensualites),
        motif: form.motif,
        dateDebut: form.dateDebut,
      });
      if (res.data.success) {
        toast.success("Prêt créé avec succès");
        setDialogOpen(false);
        setForm({
          employeId: "",
          montantTotal: "",
          nbMensualites: "",
          motif: LOAN_MOTIFS[0] as string,
          dateDebut: new Date().toISOString().slice(0, 10),
        });
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la création du prêt");
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await loansApi.updateStatus(id, LoanStatus.ANNULE);
      if (res.data.success) {
        toast.success("Prêt annulé");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'annulation");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await loansApi.updateStatus(id, LoanStatus.EN_COURS);
      if (res.data.success) {
        toast.success("Prêt approuvé");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'approbation");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await loansApi.updateStatus(id, LoanStatus.ANNULE);
      if (res.data.success) {
        toast.success("Demande rejetée");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors du rejet");
    }
  };

  const getEmployeeName = (employeId: string) => {
    const emp = employees.find((e) => e.id === employeId);
    return emp ? `${emp.prenom} ${emp.nom}` : employeId;
  };

  // Stats
  const pendingLoans = loans.filter((l) => l.statut === LoanStatus.EN_ATTENTE);
  const activeLoans = loans.filter((l) => l.statut === LoanStatus.EN_COURS);
  const totalEnCours = activeLoans.reduce((s, l) => s + l.soldeRestant, 0);
  const totalRembourse = loans
    .filter((l) => l.statut === LoanStatus.REMBOURSE)
    .reduce((s, l) => s + l.montantTotal, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white rounded-xl border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prêts & Avances</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestion des prêts et avances sur salaire des employés
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus size={16} />
                Nouveau Prêt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un Prêt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Employé *</Label>
                  <Select
                    value={form.employeId}
                    onValueChange={(v) => setForm({ ...form, employeId: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.prenom} {emp.nom} — {emp.poste}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Montant total (TND) *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min={0}
                      value={form.montantTotal}
                      onChange={(e) => setForm({ ...form, montantTotal: e.target.value })}
                      placeholder="1000.000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nb mensualités *</Label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={form.nbMensualites}
                      onChange={(e) => setForm({ ...form, nbMensualites: e.target.value })}
                      placeholder="12"
                      className="mt-1"
                    />
                  </div>
                </div>
                {form.montantTotal && form.nbMensualites && (
                  <p className="text-sm text-slate-500">
                    Mensualité estimée :{" "}
                    <span className="font-semibold text-slate-700">
                      {fmt(parseFloat(form.montantTotal) / parseInt(form.nbMensualites))} TND
                    </span>
                  </p>
                )}
                <div>
                  <Label>Motif *</Label>
                  <Select
                    value={form.motif}
                    onValueChange={(v) => setForm({ ...form, motif: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_MOTIFS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date de début *</Label>
                  <Input
                    type="date"
                    value={form.dateDebut}
                    onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le prêt"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <Wallet size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total prêts</p>
              <p className="text-lg font-bold text-slate-900">{loans.length}</p>
            </div>
          </CardContent>
        </Card>
        {pendingLoans.length > 0 && (
          <Card className="border-0 shadow-sm ring-2 ring-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">En attente</p>
                <p className="text-lg font-bold text-amber-600">{pendingLoans.length}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">En cours</p>
              <p className="text-lg font-bold text-slate-900">{activeLoans.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Solde restant</p>
              <p className="text-lg font-bold text-slate-900">{fmt(totalEnCours)} TND</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total remboursé</p>
              <p className="text-lg font-bold text-slate-900">{fmt(totalRembourse)} TND</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      {loans.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">Aucun prêt enregistré</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left p-3 text-slate-500 font-medium">Employé</th>
                    <th className="text-left p-3 text-slate-500 font-medium">Motif</th>
                    <th className="text-right p-3 text-slate-500 font-medium">Montant</th>
                    <th className="text-right p-3 text-slate-500 font-medium">Mensualité</th>
                    <th className="text-right p-3 text-slate-500 font-medium">Remboursé</th>
                    <th className="text-right p-3 text-slate-500 font-medium">Restant</th>
                    <th className="text-center p-3 text-slate-500 font-medium">Progrès</th>
                    <th className="text-center p-3 text-slate-500 font-medium">Statut</th>
                    {isAdmin && <th className="text-center p-3 text-slate-500 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => {
                    const progress =
                      loan.montantTotal > 0
                        ? Math.round((loan.montantRembourse / loan.montantTotal) * 100)
                        : 0;
                    const statusInfo = STATUS_LABELS[loan.statut] || STATUS_LABELS[LoanStatus.EN_COURS];
                    return (
                      <tr key={loan.id} className="border-b last:border-0 hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-800">
                          {isAdmin ? getEmployeeName(loan.employeId) : "—"}
                        </td>
                        <td className="p-3 text-slate-600">{loan.motif}</td>
                        <td className="p-3 text-right font-mono text-slate-800">
                          {fmt(loan.montantTotal)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600">
                          {fmt(loan.montantMensuel)}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600">
                          {fmt(loan.montantRembourse)}
                        </td>
                        <td className="p-3 text-right font-mono text-red-600 font-semibold">
                          {fmt(loan.soldeRestant)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={`text-xs ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {loan.statut === LoanStatus.EN_ATTENTE && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 px-2"
                                    onClick={() => handleApprove(loan.id)}
                                  >
                                    <ThumbsUp size={14} className="mr-1" />
                                    Approuver
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                    onClick={() => handleReject(loan.id)}
                                  >
                                    <ThumbsDown size={14} className="mr-1" />
                                    Rejeter
                                  </Button>
                                </>
                              )}
                              {loan.statut === LoanStatus.EN_COURS && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                  onClick={() => handleCancel(loan.id)}
                                >
                                  <Ban size={14} className="mr-1" />
                                  Annuler
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
