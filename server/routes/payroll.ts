// ============================================================================
// PayrollHub — Payroll API Routes
// Periods, variable elements, calculation, bulletins, PDF
// ============================================================================

import { Router, type Request, type Response } from "express";
import { requireAuth, requireMinRole } from "../auth";
import { storage } from "../storage";
import { calculatePayroll, runPayrollForPeriod } from "../payroll-engine";
import { generatePayslipPDF } from "../payslip-pdf";
import { createPeriodePaieSchema, createElementPaieSchema } from "../../shared/schema";
import { PayPeriodStatus, UserRole, PayElementType } from "../../shared/types";
import { notificationService } from "../notification-service";

export const payrollRouter = Router();

payrollRouter.use(requireAuth);

// =============================================
// Périodes de Paie
// =============================================

// GET /api/payroll/periodes — List all pay periods
payrollRouter.get("/periodes", async (req: Request, res: Response) => {
  const periodes = await storage.getPeriodesPaie(req.user!.entrepriseId);
  return res.json({ success: true, data: periodes });
});

// GET /api/payroll/periodes/:id — Get single pay period with bulletins summary
payrollRouter.get("/periodes/:id", async (req: Request, res: Response) => {
  const periode = await storage.getPeriodePaie(req.params.id);
  if (!periode) {
    return res
      .status(404)
      .json({ success: false, error: "Période introuvable" });
  }
  const bulletins = await storage.getBulletins(periode.id);
  return res.json({
    success: true,
    data: {
      periode,
      bulletins,
      summary: {
        totalBulletins: bulletins.length,
        totalBrut: bulletins.reduce(
          (s: number, b: any) => s + b.salaireBrut,
          0
        ),
        totalNet: bulletins.reduce((s: number, b: any) => s + b.netAPayer, 0),
        totalCnss: bulletins.reduce(
          (s: number, b: any) => s + b.cnssSalarial + b.cnssPatronal,
          0
        ),
        totalIrpp: bulletins.reduce((s: number, b: any) => s + b.irpp, 0),
        totalCoutEmployeur: bulletins.reduce(
          (s: number, b: any) => s + b.coutTotalEmployeur,
          0
        ),
      },
    },
  });
});

// POST /api/payroll/periodes — Create a new pay period
payrollRouter.post(
  "/periodes",
  requireMinRole(UserRole.ADMIN_PAIE),
  async (req: Request, res: Response) => {
    const parsed = createPeriodePaieSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        data: parsed.error.issues,
      });
    }

    // Check for duplicate
    const existing = await storage.getPeriodePaieByMonth(
      req.user!.entrepriseId,
      parsed.data.mois,
      parsed.data.annee
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Une période existe déjà pour ce mois",
      });
    }

    const periode = await storage.createPeriodePaie({
      entrepriseId: req.user!.entrepriseId,
      mois: parsed.data.mois,
      annee: parsed.data.annee,
      dateDebut: parsed.data.dateDebut,
      dateFin: parsed.data.dateFin,
    });

    return res.status(201).json({ success: true, data: periode });
  }
);

// PUT /api/payroll/periodes/:id/statut — Update period status
payrollRouter.put(
  "/periodes/:id/statut",
  requireMinRole(UserRole.ADMIN_PAIE),
  async (req: Request, res: Response) => {
    const { statut } = req.body;
    if (!Object.values(PayPeriodStatus).includes(statut)) {
      return res.status(400).json({ success: false, error: "Statut invalide" });
    }

    const periode = await storage.updatePeriodePaieStatut(
      req.params.id,
      statut
    );
    if (!periode) {
      return res
        .status(404)
        .json({ success: false, error: "Période introuvable" });
    }

    return res.json({ success: true, data: periode });
  }
);

// =============================================
// Éléments de Paie (Saisie des Variables)
// =============================================

// GET /api/payroll/periodes/:id/elements — Get all variable elements for a period
payrollRouter.get(
  "/periodes/:id/elements",
  async (req: Request, res: Response) => {
    const { employeId } = req.query;
    const elements = await storage.getElementsPaie(
      req.params.id,
      employeId as string | undefined
    );
    return res.json({ success: true, data: elements });
  }
);

// POST /api/payroll/periodes/:id/elements — Add variable elements (batch)
payrollRouter.post(
  "/periodes/:id/elements",
  requireMinRole(UserRole.ADMIN_PAIE),
  async (req: Request, res: Response) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res
        .status(404)
        .json({ success: false, error: "Période introuvable" });
    }
    if (periode.statut === PayPeriodStatus.FINALISEE) {
      return res.status(400).json({
        success: false,
        error: "Période finalisée, modification impossible",
      });
    }

    const { elements } = req.body;
    if (!Array.isArray(elements)) {
      return res
        .status(400)
        .json({ success: false, error: "Un tableau d'éléments est requis" });
    }

    const created = [];
    for (const el of elements) {
      const parsed = createElementPaieSchema.safeParse(el);
      if (!parsed.success) continue;

      const element = await storage.createElementPaie({
        periodePaieId: req.params.id,
        employeId: parsed.data.employeId,
        type: parsed.data.type,
        libelle: parsed.data.libelle,
        montant: parsed.data.montant,
        estVariable: true,
        heures: parsed.data.heures,
        taux: parsed.data.taux,
      });
      created.push(element);
    }

    return res.status(201).json({ success: true, data: created });
  }
);

// DELETE /api/payroll/periodes/:id/elements — Clear variable elements
payrollRouter.delete(
  "/periodes/:id/elements",
  requireMinRole(UserRole.ADMIN_PAIE),
  async (req: Request, res: Response) => {
    const { employeId } = req.query;
    const count = await storage.deleteElementsPaie(
      req.params.id,
      employeId as string | undefined
    );
    return res.json({ success: true, data: { deleted: count } });
  }
);

