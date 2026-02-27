// ============================================================================
// PayrollHub — Declarations API Routes
// CNSS D-17, DGI DEU, Bank Wire Files generation
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireMinRole } from "../auth";
import { generateDeclarationSchema } from "../../shared/schema";
import { generateCnssD17, generateDgiDeu, generateVirementBancaire } from "../declaration-gen";
import { DeclarationType, DeclarationStatus, UserRole, PayPeriodStatus } from "../../shared/types";

export const declarationsRouter = Router();
declarationsRouter.use(requireAuth);
declarationsRouter.use(requireMinRole(UserRole.ADMIN_PAIE));

const DECL_LABELS: Record<DeclarationType, string> = {
  [DeclarationType.CNSS_D17]: "CNSS D-17",
  [DeclarationType.DGI_DEU]: "DGI DEU",
  [DeclarationType.VIREMENT_BANCAIRE]: "Virement Bancaire",
};

// GET /api/declarations — List all declarations
declarationsRouter.get("/", (req: Request, res: Response) => {
  const decls = storage.getDeclarations(req.user!.entrepriseId);
  return res.json({ success: true, data: decls });
});

// POST /api/declarations/generate — Generate a new declaration
declarationsRouter.post("/generate", (req: Request, res: Response) => {
  const parsed = generateDeclarationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Données invalides" });
  }

  const { type, trimestre, annee, periodeDebut, periodeFin } = parsed.data;
  const entrepriseId = req.user!.entrepriseId;
  const entreprise = storage.getEntreprise(entrepriseId);
  if (!entreprise) return res.status(404).json({ success: false, error: "Entreprise introuvable" });

  const employes = storage.getEmployes(entrepriseId);
  const periodes = storage.getPeriodesPaie(entrepriseId);

  try {
    if (type === DeclarationType.CNSS_D17) {
      // Get bulletins for the trimester
      const trimestreMonths = trimestre
        ? [(trimestre - 1) * 3 + 1, (trimestre - 1) * 3 + 2, (trimestre - 1) * 3 + 3]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      const relevantPeriodes = periodes.filter(
        p => p.annee === annee && trimestreMonths.includes(p.mois)
      );
      const allBulletins = relevantPeriodes.flatMap(p => storage.getBulletins(p.id));

      if (allBulletins.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Aucun bulletin trouvé pour cette période. Calculez d'abord la paie.",
        });
      }

      const nomFichier = `CNSS_D17_T${trimestre || 0}_${annee}.pdf`;
      const totalCnss = allBulletins.reduce((s, b) => s + b.cnssSalarial + b.cnssPatronal, 0);

      const declRecord = storage.createDeclaration({
        entrepriseId,
        type,
        periodeDebut,
        periodeFin,
        trimestre,
        annee,
        nomFichier,
        nbEmployes: employes.length,
        montantTotal: totalCnss,
        generePar: req.user!.id,
      });

      const { pdf, csv } = generateCnssD17(entreprise, employes, allBulletins, trimestre || 1, annee);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${nomFichier}"`);
      pdf.pipe(res);
    } else if (type === DeclarationType.DGI_DEU) {
      // Annual DEU — aggregate all bulletins by employee for the year
      const yearPeriodes = periodes.filter(p => p.annee === annee);
      const allBulletins = yearPeriodes.flatMap(p => storage.getBulletins(p.id));

      if (allBulletins.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Aucun bulletin trouvé pour cette année.",
        });
      }

      // Aggregate per employee
      const empMap = new Map<string, { brutAnnuel: number; cnssAnnuel: number; irppAnnuel: number; netAnnuel: number }>();
      for (const b of allBulletins) {
        const existing = empMap.get(b.employeId) || { brutAnnuel: 0, cnssAnnuel: 0, irppAnnuel: 0, netAnnuel: 0 };
        existing.brutAnnuel += b.salaireBrut;
        existing.cnssAnnuel += b.cnssSalarial;
        existing.irppAnnuel += b.irpp;
        existing.netAnnuel += b.netAPayer;
        empMap.set(b.employeId, existing);
      }

      const annualData = Array.from(empMap.entries()).map(([employeId, data]) => ({ employeId, ...data }));
      const totalIrpp = annualData.reduce((s, d) => s + d.irppAnnuel, 0);

      const nomFichier = `DGI_DEU_${annee}.pdf`;
      storage.createDeclaration({
        entrepriseId,
        type,
        periodeDebut,
        periodeFin,
        annee,
        nomFichier,
        nbEmployes: annualData.length,
        montantTotal: totalIrpp,
        generePar: req.user!.id,
      });

      const { pdf } = generateDgiDeu(entreprise, employes, annualData, annee);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${nomFichier}"`);
      pdf.pipe(res);
    } else if (type === DeclarationType.VIREMENT_BANCAIRE) {
      // Find the specific period in date range
      const startDate = new Date(periodeDebut);
      const mois = startDate.getMonth() + 1;
      const targetPeriode = periodes.find(p => p.annee === annee && p.mois === mois);
      if (!targetPeriode) {
        return res.status(400).json({ success: false, error: "Période de paie introuvable." });
      }

      const bulletins = storage.getBulletins(targetPeriode.id);
      if (bulletins.length === 0) {
        return res.status(400).json({ success: false, error: "Aucun bulletin calculé pour cette période." });
      }

      const totalVirement = bulletins.reduce((s, b) => s + b.netAPayer, 0);
      const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      const nomFichier = `Virement_${MOIS[mois - 1]}_${annee}.pdf`;

      storage.createDeclaration({
        entrepriseId,
        type,
        periodeDebut,
        periodeFin,
        annee,
        nomFichier,
        nbEmployes: bulletins.length,
        montantTotal: totalVirement,
        generePar: req.user!.id,
      });

      const { pdf } = generateVirementBancaire(entreprise, employes, bulletins, targetPeriode);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${nomFichier}"`);
      pdf.pipe(res);
    } else {
      return res.status(400).json({ success: false, error: "Type de déclaration non supporté" });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Erreur lors de la génération" });
  }
});

