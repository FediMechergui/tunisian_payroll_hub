// ============================================================================
// PayrollHub — Documents API Routes
// Generate and manage HR documents (work certs, CNSS attestations, etc.)
// ============================================================================

import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireMinRole } from "../auth";
import { generateDocumentSchema } from "../../shared/schema";
import { generateDocument } from "../document-pdf";
import { DocumentType, UserRole } from "../../shared/types";

export const documentsRouter = Router();
documentsRouter.use(requireAuth);

const DOC_LABELS: Record<DocumentType, string> = {
  [DocumentType.ATTESTATION_TRAVAIL]: "Attestation de Travail",
  [DocumentType.ATTESTATION_SALAIRE]: "Attestation de Salaire",
  [DocumentType.ATTESTATION_CNSS]: "Attestation CNSS",
  [DocumentType.FICHE_PAIE_ANNUELLE]: "Fiche de Paie Annuelle",
  [DocumentType.CERTIFICAT_TRAVAIL]: "Certificat de Travail",
};

// GET /api/documents — List all generated documents
documentsRouter.get("/", async (req: Request, res: Response) => {
  const docs = await storage.getDocuments(req.user!.entrepriseId);
  // Enrich with employee info
  const enriched = [];
  for (const d of docs) {
    const emp = await storage.getEmploye(d.employeId);
    enriched.push({
      ...d,
      employe: emp
        ? {
            nom: emp.nom,
            prenom: emp.prenom,
            departement: emp.departement,
            poste: emp.poste,
          }
        : undefined,
    });
  }
  return res.json({ success: true, data: enriched });
});

// GET /api/documents/employe/:employeId — Documents for a specific employee
documentsRouter.get(
  "/employe/:employeId",
  async (req: Request, res: Response) => {
    const docs = await storage.getDocumentsByEmploye(req.params.employeId);
    return res.json({ success: true, data: docs });
  }
);

// POST /api/documents/generate — Generate a new document PDF
documentsRouter.post(
  "/generate",
  requireMinRole(UserRole.MANAGER),
  async (req: Request, res: Response) => {
    const parsed = generateDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || "Données invalides",
      });
    }

    const { employeId, typeDocument, annee } = parsed.data;

    const employe = await storage.getEmploye(employeId);
    if (!employe)
      return res
        .status(404)
        .json({ success: false, error: "Employé introuvable" });

    const entreprise = await storage.getEntreprise(req.user!.entrepriseId);
    if (!entreprise)
      return res
        .status(404)
        .json({ success: false, error: "Entreprise introuvable" });

    try {
      // For annual tax form, gather bulletin data
      let bulletinData:
        | {
            mois: number;
            brut: number;
            cnss: number;
            irpp: number;
            net: number;
          }[]
        | undefined;
      if (typeDocument === DocumentType.FICHE_PAIE_ANNUELLE) {
        const allBulletins = await storage.getBulletinsByEmploye(employeId);
        const targetYear = annee || new Date().getFullYear();
        // Get periods to filter by year
        const filtered = [];
        for (const b of allBulletins) {
          const periode = await storage.getPeriodePaie(b.periodePaieId);
          if (periode && periode.annee === targetYear) {
            filtered.push({
              mois: periode.mois,
              brut: b.salaireBrut,
              cnss: b.cnssSalarial,
              irpp: b.irpp,
              net: b.netAPayer,
            });
          }
        }
        bulletinData = filtered;
      }

      const nomFichier = `${typeDocument}_${employe.nom}_${employe.prenom}_${new Date().toISOString().slice(0, 10)}.pdf`;

      // Save metadata
      const docRecord = await storage.createDocument({
        employeId,
        typeDocument,
        nomFichier,
        titre: DOC_LABELS[typeDocument] || typeDocument,
        generePar: req.user!.id,
        entrepriseId: req.user!.entrepriseId,
      });

      // Generate PDF and stream
      const pdfStream = generateDocument(typeDocument, employe, entreprise, {
        annee: annee || new Date().getFullYear(),
        bulletins: bulletinData,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomFichier}"`
      );
      pdfStream.pipe(res);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Erreur lors de la génération",
      });
    }
  }
);

// GET /api/documents/:id/download — Re-generate and download a document
documentsRouter.get("/:id/download", async (req: Request, res: Response) => {
  const doc = await storage.getDocument(req.params.id);
  if (!doc)
    return res
      .status(404)
      .json({ success: false, error: "Document introuvable" });

  const employe = await storage.getEmploye(doc.employeId);
  if (!employe)
    return res
      .status(404)
      .json({ success: false, error: "Employé introuvable" });

  const entreprise = await storage.getEntreprise(req.user!.entrepriseId);
  if (!entreprise)
    return res
      .status(404)
      .json({ success: false, error: "Entreprise introuvable" });

  try {
    let bulletinData:
      | {
          mois: number;
          brut: number;
          cnss: number;
          irpp: number;
          net: number;
        }[]
      | undefined;
    if (doc.typeDocument === DocumentType.FICHE_PAIE_ANNUELLE) {
      const allBulletins = await storage.getBulletinsByEmploye(doc.employeId);
      const filtered = [];
      for (const b of allBulletins) {
        const periode = await storage.getPeriodePaie(b.periodePaieId);
        if (periode) {
          filtered.push({
            mois: periode.mois,
            brut: b.salaireBrut,
            cnss: b.cnssSalarial,
            irpp: b.irpp,
            net: b.netAPayer,
          });
        }
      }
      bulletinData = filtered;
    }

    const pdfStream = generateDocument(doc.typeDocument, employe, entreprise, {
      bulletins: bulletinData,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.nomFichier}"`
    );
    pdfStream.pipe(res);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de la génération",
    });
  }
});

// DELETE /api/documents/:id — Delete a document record
documentsRouter.delete(
  "/:id",
  requireMinRole(UserRole.ADMIN_RH),
  async (req: Request, res: Response) => {
    const deleted = await storage.deleteDocument(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, error: "Document introuvable" });
    return res.json({ success: true, message: "Document supprimé" });
  }
);
