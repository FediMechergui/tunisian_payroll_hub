// ============================================================================
// PayrollHub — User Management API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../auth";
import { UserRole } from "../../shared/types";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.use(requireRole(UserRole.SUPER_ADMIN));

// GET /api/users
usersRouter.get("/", async (req: Request, res: Response) => {
  const users = await storage.getUtilisateurs(req.user!.entrepriseId);
  return res.json({ success: true, data: users });
});

// POST /api/users
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { email, motDePasse, nom, prenom, role, employeId } = req.body;

    if (!email || !motDePasse || !nom || !prenom || !role) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis",
      });
    }

    const existing = await storage.getUtilisateurByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Un utilisateur avec cet email existe déjà",
      });
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    const user = await storage.createUtilisateur({
      email,
      motDePasseHash,
      nom,
      prenom,
      role,
      entrepriseId: req.user!.entrepriseId,
      employeId,
    });

    const { motDePasseHash: _, ...userData } = user;
    return res.status(201).json({ success: true, data: userData });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'utilisateur",
    });
  }
});

// PUT /api/users/:id
usersRouter.put("/:id", async (req: Request, res: Response) => {
  const user = await storage.updateUtilisateur(req.params.id, req.body);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, error: "Utilisateur non trouvé" });
  }
  const { motDePasseHash: _, ...userData } = user;
  return res.json({ success: true, data: userData });
});

// DELETE /api/users/:id
usersRouter.delete("/:id", async (req: Request, res: Response) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({
      success: false,
      error: "Vous ne pouvez pas supprimer votre propre compte",
    });
  }
  const success = await storage.deleteUtilisateur(req.params.id);
  if (!success) {
    return res
      .status(404)
      .json({ success: false, error: "Utilisateur non trouvé" });
  }
  return res.json({ success: true, message: "Utilisateur désactivé" });
});
