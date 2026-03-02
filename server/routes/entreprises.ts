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
entreprisesRouter.get("/", async (req: Request, res: Response) => {
  const entreprises = await storage.getEntreprises();
  return res.json({ success: true, data: entreprises });
});

// GET /api/entreprises/:id
entreprisesRouter.get("/:id", async (req: Request, res: Response) => {
  const e = await storage.getEntreprise(req.params.id);
  if (!e) {
    return res
      .status(404)
      .json({ success: false, error: "Entreprise non trouvée" });
  }
  return res.json({ success: true, data: e });
});

// POST /api/entreprises
entreprisesRouter.post(
  "/",
  requireRole(UserRole.SUPER_ADMIN),
  async (req: Request, res: Response) => {
    try {
      const e = await storage.createEntreprise(req.body);
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
  async (req: Request, res: Response) => {
    const e = await storage.updateEntreprise(req.params.id, req.body);
    if (!e) {
      return res
        .status(404)
        .json({ success: false, error: "Entreprise non trouvée" });
    }
    return res.json({ success: true, data: e });
  }
);
