// ============================================================================
// PayrollHub — Signup Page
// Create a company + super_admin account and choose a plan
// ============================================================================

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { SectorType, WorkRegime, PlanType, SocialRegime } from "@shared/types";
import {
  PLAN_LIMITS,
  SOCIAL_REGIME_LABELS,
  DEFAULT_CONGES_PAYES_PAR_AN,
} from "@shared/const";
import {
  Building2,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
} from "lucide-react";

const SECTOR_LABELS: Record<string, string> = {
  [SectorType.INDUSTRIE]: "Industrie",
  [SectorType.SERVICES]: "Services",
  [SectorType.COMMERCE]: "Commerce",
  [SectorType.AGRICULTURE]: "Agriculture",
  [SectorType.BTP]: "BTP",
  [SectorType.TOURISME]: "Tourisme",
  [SectorType.SANTE]: "Santé",
  [SectorType.EDUCATION]: "Éducation",
  [SectorType.TRANSPORT]: "Transport",
  [SectorType.AUTRE]: "Autre",
};

const REGIME_LABELS: Record<string, string> = {
  "48h": "48h / semaine",
  "40h": "40h / semaine",
};

const STEPS = [
  { label: "Votre Compte", icon: <User size={16} /> },
  { label: "Entreprise", icon: <Building2 size={16} /> },
  { label: "Plan", icon: <Crown size={16} /> },
];

