// ============================================================================
// PayrollHub — Settings Page
// Company settings + regulatory parameters with inline editing
// ============================================================================

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parametresApi, entreprisesApi } from "@/lib/api";
import type { ParametreReglementaire, Entreprise } from "@shared/types";
import { UserRole } from "@shared/types";
import { ROLE_HIERARCHY } from "@shared/const";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2, Calculator, Percent, Banknote, Clock, CalendarDays,
  Shield, TrendingUp, Pencil, Check, X, Loader2, Save,
} from "lucide-react";

interface ParamGroup {
  categorie: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const paramGroups: ParamGroup[] = [
  { categorie: "smig", label: "SMIG", icon: <Banknote size={18} />, color: "blue" },
  { categorie: "cnss", label: "Cotisations CNSS", icon: <Shield size={18} />, color: "indigo" },
  { categorie: "irpp", label: "IRPP (Barème & Déductions)", icon: <Percent size={18} />, color: "purple" },
  { categorie: "autres", label: "Autres Contributions", icon: <TrendingUp size={18} />, color: "emerald" },
  { categorie: "heures_sup", label: "Heures Supplémentaires", icon: <Clock size={18} />, color: "amber" },
  { categorie: "conges", label: "Congés", icon: <CalendarDays size={18} />, color: "rose" },
];

export default function Settings() {
  const [parametres, setParametres] = useState<ParametreReglementaire[]>([]);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Company edit state
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState<Partial<Entreprise>>({});
  const [savingCompany, setSavingCompany] = useState(false);

  const userLevel = ROLE_HIERARCHY[user?.role as keyof typeof ROLE_HIERARCHY] || 0;
  const isSuperAdmin = userLevel >= ROLE_HIERARCHY[UserRole.SUPER_ADMIN];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paramsRes, entRes] = await Promise.all([
        parametresApi.list(),
        entreprisesApi.get(user!.entrepriseId),
      ]);
      if (paramsRes.data.success && paramsRes.data.data) setParametres(paramsRes.data.data);
      if (entRes.data.success && entRes.data.data) setEntreprise(entRes.data.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getParamsByCategory = (cat: string) =>
    parametres.filter((p) => p.categorie === cat);

  const formatValue = (param: ParametreReglementaire) => {
    const val = parseFloat(param.valeur);
    if (isNaN(val)) return param.valeur;
    if (param.categorie === "smig") return `${val.toFixed(3)} TND`;
    if (param.categorie === "irpp" && param.nom.startsWith("IRPP_FRAIS_PRO_PLAFOND")) return `${val.toFixed(0)} TND`;
    if (param.categorie === "irpp" && param.nom.includes("DEDUCTION")) return `${val.toFixed(0)} TND/an`;
    return `${val}%`;
  };

  const startEdit = (param: ParametreReglementaire) => {
    setEditingId(param.id);
    setEditValue(param.valeur);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveParam = async () => {
    if (!editingId || !editValue.trim()) return;
    setSaving(true);
    try {
      const res = await parametresApi.update(editingId, { valeur: editValue.trim() });
      if (res.data.success && res.data.data) {
        setParametres((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, valeur: editValue.trim() } : p))
        );
      }
      setEditingId(null);
      setEditValue("");
    } catch (err) {
      console.error("Failed to update parameter:", err);
    } finally {
      setSaving(false);
    }
  };

  const startCompanyEdit = () => {
    if (!entreprise) return;
    setCompanyForm({
      nom: entreprise.nom,
      adresse: entreprise.adresse,
      telephone: entreprise.telephone || "",
      email: entreprise.email || "",
    });
    setEditingCompany(true);
  };

