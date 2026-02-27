// ============================================================================
// PayrollHub — Dashboard API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// GET /api/dashboard/stats
dashboardRouter.get("/stats", (req: Request, res: Response) => {
  const stats = storage.getCachedDashboardStats(req.user!.entrepriseId);
  return res.json({ success: true, data: stats });
});
