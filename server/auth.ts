// ============================================================================
// PayrollHub — Authentication & Authorization Module
// JWT-based auth with RBAC middleware
// ============================================================================

import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { JWT_COOKIE_NAME, JWT_EXPIRY, ROLE_HIERARCHY } from "../shared/const";
import type { UserRole, ApiResponse } from "../shared/types";

const JWT_SECRET = process.env.JWT_SECRET || "payrollhub-secret-key-2025-change-in-production";

// Extend Express Request with user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: UserRole;
        entrepriseId: string;
      };
    }
  }
}

// --- Middleware ---

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[JWT_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ success: false, error: "Non authentifié" } satisfies ApiResponse);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      nom: string;
      prenom: string;
      role: UserRole;
      entrepriseId: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Token invalide ou expiré" } satisfies ApiResponse);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Non authentifié" } satisfies ApiResponse);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Accès refusé. Rôle insuffisant.",
      } satisfies ApiResponse);
    }

    next();
  };
}

export function requireMinRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Non authentifié" } satisfies ApiResponse);
    }

    const userLevel = ROLE_HIERARCHY[req.user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole as keyof typeof ROLE_HIERARCHY] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: "Accès refusé. Niveau d'autorisation insuffisant.",
      } satisfies ApiResponse);
    }

    next();
  };
}

// --- Auth Router ---

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        error: "Email et mot de passe requis",
      } satisfies ApiResponse);
    }

    const user = storage.getUtilisateurByEmail(email);
    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      } satisfies ApiResponse);
    }

    const isValid = await bcrypt.compare(motDePasse, user.motDePasseHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      } satisfies ApiResponse);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      entrepriseId: user.entrepriseId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.cookie(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24h
      path: "/",
    });

    const { motDePasseHash, ...userData } = user;
    return res.json({
      success: true,
      data: { user: userData, token },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
    } satisfies ApiResponse);
  }
});

// POST /api/auth/logout
authRouter.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(JWT_COOKIE_NAME, { path: "/" });
  return res.json({ success: true, message: "Déconnexion réussie" } satisfies ApiResponse);
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  const user = storage.getUtilisateur(req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé" } satisfies ApiResponse);
  }

  const { motDePasseHash, ...userData } = user;
  return res.json({ success: true, data: userData } satisfies ApiResponse);
});
