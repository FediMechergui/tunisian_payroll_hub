// ============================================================================
// PayrollHub — Declarations Management Page
// CNSS D-17, DGI DEU, Bank Wire generation and management
// ============================================================================

import { useEffect, useState } from "react";
import { declarationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Declaration } from "@shared/types";
import { DeclarationType, DeclarationStatus, UserRole } from "@shared/types";
import { ROLE_HIERARCHY } from "@shared/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Loader2,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  FileSpreadsheet,
  Building2,
  Banknote,
  ShieldCheck,
} from "lucide-react";

// ── Labels & Colors ──────────────────────────────────────────────────

const DECL_TYPE_LABELS: Record<DeclarationType, string> = {
  [DeclarationType.CNSS_D17]: "CNSS D-17 (Trimestrielle)",
  [DeclarationType.CNRPS_D17]: "CNRPS D-17 (Trimestrielle)",
  [DeclarationType.DGI_DEU]: "DGI DEU (Annuelle)",
  [DeclarationType.VIREMENT_BANCAIRE]: "Fichier de virement bancaire",
};

const DECL_TYPE_SHORT: Record<DeclarationType, string> = {
  [DeclarationType.CNSS_D17]: "CNSS D-17",
  [DeclarationType.CNRPS_D17]: "CNRPS D-17",
  [DeclarationType.DGI_DEU]: "DGI DEU",
  [DeclarationType.VIREMENT_BANCAIRE]: "Virement",
};

const DECL_TYPE_ICONS: Record<DeclarationType, typeof FileText> = {
  [DeclarationType.CNSS_D17]: ShieldCheck,
  [DeclarationType.CNRPS_D17]: ShieldCheck,
  [DeclarationType.DGI_DEU]: Building2,
  [DeclarationType.VIREMENT_BANCAIRE]: Banknote,
};

const STATUS_CONFIG: Record<
  DeclarationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    icon: typeof Clock;
  }
> = {
  [DeclarationStatus.BROUILLON]: {
    label: "Brouillon",
    variant: "secondary",
    icon: Clock,
  },
  [DeclarationStatus.GENERE]: {
    label: "Généré",
    variant: "outline",
    icon: CheckCircle2,
  },
  [DeclarationStatus.SOUMIS]: {
    label: "Soumis",
    variant: "default",
    icon: Send,
  },
};