// GET /api/declarations/:id/download — Re-download a declaration
declarationsRouter.get("/:id/download", (req: Request, res: Response) => {
  const decl = storage.getDeclaration(req.params.id);
  if (!decl) return res.status(404).json({ success: false, error: "Déclaration introuvable" });

  // Re-generate based on stored params
  const entreprise = storage.getEntreprise(decl.entrepriseId);
  if (!entreprise) return res.status(404).json({ success: false, error: "Entreprise introuvable" });

  const employes = storage.getEmployes(decl.entrepriseId);
  const periodes = storage.getPeriodesPaie(decl.entrepriseId);

  try {
    if (decl.type === DeclarationType.CNSS_D17) {
      const trimestreMonths = decl.trimestre
        ? [(decl.trimestre - 1) * 3 + 1, (decl.trimestre - 1) * 3 + 2, (decl.trimestre - 1) * 3 + 3]
        : [1, 2, 3];
      const relevantPeriodes = periodes.filter(p => p.annee === decl.annee && trimestreMonths.includes(p.mois));
      const allBulletins = relevantPeriodes.flatMap(p => storage.getBulletins(p.id));
      const { pdf } = generateCnssD17(entreprise, employes, allBulletins, decl.trimestre || 1, decl.annee);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${decl.nomFichier}"`);
      pdf.pipe(res);
    } else if (decl.type === DeclarationType.DGI_DEU) {
      const yearPeriodes = periodes.filter(p => p.annee === decl.annee);
      const allBulletins = yearPeriodes.flatMap(p => storage.getBulletins(p.id));
      const empMap = new Map<string, { brutAnnuel: number; cnssAnnuel: number; irppAnnuel: number; netAnnuel: number }>();
      for (const b of allBulletins) {
        const existing = empMap.get(b.employeId) || { brutAnnuel: 0, cnssAnnuel: 0, irppAnnuel: 0, netAnnuel: 0 };
        existing.brutAnnuel += b.salaireBrut; existing.cnssAnnuel += b.cnssSalarial;
        existing.irppAnnuel += b.irpp; existing.netAnnuel += b.netAPayer;
        empMap.set(b.employeId, existing);
      }
      const annualData = Array.from(empMap.entries()).map(([employeId, data]) => ({ employeId, ...data }));
      const { pdf } = generateDgiDeu(entreprise, employes, annualData, decl.annee);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${decl.nomFichier}"`);
      pdf.pipe(res);
    } else if (decl.type === DeclarationType.VIREMENT_BANCAIRE) {
      const startDate = new Date(decl.periodeDebut);
      const mois = startDate.getMonth() + 1;
      const targetPeriode = periodes.find(p => p.annee === decl.annee && p.mois === mois);
      if (!targetPeriode) return res.status(404).json({ success: false, error: "Période introuvable" });
      const bulletins = storage.getBulletins(targetPeriode.id);
      const { pdf } = generateVirementBancaire(entreprise, employes, bulletins, targetPeriode);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${decl.nomFichier}"`);
      pdf.pipe(res);
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Erreur" });
  }
});

// PUT /api/declarations/:id/statut — Update declaration status
declarationsRouter.put("/:id/statut", (req: Request, res: Response) => {
  const { statut } = req.body;
  if (!statut || !Object.values(DeclarationStatus).includes(statut)) {
    return res.status(400).json({ success: false, error: "Statut invalide" });
  }
  const updated = storage.updateDeclarationStatut(req.params.id, statut);
  if (!updated) return res.status(404).json({ success: false, error: "Déclaration introuvable" });
  return res.json({ success: true, data: updated });
});

// DELETE /api/declarations/:id — Delete declaration
declarationsRouter.delete("/:id", requireMinRole(UserRole.ADMIN_RH), (req: Request, res: Response) => {
  const deleted = storage.deleteDeclaration(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: "Déclaration introuvable" });
  return res.json({ success: true, message: "Déclaration supprimée" });
});

