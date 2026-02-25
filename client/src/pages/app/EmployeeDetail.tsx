// ============================================================================
// PayrollHub — Employee Detail Page
// Tabbed view with all employee information
// ============================================================================

import { useEffect, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { employeesApi } from "@/lib/api";
import type { Employe } from "@shared/types";
import { ContractType } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HIERARCHY } from "@shared/const";
import { UserRole } from "@shared/types";
import {
  ArrowLeft, Edit, User, Briefcase, CreditCard, Calendar, FileText,
  MapPin, Phone, Mail, Building2, Hash, Heart, Users as UsersIcon,
  Banknote, Landmark, Clock
} from "lucide-react";

const contractColors: Record<ContractType, string> = {
  [ContractType.CDI]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [ContractType.CDD]: "bg-blue-50 text-blue-700 border-blue-200",
  [ContractType.SIVP]: "bg-amber-50 text-amber-700 border-amber-200",
  [ContractType.KARAMA]: "bg-purple-50 text-purple-700 border-purple-200",
};

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function EmployeeDetail() {
  const [, params] = useRoute("/app/employes/:id");
  const [emp, setEmp] = useState<Employe | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const userLevel = ROLE_HIERARCHY[user?.role as keyof typeof ROLE_HIERARCHY] || 0;
  const canEdit = userLevel >= ROLE_HIERARCHY[UserRole.ADMIN_RH];

  useEffect(() => {
    if (params?.id) loadEmployee(params.id);
  }, [params?.id]);

  const loadEmployee = async (id: string) => {
    try {
      const res = await employeesApi.get(id);
      if (res.data.success && res.data.data) {
        setEmp(res.data.data);
      }
    } catch {
      setLocation("/app/employes");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value) + " TND";

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-TN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const maritalLabels: Record<string, string> = {
    celibataire: "Célibataire",
    marie: "Marié(e)",
    divorce: "Divorcé(e)",
    veuf: "Veuf/Veuve",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-48 bg-white rounded-xl border animate-pulse" />
      </div>
    );
  }

  if (!emp) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/employes">
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft size={18} className="mr-1" />
            Retour
          </Button>
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white flex-shrink-0">
              <span className="text-blue-600 font-bold text-xl">
                {emp.prenom[0]}{emp.nom[0]}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {emp.prenom} {emp.nom}
              </h1>
              <p className="text-slate-500 text-sm">{emp.poste} — {emp.departement}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className={`${contractColors[emp.typeContrat]} text-sm px-3 py-1`}>
                {emp.typeContrat}
              </Badge>
              {canEdit && (
                <Link href={`/app/employes/${emp.id}/modifier`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit size={14} className="mr-1.5" />
                    Modifier
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="personnel" className="space-y-4">
        <TabsList className="bg-white border shadow-sm h-11 p-1">
          <TabsTrigger value="personnel" className="text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <User size={15} className="mr-1.5" />
            Personnel
          </TabsTrigger>
          <TabsTrigger value="emploi" className="text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Briefcase size={15} className="mr-1.5" />
            Emploi
          </TabsTrigger>
          <TabsTrigger value="financier" className="text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <CreditCard size={15} className="mr-1.5" />
            Financier
          </TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personnel">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                <InfoItem icon={<User size={16} />} label="Nom complet" value={`${emp.prenom} ${emp.nom}`} />
                <InfoItem icon={<Hash size={16} />} label="CIN" value={emp.cin} />
                <InfoItem icon={<Calendar size={16} />} label="Date de naissance" value={formatDate(emp.dateNaissance)} />
                <InfoItem icon={<MapPin size={16} />} label="Adresse" value={emp.adresse} />
                <InfoItem icon={<Phone size={16} />} label="Téléphone" value={emp.telephone} />
                <InfoItem icon={<Mail size={16} />} label="Email" value={emp.email} />
                <InfoItem icon={<Heart size={16} />} label="Situation familiale" value={maritalLabels[emp.situationFamiliale] || emp.situationFamiliale} />
                <InfoItem icon={<UsersIcon size={16} />} label="Enfants à charge" value={emp.nbEnfants} />
                <InfoItem icon={<MapPin size={16} />} label="Résidence fiscale" value={emp.residenceFiscale} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Info */}
        <TabsContent value="emploi">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informations d'Emploi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                <InfoItem icon={<Hash size={16} />} label="Matricule CNSS" value={emp.matriculeCnss} />
                <InfoItem icon={<Calendar size={16} />} label="Date d'embauche" value={formatDate(emp.dateEmbauche)} />
                <InfoItem icon={<FileText size={16} />} label="Type de contrat" value={emp.typeContrat} />
                <InfoItem icon={<Briefcase size={16} />} label="Catégorie professionnelle" value={emp.categoriePro} />
                <InfoItem icon={<Briefcase size={16} />} label="Poste" value={emp.poste} />
                <InfoItem icon={<Building2 size={16} />} label="Département" value={emp.departement} />
                <InfoItem icon={<Building2 size={16} />} label="Établissement" value={emp.etablissement} />
                <InfoItem icon={<Clock size={16} />} label="Ancienneté" value={
                  (() => {
                    const start = new Date(emp.dateEmbauche);
                    const now = new Date();
                    const years = now.getFullYear() - start.getFullYear();
                    const months = now.getMonth() - start.getMonth();
                    const totalMonths = years * 12 + months;
                    return totalMonths < 12
                      ? `${totalMonths} mois`
                      : `${Math.floor(totalMonths / 12)} an${Math.floor(totalMonths / 12) > 1 ? "s" : ""} et ${totalMonths % 12} mois`;
                  })()
                } />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Info */}
        <TabsContent value="financier">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informations Financières</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                <InfoItem icon={<Banknote size={16} />} label="Salaire de base" value={formatCurrency(emp.salaireBase)} />
                <InfoItem icon={<CreditCard size={16} />} label="IBAN" value={emp.iban} />
                <InfoItem icon={<Landmark size={16} />} label="Banque" value={emp.banque} />
              </div>

              {/* Quick payroll simulation */}
              <Separator className="my-6" />
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Estimation Rapide (basée sur le salaire de base)</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-500 font-medium mb-1">CNSS Salarié (9,68%)</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(emp.salaireBase * 0.0968)}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs text-indigo-500 font-medium mb-1">CNSS Patronal (17,07%)</p>
                  <p className="text-lg font-bold text-indigo-700">{formatCurrency(emp.salaireBase * 0.1707)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-500 font-medium mb-1">Net Estimé (≈)</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(emp.salaireBase * 0.82)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-500 font-medium mb-1">Coût Employeur (≈)</p>
                  <p className="text-lg font-bold text-purple-700">{formatCurrency(emp.salaireBase * 1.2007)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
