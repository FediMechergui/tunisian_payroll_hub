// ============================================================================
// PayrollHub — Employee Self-Service Portal
// Mon Profil, Mes Bulletins, Mes Congés
// ============================================================================

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  employeesApi,
  payrollApi,
  congesApi,
  documentRequestsApi,
  loansApi,
} from "@/lib/api";
import type { Employe, BulletinPaie, Conge, Loan } from "@shared/types";
import {
  LeaveType,
  LeaveStatus,
  MaritalStatus,
  ContractType,
  LoanStatus,
} from "@shared/types";
import { LOAN_MOTIFS } from "@shared/const";
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
  FileUp,
  Banknote,
  TrendingDown,
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
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  [LeaveStatus.EN_ATTENTE]: {
    label: "En attente",
    variant: "secondary",
    icon: <Clock size={12} />,
  },
  [LeaveStatus.APPROUVE]: {
    label: "Approuvé",
    variant: "default",
    icon: <CheckCircle2 size={12} />,
  },
  [LeaveStatus.REJETE]: {
    label: "Rejeté",
    variant: "destructive",
    icon: <XCircle size={12} />,
  },
  [LeaveStatus.ANNULE]: {
    label: "Annulé",
    variant: "outline",
    icon: <Ban size={12} />,
  },
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
  const [docRequests, setDocRequests] = useState<any[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
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

  // New loan request
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [creatingLoan, setCreatingLoan] = useState(false);
  const [newLoan, setNewLoan] = useState({
    montantTotal: "",
    nbMensualites: "",
    motif: LOAN_MOTIFS[0] as string,
    dateDebut: new Date().toISOString().slice(0, 10),
  });

  const fetchData = async () => {
    if (!user?.employeId) {
      setLoading(false);
      return;
    }
    try {
      const [empRes, bulRes, congesRes, balRes, docRes, loansRes] =
        await Promise.all([
          employeesApi.get(user.employeId),
          payrollApi.getEmployeBulletins(user.employeId),
          congesApi.list(),
          congesApi.getBalance(user.employeId, new Date().getFullYear()),
          documentRequestsApi
            .list()
            .catch(() => ({ data: { success: false, data: [] } })),
          loansApi.list().catch(() => ({ data: { success: false, data: [] } })),
        ]);

      if (empRes.data.success && empRes.data.data) setEmploye(empRes.data.data);
      if (bulRes.data.success && bulRes.data.data)
        setBulletins(bulRes.data.data);
      if (congesRes.data.success && congesRes.data.data)
        setConges(congesRes.data.data);
      if (balRes.data.success && balRes.data.data) setBalance(balRes.data.data);
      if (docRes.data.success && docRes.data.data)
        setDocRequests(docRes.data.data);
      if (loansRes.data.success && loansRes.data.data)
        setLoans(loansRes.data.data as Loan[]);
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
        setNewLeave(prev => ({ ...prev, nbJours: days }));
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

  const handleDownloadDoc = async (requestId: string, typeDocument: string) => {
    try {
      const res = await documentRequestsApi.download(requestId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${typeDocument.replace(/_/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Document téléchargé");
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleRequestLoan = async () => {
    if (!newLoan.montantTotal || !newLoan.nbMensualites) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setCreatingLoan(true);
    try {
      const res = await loansApi.request({
        montantTotal: parseFloat(newLoan.montantTotal),
        nbMensualites: parseInt(newLoan.nbMensualites),
        motif: newLoan.motif,
        dateDebut: newLoan.dateDebut,
      });
      if (res.data.success) {
        toast.success("Demande de prêt soumise avec succès");
        setLoanDialogOpen(false);
        setNewLoan({
          montantTotal: "",
          nbMensualites: "",
          motif: LOAN_MOTIFS[0] as string,
          dateDebut: new Date().toISOString().slice(0, 10),
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la demande");
    } finally {
      setCreatingLoan(false);
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
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="profil" className="gap-1.5">
            <User size={14} /> Profil
          </TabsTrigger>
          <TabsTrigger value="bulletins" className="gap-1.5">
            <FileText size={14} /> Bulletins
          </TabsTrigger>
          <TabsTrigger value="conges" className="gap-1.5">
            <CalendarDays size={14} /> Congés
          </TabsTrigger>
          <TabsTrigger value="prets" className="gap-1.5">
            <Banknote size={14} /> Prêts
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileUp size={14} /> Documents
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
                          <dd>{MARITAL_LABELS[employe.situationFamiliale]}</dd>
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
                          <dd className="font-mono text-xs">{employe.iban}</dd>
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
                  {bulletins.map(b => {
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
                      onValueChange={v =>
                        setNewLeave(prev => ({ ...prev, typeConge: v }))
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
                        onChange={e =>
                          setNewLeave(prev => ({
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
                        onChange={e =>
                          setNewLeave(prev => ({
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
                      onChange={e =>
                        setNewLeave(prev => ({
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
                  {conges.map(c => {
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

        {/* ==================== TAB: PRÊTS ==================== */}
        <TabsContent value="prets" className="mt-6 space-y-6">
          {/* Header + Request Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Mes Prêts & Avances
              </h3>
              <p className="text-sm text-slate-500">
                Consultez vos prêts ou faites une nouvelle demande
              </p>
            </div>
            <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <Plus size={14} /> Demander un prêt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Demander un Prêt / Avance</DialogTitle>
                  <DialogDescription>
                    Votre demande sera soumise à la direction pour approbation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Montant (TND) *</Label>
                      <Input
                        type="number"
                        step="0.001"
                        min={1}
                        value={newLoan.montantTotal}
                        onChange={e =>
                          setNewLoan({
                            ...newLoan,
                            montantTotal: e.target.value,
                          })
                        }
                        placeholder="200.000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Nb mensualités *</Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={newLoan.nbMensualites}
                        onChange={e =>
                          setNewLoan({
                            ...newLoan,
                            nbMensualites: e.target.value,
                          })
                        }
                        placeholder="3"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {newLoan.montantTotal && newLoan.nbMensualites && (
                    <p className="text-sm text-slate-500">
                      Mensualité estimée :{" "}
                      <span className="font-semibold text-slate-700">
                        {(
                          parseFloat(newLoan.montantTotal) /
                          parseInt(newLoan.nbMensualites)
                        ).toLocaleString("fr-TN", {
                          minimumFractionDigits: 3,
                        })}{" "}
                        TND
                      </span>
                    </p>
                  )}
                  <div>
                    <Label>Motif *</Label>
                    <Select
                      value={newLoan.motif}
                      onValueChange={v => setNewLoan({ ...newLoan, motif: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOAN_MOTIFS.map(m => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date souhaitée</Label>
                    <Input
                      type="date"
                      value={newLoan.dateDebut}
                      onChange={e =>
                        setNewLoan({ ...newLoan, dateDebut: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleRequestLoan}
                    disabled={creatingLoan}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {creatingLoan ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      "Soumettre la demande"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Loan Summary */}
          {loans.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-amber-50">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">En attente</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {
                      loans.filter(l => l.statut === LoanStatus.EN_ATTENTE)
                        .length
                    }
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">En cours</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {loans.filter(l => l.statut === LoanStatus.EN_COURS).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">Solde restant</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">
                    {loans
                      .filter(l => l.statut === LoanStatus.EN_COURS)
                      .reduce((s, l) => s + l.soldeRestant, 0)
                      .toLocaleString("fr-TN", {
                        minimumFractionDigits: 3,
                      })}{" "}
                    <span className="text-sm font-normal">TND</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-slate-500">Total remboursé</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-1">
                    {loans
                      .reduce((s, l) => s + l.montantRembourse, 0)
                      .toLocaleString("fr-TN", {
                        minimumFractionDigits: 3,
                      })}{" "}
                    <span className="text-sm font-normal">TND</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {loans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-8">
                <Banknote className="text-slate-300" size={40} />
                <p className="text-slate-500 mt-3">Aucun prêt ou avance</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cliquez sur « Demander un prêt » pour en faire la demande
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motif</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Mensualité</TableHead>
                    <TableHead className="text-right">Remboursé</TableHead>
                    <TableHead className="text-right">Restant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map(loan => {
                    const progress =
                      loan.montantTotal > 0
                        ? Math.round(
                            (loan.montantRembourse / loan.montantTotal) * 100
                          )
                        : 0;
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">
                          {loan.motif}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {loan.montantTotal.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-500">
                          {loan.montantMensuel.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600">
                          {loan.montantRembourse.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-red-600">
                          {loan.soldeRestant.toLocaleString("fr-TN", {
                            minimumFractionDigits: 3,
                          })}{" "}
                          TND
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                loan.statut === LoanStatus.EN_ATTENTE
                                  ? "outline"
                                  : loan.statut === LoanStatus.EN_COURS
                                    ? "secondary"
                                    : loan.statut === LoanStatus.REMBOURSE
                                      ? "default"
                                      : "destructive"
                              }
                              className="text-xs"
                            >
                              {loan.statut === LoanStatus.EN_ATTENTE &&
                                "En attente"}
                              {loan.statut === LoanStatus.EN_COURS &&
                                "En cours"}
                              {loan.statut === LoanStatus.REMBOURSE &&
                                "Remboursé"}
                              {loan.statut === LoanStatus.ANNULE && "Annulé"}
                            </Badge>
                            {loan.statut === LoanStatus.EN_COURS && (
                              <div className="flex items-center gap-1">
                                <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {progress}%
                                </span>
                              </div>
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
        </TabsContent>

        {/* ==================== TAB: DOCUMENTS ==================== */}
        <TabsContent value="documents" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Mes demandes de documents
              </h3>
              <p className="text-sm text-slate-500">
                Suivez l'état de vos demandes de documents RH
              </p>
            </div>
            <Button size="sm" asChild>
              <a href="/app/demandes-documents">
                <Plus size={14} className="mr-1" /> Nouvelle demande
              </a>
            </Button>
          </div>

          {docRequests.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <FileUp size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">
                  Aucune demande de document
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Rendez-vous sur la page{" "}
                  <a
                    href="/app/demandes-documents"
                    className="text-blue-600 underline"
                  >
                    Demandes Documents
                  </a>{" "}
                  pour créer votre première demande.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Pièces</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docRequests.slice(0, 10).map((dr: any) => (
                    <TableRow key={dr.id}>
                      <TableCell className="text-sm font-medium">
                        {dr.typeDocument?.replace(/_/g, " ") ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {dr.createdAt
                          ? new Date(dr.createdAt).toLocaleDateString("fr-TN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dr.statut === "approuve" || dr.statut === "genere"
                              ? "default"
                              : dr.statut === "rejete"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {dr.statut === "en_attente" && "En attente"}
                          {dr.statut === "en_revision" && "En révision"}
                          {dr.statut === "approuve" && "Approuvé"}
                          {dr.statut === "rejete" && "Rejeté"}
                          {dr.statut === "genere" && "Généré"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {dr.uploadedPapers?.length ?? 0} /{" "}
                        {dr.requiredPapers?.length ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {(dr.statut === "approuve" ||
                          dr.statut === "genere") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() =>
                              handleDownloadDoc(dr.id, dr.typeDocument)
                            }
                          >
                            <Download size={14} className="mr-1" /> Télécharger
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {docRequests.length > 10 && (
                <div className="p-3 text-center border-t">
                  <Button variant="link" size="sm" asChild>
                    <a href="/app/demandes-documents">
                      Voir toutes les demandes →
                    </a>
                  </Button>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
