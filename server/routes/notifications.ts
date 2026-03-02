// ============================================================================
// PayrollHub — Notifications API Routes
// GET/PUT/DELETE for notification management
// ============================================================================

import { Router, type Request, type Response } from "express";
import { requireAuth } from "../auth";
import { storage } from "../storage";
import type { ApiResponse, Notification } from "../../shared/types";

export const notificationsRouter = Router();

// All routes require authentication
notificationsRouter.use(requireAuth);

// GET /api/notifications — list all notifications for current user
notificationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const notifications = await storage.getNotifications(req.user!.id);
    const unreadCount = await storage.getUnreadCount(req.user!.id);

    return res.json({
      success: true,
      data: { notifications, unreadCount },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("List notifications error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// GET /api/notifications/unread-count — just the count (for bell badge)
notificationsRouter.get(
  "/unread-count",
  async (req: Request, res: Response) => {
    try {
      const count = await storage.getUnreadCount(req.user!.id);
      return res.json({ success: true, data: count } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Erreur serveur",
      } satisfies ApiResponse);
    }
  }
);

// PUT /api/notifications/:id/read — mark one notification as read
notificationsRouter.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const ok = await storage.markNotificationRead(req.params.id, req.user!.id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Notification introuvable",
      } satisfies ApiResponse);
    }
    return res.json({
      success: true,
      message: "Marquée comme lue",
    } satisfies ApiResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// PUT /api/notifications/read-all — mark all as read
notificationsRouter.put("/read-all", async (req: Request, res: Response) => {
  try {
    const count = await storage.markAllNotificationsRead(req.user!.id);
    return res.json({
      success: true,
      data: count,
      message: `${count} notifications marquées comme lues`,
    } satisfies ApiResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// DELETE /api/notifications/:id
notificationsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const ok = await storage.deleteNotification(req.params.id, req.user!.id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Notification introuvable",
      } satisfies ApiResponse);
    }
    return res.json({
      success: true,
      message: "Notification supprimée",
    } satisfies ApiResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});
