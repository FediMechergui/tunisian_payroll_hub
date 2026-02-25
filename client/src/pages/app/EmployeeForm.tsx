// ============================================================================
// PayrollHub — Employee Form (Create / Edit)
// Multi-step form with Zod validation
// ============================================================================

import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployeSchema, type CreateEmployeInput } from "@shared/schema";
import { ContractType, MaritalStatus } from "@shared/types";
import { DEPARTEMENTS, CATEGORIES_PRO, BANQUES_TN } from "@shared/const";
import { employeesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Loader2, User, Briefcase, CreditCard } from "lucide-react";

const STEPS = [
  { id: 0, label: "Informations Personnelles", icon: <User size={18} /> },
  { id: 1, label: "Emploi", icon: <Briefcase size={18} /> },
  { id: 2, label: "Financier", icon: <CreditCard size={18} /> },
];

export default function EmployeeForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [, setLocation] = useLocation();

  // Detect edit mode from route
  const [isEditRoute, editParams] = useRoute("/app/employes/:id/modifier");
  const isEdit = !!isEditRoute && !!editParams?.id;
  const employeeId = editParams?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeInput>({
    resolver: zodResolver(createEmployeSchema),
    defaultValues: {
      nbEnfants: 0,
      salaireBase: 0,
      situationFamiliale: MaritalStatus.CELIBATAIRE,
      typeContrat: ContractType.CDI,
    },
  });

  // Fetch employee data when editing
  useEffect(() => {
    if (isEdit && employeeId) {
      setLoadingEmployee(true);
      employeesApi
        .get(employeeId)
        .then((res) => {
          if (res.data.success && res.data.data) {
            const emp = res.data.data;
            reset({
              nom: emp.nom,
              prenom: emp.prenom,
              cin: emp.cin,
              dateNaissance: emp.dateNaissance,
              adresse: emp.adresse,
              telephone: emp.telephone || "",
              email: emp.email || "",
              situationFamiliale: emp.situationFamiliale,
              nbEnfants: emp.nbEnfants,
              residenceFiscale: emp.residenceFiscale,
              matriculeCnss: emp.matriculeCnss,
              dateEmbauche: emp.dateEmbauche,
              typeContrat: emp.typeContrat,
              categoriePro: emp.categoriePro,
              poste: emp.poste,
              departement: emp.departement,
              etablissement: emp.etablissement || "",
              salaireBase: emp.salaireBase,
              iban: emp.iban,
              banque: emp.banque || "",
            });
          }
        })
        .catch(() => {
          setLocation("/app/employes");
        })
        .finally(() => {
          setLoadingEmployee(false);
        });
    }
  }, [isEdit, employeeId]);

  const maritalLabels: Record<string, string> = {
    [MaritalStatus.CELIBATAIRE]: "Célibataire",
    [MaritalStatus.MARIE]: "Marié(e)",
    [MaritalStatus.DIVORCE]: "Divorcé(e)",
    [MaritalStatus.VEUF]: "Veuf/Veuve",
  };

  const step0Fields: (keyof CreateEmployeInput)[] = [
    "nom", "prenom", "cin", "dateNaissance", "adresse", "telephone", "email",
    "situationFamiliale", "nbEnfants", "residenceFiscale",
  ];
  const step1Fields: (keyof CreateEmployeInput)[] = [
    "matriculeCnss", "dateEmbauche", "typeContrat", "categoriePro", "poste",
    "departement", "etablissement",
  ];
  const step2Fields: (keyof CreateEmployeInput)[] = [
    "salaireBase", "iban", "banque",
  ];

  const goNext = async () => {
    const fields = step === 0 ? step0Fields : step === 1 ? step1Fields : step2Fields;
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = async (data: CreateEmployeInput) => {
    setIsSubmitting(true);
    try {
      const res = isEdit
        ? await employeesApi.update(employeeId!, data)
        : await employeesApi.create(data);
      if (res.data.success) {
        setLocation(isEdit ? `/app/employes/${employeeId}` : "/app/employes");
      }
    } catch (err: any) {
      console.error(isEdit ? "Update employee error:" : "Create employee error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ name }: { name: keyof CreateEmployeInput }) => {
    const error = errors[name];
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1">{error.message as string}</p>;
  };

  if (loadingEmployee) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setLocation(isEdit ? `/app/employes/${employeeId}` : "/app/employes")}>
          <ArrowLeft size={18} className="mr-1" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Modifier l'Employé" : "Nouvel Employé"}</h1>
          <p className="text-slate-500 text-sm">{isEdit ? "Modifiez les informations de l'employé" : "Remplissez les informations pour créer un nouveau profil"}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                i === step
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : i < step
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                  : "bg-slate-50 text-slate-400 border border-slate-100"
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === step ? "bg-blue-600 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span className="hidden sm:inline truncate">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 flex-shrink-0 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input id="prenom" {...register("prenom")} className="mt-1" placeholder="Prénom" />
                  <FieldError name="prenom" />
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" {...register("nom")} className="mt-1" placeholder="Nom de famille" />
                  <FieldError name="nom" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cin">CIN (Carte d'Identité Nationale) *</Label>
                  <Input id="cin" {...register("cin")} className="mt-1" placeholder="12345678" maxLength={8} />
                  <FieldError name="cin" />
                </div>
                <div>
                  <Label htmlFor="dateNaissance">Date de Naissance *</Label>
                  <Input id="dateNaissance" type="date" {...register("dateNaissance")} className="mt-1" />
                  <FieldError name="dateNaissance" />
                </div>
              </div>
              <div>
                <Label htmlFor="adresse">Adresse *</Label>
                <Input id="adresse" {...register("adresse")} className="mt-1" placeholder="Adresse complète" />
                <FieldError name="adresse" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" {...register("telephone")} className="mt-1" placeholder="+216 XX XXX XXX" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1" placeholder="prenom.nom@email.tn" />
                  <FieldError name="email" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Situation Familiale *</Label>
                  <Select
                    value={watch("situationFamiliale")}
                    onValueChange={(v) => setValue("situationFamiliale", v as MaritalStatus)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(maritalLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nbEnfants">Enfants à Charge</Label>
                  <Input id="nbEnfants" type="number" min={0} max={20} {...register("nbEnfants", { valueAsNumber: true })} className="mt-1" />
                  <FieldError name="nbEnfants" />
                </div>
                <div>
                  <Label htmlFor="residenceFiscale">Résidence Fiscale *</Label>
                  <Input id="residenceFiscale" {...register("residenceFiscale")} className="mt-1" placeholder="Tunis" />
                  <FieldError name="residenceFiscale" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Employment */}
        {step === 1 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                Informations d'Emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="matriculeCnss">Matricule CNSS *</Label>
                  <Input id="matriculeCnss" {...register("matriculeCnss")} className="mt-1" placeholder="CNS00XXXX" />
                  <FieldError name="matriculeCnss" />
                </div>
                <div>
                  <Label htmlFor="dateEmbauche">Date d'Embauche *</Label>
                  <Input id="dateEmbauche" type="date" {...register("dateEmbauche")} className="mt-1" />
                  <FieldError name="dateEmbauche" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Type de Contrat *</Label>
                  <Select
                    value={watch("typeContrat")}
                    onValueChange={(v) => setValue("typeContrat", v as ContractType)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(ContractType).map((ct) => (
                        <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Catégorie Professionnelle *</Label>
                  <Select
                    value={watch("categoriePro")}
                    onValueChange={(v) => setValue("categoriePro", v)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES_PRO.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError name="categoriePro" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="poste">Poste *</Label>
                  <Input id="poste" {...register("poste")} className="mt-1" placeholder="Intitulé du poste" />
                  <FieldError name="poste" />
                </div>
                <div>
                  <Label>Département *</Label>
                  <Select
                    value={watch("departement")}
                    onValueChange={(v) => setValue("departement", v)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTEMENTS.map((dep) => (
                        <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError name="departement" />
                </div>
              </div>
              <div>
                <Label htmlFor="etablissement">Établissement</Label>
                <Input id="etablissement" {...register("etablissement")} className="mt-1" placeholder="Nom de l'établissement (optionnel)" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Financial */}
        {step === 2 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                Informations Financières
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="salaireBase">Salaire de Base (TND/mois) *</Label>
                <Input id="salaireBase" type="number" step="0.001" min={0} {...register("salaireBase", { valueAsNumber: true })} className="mt-1" placeholder="1200.000" />
                <FieldError name="salaireBase" />
                <p className="text-xs text-slate-400 mt-1">
                  SMIG 2025 : 528,320 TND (48h) / 448,238 TND (40h)
                </p>
              </div>
              <div>
                <Label htmlFor="iban">IBAN *</Label>
                <Input id="iban" {...register("iban")} className="mt-1 font-mono" placeholder="TN59 XXXX XXXX XXXX XXXX XXXX" />
                <FieldError name="iban" />
              </div>
              <div>
                <Label>Banque</Label>
                <Select
                  value={watch("banque") || ""}
                  onValueChange={(v) => setValue("banque", v)}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner une banque" /></SelectTrigger>
                  <SelectContent>
                    {BANQUES_TN.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => step > 0 ? setStep(s => s - 1) : setLocation("/app/employes")}
            className="gap-1"
          >
            <ArrowLeft size={16} />
            {step > 0 ? "Précédent" : "Annuler"}
          </Button>

          {step < 2 ? (
            <Button type="button" onClick={goNext} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
              Suivant
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isEdit ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  <Check size={16} />
                  {isEdit ? "Enregistrer" : "Créer l'Employé"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
