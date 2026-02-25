// ============================================================================
// PayrollHub — Auth Context
// Manages authentication state across the app
// ============================================================================

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Utilisateur } from "@shared/types";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: Utilisateur | null;
  loading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await authApi.me();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, motDePasse: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(email, motDePasse);
      if (res.data.success && res.data.data) {
        setUser(res.data.data.user);
        return true;
      }
      setError("Identifiants invalides");
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erreur de connexion";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
