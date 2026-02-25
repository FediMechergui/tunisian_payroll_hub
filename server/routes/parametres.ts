// ============================================================================
// PayrollHub — Regulatory Parameters API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../auth";
import { UserRole } from "../../shared/types";

export const parametresRouter = Router();

parametresRouter.use(requireAuth);

// GET /api/parametres
parametresRouter.get("/", (req: Request, res: Response) => {
  const { categorie } = req.query;
  const params = storage.getParametres(categorie as string);
  return res.json({ success: true, data: params });
});

// PUT /api/parametres/:id
parametresRouter.put(
  "/:id",
  requireRole(UserRole.SUPER_ADMIN),
  (req: Request, res: Response) => {
    const param = storage.updateParametre(req.params.id, req.body);
    if (!param) {
      return res.status(404).json({
        success: false,
        error: "Paramètre non trouvé",
      });
    }
    return res.json({ success: true, data: param });
  }
);
