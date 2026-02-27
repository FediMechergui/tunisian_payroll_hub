// ============================================================================
// PayrollHub — Employee API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireMinRole } from "../auth";
import { UserRole } from "../../shared/types";
import { notificationService } from "../notification-service";

export const employeesRouter = Router();

// All routes require authentication
employeesRouter.use(requireAuth);

// GET /api/employees
employeesRouter.get("/", (req: Request, res: Response) => {
  const { search, page = "1", pageSize = "20" } = req.query;
  const emps = storage.getEmployes(req.user!.entrepriseId, search as string);

  const p = parseInt(page as string, 10);
  const ps = parseInt(pageSize as string, 10);
  const start = (p - 1) * ps;
  const items = emps.slice(start, start + ps);

  return res.json({
    success: true,
    data: {
      items,
      total: emps.length,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(emps.length / ps),
    },
  });
});

// GET /api/employees/:id/contracts
employeesRouter.get("/:id/contracts", (req: Request, res: Response) => {
  const emp = storage.getEmploye(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employé non trouvé" });
  }
  // Derive current contract info from employee record
  // Full contract history will be implemented in Phase 2
  const contract = {
    id: `contract-${emp.id}`,
    employeId: emp.id,
    typeContrat: emp.typeContrat,
    dateDebut: emp.dateEmbauche,
    dateFin: emp.dateFin || null,
    categoriePro: emp.categoriePro,
    poste: emp.poste,
    departement: emp.departement,
    salaireBase: emp.salaireBase,
    actif: emp.actif,
  };
  return res.json({ success: true, data: [contract] });
});

// GET /api/employees/:id
employeesRouter.get("/:id", (req: Request, res: Response) => {
  const emp = storage.getEmploye(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employé non trouvé" });
  }
  return res.json({ success: true, data: emp });
});

// POST /api/employees
employeesRouter.post(
  "/",
  requireMinRole(UserRole.ADMIN_RH),
  (req: Request, res: Response) => {
    try {
      const emp = storage.createEmploye(req.body, req.user!.entrepriseId);
      storage.invalidateCache("dashboard");
      notificationService.onEmployeeCreated(req.user!.entrepriseId, `${emp.prenom} ${emp.nom}`);
      return res.status(201).json({ success: true, data: emp });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Erreur lors de la création de l'employé",
      });
    }
  }
);

// PUT /api/employees/:id
employeesRouter.put(
  "/:id",
  requireMinRole(UserRole.ADMIN_RH),
  (req: Request, res: Response) => {
    const emp = storage.updateEmploye(req.params.id, req.body);
    if (!emp) {
      return res.status(404).json({ success: false, error: "Employé non trouvé" });
    }
    return res.json({ success: true, data: emp });
  }
);

// DELETE /api/employees/:id
employeesRouter.delete(
  "/:id",
  requireMinRole(UserRole.ADMIN_RH),
  (req: Request, res: Response) => {
    const success = storage.deleteEmploye(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: "Employé non trouvé" });
    }
    return res.json({ success: true, message: "Employé archivé avec succès" });
  }
);
