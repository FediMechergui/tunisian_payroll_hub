// ============================================================================
// PayrollHub — Leave Management Page
// List, create, approve/reject leave requests
// ============================================================================

import { useEffect, useState } from "react";
import { congesApi, employeesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Conge, Employe } from "@shared/types";
import { LeaveType, LeaveStatus, UserRole } from "@shared/types";
import { ROLE_HIERARCHY } from "@shared/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  XCircle,
  Ban,
  Calendar,
  Umbrella,
  Stethoscope,
  Baby,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.CONGE_PAYE]: "Congé payé",
  [LeaveType.MALADIE]: "Maladie",
  [LeaveType.MATERNITE]: "Maternité",
  [LeaveType.PATERNITE]: "Paternité",
  [LeaveType.SANS_SOLDE]: "Sans solde",
  [LeaveType.EXCEPTIONNEL]: "Exceptionnel",
};

const LEAVE_TYPE_ICONS: Record<LeaveType, React.ReactNode> = {
  [LeaveType.CONGE_PAYE]: <Umbrella size={14} />,
  [LeaveType.MALADIE]: <Stethoscope size={14} />,
  [LeaveType.MATERNITE]: <Baby size={14} />,
  [LeaveType.PATERNITE]: <Baby size={14} />,
  [LeaveType.SANS_SOLDE]: <AlertCircle size={14} />,
  [LeaveType.EXCEPTIONNEL]: <Calendar size={14} />,
};

const STATUS_CONFIG: Record<LeaveStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  [LeaveStatus.EN_ATTENTE]: { label: "En attente", variant: "secondary", icon: <Clock size={12} /> },
  [LeaveStatus.APPROUVE]: { label: "Approuvé", variant: "default", icon: <CheckCircle2 size={12} /> },
  [LeaveStatus.REJETE]: { label: "Rejeté", variant: "destructive", icon: <XCircle size={12} /> },
  [LeaveStatus.ANNULE]: { label: "Annulé", variant: "outline", icon: <Ban size={12} /> },
};

type EnrichedConge = Conge & {
  employe?: { nom: string; prenom: string; departement: string; poste: string };
};

