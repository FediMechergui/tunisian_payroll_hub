// ============================================================================
// PayrollHub — Loan (Prêt) API Routes
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireMinRole } from "../auth";
import { UserRole, LoanStatus } from "../../shared/types";
import { createLoanSchema, updateLoanStatusSchema } from "../../shared/schema";
import { notificationService } from "../notification-service";

export const loansRouter = Router();

loansRouter.use(requireAuth);

// GET /api/loans — list loans for the company (or for a specific employee)
loansRouter.get("/", async (req: Request, res: Response) => {
  const { employeId } = req.query;

  // If user is an employee, only show their own loans
  if (req.user!.role === UserRole.EMPLOYE) {
    if (!req.user!.employeId) {
      return res.json({ success: true, data: [] });
    }
    const loans = await storage.getLoans(req.user!.entrepriseId, req.user!.employeId);
    return res.json({ success: true, data: loans });
  }

  const loans = await storage.getLoans(
    req.user!.entrepriseId,
    employeId as string | undefined
  );
  return res.json({ success: true, data: loans });
});

// GET /api/loans/:id
loansRouter.get("/:id", async (req: Request, res: Response) => {
  const loan = await storage.getLoan(req.params.id);
  if (!loan) {
    return res.status(404).json({ success: false, error: "Prêt non trouvé" });
  }
  // Employee can only see their own loans
  if (req.user!.role === UserRole.EMPLOYE && loan.employeId !== req.user!.employeId) {
    return res.status(403).json({ success: false, error: "Accès non autorisé" });
  }
  return res.json({ success: true, data: loan });
});

// POST /api/loans — create a new loan (Admin)
loansRouter.post(
  "/",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    try {
      const parsed = createLoanSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Données invalides",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const loan = await storage.createLoan({
        ...parsed.data,
        entrepriseId: req.user!.entrepriseId,
        approuvePar: req.user!.id,
        statut: LoanStatus.EN_COURS,
      });

      // Notify the employee
      const emp = await storage.getEmploye(parsed.data.employeId);
      if (emp) {
        await notificationService.onEmployeeCreated(
          req.user!.entrepriseId,
          `Prêt de ${loan.montantTotal} TND accordé à ${emp.prenom} ${emp.nom}`
        );
      }

      return res.status(201).json({ success: true, data: loan });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Erreur lors de la création du prêt",
      });
    }
  }
);

// POST /api/loans/request — employee requests a loan
loansRouter.post("/request", async (req: Request, res: Response) => {
  try {
    if (!req.user!.employeId) {
      return res.status(400).json({
        success: false,
        error: "Aucun profil employé associé à votre compte",
      });
    }

    const parsed = createLoanSchema.safeParse({
      ...req.body,
      employeId: req.user!.employeId, // enforce own employeId
    });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const loan = await storage.createLoan({
      ...parsed.data,
      entrepriseId: req.user!.entrepriseId,
      statut: LoanStatus.EN_ATTENTE,
    });

    // Notify HR
    await notificationService.onEmployeeCreated(
      req.user!.entrepriseId,
      `Nouvelle demande de prêt de ${loan.montantTotal} TND par ${req.user!.prenom} ${req.user!.nom}`
    );

    return res.status(201).json({ success: true, data: loan });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Erreur lors de la demande de prêt",
    });
  }
});

// PUT /api/loans/:id/status — update loan status (cancel, mark complete)
loansRouter.put(
  "/:id/status",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    const parsed = updateLoanStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Statut invalide" });
    }

    const loan = await storage.updateLoanStatus(req.params.id, parsed.data.statut);
    if (!loan) {
      return res.status(404).json({ success: false, error: "Prêt non trouvé" });
    }
    return res.json({ success: true, data: loan });
  }
);

// GET /api/loans/employee/:employeId/active — get active loans for payroll deduction
loansRouter.get(
  "/employee/:employeId/active",
  requireMinRole(UserRole.COMPTABLE),
  async (req: Request, res: Response) => {
    const loans = await storage.getActiveLoans(req.params.employeId);
    return res.json({ success: true, data: loans });
  }
);