const TRIMESTRE_LABELS: Record<number, string> = {
  1: "T1 (Jan–Mar)",
  2: "T2 (Avr–Jun)",
  3: "T3 (Jul–Sep)",
  4: "T4 (Oct–Déc)",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-TN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n);

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function Declarations() {
  const { user } = useAuth();
  const isAdminPaie = user
    ? ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.ADMIN_PAIE]
    : false;
  const isAdminRH = user
    ? ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.ADMIN_RH]
    : false;

  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [declType, setDeclType] = useState<DeclarationType | "">("");
  const [trimestre, setTrimestre] = useState<number>(
    Math.ceil((new Date().getMonth() + 1) / 3)
  );
  const [annee, setAnnee] = useState(new Date().getFullYear());

  // ── Load ─────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await declarationsApi.list();
      setDeclarations(res.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Compute periods from type + trimestre + annee ────────────────
  const computePeriods = () => {
    if (
      declType === DeclarationType.CNSS_D17 ||
      declType === DeclarationType.CNRPS_D17
    ) {
      const startMonth = (trimestre - 1) * 3;
      const endMonth = startMonth + 2;
      const periodeDebut = `${annee}-${String(startMonth + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(annee, endMonth + 1, 0).getDate();
      const periodeFin = `${annee}-${String(endMonth + 1).padStart(2, "0")}-${lastDay}`;
      return { periodeDebut, periodeFin };
    }
    if (declType === DeclarationType.DGI_DEU) {
      return { periodeDebut: `${annee}-01-01`, periodeFin: `${annee}-12-31` };
    }
    // Virement: current month
    const now = new Date();
    const m = now.getMonth();
    const periodeDebut = `${annee}-${String(m + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(annee, m + 1, 0).getDate();
    const periodeFin = `${annee}-${String(m + 1).padStart(2, "0")}-${lastDay}`;
    return { periodeDebut, periodeFin };
  };

  // ── Generate ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!declType) return;
    const { periodeDebut, periodeFin } = computePeriods();
    try {
      setGenerating(true);
      const response = await declarationsApi.generate({
        type: declType,
        trimestre:
          declType === DeclarationType.CNSS_D17 ||
          declType === DeclarationType.CNRPS_D17
            ? trimestre
            : undefined,
        annee,
        periodeDebut,
        periodeFin,
      });

      // Download PDF blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${DECL_TYPE_SHORT[declType]}_${annee}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      // Try to read error from blob
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          alert(json.error || "Erreur lors de la génération");
        } catch {
          alert("Erreur lors de la génération");
        }
      } else {
        alert(err.response?.data?.error || "Erreur lors de la génération");
      }
    } finally {
      setGenerating(false);
    }
  };

  // ── Download PDF ─────────────────────────────────────────────────
  const handleDownloadPDF = async (decl: Declaration) => {
    try {
      const res = await declarationsApi.download(decl.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = decl.nomFichier;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement PDF");
    }
  };

  // ── Download CSV ─────────────────────────────────────────────────
  const handleDownloadCSV = async (decl: Declaration) => {
    try {
      const res = await declarationsApi.downloadCsv(decl.id);
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = decl.nomFichier.replace(".pdf", ".csv");
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement CSV");
    }
  };

  // ── Update Status ────────────────────────────────────────────────
  const handleStatusChange = async (
    decl: Declaration,
    newStatut: DeclarationStatus
  ) => {
    try {
      await declarationsApi.updateStatut(decl.id, newStatut);
      loadData();
    } catch {
      alert("Erreur");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette déclaration ?")) return;
    try {
      await declarationsApi.delete(id);
      loadData();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Déclarations réglementaires
          </h1>
          <p className="text-muted-foreground">
            CNSS D-17, DGI DEU et fichiers de virement bancaire
          </p>
        </div>
        {isAdminPaie && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle déclaration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Générer une déclaration</DialogTitle>
                <DialogDescription>
                  Sélectionnez le type de déclaration et la période.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label>Type de déclaration</Label>
                  <Select
                    value={declType || ""}
                    onValueChange={v => setDeclType(v as DeclarationType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DeclarationType).map(t => (
                        <SelectItem key={t} value={t}>
                          {DECL_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trimestre (for CNSS/CNRPS) */}
                {(declType === DeclarationType.CNSS_D17 ||
                  declType === DeclarationType.CNRPS_D17) && (
                  <div className="space-y-2">
                    <Label>Trimestre</Label>
                    <Select
                      value={String(trimestre)}
                      onValueChange={v => setTrimestre(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(t => (
                          <SelectItem key={t} value={String(t)}>
                            {TRIMESTRE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Année */}
                <div className="space-y-2">
                  <Label>Année</Label>
                  <Input
                    type="number"
                    min={2020}
                    max={2099}
                    value={annee}
                    onChange={e => setAnnee(Number(e.target.value))}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!declType || generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours…
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Générer & Télécharger
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Type overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(DeclarationType).map(t => {
          const Icon = DECL_TYPE_ICONS[t];
          const items = declarations.filter(d => d.type === t);
          const latest = items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          return (
            <Card key={t}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">
                    {DECL_TYPE_SHORT[t]}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {DECL_TYPE_LABELS[t]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{items.length}</p>
                {latest && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Dernière:{" "}
                    {new Date(latest.createdAt).toLocaleDateString("fr-TN")}
                    {" · "}
                    {fmt(latest.montantTotal)} TND
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Historique des déclarations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {declarations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune déclaration générée. Cliquez sur « Nouvelle déclaration »
              pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Nb Employés</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarations
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map(d => {
                    const statusCfg = STATUS_CONFIG[d.statut];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <TableRow key={d.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {DECL_TYPE_SHORT[d.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {d.trimestre ? `T${d.trimestre} ` : ""}
                          {d.annee}
                        </TableCell>
                        <TableCell>{d.nbEmployes}</TableCell>
                        <TableCell className="font-mono">
                          {fmt(d.montantTotal)} TND
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(d.createdAt).toLocaleDateString("fr-TN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(d)}
                              title="PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {d.type !== DeclarationType.VIREMENT_BANCAIRE && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadCSV(d)}
                                title="CSV"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Status progression */}
                            {isAdminPaie &&
                              d.statut === DeclarationStatus.BROUILLON && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(
                                      d,
                                      DeclarationStatus.GENERE
                                    )
                                  }
                                  title="Marquer comme généré"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                            {isAdminPaie &&
                              d.statut === DeclarationStatus.GENERE && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(
                                      d,
                                      DeclarationStatus.SOUMIS
                                    )
                                  }
                                  title="Marquer comme soumis"
                                >
                                  <Send className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                            {isAdminRH && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(d.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
