// ============================================================================
// PayrollHub — Document Request Routes
// Employees request documents, upload papers, managers review & approve
// ============================================================================

import { Router, type Request, type Response } from "express";
import { requireAuth, requireMinRole } from "../auth";
import { storage } from "../storage";
import {
  UserRole,
  DocumentRequestStatus,
  DocumentType,
  type ApiResponse,
} from "../../shared/types";
import { DOCUMENT_REQUIRED_PAPERS } from "../../shared/const";
import {
  createDocumentRequestSchema,
  reviewDocumentRequestSchema,
} from "../../shared/schema";
import { uploadPapers } from "../multer-config";
import { UploadedFileModel } from "../models";
import { generateDocument } from "../document-pdf";

// Map document request types to DocumentType enum for PDF generation
const REQUEST_TYPE_TO_DOC_TYPE: Record<string, DocumentType | undefined> = {
  attestation_travail: DocumentType.ATTESTATION_TRAVAIL,
  attestation_salaire: DocumentType.ATTESTATION_SALAIRE,
  attestation_cnss: DocumentType.ATTESTATION_CNSS,
  certificat_travail: DocumentType.CERTIFICAT_TRAVAIL,
  fiche_paie_annuelle: DocumentType.FICHE_PAIE_ANNUELLE,
};

export const documentRequestsRouter = Router();

// All routes require authentication
documentRequestsRouter.use(requireAuth);

// POST /api/document-requests — Create a new document request
documentRequestsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createDocumentRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      } satisfies ApiResponse);
    }

    const user = req.user!;

    // Get the employee for this user
    if (!user.entrepriseId) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Utilisateur non lié à une entreprise",
        } satisfies ApiResponse);
    }

    // Find the user's linked employee
    const fullUser = await storage.getUtilisateur(user.id);
    if (!fullUser?.employeId) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Aucun employé lié à votre compte",
        } satisfies ApiResponse);
    }

    const requiredPapers =
      DOCUMENT_REQUIRED_PAPERS[parsed.data.typeDocument] || [];

    const request = await storage.createDocumentRequest({
      employeId: fullUser.employeId,
      entrepriseId: user.entrepriseId,
      typeDocument: parsed.data.typeDocument,
      motif: parsed.data.motif,
      requiredPapers,
      uploadedPapers: [],
      reviewedBy: undefined,
      reviewComment: undefined,
      dateReview: undefined,
      generatedDocumentId: undefined,
    });

    return res
      .status(201)
      .json({ success: true, data: request } satisfies ApiResponse);
  } catch (error) {
    console.error("Error creating document request:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// POST /api/document-requests/:id/upload — Upload papers for a document request
documentRequestsRouter.post(
  "/:id/upload",
  uploadPapers.array("papers", 5),
  async (req: Request, res: Response) => {
    try {
      const request = await storage.getDocumentRequest(req.params.id);
      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            error: "Demande non trouvée",
          } satisfies ApiResponse);
      }

      // Verify the request belongs to this user's employee
      const fullUser = await storage.getUtilisateur(req.user!.id);
      if (!fullUser?.employeId || request.employeId !== fullUser.employeId) {
        return res
          .status(403)
          .json({
            success: false,
            error: "Accès refusé",
          } satisfies ApiResponse);
      }

      // Only allow uploading to pending requests
      if (
        request.statut !== DocumentRequestStatus.EN_ATTENTE &&
        request.statut !== DocumentRequestStatus.REJETE
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Impossible d'ajouter des fichiers à cette demande",
          } satisfies ApiResponse);
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Aucun fichier fourni",
          } satisfies ApiResponse);
      }

      // Save file metadata to DB
      const uploadedPapers = [];
      for (const file of files) {
        const fileMeta = await UploadedFileModel.create({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          uploadedBy: req.user!.id,
          entrepriseId: req.user!.entrepriseId,
          category: "paper",
        });

        uploadedPapers.push({
          fileId: fileMeta._id.toString(),
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        });
      }

      // Update the request with new papers
      const existingPapers = request.uploadedPapers || [];
      const updated = await storage.updateDocumentRequest(req.params.id, {
        uploadedPapers: [...existingPapers, ...uploadedPapers],
        statut: DocumentRequestStatus.EN_ATTENTE as any, // Reset to pending if was rejected
      });

      return res.json({ success: true, data: updated } satisfies ApiResponse);
    } catch (error) {
      console.error("Error uploading papers:", error);
      return res
        .status(500)
        .json({
          success: false,
          error: "Erreur serveur",
        } satisfies ApiResponse);
    }
  }
);

