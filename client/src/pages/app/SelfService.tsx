// ============================================================================
// PayrollHub — Employee Self-Service Portal
// Mon Profil, Mes Bulletins, Mes Congés
// ============================================================================

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { employeesApi, payrollApi, congesApi } from "@/lib/api";
import type { Employe, BulletinPaie, Conge } from "@shared/types";
import { LeaveType, LeaveStatus, MaritalStatus, ContractType } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  User,
  FileText,
  CalendarDays,
  Loader2,
  Download,
  Plus,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Umbrella,
  Stethoscope,
  Baby,
  AlertCircle,
  Calendar,
  Building2,
  Briefcase,
  CreditCard,
  Heart,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// ---- CONSTANTS ----

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

const STATUS_CONFIG: Record<
  LeaveStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  [LeaveStatus.EN_ATTENTE]: { label: "En attente", variant: "secondary", icon: <Clock size={12} /> },
  [LeaveStatus.APPROUVE]: { label: "Approuvé", variant: "default", icon: <CheckCircle2 size={12} /> },
  [LeaveStatus.REJETE]: { label: "Rejeté", variant: "destructive", icon: <XCircle size={12} /> },
  [LeaveStatus.ANNULE]: { label: "Annulé", variant: "outline", icon: <Ban size={12} /> },
};

const MARITAL_LABELS: Record<MaritalStatus, string> = {
  [MaritalStatus.CELIBATAIRE]: "Célibataire",
  [MaritalStatus.MARIE]: "Marié(e)",
  [MaritalStatus.DIVORCE]: "Divorcé(e)",
  [MaritalStatus.VEUF]: "Veuf/ve",
};

const CONTRACT_LABELS: Record<ContractType, string> = {
  [ContractType.CDI]: "CDI",
  [ContractType.CDD]: "CDD",
  [ContractType.SIVP]: "SIVP",
  [ContractType.KARAMA]: "Karama",
};

// ---- MAIN COMPONENT ----

