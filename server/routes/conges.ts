// ============================================================================
// PayrollHub — Leave Management API Routes
// CRUD, approval workflow, balance tracking
// ============================================================================

import { Router, type Request, type Response } from "express";
import { requireAuth, requireMinRole } from "../auth";
import { storage } from "../storage";
import { createCongeSchema, updateCongeStatutSchema } from "../../shared/schema";
import { LeaveStatus, UserRole } from "../../shared/types";
import { ROLE_HIERARCHY } from "../../shared/const";
import { notificationService } from "../notification-service";

export const congesRouter = Router();

congesRouter.use(requireAuth);

// =============================================
// List leaves (filtered by role)
// =============================================

// GET /api/conges — List all leaves for the company (HR/admin) or own leaves (employee)
congesRouter.get("/", (req: Request, res: Response) => {
  const userLevel =
    ROLE_HIERARCHY[req.user!.role as keyof typeof ROLE_HIERARCHY] || 0;
  const managerLevel =
    ROLE_HIERARCHY[UserRole.MANAGER as keyof typeof ROLE_HIERARCHY] || 0;

  let conges;
  if (userLevel >= managerLevel) {
    // Managers+ see all leaves in company
    conges = storage.getCongesByEntreprise(req.user!.entrepriseId);
  } else {
    // Employees see only their own
    const user = storage.getUtilisateur(req.user!.id);
    if (!user?.employeId) {
      return res.json({ success: true, data: [] });
    }
    conges = storage.getConges(user.employeId);
  }

  // Enrich with employee names
  const enriched = conges.map((c) => {
    const emp = storage.getEmploye(c.employeId);
    return {
      ...c,
      employe: emp
        ? { nom: emp.nom, prenom: emp.prenom, departement: emp.departement, poste: emp.poste }
        : undefined,
    };
  });

  return res.json({ success: true, data: enriched });
});

// =============================================
// Get single leave
// =============================================

// GET /api/conges/:id
congesRouter.get("/:id", (req: Request, res: Response) => {
  const conge = storage.getConge(req.params.id);
  if (!conge) {
    return res.status(404).json({ success: false, error: "Congé introuvable" });
  }

  const emp = storage.getEmploye(conge.employeId);
  return res.json({
    success: true,
    data: {
      ...conge,
      employe: emp
        ? { nom: emp.nom, prenom: emp.prenom, departement: emp.departement, poste: emp.poste }
        : undefined,
    },
  });
});

// =============================================
// Create leave request
// =============================================

// POST /api/conges — Create a new leave request
congesRouter.post("/", (req: Request, res: Response) => {
  const parsed = createCongeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Données invalides",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { employeId, typeConge, dateDebut, dateFin, nbJours, motif } = parsed.data;

  // Verify employee exists
  const emp = storage.getEmploye(employeId);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employé introuvable" });
  }

  // Self-service: employees can only request for themselves
  const userLevel =
    ROLE_HIERARCHY[req.user!.role as keyof typeof ROLE_HIERARCHY] || 0;
  const managerLevel =
    ROLE_HIERARCHY[UserRole.MANAGER as keyof typeof ROLE_HIERARCHY] || 0;

  if (userLevel < managerLevel) {
    const user = storage.getUtilisateur(req.user!.id);
    if (user?.employeId !== employeId) {
      return res.status(403).json({
        success: false,
        error: "Vous ne pouvez demander un congé que pour vous-même",
      });
    }
  }

  // Check leave balance for congé payé
  if (typeConge === "conge_paye") {
    const year = new Date(dateDebut).getFullYear();
    const balance = storage.getLeaveBalance(employeId, year);
    if (balance.solde - balance.enAttente < nbJours) {
      return res.status(400).json({
        success: false,
        error: `Solde insuffisant. Disponible: ${balance.solde - balance.enAttente} jours (droit: ${balance.droitAnnuel}, consommé: ${balance.consomme}, en attente: ${balance.enAttente})`,
      });
    }
  }

  const conge = storage.createConge({
    employeId,
    typeConge,
    dateDebut,
    dateFin,
    nbJours,
    motif: motif || undefined,
  });

  storage.invalidateCache("dashboard");
  notificationService.onLeaveRequested(
    req.user!.entrepriseId,
    `${emp.prenom} ${emp.nom}`,
    typeConge,
    dateDebut,
    dateFin
  );

  return res.status(201).json({ success: true, data: conge });
});

