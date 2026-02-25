// ============================================================================
// PayrollHub — Payroll Period Detail
// Variable input, calculation trigger, bulletin list, PDF download
// ============================================================================

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { payrollApi, employeesApi } from "@/lib/api";
import type { PeriodePaie, BulletinPaie, Employe, ElementPaie } from "@shared/types";
import { PayPeriodStatus, PayElementType } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Lock,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const VARIABLE_TYPES = [
  { value: PayElementType.PRIME_ANCIENNETE, label: "Prime d'ancienneté" },
  { value: PayElementType.PRIME_RENDEMENT, label: "Prime de rendement" },
  { value: PayElementType.PRIME_TRANSPORT, label: "Prime de transport" },
  { value: PayElementType.PRIME_PANIER, label: "Prime de panier" },
  { value: PayElementType.PRIME_REPRESENTATION, label: "Prime de représentation" },
  { value: PayElementType.PRIME_BILAN, label: "Prime de bilan" },
  { value: PayElementType.INDEMNITE_DEPLACEMENT, label: "Indemnité de déplacement" },
  { value: PayElementType.INDEMNITE_NUIT, label: "Indemnité de nuit" },
  { value: PayElementType.HEURES_SUP, label: "Heures supplémentaires" },
  { value: PayElementType.AVANTAGE_NATURE, label: "Avantage en nature" },
  { value: PayElementType.ACOMPTE, label: "Acompte" },
  { value: PayElementType.REMBOURSEMENT, label: "Remboursement" },
];

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
}