// GET /api/document-requests — List requests (filtered by role)
documentRequestsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    // Employees see only their own requests
    if (user.role === UserRole.EMPLOYE) {
      const fullUser = await storage.getUtilisateur(user.id);
      if (!fullUser?.employeId) {
        return res.json({ success: true, data: [] } satisfies ApiResponse);
      }
      const requests = await storage.getDocumentRequestsByEmploye(
        fullUser.employeId
      );
      return res.json({ success: true, data: requests } satisfies ApiResponse);
    }

    // Managers+ see all requests for their company
    if (user.entrepriseId) {
      const requests = await storage.getDocumentRequests(user.entrepriseId);
      return res.json({ success: true, data: requests } satisfies ApiResponse);
    }

    return res.json({ success: true, data: [] } satisfies ApiResponse);
  } catch (error) {
    console.error("Error fetching document requests:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// GET /api/document-requests/:id — Get a specific request
documentRequestsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const request = await storage.getDocumentRequest(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Demande non trouvée",
        } satisfies ApiResponse);
    }

    // Get employee info for this request
    const employee = await storage.getEmploye(request.employeId);

    return res.json({
      success: true,
      data: { ...request, employe: employee },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Error fetching document request:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// PUT /api/document-requests/:id/review — Review (approve/reject) a request
documentRequestsRouter.put(
  "/:id/review",
  requireMinRole(UserRole.MANAGER),
  async (req: Request, res: Response) => {
    try {
      const parsed = reviewDocumentRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.issues.map((e: any) => e.message).join(", "),
        } satisfies ApiResponse);
      }

      const request = await storage.getDocumentRequest(req.params.id);
      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            error: "Demande non trouvée",
          } satisfies ApiResponse);
      }

      const now = new Date().toISOString();
      const newStatut =
        parsed.data.statut === "approuve"
          ? DocumentRequestStatus.APPROUVE
          : DocumentRequestStatus.REJETE;

      const updated = await storage.updateDocumentRequest(req.params.id, {
        statut: newStatut as any,
        reviewedBy: req.user!.id,
        reviewComment: parsed.data.reviewComment,
        dateReview: now,
      });

      // If approved, auto-generate the document PDF
      if (newStatut === DocumentRequestStatus.APPROUVE && updated) {
        const docType =
          REQUEST_TYPE_TO_DOC_TYPE[updated.typeDocument as string];
        if (docType) {
          try {
            const employee = await storage.getEmploye(updated.employeId);
            const entreprise = await storage.getEntreprise(
              updated.entrepriseId
            );
            if (employee && entreprise) {
              const nomFichier = `${docType}_${employee.nom}_${employee.prenom}_${new Date().toISOString().slice(0, 10)}.pdf`;
              const docRecord = await storage.createDocument({
                employeId: updated.employeId,
                typeDocument: docType,
                nomFichier,
                titre: `${docType.replace(/_/g, " ")}`,
                generePar: req.user!.id,
                entrepriseId: updated.entrepriseId,
              });
              // Update the request with the generated document ID and GENERE status
              await storage.updateDocumentRequest(req.params.id, {
                generatedDocumentId: docRecord.id,
                statut: DocumentRequestStatus.GENERE as any,
              });
            }
          } catch (genErr) {
            console.error(
              "Error auto-generating document after approval:",
              genErr
            );
            // Don't fail the review — the approval still stands
          }
        }
      }

      // Send notification to the employee
      if (updated) {
        const employee = await storage.getEmploye(updated.employeId);
        // Find user linked to this employee
        const users = await storage.getUtilisateurs(updated.entrepriseId);
        const empUser = users.find(u => u.employeId === updated.employeId);
        if (empUser) {
          await storage.createNotification({
            entrepriseId: updated.entrepriseId,
            destinataireId: empUser.id,
            type: "document_genere" as any,
            priorite: "medium" as any,
            titre:
              newStatut === DocumentRequestStatus.APPROUVE
                ? "Demande de document approuvée"
                : "Demande de document rejetée",
            message:
              newStatut === DocumentRequestStatus.APPROUVE
                ? `Votre demande de ${updated.typeDocument.replace(/_/g, " ")} a été approuvée.`
                : `Votre demande de ${updated.typeDocument.replace(/_/g, " ")} a été rejetée. ${parsed.data.reviewComment || ""}`,
            lien: "/app/mon-espace",
          });
        }
      }

      return res.json({ success: true, data: updated } satisfies ApiResponse);
    } catch (error) {
      console.error("Error reviewing document request:", error);
      return res
        .status(500)
        .json({
          success: false,
          error: "Erreur serveur",
        } satisfies ApiResponse);
    }
  }
);

