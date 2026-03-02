// ============================================================================
// PayrollHub — API Keys Management Routes
// CRUD for managing external API keys (admin only)
// ============================================================================

import { Router, type Request, type Response } from "express";
import { requireAuth, requireMinRole } from "../auth";
import { storage } from "../storage";
import { createApiKeySchema } from "../../shared/schema";
import { UserRole, NotificationType, NotificationPriority } from "../../shared/types";
import type { ApiResponse } from "../../shared/types";

export const apiKeysRouter = Router();

// All routes require ADMIN_RH+
apiKeysRouter.use(requireAuth, requireMinRole(UserRole.ADMIN_RH));

// GET /api/api-keys — list all API keys
apiKeysRouter.get("/", async (req: Request, res: Response) => {
  try {
    const keys = await storage.getApiKeys(req.user!.entrepriseId);
    return res.json({ success: true, data: keys } satisfies ApiResponse);
  } catch (error) {
    console.error("List API keys error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// POST /api/api-keys — create a new API key
apiKeysRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createApiKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map(i => i.message).join(", "),
      } satisfies ApiResponse);
    }

    const result = await storage.createApiKey({
      entrepriseId: req.user!.entrepriseId,
      nom: parsed.data.nom,
      permissions: parsed.data.permissions,
      limiteRequetes: parsed.data.limiteRequetes ?? 1000,
    });

    // Notify admins
    await storage.broadcastNotification(
      req.user!.entrepriseId,
      UserRole.ADMIN_RH,
      {
        type: NotificationType.ALERTE_SYSTEME,
        priorite: NotificationPriority.MEDIUM,
        titre: "Nouvelle clé API créée",
        message: `La clé API "${result.apiKey.nom}" a été créée par ${req.user!.prenom} ${req.user!.nom}.`,
        lien: "/app/api-keys",
      }
    );

    return res.status(201).json({
      success: true,
      data: {
        ...result.apiKey,
        rawKey: result.rawKey, // Only returned once!
      },
      message:
        "Clé API créée. Copiez la clé maintenant, elle ne sera plus affichée.",
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Create API key error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// PUT /api/api-keys/:id/toggle — enable/disable API key
apiKeysRouter.put("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const key = await storage.toggleApiKey(
      req.params.id,
      req.user!.entrepriseId
    );
    if (!key) {
      return res.status(404).json({
        success: false,
        error: "Clé API introuvable",
      } satisfies ApiResponse);
    }
    return res.json({ success: true, data: key } satisfies ApiResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// DELETE /api/api-keys/:id
apiKeysRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const ok = await storage.deleteApiKey(
      req.params.id,
      req.user!.entrepriseId
    );
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Clé API introuvable",
      } satisfies ApiResponse);
    }
    return res.json({
      success: true,
      message: "Clé API supprimée",
    } satisfies ApiResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});