  const saveCompany = async () => {
    if (!entreprise) return;
    setSavingCompany(true);
    try {
      const res = await entreprisesApi.update(entreprise.id, companyForm);
      if (res.data.success && res.data.data) {
        setEntreprise(res.data.data);
      }
      setEditingCompany(false);
    } catch (err) {
      console.error("Failed to update company:", err);
    } finally {
      setSavingCompany(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white rounded-xl border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">
          Paramètres réglementaires et configuration de l'entreprise
        </p>
      </div>

      <Tabs defaultValue="reglementaire" className="space-y-4">
        <TabsList className="bg-white border shadow-sm h-11 p-1">
          <TabsTrigger value="reglementaire" className="text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Calculator size={15} className="mr-1.5" />
            Réglementaire
          </TabsTrigger>
          <TabsTrigger value="entreprise" className="text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Building2 size={15} className="mr-1.5" />
            Entreprise
          </TabsTrigger>
        </TabsList>

        {/* Regulatory Parameters */}
        <TabsContent value="reglementaire" className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Valeurs 2025-2026</strong> — Basées sur la Loi de Finances 2025, incluant les mises à jour CNSS et le nouveau barème IRPP avec CSS.
              {isSuperAdmin && (
                <span className="ml-2 text-blue-500 font-normal">
                  — Cliquez sur <Pencil size={12} className="inline mx-0.5" /> pour modifier une valeur.
                </span>
              )}
            </p>
          </div>

          {paramGroups.map((group) => {
            const params = getParamsByCategory(group.categorie);
            if (params.length === 0) return null;
            return (
              <Card key={group.categorie} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={`text-${group.color}-600`}>{group.icon}</span>
                    {group.label}
                    <Badge variant="outline" className="ml-auto text-xs bg-slate-50">
                      {params.length} paramètre{params.length > 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {params.map((param) => (
                      <div
                        key={param.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          editingId === param.id
                            ? "bg-blue-50/50 border-blue-200"
                            : "bg-slate-50/80 border-slate-100"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {param.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            Depuis le {param.dateDebutValidite}
                          </p>
                        </div>

                        {editingId === param.id ? (
                          <div className="flex items-center gap-1.5 ml-3">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 h-8 text-sm text-right font-mono"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveParam();
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                              onClick={saveParam}
                              disabled={saving}
                            >
                              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                              onClick={cancelEdit}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 ml-3">
                            <span className={`text-sm font-bold text-${group.color}-700 whitespace-nowrap`}>
                              {formatValue(param)}
                            </span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => startEdit(param)}
                                className="text-slate-300 hover:text-blue-600 transition-colors p-0.5"
                                title="Modifier"
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Company Info */}
        <TabsContent value="entreprise">
          {entreprise && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 size={18} className="text-blue-600" />
                  Informations de l'Entreprise
                  {isSuperAdmin && !editingCompany && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto h-8 text-xs"
                      onClick={startCompanyEdit}
                    >
                      <Pencil size={13} className="mr-1" />
                      Modifier
                    </Button>
                  )}
                  {editingCompany && (
                    <div className="ml-auto flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setEditingCompany(false)}
                      >
                        <X size={13} className="mr-1" />
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={saveCompany}
                        disabled={savingCompany}
                      >
                        {savingCompany ? <Loader2 size={13} className="mr-1 animate-spin" /> : <Save size={13} className="mr-1" />}
                        Enregistrer
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Nom</p>
                    {editingCompany ? (
                      <Input
                        value={companyForm.nom || ""}
                        onChange={(e) => setCompanyForm({ ...companyForm, nom: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{entreprise.nom}</p>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Adresse</p>
                    {editingCompany ? (
                      <Input
                        value={companyForm.adresse || ""}
                        onChange={(e) => setCompanyForm({ ...companyForm, adresse: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{entreprise.adresse}</p>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Matricule Fiscal</p>
                    <p className="text-sm font-semibold text-slate-800 font-mono">{entreprise.matriculeFiscal}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Code CNSS</p>
                    <p className="text-sm font-semibold text-slate-800 font-mono">{entreprise.codeCnss}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Secteur d'Activité</p>
                    <p className="text-sm font-semibold text-slate-800 capitalize">{entreprise.secteurActivite}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Régime de Travail</p>
                    <p className="text-sm font-semibold text-slate-800">{entreprise.regimeTravail}/semaine</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Téléphone</p>
                    {editingCompany ? (
                      <Input
                        value={companyForm.telephone || ""}
                        onChange={(e) => setCompanyForm({ ...companyForm, telephone: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{entreprise.telephone || "—"}</p>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Email</p>
                    {editingCompany ? (
                      <Input
                        value={companyForm.email || ""}
                        onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{entreprise.email || "—"}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