export default function SelfService() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employe, setEmploye] = useState<Employe | null>(null);
  const [bulletins, setBulletins] = useState<BulletinPaie[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [balance, setBalance] = useState<{
    droitAnnuel: number;
    consomme: number;
    enAttente: number;
    solde: number;
  } | null>(null);

  // New leave request
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLeave, setNewLeave] = useState({
    typeConge: LeaveType.CONGE_PAYE as string,
    dateDebut: "",
    dateFin: "",
    nbJours: 0,
    motif: "",
  });

  const fetchData = async () => {
    if (!user?.employeId) {
      setLoading(false);
      return;
    }
    try {
      const [empRes, bulRes, congesRes, balRes] = await Promise.all([
        employeesApi.get(user.employeId),
        payrollApi.getEmployeBulletins(user.employeId),
        congesApi.list(),
        congesApi.getBalance(user.employeId, new Date().getFullYear()),
      ]);

      if (empRes.data.success && empRes.data.data)
        setEmploye(empRes.data.data);
      if (bulRes.data.success && bulRes.data.data)
        setBulletins(bulRes.data.data);
      if (congesRes.data.success && congesRes.data.data)
        setConges(congesRes.data.data);
      if (balRes.data.success && balRes.data.data)
        setBalance(balRes.data.data);
    } catch {
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-compute business days
  useEffect(() => {
    if (newLeave.dateDebut && newLeave.dateFin) {
      const start = new Date(newLeave.dateDebut);
      const end = new Date(newLeave.dateFin);
      if (end >= start) {
        let days = 0;
        const d = new Date(start);
        while (d <= end) {
          const dow = d.getDay();
          if (dow !== 0 && dow !== 6) days++;
          d.setDate(d.getDate() + 1);
        }
        setNewLeave((prev) => ({ ...prev, nbJours: days }));
      }
    }
  }, [newLeave.dateDebut, newLeave.dateFin]);

  const handleCreateLeave = async () => {
    if (!user?.employeId || !newLeave.dateDebut || !newLeave.dateFin) {
      toast.error("Veuillez remplir les dates");
      return;
    }
    setCreating(true);
    try {
      const res = await congesApi.create({
        employeId: user.employeId,
        typeConge: newLeave.typeConge,
        dateDebut: newLeave.dateDebut,
        dateFin: newLeave.dateFin,
        nbJours: newLeave.nbJours,
        motif: newLeave.motif || undefined,
      });
      if (res.data.success) {
        toast.success("Demande de congé soumise");
        setCreateOpen(false);
        setNewLeave({
          typeConge: LeaveType.CONGE_PAYE,
          dateDebut: "",
          dateFin: "",
          nbJours: 0,
          motif: "",
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await congesApi.cancel(id);
      toast.success("Demande annulée");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const handleDownloadPDF = async (bulletinId: string, label: string) => {
    try {
      const res = await payrollApi.downloadPDF(bulletinId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulletin-${label}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch {
      toast.error("Erreur de téléchargement");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user?.employeId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <User className="text-slate-300" size={48} />
        <p className="text-slate-500">
          Votre compte n'est pas lié à un dossier employé.
        </p>
        <p className="text-sm text-slate-400">
          Contactez votre administrateur RH.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon Espace</h1>
        <p className="text-sm text-slate-500 mt-1">
          Consultez votre profil, vos bulletins de paie et gérez vos congés
        </p>
      </div>

      <Tabs defaultValue="profil">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profil" className="gap-1.5">
            <User size={14} /> Profil
          </TabsTrigger>
          <TabsTrigger value="bulletins" className="gap-1.5">
            <FileText size={14} /> Bulletins
          </TabsTrigger>
          <TabsTrigger value="conges" className="gap-1.5">
            <CalendarDays size={14} /> Congés
          </TabsTrigger>
        </TabsList>

        {/* ==================== TAB: PROFIL ==================== */}
        <TabsContent value="profil" className="mt-6">
          {employe ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Identity Card */}
              <Card className="lg:col-span-1 border-0 shadow-sm">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold text-2xl">
                      {employe.prenom[0]}
                      {employe.nom[0]}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {employe.prenom} {employe.nom}
                  </h2>
                  <p className="text-sm text-slate-500">{employe.poste}</p>
                  <Badge variant="secondary" className="mt-2">
                    {employe.departement}
                  </Badge>
                  <Separator className="my-4 w-full" />
                  <div className="space-y-3 w-full text-left text-sm">
                    {employe.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {employe.email}
                      </div>
                    )}
                    {employe.telephone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {employe.telephone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      {employe.adresse}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Informations Détaillées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Personal */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                        <Heart size={10} className="inline mr-1" />
                        Personnel
                      </p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">CIN</dt>
                          <dd className="font-mono font-medium">
                            {employe.cin}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Date de naissance</dt>
                          <dd>
                            {new Date(employe.dateNaissance).toLocaleDateString(
                              "fr-TN"
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Situation</dt>
                          <dd>
                            {MARITAL_LABELS[employe.situationFamiliale]}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Enfants</dt>
                          <dd>{employe.nbEnfants}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Employment */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                        <Briefcase size={10} className="inline mr-1" />
                        Emploi
                      </p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Contrat</dt>
                          <dd>
                            <Badge variant="outline" className="text-xs">
                              {CONTRACT_LABELS[employe.typeContrat]}
                            </Badge>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Catégorie</dt>
                          <dd>{employe.categoriePro}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Embauche</dt>
                          <dd>
                            {new Date(employe.dateEmbauche).toLocaleDateString(
                              "fr-TN"
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">CNSS</dt>
                          <dd className="font-mono text-xs">
                            {employe.matriculeCnss}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Financial */}
                    <div className="sm:col-span-2">
                      <Separator className="my-2" />
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2 mt-3">
                        <CreditCard size={10} className="inline mr-1" />
                        Financier
                      </p>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Salaire de base</dt>
                          <dd className="font-bold text-blue-600">
                            {employe.salaireBase.toLocaleString("fr-TN")} TND
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">IBAN</dt>
                          <dd className="font-mono text-xs">
                            {employe.iban}
                          </dd>
                        </div>
                        {employe.banque && (
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Banque</dt>
                            <dd>{employe.banque}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-8">
                <User className="text-slate-300" size={40} />
                <p className="text-slate-500 mt-3">Profil non trouvé</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== TAB: BULLETINS ==================== */}
        <TabsContent value="bulletins" className="mt-6">
          {bulletins.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-8">
                <FileText className="text-slate-300" size={40} />
                <p className="text-slate-500 mt-3">
                  Aucun bulletin de paie disponible
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Mes Bulletins de Paie ({bulletins.length})
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead className="text-right">Brut</TableHead>
                    <TableHead className="text-right">CNSS</TableHead>
                    <TableHead className="text-right">IRPP</TableHead>
                    <TableHead className="text-right font-bold">
                      Net à Payer
                    </TableHead>
                    <TableHead className="text-center">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulletins.map((b) => {
                    const dateGen = new Date(b.dateGeneration);
                    const label = dateGen.toLocaleDateString("fr-TN", {
                      month: "long",
                      year: "numeric",
                    });
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium capitalize">
                          {label}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {b.salaireBrut.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-500">
                          {b.cnssSalarial.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-500">
                          {b.irpp.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-green-600">
                          {b.netAPayer.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}{" "}
                          TND
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => handleDownloadPDF(b.id, label)}
                          >
                            <Download size={14} className="mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ==================== TAB: CONGÉS ==================== */}
        <TabsContent value="conges" className="mt-6 space-y-6">
          {/* Balance Cards */}
          {balance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">Solde disponible</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {balance.solde}{" "}
                    <span className="text-sm font-normal">jours</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">Droit annuel</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {balance.droitAnnuel}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">Consommé</p>
                  <p className="text-2xl font-bold text-orange-500 mt-1">
                    {balance.consomme}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">En attente</p>
                  <p className="text-2xl font-bold text-amber-500 mt-1">
                    {balance.enAttente}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex justify-end">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" /> Demander un congé
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Demande</DialogTitle>
                  <DialogDescription>
                    Soumettez une demande de congé pour validation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Type de congé</Label>
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
                        {Object.entries(LEAVE_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date début</Label>
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
                      <Label>Date fin</Label>
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
                      Jours ouvrés:{" "}
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
                        setNewLeave((prev) => ({
                          ...prev,
                          motif: e.target.value,
                        }))
                      }
                      placeholder="Raison..."
                    />
                  </div>
                  <Button
                    onClick={handleCreateLeave}
                    disabled={creating}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {creating && (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    )}
                    Soumettre
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Leave History */}
          {conges.length === 0 ? (
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
                    <TableHead>Type</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead className="text-center">Jours</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conges.map((c) => {
                    const sc = STATUS_CONFIG[c.statut];
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            {LEAVE_TYPE_ICONS[c.typeConge]}
                            {LEAVE_TYPE_LABELS[c.typeConge]}
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
                          <Badge variant={sc.variant} className="gap-1">
                            {sc.icon}
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {c.statut === LeaveStatus.EN_ATTENTE && (
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