export default function Leaves() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conges, setConges] = useState<EnrichedConge[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeId: "",
    typeConge: LeaveType.CONGE_PAYE as string,
    dateDebut: "",
    dateFin: "",
    nbJours: 0,
    motif: "",
  });

  // Balance
  const [balance, setBalance] = useState<{
    droitAnnuel: number;
    consomme: number;
    enAttente: number;
    solde: number;
  } | null>(null);

  const isManager =
    (ROLE_HIERARCHY[user?.role as keyof typeof ROLE_HIERARCHY] || 0) >=
    (ROLE_HIERARCHY[UserRole.MANAGER as keyof typeof ROLE_HIERARCHY] || 0);

  const isEmployee = user?.role === UserRole.EMPLOYE;

  const fetchData = async () => {
    try {
      const [congesRes, empRes] = await Promise.all([
        congesApi.list(),
        isManager ? employeesApi.list() : Promise.resolve(null),
      ]);

      if (congesRes.data.success && congesRes.data.data) {
        setConges(congesRes.data.data);
      }
      if (empRes?.data?.success && empRes.data.data) {
        setEmployes(empRes.data.data.items || []);
      }

      // Load balance for self-service
      if (user?.employeId) {
        const balRes = await congesApi.getBalance(
          user.employeId,
          new Date().getFullYear()
        );
        if (balRes.data.success && balRes.data.data) {
          setBalance(balRes.data.data);
        }
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-compute nbJours
  useEffect(() => {
    if (newLeave.dateDebut && newLeave.dateFin) {
      const start = new Date(newLeave.dateDebut);
      const end = new Date(newLeave.dateFin);
      if (end >= start) {
        let days = 0;
        const d = new Date(start);
        while (d <= end) {
          const dow = d.getDay();
          if (dow !== 0 && dow !== 6) days++; // exclude weekends
          d.setDate(d.getDate() + 1);
        }
        setNewLeave((prev) => ({ ...prev, nbJours: days }));
      }
    }
  }, [newLeave.dateDebut, newLeave.dateFin]);

  const handleCreate = async () => {
    if (!newLeave.employeId || !newLeave.dateDebut || !newLeave.dateFin) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setCreating(true);
    try {
      const res = await congesApi.create({
        employeId: newLeave.employeId,
        typeConge: newLeave.typeConge,
        dateDebut: newLeave.dateDebut,
        dateFin: newLeave.dateFin,
        nbJours: newLeave.nbJours,
        motif: newLeave.motif || undefined,
      });
      if (res.data.success) {
        toast.success("Demande de congé créée");
        setCreateOpen(false);
        setNewLeave({
          employeId: isEmployee && user?.employeId ? user.employeId : "",
          typeConge: LeaveType.CONGE_PAYE,
          dateDebut: "",
          dateFin: "",
          nbJours: 0,
          motif: "",
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await congesApi.updateStatut(id, "approuve");
      toast.success("Congé approuvé");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await congesApi.updateStatut(id, "rejete");
      toast.success("Congé rejeté");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await congesApi.cancel(id);
      toast.success("Congé annulé");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const filtered =
    filterStatus === "all"
      ? conges
      : conges.filter((c) => c.statut === filterStatus);

  const pendingCount = conges.filter(
    (c) => c.statut === LeaveStatus.EN_ATTENTE
  ).length;
  const approvedCount = conges.filter(
    (c) => c.statut === LeaveStatus.APPROUVE
  ).length;

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
          <h1 className="text-2xl font-bold text-slate-900">
            Gestion des Congés
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isManager
              ? "Gérez les demandes de congé de votre équipe"
              : "Consultez et demandez vos congés"}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (isEmployee && user?.employeId) {
                  setNewLeave((prev) => ({
                    ...prev,
                    employeId: user.employeId!,
                  }));
                }
              }}
            >
              <Plus size={16} className="mr-2" /> Nouvelle Demande
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Demande de Congé</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une demande de congé.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {isManager && (
                <div>
                  <Label>Employé *</Label>
                  <Select
                    value={newLeave.employeId}
                    onValueChange={(v) =>
                      setNewLeave((prev) => ({ ...prev, employeId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employes.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.prenom} {e.nom} — {e.departement}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Type de congé *</Label>
                <Select
                  value={newLeave.typeConge}
                  onValueChange={(v) =>
                    setNewLeave((prev) => ({ ...prev, typeConge: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date début *</Label>
                  <Input
                    type="date"
                    value={newLeave.dateDebut}
                    onChange={(e) =>
                      setNewLeave((prev) => ({
                        ...prev,
                        dateDebut: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Date fin *</Label>
                  <Input
                    type="date"
                    value={newLeave.dateFin}
                    min={newLeave.dateDebut}
                    onChange={(e) =>
                      setNewLeave((prev) => ({
                        ...prev,
                        dateFin: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>
                  Nombre de jours ouvrés:{" "}
                  <span className="font-bold text-blue-600">
                    {newLeave.nbJours}
                  </span>
                </Label>
              </div>
              <div>
                <Label>Motif (optionnel)</Label>
                <Input
                  value={newLeave.motif}
                  onChange={(e) =>
                    setNewLeave((prev) => ({ ...prev, motif: e.target.value }))
                  }
                  placeholder="Raison de la demande..."
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <CalendarDays size={16} className="mr-2" />
                )}
                Soumettre la Demande
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats & Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <p className="text-xs text-slate-500">En attente</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {pendingCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <p className="text-xs text-slate-500">Approuvés</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {approvedCount}
            </p>
          </CardContent>
        </Card>
        {balance && (
          <>
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <Umbrella size={16} className="text-blue-500" />
                  <p className="text-xs text-slate-500">Solde congés payés</p>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {balance.solde} <span className="text-sm font-normal">jours</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <p className="text-xs text-slate-500">Droit annuel</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {balance.droitAnnuel}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    (consommé: {balance.consomme})
                  </span>
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filterStatus}
        onValueChange={setFilterStatus}
      >
        <TabsList>
          <TabsTrigger value="all">
            Tous ({conges.length})
          </TabsTrigger>
          <TabsTrigger value={LeaveStatus.EN_ATTENTE}>
            En attente ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value={LeaveStatus.APPROUVE}>
            Approuvés ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value={LeaveStatus.REJETE}>
            Rejetés
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Leave Table */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-8">
            <CalendarDays className="text-slate-300" size={40} />
            <p className="text-slate-500 mt-3">Aucune demande de congé</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                {isManager && <TableHead>Employé</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="text-center">Jours</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const statusConf = STATUS_CONFIG[c.statut];
                return (
                  <TableRow key={c.id}>
                    {isManager && (
                      <TableCell className="font-medium">
                        {c.employe
                          ? `${c.employe.prenom} ${c.employe.nom}`
                          : "—"}
                        {c.employe && (
                          <span className="block text-xs text-slate-400">
                            {c.employe.departement}
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {LEAVE_TYPE_ICONS[c.typeConge]}
                        <span className="text-sm">
                          {LEAVE_TYPE_LABELS[c.typeConge]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(c.dateDebut).toLocaleDateString("fr-TN", {
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      →{" "}
                      {new Date(c.dateFin).toLocaleDateString("fr-TN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">
                      {c.nbJours}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                      {c.motif || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusConf.variant}
                        className="gap-1"
                      >
                        {statusConf.icon}
                        {statusConf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {c.statut === LeaveStatus.EN_ATTENTE &&
                          isManager && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(c.id)}
                              >
                                <CheckCircle2 size={14} className="mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(c.id)}
                              >
                                <XCircle size={14} className="mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                        {c.statut === LeaveStatus.EN_ATTENTE &&
                          !isManager && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-slate-500"
                              onClick={() => handleCancel(c.id)}
                            >
                              <Ban size={14} className="mr-1" />
                              Annuler
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