// =============================================
// Calcul de Paie
// =============================================

// POST /api/payroll/periodes/:id/calculer — Run payroll calculation for entire period
payrollRouter.post(
  "/periodes/:id/calculer",
  requireMinRole(UserRole.ADMIN_PAIE),
  async (req: Request, res: Response) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res
        .status(404)
        .json({ success: false, error: "Période introuvable" });
    }
    if (periode.statut === PayPeriodStatus.FINALISEE) {
      return res
        .status(400)
        .json({ success: false, error: "Période déjà finalisée" });
    }

    try {
      // Clear previous bulletins for this period (re-calculation)
      await storage.deleteBulletins(periode.id);

      // Run payroll engine
      const bulletins = await runPayrollForPeriod(
        periode.id,
        periode.entrepriseId
      );

      // Save bulletins
      await storage.saveBulletins(bulletins);

      // Update period status
      await storage.updatePeriodePaieStatut(
        periode.id,
        PayPeriodStatus.CALCULEE
      );

      // Build summary
      const summary = {
        totalBulletins: bulletins.length,
        totalBrut: bulletins.reduce((s, b) => s + b.salaireBrut, 0),
        totalNet: bulletins.reduce((s, b) => s + b.netAPayer, 0),
        totalCnss: bulletins.reduce(
          (s, b) => s + b.cnssSalarial + b.cnssPatronal,
          0
        ),
        totalIrpp: bulletins.reduce((s, b) => s + b.irpp, 0),
        totalCoutEmployeur: bulletins.reduce(
          (s, b) => s + b.coutTotalEmployeur,
          0
        ),
      };

      const monthNames = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      const pLabel = `${monthNames[periode.mois - 1]} ${periode.annee}`;
      await notificationService.onPayrollCalculated(
        req.user!.entrepriseId,
        pLabel
      );
      await storage.invalidateCache("dashboard");

      return res.json({ success: true, data: { bulletins, summary } });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, error: error.message || "Erreur de calcul" });
    }
  }
);

// POST /api/payroll/periodes/:id/valider — Validate the period (lock)
payrollRouter.post(
  "/periodes/:id/valider",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res
        .status(404)
        .json({ success: false, error: "Période introuvable" });
    }
    if (periode.statut !== PayPeriodStatus.CALCULEE) {
      return res.status(400).json({
        success: false,
        error: "La période doit être calculée avant validation",
      });
    }

    await storage.updatePeriodePaieStatut(periode.id, PayPeriodStatus.VALIDEE);
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const label = `${months[periode.mois - 1]} ${periode.annee}`;
    await notificationService.onPayrollValidated(req.user!.entrepriseId, label);
    await storage.invalidateCache("dashboard");
    return res.json({ success: true, data: { message: "Période validée" } });
  }
);

// POST /api/payroll/periodes/:id/finaliser — Finalize (no more changes)
payrollRouter.post(
  "/periodes/:id/finaliser",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res
        .status(404)
        .json({ success: false, error: "Période introuvable" });
    }
    if (periode.statut !== PayPeriodStatus.VALIDEE) {
      return res.status(400).json({
        success: false,
        error: "La période doit être validée avant finalisation",
      });
    }

    await storage.updatePeriodePaieStatut(
      periode.id,
      PayPeriodStatus.FINALISEE
    );
    const months2 = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const label2 = `${months2[periode.mois - 1]} ${periode.annee}`;
    await notificationService.onPayrollFinalized(
      req.user!.entrepriseId,
      label2
    );
    await storage.invalidateCache("dashboard");
    return res.json({ success: true, data: { message: "Période finalisée" } });
  }
);

// =============================================
// Bulletins de Paie
// =============================================

// GET /api/payroll/bulletins/:id — Get a single bulletin
payrollRouter.get("/bulletins/:id", async (req: Request, res: Response) => {
  const bulletin = await storage.getBulletin(req.params.id);
  if (!bulletin) {
    return res
      .status(404)
      .json({ success: false, error: "Bulletin introuvable" });
  }
  return res.json({ success: true, data: bulletin });
});

// GET /api/payroll/bulletins/:id/pdf — Download payslip as PDF
payrollRouter.get("/bulletins/:id/pdf", async (req: Request, res: Response) => {
  const bulletin = await storage.getBulletin(req.params.id);
  if (!bulletin) {
    return res
      .status(404)
      .json({ success: false, error: "Bulletin introuvable" });
  }

  const entreprise = await storage.getEntreprise(bulletin.employe.entrepriseId);
  if (!entreprise) {
    return res
      .status(404)
      .json({ success: false, error: "Entreprise introuvable" });
  }

  const periode = await storage.getPeriodePaie(bulletin.periodePaieId);
  if (!periode) {
    return res
      .status(404)
      .json({ success: false, error: "Période introuvable" });
  }

  const moisLabels = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const filename = `bulletin_${bulletin.employe.nom}_${bulletin.employe.prenom}_${moisLabels[periode.mois - 1]}_${periode.annee}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const stream = generatePayslipPDF(bulletin, entreprise, periode);
  stream.pipe(res);
  stream.end();
});

// GET /api/payroll/employes/:id/bulletins — Get bulletins for an employee (history)
payrollRouter.get(
  "/employes/:id/bulletins",
  async (req: Request, res: Response) => {
    const employe = await storage.getEmploye(req.params.id);
    if (!employe) {
      return res
        .status(404)
        .json({ success: false, error: "Employé introuvable" });
    }

    const bulletins = await storage.getBulletinsByEmploye(req.params.id);
    return res.json({ success: true, data: bulletins });
  }
);
