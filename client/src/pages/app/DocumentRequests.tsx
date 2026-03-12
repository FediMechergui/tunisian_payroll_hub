// ============================================================================
// PayrollHub — Document Requests Page
// Employees create requests & upload papers; managers/admins review them
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { documentRequestsApi } from "@/lib/api";
import { UserRole, DocumentRequestStatus } from "@shared/types";
import { DOCUMENT_REQUIRED_PAPERS, ROLE_HIERARCHY } from "@shared/const";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Plus,
  Loader2,
  Paperclip,
  FileCheck,
  AlertCircle,
  Download,
  Send,
} from "lucide-react";

// ---- Helpers ----------------------------------------------------------------

const DOC_TYPE_LABELS: Record<string, string> = {
  attestation_travail: "Attestation de Travail",
  attestation_salaire: "Attestation de Salaire",
  attestation_cnss: "Attestation CNSS",
  certificat_travail: "Certificat de Travail",
  fiche_paie_duplicata: "Duplicata Fiche de Paie",
  attestation_conge: "Attestation de Congé",
  domiciliation_bancaire: "Domiciliation Bancaire",
  ordre_virement: "Ordre de Virement",
};

const statusBadge = (s: string) => {
  switch (s) {
    case DocumentRequestStatus.EN_ATTENTE:
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock size={12} className="mr-1" />En attente</Badge>;
    case DocumentRequestStatus.EN_REVISION:
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Eye size={12} className="mr-1" />En révision</Badge>;
    case DocumentRequestStatus.APPROUVE:
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle size={12} className="mr-1" />Approuvé</Badge>;
    case DocumentRequestStatus.REJETE:
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle size={12} className="mr-1" />Rejeté</Badge>;
    case DocumentRequestStatus.GENERE:
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><FileCheck size={12} className="mr-1" />Généré</Badge>;
    default:
      return <Badge variant="outline">{s}</Badge>;
  }
};

// ---- Component --------------------------------------------------------------

