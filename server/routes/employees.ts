// ============================================================================
// PayrollHub — Employee API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { requireAuth, requireMinRole } from "../auth";
import { UserRole } from "../../shared/types";
import { PLAN_LIMITS } from "../../shared/const";
import { notificationService } from "../notification-service";

export const employeesRouter = Router();

// All routes require authentication
employeesRouter.use(requireAuth);

// GET /api/employees
employeesRouter.get("/", async (req: Request, res: Response) => {
  const { search, page = "1", pageSize = "20" } = req.query;
  const emps = await storage.getEmployes(
    req.user!.entrepriseId,
    search as string
  );

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
employeesRouter.get("/:id/contracts", async (req: Request, res: Response) => {
  const emp = await storage.getEmploye(req.params.id);
  if (!emp) {
    return res
      .status(404)
      .json({ success: false, error: "Employé non trouvé" });
  }
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
employeesRouter.get("/:id", async (req: Request, res: Response) => {
  const emp = await storage.getEmploye(req.params.id);
  if (!emp) {
    return res
      .status(404)
      .json({ success: false, error: "Employé non trouvé" });
  }
  return res.json({ success: true, data: emp });
});

// POST /api/employees — with plan-based employee limit enforcement
employeesRouter.post(
  "/",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    try {
      // Enforce plan-based employee limits
      const entreprise = await storage.getEntreprise(req.user!.entrepriseId);
      if (entreprise) {
        const currentCount = await storage.countEmployes(
          req.user!.entrepriseId
        );
        const maxAllowed =
          entreprise.maxEmployees ??
          PLAN_LIMITS[entreprise.plan as keyof typeof PLAN_LIMITS]
            ?.maxEmployees ??
          5;
        if (maxAllowed !== -1 && currentCount >= maxAllowed) {
          return res.status(403).json({
            success: false,
            error: `Limite du plan atteinte (${maxAllowed} employés max pour le plan ${entreprise.plan}). Veuillez upgrader votre plan.`,
          });
        }
      }

      const {
        createAccount,
        accountEmail,
        accountPassword,
        accountRole,
        ...employeeData
      } = req.body;

      const emp = await storage.createEmploye(
        employeeData,
        req.user!.entrepriseId
      );

      // Auto-create user account for the employee
      // If createAccount is explicitly true, use provided email/password
      // Otherwise, auto-create if employee has an email (generate a default password)
      let linkedUser = null;
      const shouldCreateAccount =
        createAccount || (emp.email && emp.email.trim() !== "");
      const finalEmail = accountEmail || emp.email;
      const finalPassword = accountPassword || `PH${emp.cin}!2025`;

      if (shouldCreateAccount && finalEmail && finalEmail.trim() !== "") {
        const existing = await storage.getUtilisateurByEmail(finalEmail);
        if (existing) {
          // Employee created but account already exists — warn but don't fail
          return res.status(201).json({
            success: true,
            data: emp,
            warning:
              "Employé créé, mais un compte avec cet email existe déjà. Aucun nouveau compte créé.",
          });
        }

        // Only allow roles below the current user's role
        const ROLE_HIERARCHY: Record<string, number> = {
          employe: 1,
          manager: 2,
          comptable: 3,
          admin_paie: 4,
          admin_rh: 5,
          super_admin: 6,
        };
        const callerLevel = ROLE_HIERARCHY[req.user!.role] || 0;
        const targetRole = accountRole || UserRole.EMPLOYE;
        const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

        if (targetLevel >= callerLevel) {
          return res.status(201).json({
            success: true,
            data: emp,
            warning:
              "Employé créé, mais vous ne pouvez pas créer un compte avec un rôle égal ou supérieur au vôtre.",
          });
        }

        const motDePasseHash = await bcrypt.hash(finalPassword, 10);
        linkedUser = await storage.createUtilisateur({
          email: finalEmail,
          motDePasseHash,
          nom: emp.nom,
          prenom: emp.prenom,
          role: targetRole,
          entrepriseId: req.user!.entrepriseId,
          employeId: emp.id,
        });
      }

      await storage.invalidateCache("dashboard");
      await notificationService.onEmployeeCreated(
        req.user!.entrepriseId,
        `${emp.prenom} ${emp.nom}`
      );
      return res.status(201).json({
        success: true,
        data: emp,
        ...(linkedUser
          ? {
              accountCreated: true,
              accountEmail: linkedUser.email,
              accountRole: linkedUser.role,
            }
          : {}),
      });
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
  async (req: Request, res: Response) => {
    const emp = await storage.updateEmploye(req.params.id, req.body);
    if (!emp) {
      return res
        .status(404)
        .json({ success: false, error: "Employé non trouvé" });
    }
    return res.json({ success: true, data: emp });
  }
);

// DELETE /api/employees/:id
employeesRouter.delete(
  "/:id",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    const success = await storage.deleteEmploye(req.params.id);
    if (!success) {
      return res
        .status(404)
        .json({ success: false, error: "Employé non trouvé" });
    }
    return res.json({ success: true, message: "Employé archivé avec succès" });
  }
);