// DELETE /api/document-requests/:id — Cancel a request
documentRequestsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const request = await storage.getDocumentRequest(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Demande non trouvée",
        } satisfies ApiResponse);
    }

    // Only allow the employee who created it (or admin) to delete
    const fullUser = await storage.getUtilisateur(req.user!.id);
    if (
      req.user!.role === UserRole.EMPLOYE &&
      request.employeId !== fullUser?.employeId
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Accès refusé" } satisfies ApiResponse);
    }

    await storage.deleteDocumentRequest(req.params.id);
    return res.json({
      success: true,
      message: "Demande supprimée",
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Error deleting document request:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// GET /api/document-requests/required-papers/:type — Get required papers for a document type
documentRequestsRouter.get(
  "/required-papers/:type",
  (_req: Request, res: Response) => {
    const type = _req.params.type;
    const papers = DOCUMENT_REQUIRED_PAPERS[type] || [];
    return res.json({ success: true, data: papers } satisfies ApiResponse);
  }
);

// GET /api/document-requests/:id/download — Download the generated document PDF
documentRequestsRouter.get(
  "/:id/download",
  async (req: Request, res: Response) => {
    try {
      const request = await storage.getDocumentRequest(req.params.id);
      if (!request) {
        return res
          .status(404)
          .json({
            success: false,
            error: "Demande non trouvée",
          } satisfies ApiResponse);
      }

      // Verify ownership for employees
      if (req.user!.role === UserRole.EMPLOYE) {
        const fullUser = await storage.getUtilisateur(req.user!.id);
        if (!fullUser?.employeId || request.employeId !== fullUser.employeId) {
          return res
            .status(403)
            .json({
              success: false,
              error: "Accès refusé",
            } satisfies ApiResponse);
        }
      }

      if (
        request.statut !== DocumentRequestStatus.APPROUVE &&
        request.statut !== DocumentRequestStatus.GENERE
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Le document n'est pas encore approuvé",
          } satisfies ApiResponse);
      }

      const docType = REQUEST_TYPE_TO_DOC_TYPE[request.typeDocument as string];
      if (!docType) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Type de document non supporté pour la génération",
          } satisfies ApiResponse);
      }

      const employee = await storage.getEmploye(request.employeId);
      if (!employee) {
        return res
          .status(404)
          .json({
            success: false,
            error: "Employé introuvable",
          } satisfies ApiResponse);
      }

      const entreprise = await storage.getEntreprise(request.entrepriseId);
      if (!entreprise) {
        return res
          .status(404)
          .json({
            success: false,
            error: "Entreprise introuvable",
          } satisfies ApiResponse);
      }

      const nomFichier = `${docType}_${employee.nom}_${employee.prenom}.pdf`;
      const pdfStream = generateDocument(docType, employee, entreprise, {
        annee: new Date().getFullYear(),
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomFichier}"`
      );
      pdfStream.pipe(res);
    } catch (error) {
      console.error("Error downloading document request:", error);
      return res
        .status(500)
        .json({
          success: false,
          error: "Erreur serveur",
        } satisfies ApiResponse);
    }
  }
);
