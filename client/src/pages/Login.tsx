// ============================================================================
// PayrollHub — Login Page
// Beautiful, branded login page
// ============================================================================

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, motDePasse);
    setIsLoading(false);
    if (success) {
      setLocation("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-2xl">PH</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PayrollHub</h1>
          <p className="text-blue-200/60 text-sm">
            Gestion Intégrée de Paie et RH — Tunisie
          </p>
        </div>

        <Card className="bg-white/[0.07] backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-blue-300/80">
              <Shield size={18} />
              <span className="text-sm font-medium">Connexion Sécurisée</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-100/80 text-sm">
                  Adresse Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.tn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 focus:ring-blue-400/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-100/80 text-sm">
                  Mot de Passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={motDePasse}
                    onChange={e => setMotDePasse(e.target.value)}
                    required
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-blue-200/30 focus:border-blue-400/50 focus:ring-blue-400/20 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-blue-200/70 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se Connecter"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-center text-blue-200/40 text-sm">
                Pas encore de compte ?{" "}
                <a
                  href="/signup"
                  className="text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Créer un espace entreprise
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-blue-200/20 text-xs">
          © 2025 PayrollHub Tunisia — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