// GET /api/declarations/:id/csv — Download CSV version
declarationsRouter.get("/:id/csv", (req: Request, res: Response) => {
  const decl = storage.getDeclaration(req.params.id);
  if (!decl) return res.status(404).json({ success: false, error: "Déclaration introuvable" });

  const entreprise = storage.getEntreprise(decl.entrepriseId);
  if (!entreprise) return res.status(404).json({ success: false, error: "Entreprise introuvable" });

  const employes = storage.getEmployes(decl.entrepriseId);
  const periodes = storage.getPeriodesPaie(decl.entrepriseId);

  try {
    let csvContent = "";

    if (decl.type === DeclarationType.CNSS_D17) {
      const trimestreMonths = decl.trimestre
        ? [(decl.trimestre - 1) * 3 + 1, (decl.trimestre - 1) * 3 + 2, (decl.trimestre - 1) * 3 + 3]
        : [1, 2, 3];
      const relevantPeriodes = periodes.filter(p => p.annee === decl.annee && trimestreMonths.includes(p.mois));
      const allBulletins = relevantPeriodes.flatMap(p => storage.getBulletins(p.id));
      const { csv } = generateCnssD17(entreprise, employes, allBulletins, decl.trimestre || 1, decl.annee);
      csvContent = csv;
    } else if (decl.type === DeclarationType.DGI_DEU) {
      const yearPeriodes = periodes.filter(p => p.annee === decl.annee);
      const allBulletins = yearPeriodes.flatMap(p => storage.getBulletins(p.id));
      const empMap = new Map<string, { brutAnnuel: number; cnssAnnuel: number; irppAnnuel: number; netAnnuel: number }>();
      for (const b of allBulletins) {
        const existing = empMap.get(b.employeId) || { brutAnnuel: 0, cnssAnnuel: 0, irppAnnuel: 0, netAnnuel: 0 };
        existing.brutAnnuel += b.salaireBrut; existing.cnssAnnuel += b.cnssSalarial;
        existing.irppAnnuel += b.irpp; existing.netAnnuel += b.netAPayer;
        empMap.set(b.employeId, existing);
      }
      const annualData = Array.from(empMap.entries()).map(([employeId, data]) => ({ employeId, ...data }));
      const { csv } = generateDgiDeu(entreprise, employes, annualData, decl.annee);
      csvContent = csv;
    } else {
      return res.status(400).json({ success: false, error: "Export CSV non disponible pour ce type" });
    }

    const csvFilename = decl.nomFichier.replace(".pdf", ".csv");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${csvFilename}"`);
    res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Erreur" });
  }
});