// =============================================
// Approve / Reject / Cancel leave
// =============================================

// PUT /api/conges/:id/statut — Update leave status (approve/reject/cancel)
congesRouter.put(
  "/:id/statut",
  requireMinRole(UserRole.MANAGER),
  (req: Request, res: Response) => {
    const parsed = updateCongeStatutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const conge = storage.getConge(req.params.id);
    if (!conge) {
      return res.status(404).json({ success: false, error: "Congé introuvable" });
    }

    // Can only change status from EN_ATTENTE
    if (conge.statut !== LeaveStatus.EN_ATTENTE) {
      return res.status(400).json({
        success: false,
        error: `Impossible de modifier un congé déjà ${conge.statut}`,
      });
    }

    const newStatut =
      parsed.data.statut === "approuve"
        ? LeaveStatus.APPROUVE
        : parsed.data.statut === "rejete"
          ? LeaveStatus.REJETE
          : LeaveStatus.ANNULE;

    const updated = storage.updateCongeStatut(
      req.params.id,
      newStatut,
      req.user!.id
    );

    // Notify the employee
    if (parsed.data.statut === "approuve" || parsed.data.statut === "rejete") {
      const emp = storage.getEmploye(conge.employeId);
      // Find the user linked to this employee
      const users = storage.getUtilisateurs(req.user!.entrepriseId);
      const empUser = users.find(u => u.employeId === conge.employeId);
      notificationService.onLeaveDecision(
        req.user!.entrepriseId,
        empUser?.id,
        parsed.data.statut as "approuve" | "rejete",
        conge.typeConge
      );
    }
    storage.invalidateCache("dashboard");

    return res.json({ success: true, data: updated });
  }
);

// =============================================
// Cancel own leave request (employee)
// =============================================

// PUT /api/conges/:id/annuler — Cancel own pending leave
congesRouter.put("/:id/annuler", (req: Request, res: Response) => {
  const conge = storage.getConge(req.params.id);
  if (!conge) {
    return res.status(404).json({ success: false, error: "Congé introuvable" });
  }

  // Only pending leaves can be cancelled by the requester
  if (conge.statut !== LeaveStatus.EN_ATTENTE) {
    return res.status(400).json({
      success: false,
      error: "Seuls les congés en attente peuvent être annulés",
    });
  }

  // Must be the employee's own leave (or manager+)
  const userLevel =
    ROLE_HIERARCHY[req.user!.role as keyof typeof ROLE_HIERARCHY] || 0;
  const managerLevel =
    ROLE_HIERARCHY[UserRole.MANAGER as keyof typeof ROLE_HIERARCHY] || 0;

  if (userLevel < managerLevel) {
    const user = storage.getUtilisateur(req.user!.id);
    if (user?.employeId !== conge.employeId) {
      return res.status(403).json({
        success: false,
        error: "Vous ne pouvez annuler que vos propres demandes",
      });
    }
  }

  const updated = storage.updateCongeStatut(req.params.id, LeaveStatus.ANNULE);
  return res.json({ success: true, data: updated });
});

// =============================================
// Leave balance
// =============================================

// GET /api/conges/balance/:employeId — Get leave balance for an employee
congesRouter.get("/balance/:employeId", (req: Request, res: Response) => {
  const emp = storage.getEmploye(req.params.employeId);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employé introuvable" });
  }

  const year = req.query.year
    ? parseInt(req.query.year as string, 10)
    : new Date().getFullYear();

  const balance = storage.getLeaveBalance(req.params.employeId, year);
  return res.json({ success: true, data: balance });
});

// GET /api/conges/my-balance — Get current user's leave balance
congesRouter.get("/my-balance", (_req: Request, res: Response) => {
  // This route must be defined before /:id to avoid conflict
  // but since Express matches in order, it's fine here as a named route
  return res.status(400).json({ success: false, error: "Use /balance/:employeId" });
});

// =============================================
// Delete leave (admin only)
// =============================================

// DELETE /api/conges/:id — Delete leave request (admin)
congesRouter.delete(
  "/:id",
  requireMinRole(UserRole.ADMIN_RH),
  (req: Request, res: Response) => {
    const conge = storage.getConge(req.params.id);
    if (!conge) {
      return res.status(404).json({ success: false, error: "Congé introuvable" });
    }

    storage.deleteConge(req.params.id);
    return res.json({ success: true, message: "Congé supprimé" });
  }
);
