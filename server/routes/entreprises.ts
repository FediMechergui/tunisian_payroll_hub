// ============================================================================
// PayrollHub — Company (Entreprise) API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../auth";
import { UserRole } from "../../shared/types";

export const entreprisesRouter = Router();

entreprisesRouter.use(requireAuth);

// GET /api/entreprises
entreprisesRouter.get("/", (req: Request, res: Response) => {
  const entreprises = storage.getEntreprises();
  return res.json({ success: true, data: entreprises });
});

// GET /api/entreprises/:id
entreprisesRouter.get("/:id", (req: Request, res: Response) => {
  const e = storage.getEntreprise(req.params.id);
  if (!e) {
    return res.status(404).json({ success: false, error: "Entreprise non trouvée" });
  }
  return res.json({ success: true, data: e });
});

// POST /api/entreprises
entreprisesRouter.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN),
  (req: Request, res: Response) => {
    try {
      const e = storage.createEntreprise(req.body);
      return res.status(201).json({ success: true, data: e });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Erreur lors de la création de l'entreprise",
      });
    }
  }
);

// PUT /api/entreprises/:id
entreprisesRouter.put(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN),
  (req: Request, res: Response) => {
    const e = storage.updateEntreprise(req.params.id, req.body);
    if (!e) {
      return res.status(404).json({ success: false, error: "Entreprise non trouvée" });
    }
    return res.json({ success: true, data: e });
  }
);
