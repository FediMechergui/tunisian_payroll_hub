// ============================================================================
// PayrollHub — Platform Dashboard (Super External Admin)
// Manage companies, plans, and view platform-wide statistics
// ============================================================================

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { superExternalApi } from "@/lib/api";
import { UserRole, PlanType, SectorType, WorkRegime } from "@shared/types";
import type { Entreprise, Utilisateur } from "@shared/types";
import { PLAN_LIMITS } from "@shared/const";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Building2,
  Users,
  UserPlus,
  Crown,
  Plus,
  RefreshCw,
  Globe,
  TrendingUp,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";

type CompanyRow = Entreprise & { employeeCount: number; userCount: number };

export default function PlatformDashboard() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<string | null>(null);
  const [companyDetail, setCompanyDetail] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    companyName: "",
    matriculeFiscal: "",
    adresse: "",
    codeCnss: "",
    telephone: "",
    secteurActivite: "services" as SectorType,
    regimeTravail: "48h" as WorkRegime,
    plan: PlanType.GRATUIT,
    adminEmail: "",
    adminPassword: "",
    adminNom: "",
    adminPrenom: "",
  });

  // Redirect non-super-external users
  if (user?.role !== UserRole.SUPER_EXTERNAL_ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-lg font-semibold">Accès Refusé</h2>
            <p className="text-sm text-slate-500 mt-2">
              Cette page est réservée aux administrateurs de la plateforme.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const load = async () => {
    setLoading(true);
    try {
      const [companiesRes, statsRes] = await Promise.all([
        superExternalApi.listCompanies(),
        superExternalApi.getStats(),
      ]);
      setCompanies(companiesRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.companyName || !form.matriculeFiscal || !form.adminEmail || !form.adminPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setCreating(true);
    try {
      await superExternalApi.createCompany({
        companyName: form.companyName,
        matriculeFiscal: form.matriculeFiscal,
        adresse: form.adresse,
        codeCnss: form.codeCnss,
        telephone: form.telephone,
        secteurActivite: form.secteurActivite,
        regimeTravail: form.regimeTravail,
        plan: form.plan,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminNom: form.adminNom,
        adminPrenom: form.adminPrenom,
      });
      toast.success("Entreprise créée avec succès");
      setDialogOpen(false);
      setForm({
        companyName: "",
        matriculeFiscal: "",
        adresse: "",
        codeCnss: "",
        telephone: "",
        secteurActivite: "services" as SectorType,
        regimeTravail: "48h" as WorkRegime,
        plan: PlanType.GRATUIT,
        adminEmail: "",
        adminPassword: "",
        adminNom: "",
        adminPrenom: "",
      });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailDialog(id);
    try {
      const res = await superExternalApi.getCompany(id);
      setCompanyDetail(res.data.data);
    } catch {
      toast.error("Erreur lors du chargement des détails");
    }
  };

  const handlePlanChange = async (companyId: string, newPlan: string) => {
    try {
      await superExternalApi.updatePlan(companyId, newPlan);
      toast.success("Plan mis à jour");
      load();
      if (detailDialog === companyId) openDetail(companyId);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const planColor = (plan: string) => {
    switch (plan) {
      case PlanType.GRATUIT: return "bg-slate-100 text-slate-600";
      case PlanType.STARTER: return "bg-blue-100 text-blue-700";
      case PlanType.BUSINESS: return "bg-purple-100 text-purple-700";
      case PlanType.ENTERPRISE: return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion Plateforme</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérer les entreprises, plans et utilisateurs de PayrollHub
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualiser
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Nouvelle Entreprise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une Entreprise</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle entreprise avec un administrateur super_admin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de l'entreprise *</Label>
                    <Input
                      value={form.companyName}
                      onChange={e => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Ma Société SARL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Matricule Fiscal *</Label>
                    <Input
                      value={form.matriculeFiscal}
                      onChange={e => setForm({ ...form, matriculeFiscal: e.target.value })}
                      placeholder="1234567ABC000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input
                      value={form.adresse}
                      onChange={e => setForm({ ...form, adresse: e.target.value })}
                      placeholder="Tunis, Tunisie"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={form.telephone}
                      onChange={e => setForm({ ...form, telephone: e.target.value })}
                      placeholder="+216 71 XXX XXX"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Secteur d'activité</Label>
                    <Select value={form.secteurActivite} onValueChange={v => setForm({ ...form, secteurActivite: v as SectorType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="industrie">Industrie</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="batiment">Bâtiment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={form.plan} onValueChange={v => setForm({ ...form, plan: v as PlanType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PLAN_LIMITS).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            {info.label} ({info.maxEmployees === -1 ? "Illimité" : `${info.maxEmployees} emp.`})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
                <p className="text-sm font-medium text-slate-700">Administrateur (Super Admin)</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input
                      value={form.adminPrenom}
                      onChange={e => setForm({ ...form, adminPrenom: e.target.value })}
                      placeholder="Ahmed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={form.adminNom}
                      onChange={e => setForm({ ...form, adminNom: e.target.value })}
                      placeholder="Ben Ali"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={form.adminEmail}
                      onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                      placeholder="admin@entreprise.tn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mot de passe *</Label>
                    <Input
                      type="password"
                      value={form.adminPassword}
                      onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 size={16} className="mr-1 animate-spin" />}
                  Créer l'Entreprise
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalCompanies}</p>
                  <p className="text-xs text-slate-500">Entreprises</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                  <p className="text-xs text-slate-500">Utilisateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <UserPlus size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalEmployees}</p>
                  <p className="text-xs text-slate-500">Employés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Crown size={20} className="text-amber-600" />
                </div>
                <div>
                  <div className="flex gap-1 flex-wrap">
                    {stats.companiesByPlan && Object.entries(stats.companiesByPlan).map(([plan, count]: any) => (
                      <Badge key={plan} variant="outline" className="text-[10px]">
                        {plan}: {count}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Par Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Entreprises</CardTitle>
          <CardDescription>
            Liste de toutes les entreprises inscrites sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Building2 size={48} className="mx-auto mb-3 opacity-50" />
              <p>Aucune entreprise enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Entreprise</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Matricule Fiscal</th>
                    <th className="text-left py-3 px-3 text-slate-500 font-medium">Plan</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-medium">Employés</th>
                    <th className="text-center py-3 px-3 text-slate-500 font-medium">Utilisateurs</th>
                    <th className="text-right py-3 px-3 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-slate-900">{c.nom}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-xs">{c.matriculeFiscal}</td>
                      <td className="py-3 px-3">
                        <Select
                          value={c.plan || "gratuit"}
                          onValueChange={v => handlePlanChange(c.id, v)}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PLAN_LIMITS).map(([key, info]) => (
                              <SelectItem key={key} value={key}>{info.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-slate-900 font-medium">{c.employeeCount}</span>
                        <span className="text-slate-400">/{c.maxEmployees === -1 ? "∞" : c.maxEmployees}</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{c.userCount}</td>
                      <td className="py-3 px-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(c.id)}>
                          Détails <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => { setDetailDialog(null); setCompanyDetail(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{companyDetail?.company?.nom || "Chargement..."}</DialogTitle>
            <DialogDescription>
              MF: {companyDetail?.company?.matriculeFiscal || "—"}
            </DialogDescription>
          </DialogHeader>
          {companyDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Plan</p>
                  <Badge className={planColor(companyDetail.company?.plan || "gratuit")}>{companyDetail.company?.plan || "gratuit"}</Badge>
                </div>
                <div>
                  <p className="text-slate-500">Employés</p>
                  <p className="font-medium">{companyDetail.employeeCount ?? 0} / {companyDetail.company?.maxEmployees === -1 ? "∞" : companyDetail.company?.maxEmployees ?? "—"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Adresse</p>
                  <p className="font-medium">{companyDetail.company?.adresse || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Téléphone</p>
                  <p className="font-medium">{companyDetail.company?.telephone || "—"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Utilisateurs ({companyDetail.users?.length || 0})</p>
                <div className="space-y-2">
                  {companyDetail.users?.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="font-medium">{u.prenom} {u.nom}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{u.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
