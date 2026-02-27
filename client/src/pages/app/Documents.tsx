// ============================================================================
// PayrollHub — Documents Management Page
// Generate and manage HR documents (attestations, certificates, etc.)
// ============================================================================

import { useEffect, useState } from "react";
import { documentsApi, employeesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Employe, DocumentRH } from "@shared/types";
import { DocumentType, UserRole } from "@shared/types";
import { ROLE_HIERARCHY } from "@shared/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  FileText,
  Download,
  Plus,
  Loader2,
  Trash2,
  Search,
  FileCheck,
  FileBadge,
  FileOutput,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Mapping labels ───────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.ATTESTATION_TRAVAIL]: "Attestation de travail",
  [DocumentType.ATTESTATION_SALAIRE]: "Attestation de salaire",
  [DocumentType.ATTESTATION_CNSS]: "Attestation CNSS",
  [DocumentType.FICHE_PAIE_ANNUELLE]: "Fiche de paie annuelle",
  [DocumentType.CERTIFICAT_TRAVAIL]: "Certificat de travail",
};

const DOC_TYPE_ICONS: Record<DocumentType, typeof FileText> = {
  [DocumentType.ATTESTATION_TRAVAIL]: FileCheck,
  [DocumentType.ATTESTATION_SALAIRE]: FileBadge,
  [DocumentType.ATTESTATION_CNSS]: FileOutput,
  [DocumentType.FICHE_PAIE_ANNUELLE]: FileSpreadsheet,
  [DocumentType.CERTIFICAT_TRAVAIL]: FileText,
};

type DocWithEmploye = DocumentRH & {
  employe?: { nom: string; prenom: string; departement: string };
};

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function Documents() {
  const { user } = useAuth();
  const isManager = user ? ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[UserRole.MANAGER] : false;

  const [documents, setDocuments] = useState<DocWithEmploye[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [selectedEmploye, setSelectedEmploye] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | "">("");
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());

  // ── Load data ────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, empsRes] = await Promise.all([
        documentsApi.list(),
        employeesApi.list({ pageSize: 500 }),
      ]);
      setDocuments(docsRes.data.data || []);
      const empData = empsRes.data.data;
      setEmployes(Array.isArray(empData) ? empData : (empData as any)?.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Generate document ────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selectedEmploye || !selectedType) return;
    try {
      setGenerating(true);
      const response = await documentsApi.generate({
        employeId: selectedEmploye,
        typeDocument: selectedType,
        annee: selectedType === DocumentType.FICHE_PAIE_ANNUELLE ? selectedAnnee : undefined,
      });

      // Download the blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const emp = employes.find(e => e.id === selectedEmploye);
      a.download = `${selectedType}_${emp?.nom || "doc"}_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      setDialogOpen(false);
      setSelectedEmploye("");
      setSelectedType("");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  // ── Re-download document ─────────────────────────────────────────
  const handleDownload = async (doc: DocumentRH) => {
    try {
      const response = await documentsApi.download(doc.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nomFichier;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement");
    }
  };

  // ── Delete document ──────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await documentsApi.delete(id);
      loadData();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────
  const filtered = documents.filter(d => {
    const label = DOC_TYPE_LABELS[d.typeDocument] || d.typeDocument;
    const empName = d.employe ? `${d.employe.nom} ${d.employe.prenom}` : "";
    const q = search.toLowerCase();
    return label.toLowerCase().includes(q) || empName.toLowerCase().includes(q);
  });

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
          <h1 className="text-2xl font-bold tracking-tight">Documents RH</h1>
          <p className="text-muted-foreground">
            Générer et gérer les attestations, certificats et fiches
          </p>
        </div>
        {isManager && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Générer un document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Générer un document</DialogTitle>
                <DialogDescription>
                  Sélectionnez l'employé et le type de document à générer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Employé</Label>
                  <Select value={selectedEmploye} onValueChange={setSelectedEmploye}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employes.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nom} {e.prenom} — {e.departement}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type de document</Label>
                  <Select value={selectedType} onValueChange={v => setSelectedType(v as DocumentType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DocumentType).map(t => (
                        <SelectItem key={t} value={t}>
                          {DOC_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedType === DocumentType.FICHE_PAIE_ANNUELLE && (
                  <div className="space-y-2">
                    <Label>Année</Label>
                    <Input
                      type="number"
                      min={2020}
                      max={2099}
                      value={selectedAnnee}
                      onChange={e => setSelectedAnnee(Number(e.target.value))}
                    />
                  </div>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedEmploye || !selectedType || generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération…
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

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {Object.values(DocumentType).map(t => {
          const count = documents.filter(d => d.typeDocument === t).length;
          const Icon = DOC_TYPE_ICONS[t];
          return (
            <Card key={t}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {DOC_TYPE_LABELS[t]}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun document trouvé. Utilisez le bouton « Générer un document » pour en créer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Badge variant="outline">{DOC_TYPE_LABELS[d.typeDocument]}</Badge>
                    </TableCell>
                    <TableCell>
                      {d.employe ? `${d.employe.nom} ${d.employe.prenom}` : d.employeId}
                    </TableCell>
                    <TableCell>{d.titre}</TableCell>
                    <TableCell>
                      {new Date(d.dateCreation).toLocaleDateString("fr-TN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(d)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {ROLE_HIERARCHY[user!.role] >= ROLE_HIERARCHY[UserRole.ADMIN_RH] && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
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