export default function Signup() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({
    adminNom: "",
    adminPrenom: "",
    adminEmail: "",
    adminPassword: "",
    companyName: "",
    matriculeFiscal: "",
    codeCnss: "",
    adresse: "",
    secteurActivite: SectorType.SERVICES as string,
    regimeTravail: "48h" as string,
    regimeSocial: SocialRegime.CNSS as string,
    congesPayesParAn: DEFAULT_CONGES_PAYES_PAR_AN,
    telephone: "",
    plan: PlanType.GRATUIT as string,
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Step validation
  const canProceed = () => {
    if (step === 0) {
      return (
        form.adminNom.length >= 2 &&
        form.adminPrenom.length >= 2 &&
        form.adminEmail.includes("@") &&
        form.adminPassword.length >= 8
      );
    }
    if (step === 1) {
      return (
        form.companyName.length >= 2 &&
        form.matriculeFiscal.length >= 5 &&
        form.codeCnss.length >= 5 &&
        form.adresse.length >= 5
      );
    }
    return true; // step 2 — plan is always selected
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.signup(form);
      if (res.data.success) {
        // The JWT cookie is set by the server, force a page reload to pick it up
        window.location.href = "/app";
      } else {
        setError("Erreur lors de la création du compte");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Erreur lors de la création du compte";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-3 shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-xl">PH</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Créer votre espace
          </h1>
          <p className="text-blue-200/60 text-sm">
            Inscrivez-vous et lancez votre gestion de paie
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    : i < step
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-white/5 text-white/30 border border-white/10"
                }`}
              >
                {i < step ? <Check size={12} /> : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${i < step ? "bg-emerald-400/40" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white/[0.07] backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-blue-300/80">
              {STEPS[step].icon}
              <span className="text-sm font-medium">{STEPS[step].label}</span>
              <span className="text-xs text-white/30 ml-auto">
                Étape {step + 1} / {STEPS.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ========== STEP 0: Admin Account ========== */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">Prénom</Label>
                    <Input
                      value={form.adminPrenom}
                      onChange={e => update("adminPrenom", e.target.value)}
                      placeholder="Ahmed"
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">Nom</Label>
                    <Input
                      value={form.adminNom}
                      onChange={e => update("adminNom", e.target.value)}
                      placeholder="Ben Ali"
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-100/80 text-xs">
                    Adresse Email
                  </Label>
                  <Input
                    type="email"
                    value={form.adminEmail}
                    onChange={e => update("adminEmail", e.target.value)}
                    placeholder="vous@entreprise.tn"
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-100/80 text-xs">
                    Mot de Passe
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.adminPassword}
                      onChange={e => update("adminPassword", e.target.value)}
                      placeholder="Min. 8 caractères"
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-blue-200/70 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.adminPassword.length > 0 &&
                    form.adminPassword.length < 8 && (
                      <p className="text-amber-400/80 text-xs">
                        Min. 8 caractères
                      </p>
                    )}
                </div>
              </>
            )}

            {/* ========== STEP 1: Company Info ========== */}
            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-blue-100/80 text-xs">
                    Nom de l'entreprise
                  </Label>
                  <Input
                    value={form.companyName}
                    onChange={e => update("companyName", e.target.value)}
                    placeholder="Ma Société SARL"
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">
                      Matricule Fiscal
                    </Label>
                    <Input
                      value={form.matriculeFiscal}
                      onChange={e => update("matriculeFiscal", e.target.value)}
                      placeholder="0000000X/A/M/000"
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">
                      Code{" "}
                      {form.regimeSocial === SocialRegime.CNRPS
                        ? "CNRPS"
                        : "CNSS"}
                    </Label>
                    <Input
                      value={form.codeCnss}
                      onChange={e => update("codeCnss", e.target.value)}
                      placeholder="00-000000-00"
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-100/80 text-xs">Adresse</Label>
                  <Input
                    value={form.adresse}
                    onChange={e => update("adresse", e.target.value)}
                    placeholder="Rue, Ville, Gouvernorat"
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">
                      Secteur d'activité
                    </Label>
                    <Select
                      value={form.secteurActivite}
                      onValueChange={v => update("secteurActivite", v)}
                    >
                      <SelectTrigger className="bg-white/[0.06] border-white/10 text-white h-10 [&>span]:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SECTOR_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">
                      Régime de Travail
                    </Label>
                    <Select
                      value={form.regimeTravail}
                      onValueChange={v => update("regimeTravail", v)}
                    >
                      <SelectTrigger className="bg-white/[0.06] border-white/10 text-white h-10 [&>span]:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REGIME_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-100/80 text-xs">
                    Téléphone (optionnel)
                  </Label>
                  <Input
                    value={form.telephone}
                    onChange={e => update("telephone", e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">
                      Régime Social
                    </Label>
                    <Select
                      value={form.regimeSocial}
                      onValueChange={v => update("regimeSocial", v)}
                    >
                      <SelectTrigger className="bg-white/[0.06] border-white/10 text-white h-10 [&>span]:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SOCIAL_REGIME_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-blue-100/80 text-xs">
                      Congés payés / an (jours)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={form.congesPayesParAn}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          congesPayesParAn: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="18"
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 h-10"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ========== STEP 2: Plan Selection ========== */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-blue-200/60 text-xs">
                  Choisissez le plan adapté à la taille de votre entreprise.
                  Vous pourrez le changer à tout moment.
                </p>
                {Object.entries(PLAN_LIMITS).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update("plan", key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      form.plan === key
                        ? "bg-blue-500/15 border-blue-400/40 ring-1 ring-blue-400/20"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-semibold text-sm ${form.plan === key ? "text-blue-300" : "text-white/80"}`}
                      >
                        {info.label}
                      </span>
                      <span className="text-xs text-white/40">
                        {info.maxEmployees === -1
                          ? "Illimité"
                          : `Max ${info.maxEmployees} employés`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {info.features.map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center gap-3 pt-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(s => s - 1)}
                  className="text-blue-200/60 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft size={16} className="mr-1" /> Retour
                </Button>
              )}
              <div className="flex-1" />
              {step < 2 ? (
                <Button
                  type="button"
                  disabled={!canProceed()}
                  onClick={() => setStep(s => s + 1)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                >
                  Suivant <ArrowRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-1" /> Créer mon espace
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Link to login */}
            {step === 0 && (
              <div className="pt-3 border-t border-white/5">
                <p className="text-center text-blue-200/40 text-xs">
                  Vous avez déjà un compte ?{" "}
                  <a
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Se connecter
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-blue-200/20 text-xs">
          © 2025 PayrollHub Tunisia — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
