// ============================================================================
// PayrollHub — Reports Builder Page
// Generate custom filterable reports with CSV/PDF export
// ============================================================================

import { useEffect, useState } from "react";
import { reportsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ReportConfig } from "@shared/types";
import { ReportType, UserRole } from "@shared/types";
import { ROLE_HIERARCHY, DEPARTEMENTS } from "@shared/const";
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
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Users,
  Wallet,
  CalendarDays,
  Building2,
  Cog,
} from "lucide-react";

// ── Labels ───────────────────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.MASSE_SALARIALE]: "Masse salariale",
  [ReportType.EFFECTIFS]: "État des effectifs",
  [ReportType.CHARGES_SOCIALES]: "Charges sociales",
  [ReportType.CONGES]: "Congés",
  [ReportType.COUT_DEPARTEMENT]: "Coût par département",
  [ReportType.PERSONNALISE]: "Rapport personnalisé",
};

const REPORT_TYPE_ICONS: Record<ReportType, typeof BarChart3> = {
  [ReportType.MASSE_SALARIALE]: Wallet,
  [ReportType.EFFECTIFS]: Users,
  [ReportType.CHARGES_SOCIALES]: BarChart3,
  [ReportType.CONGES]: CalendarDays,
  [ReportType.COUT_DEPARTEMENT]: Building2,
  [ReportType.PERSONNALISE]: Cog,
};

const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  [ReportType.MASSE_SALARIALE]: "Évolution mensuelle des salaires bruts, nets et charges",
  [ReportType.EFFECTIFS]: "Répartition des effectifs par département, contrat et ancienneté",
  [ReportType.CHARGES_SOCIALES]: "Détail mensuel CNSS, FOPROLOS, TFP, IRPP",
  [ReportType.CONGES]: "Situation des congés par employé",
  [ReportType.COUT_DEPARTEMENT]: "Analyse du coût salarial par département",
  [ReportType.PERSONNALISE]: "Données détaillées par employé avec filtres",
};

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function Reports() {
  const { user } = useAuth();
  const isComptable = user ? ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.COMPTABLE] : false;
  const isAdminRH = user ? ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.ADMIN_RH] : false;

  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [titre, setTitre] = useState("");
  const [periodeDebut, setPeriodeDebut] = useState(() => {
    const d = new Date();
    d.setMonth(0, 1);
    return d.toISOString().slice(0, 10);
  });
  const [periodeFin, setPeriodeFin] = useState(() => new Date().toISOString().slice(0, 10));
  const [departement, setDepartement] = useState<string>("");

  // ── Load ─────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.list();
      setReports(res.data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-fill titre on type change
  useEffect(() => {
    if (reportType) {
      setTitre(REPORT_TYPE_LABELS[reportType]);
    }
  }, [reportType]);

  // ── Generate ─────────────────────────────────────────────────────
  const handleGenerate = async (format: "pdf" | "csv") => {
    if (!reportType || !titre) return;
    try {
      setGenerating(true);
      const data = {
        type: reportType,
        titre,
        periodeDebut,
        periodeFin,
        filtres: departement ? { departement } : undefined,
      };
      const response = await reportsApi.generate(data, format);

      const mimeType = format === "csv" ? "text/csv" : "application/pdf";
      const ext = format === "csv" ? ".csv" : ".pdf";
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${titre.replace(/\s/g, "_")}${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);

      loadData(); // refresh list
    } catch (err: any) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          alert(json.error || "Erreur");
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

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce rapport ?")) return;
    try {
      await reportsApi.delete(id);
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <p className="text-muted-foreground">
          Générateur de rapports personnalisés avec export PDF et CSV
        </p>
      </div>

      {/* Report type cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Object.values(ReportType).map(t => {
          const Icon = REPORT_TYPE_ICONS[t];
          const isSelected = reportType === t;
          return (
            <Card
              key={t}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-primary shadow-md" : ""
              }`}
              onClick={() => setReportType(t)}
            >
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs font-medium leading-tight">{REPORT_TYPE_LABELS[t]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generator form */}
      {reportType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {(() => { const I = REPORT_TYPE_ICONS[reportType]; return <I className="h-5 w-5" />; })()}
              {REPORT_TYPE_LABELS[reportType]}
            </CardTitle>
            <CardDescription>{REPORT_TYPE_DESCRIPTIONS[reportType]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Titre du rapport</Label>
                <Input value={titre} onChange={e => setTitre(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Période début</Label>
                <Input type="date" value={periodeDebut} onChange={e => setPeriodeDebut(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Période fin</Label>
                <Input type="date" value={periodeFin} onChange={e => setPeriodeFin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Département (optionnel)</Label>
                <Select value={departement} onValueChange={setDepartement}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les départements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous les départements</SelectItem>
                    {DEPARTEMENTS.map(d => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => handleGenerate("pdf")}
                disabled={!titre || generating}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Générer PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerate("csv")}
                disabled={!titre || generating}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                )}
                Exporter CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des rapports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun rapport généré. Sélectionnez un type de rapport ci-dessus et cliquez sur « Générer ».
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Filtres</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="outline">{REPORT_TYPE_LABELS[r.type]}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{r.titre}</TableCell>
                      <TableCell className="text-sm">
                        {r.periodeDebut} → {r.periodeFin}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.filtres?.departement || "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(r.createdAt).toLocaleDateString("fr-TN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdminRH && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
