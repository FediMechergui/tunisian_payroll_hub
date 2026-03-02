// ============================================================================
// PayrollHub — Authentication & Authorization Module
// JWT-based auth with RBAC middleware
// ============================================================================

import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import {
  JWT_COOKIE_NAME,
  JWT_EXPIRY,
  ROLE_HIERARCHY,
  PLAN_LIMITS,
} from "../shared/const";
import type { UserRole, ApiResponse, PlanType } from "../shared/types";
import { signupSchema } from "../shared/schema";

const JWT_SECRET =
  process.env.JWT_SECRET || "payrollhub-secret-key-2025-change-in-production";

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
    return res
      .status(401)
      .json({ success: false, error: "Non authentifié" } satisfies ApiResponse);
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
    return res
      .status(401)
      .json({
        success: false,
        error: "Token invalide ou expiré",
      } satisfies ApiResponse);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Non authentifié",
        } satisfies ApiResponse);
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
      return res
        .status(401)
        .json({
          success: false,
          error: "Non authentifié",
        } satisfies ApiResponse);
    }

    const userLevel =
      ROLE_HIERARCHY[req.user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredLevel =
      ROLE_HIERARCHY[minRole as keyof typeof ROLE_HIERARCHY] || 0;

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

// POST /api/auth/signup — Public: create company + super_admin account
authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      } satisfies ApiResponse);
    }

    const d = parsed.data;

    // Check if email already taken
    const existing = await storage.getUtilisateurByEmail(d.adminEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Un compte avec cet email existe déjà",
      } satisfies ApiResponse);
    }

    // Check if matricule fiscal already taken
    const existingCompany = await storage.getEntrepriseByMatricule(
      d.matriculeFiscal
    );
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        error: "Une entreprise avec ce matricule fiscal existe déjà",
      } satisfies ApiResponse);
    }

    // Resolve plan limits
    const planConfig =
      PLAN_LIMITS[d.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.gratuit;

    // Create the company
    const company = await storage.createEntreprise({
      nom: d.companyName,
      adresse: d.adresse,
      matriculeFiscal: d.matriculeFiscal,
      codeCnss: d.codeCnss,
      secteurActivite: d.secteurActivite,
      telephone: d.telephone,
      regimeTravail: d.regimeTravail,
      plan: d.plan as PlanType,
      maxEmployees: planConfig.maxEmployees,
    } as any);

    // Create the super_admin user
    const motDePasseHash = await bcrypt.hash(d.adminPassword, 10);
    const user = await storage.createUtilisateur({
      email: d.adminEmail,
      motDePasseHash,
      nom: d.adminNom,
      prenom: d.adminPrenom,
      role: "super_admin" as UserRole,
      entrepriseId: company.id,
    });

    // Auto-login: issue JWT
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
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    const { motDePasseHash: _, ...userData } = user;
    return res.status(201).json({
      success: true,
      data: { user: userData, token, company },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
    } satisfies ApiResponse);
  }
});

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

    const user = await storage.getUtilisateurByEmail(email);
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
  return res.json({
    success: true,
    message: "Déconnexion réussie",
  } satisfies ApiResponse);
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await storage.getUtilisateur(req.user!.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Utilisateur non trouvé",
    } satisfies ApiResponse);
  }

  const { motDePasseHash, ...userData } = user;
  return res.json({ success: true, data: userData } satisfies ApiResponse);
});