export default function PayrollPeriodDetail() {
  const [matched, params] = useRoute("/app/paie/:id");
  const [, navigate] = useLocation();
  const periodeId = params?.id || "";

  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<PeriodePaie | null>(null);
  const [bulletins, setBulletins] = useState<BulletinPaie[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [elements, setElements] = useState<ElementPaie[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Variable entry form
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newElementEmployeId, setNewElementEmployeId] = useState("");
  const [newElementType, setNewElementType] = useState<PayElementType>(PayElementType.PRIME_RENDEMENT);
  const [newElementMontant, setNewElementMontant] = useState("");
  const [newElementLibelle, setNewElementLibelle] = useState("");
  const [newElementHeures, setNewElementHeures] = useState("");
  const [addingElement, setAddingElement] = useState(false);

  // Payslip detail dialog
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinPaie | null>(null);

  const fetchData = async () => {
    try {
      const [periodeRes, empRes, elemRes] = await Promise.all([
        payrollApi.getPeriode(periodeId),
        employeesApi.list(),
        payrollApi.getElements(periodeId),
      ]);

      if (periodeRes.data.success && periodeRes.data.data) {
        setPeriode(periodeRes.data.data.periode);
        setBulletins(periodeRes.data.data.bulletins || []);
        setSummary(periodeRes.data.data.summary);
      }
      if (empRes.data.success && empRes.data.data) {
        setEmployes(empRes.data.data.items || []);
      }
      if (elemRes.data.success && elemRes.data.data) {
        setElements(elemRes.data.data);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (periodeId) fetchData(); }, [periodeId]);

  // --- Actions ---

  const handleAddElement = async () => {
    if (!newElementEmployeId || !newElementMontant) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setAddingElement(true);
    try {
      const type = newElementType;
      const label = newElementLibelle || VARIABLE_TYPES.find((t) => t.value === type)?.label || type;

      await payrollApi.addElements(periodeId, [{
        employeId: newElementEmployeId,
        type,
        libelle: label,
        montant: parseFloat(newElementMontant),
        heures: newElementHeures ? parseFloat(newElementHeures) : undefined,
      }]);

      toast.success("Élément ajouté");
      setAddDialogOpen(false);
      setNewElementEmployeId("");
      setNewElementMontant("");
      setNewElementLibelle("");
      setNewElementHeures("");
      fetchData();
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setAddingElement(false);
    }
  };

  const handleClearElements = async () => {
    try {
      await payrollApi.clearElements(periodeId);
      toast.success("Éléments supprimés");
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const { data } = await payrollApi.calculer(periodeId);
      if (data.success && data.data) {
        setBulletins(data.data.bulletins);
        setSummary(data.data.summary);
        setPeriode((prev) => prev ? { ...prev, statut: PayPeriodStatus.CALCULEE } : prev);
        toast.success(`Paie calculée — ${data.data.bulletins.length} bulletins générés`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur de calcul");
    } finally {
      setCalculating(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      await payrollApi.valider(periodeId);
      setPeriode((prev) => prev ? { ...prev, statut: PayPeriodStatus.VALIDEE } : prev);
      toast.success("Période validée");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setValidating(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await payrollApi.finaliser(periodeId);
      setPeriode((prev) => prev ? { ...prev, statut: PayPeriodStatus.FINALISEE } : prev);
      toast.success("Période finalisée (verrouillée)");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setFinalizing(false);
    }
  };

  const handleDownloadPDF = async (bulletinId: string, empNom: string) => {
    try {
      const response = await payrollApi.downloadPDF(bulletinId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `bulletin_${empNom}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!periode) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Période introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/paie")}>
          Retour
        </Button>
      </div>
    );
  }

  const isEditable = periode.statut === PayPeriodStatus.EN_COURS || periode.statut === PayPeriodStatus.CALCULEE;
  const canCalculate = periode.statut === PayPeriodStatus.EN_COURS || periode.statut === PayPeriodStatus.CALCULEE;
  const canValidate = periode.statut === PayPeriodStatus.CALCULEE;
  const canFinalize = periode.statut === PayPeriodStatus.VALIDEE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/paie")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {MOIS_LABELS[periode.mois - 1]} {periode.annee}
            </h1>
            <p className="text-sm text-slate-500">{periode.dateDebut} → {periode.dateFin}</p>
          </div>
          <Badge
            variant={
              periode.statut === PayPeriodStatus.FINALISEE ? "destructive" :
              periode.statut === PayPeriodStatus.VALIDEE ? "outline" :
              periode.statut === PayPeriodStatus.CALCULEE ? "default" : "secondary"
            }
          >
            {periode.statut === PayPeriodStatus.EN_COURS && "En cours"}
            {periode.statut === PayPeriodStatus.CALCULEE && "Calculée"}
            {periode.statut === PayPeriodStatus.VALIDEE && "Validée"}
            {periode.statut === PayPeriodStatus.FINALISEE && "Finalisée"}
          </Badge>
        </div>

        <div className="flex gap-2">
          {canCalculate && (
            <Button onClick={handleCalculate} disabled={calculating} className="bg-blue-600 hover:bg-blue-700">
              {calculating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Calculator size={16} className="mr-2" />}
              Calculer la Paie
            </Button>
          )}
          {canValidate && (
            <Button onClick={handleValidate} disabled={validating} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              {validating ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
              Valider
            </Button>
          )}
          {canFinalize && (
            <Button onClick={handleFinalize} disabled={finalizing} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              {finalizing ? <Loader2 size={16} className="animate-spin mr-2" /> : <Lock size={16} className="mr-2" />}
              Finaliser
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {summary && summary.totalBulletins > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Bulletins", value: summary.totalBulletins, format: false },
            { label: "Brut Total", value: summary.totalBrut, format: true },
            { label: "Net Total", value: summary.totalNet, format: true },
            { label: "CNSS", value: summary.totalCnss, format: true },
            { label: "IRPP", value: summary.totalIrpp, format: true },
            { label: "Coût Employeur", value: summary.totalCoutEmployeur, format: true },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {s.format ? `${fmt(s.value)} TND` : s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs: Variables / Bulletins */}
      <Tabs defaultValue="bulletins">
        <TabsList>
          <TabsTrigger value="variables">
            <Plus size={14} className="mr-1" /> Saisie des Variables
          </TabsTrigger>
          <TabsTrigger value="bulletins">
            <FileText size={14} className="mr-1" /> Bulletins ({bulletins.length})
          </TabsTrigger>
        </TabsList>

        {/* ===================== VARIABLES TAB ===================== */}
        <TabsContent value="variables" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Saisissez les éléments variables (primes, heures sup, indemnités) pour cette période.
            </p>
            <div className="flex gap-2">
              {isEditable && elements.length > 0 && (
                <Button variant="outline" size="sm" className="text-red-600" onClick={handleClearElements}>
                  <Trash2 size={14} className="mr-1" /> Tout supprimer
                </Button>
              )}
              {isEditable && (
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus size={14} className="mr-1" /> Ajouter un élément
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un Élément Variable</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Employé *</Label>
                        <Select value={newElementEmployeId} onValueChange={setNewElementEmployeId}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                          <SelectContent>
                            {employes.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.prenom} {e.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Type *</Label>
                        <Select value={newElementType} onValueChange={(v) => setNewElementType(v as PayElementType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {VARIABLE_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Libellé (optionnel)</Label>
                        <Input value={newElementLibelle} onChange={(e) => setNewElementLibelle(e.target.value)} placeholder="Auto-généré si vide" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Montant (TND) *</Label>
                          <Input type="number" step="0.001" value={newElementMontant} onChange={(e) => setNewElementMontant(e.target.value)} />
                        </div>
                        <div>
                          <Label>Heures (optionnel)</Label>
                          <Input type="number" step="0.5" value={newElementHeures} onChange={(e) => setNewElementHeures(e.target.value)} />
                        </div>
                      </div>
                      <Button onClick={handleAddElement} disabled={addingElement} className="w-full bg-blue-600 hover:bg-blue-700">
                        {addingElement ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                        Ajouter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {elements.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-8">
                <Wallet className="text-slate-300" size={40} />
                <p className="text-slate-500 mt-3">Aucun élément variable saisi</p>
                <p className="text-xs text-slate-400">Les salaires de base sont inclus automatiquement lors du calcul</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elements.map((el) => {
                    const emp = employes.find((e) => e.id === el.employeId);
                    return (
                      <TableRow key={el.id}>
                        <TableCell className="font-medium">{emp ? `${emp.prenom} ${emp.nom}` : el.employeId.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{el.type}</Badge></TableCell>
                        <TableCell>{el.libelle}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(el.montant)}</TableCell>
                        <TableCell className="text-right">{el.heures ? `${el.heures}h` : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ===================== BULLETINS TAB ===================== */}
        <TabsContent value="bulletins" className="space-y-4">
          {bulletins.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-8">
                <FileText className="text-slate-300" size={40} />
                <p className="text-slate-500 mt-3">Aucun bulletin de paie</p>
                <p className="text-xs text-slate-400">Cliquez sur "Calculer la Paie" pour générer les bulletins</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead className="text-right">Brut</TableHead>
                    <TableHead className="text-right">CNSS</TableHead>
                    <TableHead className="text-right">IRPP</TableHead>
                    <TableHead className="text-right">Net à Payer</TableHead>
                    <TableHead className="text-right">Coût Employeur</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulletins.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.employe.prenom} {b.employe.nom}</TableCell>
                      <TableCell className="text-sm text-slate-500">{b.employe.poste}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(b.salaireBrut)}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">-{fmt(b.cnssSalarial)}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">-{fmt(b.irpp)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-blue-600">{fmt(b.netAPayer)}</TableCell>
                      <TableCell className="text-right font-mono text-slate-500">{fmt(b.coutTotalEmployeur)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Voir le détail"
                            onClick={() => setSelectedBulletin(b)}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            title="Télécharger PDF"
                            onClick={() => handleDownloadPDF(b.id, `${b.employe.nom}_${b.employe.prenom}`)}
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ===================== PAYSLIP DETAIL DIALOG ===================== */}
      <Dialog open={!!selectedBulletin} onOpenChange={() => setSelectedBulletin(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBulletin && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText size={18} />
                  Bulletin de Paie — {selectedBulletin.employe.prenom} {selectedBulletin.employe.nom}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Employee info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">CIN:</span>{" "}
                    <span className="font-medium">{selectedBulletin.employe.cin}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">CNSS:</span>{" "}
                    <span className="font-medium">{selectedBulletin.employe.matriculeCnss}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Poste:</span>{" "}
                    <span className="font-medium">{selectedBulletin.employe.poste}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Catégorie:</span>{" "}
                    <span className="font-medium">{selectedBulletin.employe.categoriePro}</span>
                  </div>
                </div>

                {/* Gains */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Gains</h4>
                  <Table>
                    <TableBody>
                      {selectedBulletin.elements
                        .filter((e) => ![
                          PayElementType.CNSS_SALARIAL, PayElementType.CNSS_PATRONAL,
                          PayElementType.IRPP, PayElementType.FOPROLOS, PayElementType.TFP,
                          PayElementType.ACOMPTE, PayElementType.SAISIE_SALAIRE,
                        ].includes(e.type))
                        .map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="text-sm">{e.libelle}</TableCell>
                            <TableCell className="text-right font-mono">{fmt(e.montant)} TND</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                <div className="space-y-2 border-t pt-3">
                  {[
                    { label: "Salaire Brut", value: selectedBulletin.salaireBrut, bold: true },
                    { label: "CNSS Salariale", value: -selectedBulletin.cnssSalarial, red: true },
                    { label: "IRPP", value: -selectedBulletin.irpp, red: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className={row.bold ? "font-semibold" : ""}>{row.label}</span>
                      <span className={`font-mono ${row.red ? "text-red-600" : ""} ${row.bold ? "font-bold" : ""}`}>
                        {row.value < 0 ? `-${fmt(Math.abs(row.value))}` : fmt(row.value)} TND
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900">Net à Payer</span>
                  <span className="text-xl font-bold text-blue-600">{fmt(selectedBulletin.netAPayer)} TND</span>
                </div>

                <div className="text-sm text-slate-500 space-y-1 border-t pt-3">
                  <div className="flex justify-between">
                    <span>CNSS Patronale</span>
                    <span className="font-mono">{fmt(selectedBulletin.cnssPatronal)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FOPROLOS</span>
                    <span className="font-mono">{fmt(selectedBulletin.foprolos)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TFP</span>
                    <span className="font-mono">{fmt(selectedBulletin.tfp)} TND</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700 pt-2 border-t">
                    <span>Coût Total Employeur</span>
                    <span className="font-mono">{fmt(selectedBulletin.coutTotalEmployeur)} TND</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleDownloadPDF(selectedBulletin.id, `${selectedBulletin.employe.nom}_${selectedBulletin.employe.prenom}`)}
                >
                  <Download size={16} className="mr-2" />
                  Télécharger le PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