export default function DocumentRequests() {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);
  const [reviewDecision, setReviewDecision] = useState<"approuve" | "rejete">("approuve");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Create form
  const [newType, setNewType] = useState("");
  const [newNote, setNewNote] = useState("");
  const [requiredPapers, setRequiredPapers] = useState<string[]>([]);

  const isManager = user ? ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] >= ROLE_HIERARCHY[UserRole.MANAGER] : false;

  const load = async () => {
    setLoading(true);
    try {
      const res = await documentRequestsApi.list();
      setRequests(res.data.data || []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // When type changes, fetch required papers
  useEffect(() => {
    if (!newType) { setRequiredPapers([]); return; }
    (async () => {
      try {
        const res = await documentRequestsApi.getRequiredPapers(newType);
        setRequiredPapers(res.data.data || []);
      } catch {
        const local = DOCUMENT_REQUIRED_PAPERS[newType as keyof typeof DOCUMENT_REQUIRED_PAPERS];
        setRequiredPapers(local || []);
      }
    })();
  }, [newType]);

  const handleCreate = async () => {
    if (!newType) { toast.error("Sélectionnez un type de document"); return; }
    setCreating(true);
    try {
      await documentRequestsApi.create({ typeDocument: newType as any, motif: newNote || undefined });
      toast.success("Demande créée avec succès");
      setCreateOpen(false);
      setNewType("");
      setNewNote("");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (id: string) => {
    try {
      const res = await documentRequestsApi.get(id);
      setDetailItem(res.data.data);
      setDetailOpen(true);
    } catch {
      toast.error("Erreur");
    }
  };

  const handleUpload = async (requestId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await documentRequestsApi.uploadPapers(requestId, Array.from(files));
      toast.success("Fichiers téléchargés");
      openDetail(requestId); // refresh
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  const openReview = (item: any) => {
    setReviewTarget(item);
    setReviewDecision("approuve");
    setReviewComment("");
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      await documentRequestsApi.review(reviewTarget.id, reviewDecision, reviewComment || undefined);
      toast.success(reviewDecision === "approuve" ? "Demande approuvée" : "Demande rejetée");
      setReviewOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette demande ?")) return;
    try {
      await documentRequestsApi.cancel(id);
      toast.success("Demande annulée");
      load();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDownloadDoc = async (id: string, typeDocument: string) => {
    try {
      const res = await documentRequestsApi.download(id);
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

  // ---- Render ---------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Demandes de Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isManager
              ? "Gérer les demandes de documents des employés"
              : "Demander des documents RH et suivre l'avancement"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          {!isManager && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  Nouvelle Demande
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Demande de Document</DialogTitle>
                  <DialogDescription>
                    Sélectionnez le type de document et joignez les
                    justificatifs requis.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Type de document *</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir…" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {requiredPapers.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                        <AlertCircle size={14} /> Justificatifs requis :
                      </p>
                      <ul className="list-disc list-inside text-xs text-amber-600 space-y-0.5">
                        {requiredPapers.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-amber-500 mt-2">
                        Vous pourrez les joindre après la création de la
                        demande.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Note (optionnel)</Label>
                    <Textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Précisez votre besoin…"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating && (
                      <Loader2 size={16} className="mr-1 animate-spin" />
                    )}
                    <Send size={16} className="mr-1" />
                    Soumettre
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isManager ? "Demandes à traiter" : "Mes demandes"}
          </CardTitle>
          <CardDescription>
            {requests.length} demande{requests.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>Aucune demande</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {DOC_TYPE_LABELS[r.typeDocument] || r.typeDocument}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isManager && r.employeNom ? `${r.employeNom} — ` : ""}
                        {new Date(
                          r.dateCreation || r.createdAt
                        ).toLocaleDateString("fr-TN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusBadge(r.statut)}
                    {r.uploadedPapers?.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-slate-50"
                      >
                        <Paperclip size={10} className="mr-0.5" />
                        {r.uploadedPapers.length}
                      </Badge>
                    )}
                    {(r.statut === DocumentRequestStatus.APPROUVE ||
                      r.statut === DocumentRequestStatus.GENERE) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleDownloadDoc(r.id, r.typeDocument)}
                        title="Télécharger le document"
                      >
                        <Download size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetail(r.id)}
                    >
                      <Eye size={14} />
                    </Button>
                    {isManager &&
                      (r.statut === DocumentRequestStatus.EN_ATTENTE ||
                        r.statut === DocumentRequestStatus.EN_REVISION) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => openReview(r)}
                        >
                          Traiter
                        </Button>
                      )}
                    {!isManager &&
                      r.statut === DocumentRequestStatus.EN_ATTENTE && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleCancel(r.id)}
                        >
                          <XCircle size={14} />
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detailItem ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {DOC_TYPE_LABELS[detailItem.typeDocument] ||
                    detailItem.typeDocument}
                </DialogTitle>
                <DialogDescription>
                  Demande #{detailItem.id?.slice(-6)} —{" "}
                  {new Date(
                    detailItem.dateCreation || detailItem.createdAt
                  ).toLocaleDateString("fr-TN")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  {statusBadge(detailItem.statut)}
                  {detailItem.employeNom && (
                    <span className="text-sm text-slate-600">
                      par {detailItem.employeNom}
                    </span>
                  )}
                </div>

                {detailItem.note && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Note
                    </p>
                    {detailItem.note}
                  </div>
                )}

                {detailItem.commentaire && (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                    <p className="text-xs font-medium text-blue-500 mb-1">
                      Commentaire du responsable
                    </p>
                    {detailItem.commentaire}
                  </div>
                )}

                {/* Required Papers */}
                {detailItem.requiredPapers?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Justificatifs requis
                    </p>
                    <ul className="space-y-1">
                      {detailItem.requiredPapers.map((p: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <AlertCircle
                            size={14}
                            className="text-amber-500 shrink-0"
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Uploaded Papers */}
                {detailItem.uploadedPapers?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Fichiers joints ({detailItem.uploadedPapers.length})
                    </p>
                    <div className="space-y-2">
                      {detailItem.uploadedPapers.map((f: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip
                              size={14}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="truncate">
                              {f.originalName || f.filename}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {f.size ? `${(f.size / 1024).toFixed(0)} KB` : ""}
                            </span>
                          </div>
                          {f.path && (
                            <a
                              href={`/${f.path}`}
                              target="_blank"
                              rel="noreferrer"
                              title={`Télécharger ${f.originalName || f.filename}`}
                              className="text-blue-600 hover:underline text-xs shrink-0"
                            >
                              <Download size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download button for approved/generated documents */}
                {(detailItem.statut === DocumentRequestStatus.APPROUVE ||
                  detailItem.statut === DocumentRequestStatus.GENERE) && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() =>
                      handleDownloadDoc(detailItem.id, detailItem.typeDocument)
                    }
                  >
                    <Download size={16} className="mr-2" />
                    Télécharger le document
                  </Button>
                )}

                <Separator />

                {/* Upload zone (for employee, if status allows) */}
                {!isManager &&
                  (detailItem.statut === DocumentRequestStatus.EN_ATTENTE ||
                    detailItem.statut ===
                      DocumentRequestStatus.EN_REVISION) && (
                    <div>
                      <input
                        ref={fileInput}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        aria-label="Joindre des fichiers"
                        onChange={e =>
                          handleUpload(detailItem.id, e.target.files)
                        }
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={uploading}
                        onClick={() => fileInput.current?.click()}
                      >
                        {uploading ? (
                          <Loader2 size={16} className="mr-1 animate-spin" />
                        ) : (
                          <Upload size={16} className="mr-1" />
                        )}
                        Joindre des fichiers
                      </Button>
                      <p className="text-[10px] text-slate-400 mt-1 text-center">
                        PDF, images, Word, Excel — max 5 fichiers, 10 MB chacun
                      </p>
                    </div>
                  )}

                {/* Review buttons for manager */}
                {isManager &&
                  (detailItem.statut === DocumentRequestStatus.EN_ATTENTE ||
                    detailItem.statut ===
                      DocumentRequestStatus.EN_REVISION) && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          openReview(detailItem);
                          setDetailOpen(false);
                        }}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Traiter
                      </Button>
                    </div>
                  )}
              </div>
            </>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traiter la demande</DialogTitle>
            <DialogDescription>
              {reviewTarget
                ? DOC_TYPE_LABELS[reviewTarget.typeDocument] ||
                  reviewTarget.typeDocument
                : ""}
              {reviewTarget?.employeNom ? ` — ${reviewTarget.employeNom}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Décision</Label>
              <Select
                value={reviewDecision}
                onValueChange={(v: any) => setReviewDecision(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approuve">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-500" />{" "}
                      Approuver
                    </span>
                  </SelectItem>
                  <SelectItem value="rejete">
                    <span className="flex items-center gap-1">
                      <XCircle size={14} className="text-red-500" /> Rejeter
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder={
                  reviewDecision === "rejete"
                    ? "Motif du rejet…"
                    : "Commentaire optionnel…"
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={submitReview}
              disabled={submittingReview}
              className={
                reviewDecision === "rejete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {submittingReview && (
                <Loader2 size={16} className="mr-1 animate-spin" />
              )}
              {reviewDecision === "approuve" ? "Approuver" : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
