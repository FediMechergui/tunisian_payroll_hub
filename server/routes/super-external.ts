// ============================================================================
// PayrollHub — Super External Admin Routes
// Platform-level admin: create companies + super_admin accounts
// ============================================================================

import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, requireRole } from "../auth";
import { storage } from "../storage";
import { UserRole, PlanType, type ApiResponse } from "../../shared/types";
import { PLAN_LIMITS } from "../../shared/const";
import { createCompanyWithAdminSchema } from "../../shared/schema";

export const superExternalRouter = Router();

// All routes require SUPER_EXTERNAL_ADMIN role
superExternalRouter.use(requireAuth, requireRole(UserRole.SUPER_EXTERNAL_ADMIN));

// GET /api/super-external/companies — List all companies
superExternalRouter.get("/companies", async (_req: Request, res: Response) => {
  try {
    const companies = await storage.getEntreprises();
    // Enrich with employee counts
    const enriched = await Promise.all(
      companies.map(async (c) => {
        const empCount = await storage.countEmployes(c.id);
        const users = await storage.getUtilisateurs(c.id);
        return { ...c, plan: c.plan || "gratuit", employeeCount: empCount, userCount: users.length };
      })
    );
    return res.json({ success: true, data: enriched } satisfies ApiResponse);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// GET /api/super-external/companies/:id — Get company details
superExternalRouter.get("/companies/:id", async (req: Request, res: Response) => {
  try {
    const company = await storage.getEntreprise(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: "Entreprise non trouvée" } satisfies ApiResponse);
    }
    const employeeCount = await storage.countEmployes(company.id);
    const users = await storage.getUtilisateurs(company.id);
    return res.json({ success: true, data: { company: { ...company, plan: company.plan || "gratuit" }, employeeCount, users } } satisfies ApiResponse);
  } catch (error) {
    console.error("Error fetching company:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// POST /api/super-external/companies — Create company + super_admin
superExternalRouter.post("/companies", async (req: Request, res: Response) => {
  try {
    const parsed = createCompanyWithAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e: any) => e.message).join(", "),
      } satisfies ApiResponse);
    }

    const data = parsed.data;

    // Check if matricule fiscal already exists
    const existing = await storage.getEntrepriseByMatricule(data.matriculeFiscal);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Une entreprise avec ce matricule fiscal existe déjà",
      } satisfies ApiResponse);
    }

    // Check if admin email already exists
    const existingUser = await storage.getUtilisateurByEmail(data.adminEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Un utilisateur avec cet email existe déjà",
      } satisfies ApiResponse);
    }

    // Get plan limits
    const planKey = data.plan as keyof typeof PLAN_LIMITS;
    const planConfig = PLAN_LIMITS[planKey];

    // Create the company
    const company = await storage.createEntreprise({
      nom: data.companyName,
      adresse: data.adresse,
      matriculeFiscal: data.matriculeFiscal,
      codeCnss: data.codeCnss,
      secteurActivite: data.secteurActivite,
      telephone: data.telephone,
      email: data.companyEmail,
      regimeTravail: data.regimeTravail,
      plan: data.plan as PlanType,
      maxEmployees: planConfig.maxEmployees,
      createdBy: req.user!.id,
    });

    // Create the super_admin user for this company
    const passwordHash = await bcrypt.hash(data.adminPassword, 10);
    const admin = await storage.createUtilisateur({
      email: data.adminEmail,
      motDePasseHash: passwordHash,
      nom: data.adminNom,
      prenom: data.adminPrenom,
      role: UserRole.SUPER_ADMIN,
      entrepriseId: company.id,
    });

    const { motDePasseHash, ...adminData } = admin;

    return res.status(201).json({
      success: true,
      data: {
        company,
        admin: adminData,
      },
      message: "Entreprise et administrateur créés avec succès",
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// PUT /api/super-external/companies/:id/plan — Update company plan
superExternalRouter.put("/companies/:id/plan", async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!plan || !PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]) {
      return res.status(400).json({ success: false, error: "Plan invalide" } satisfies ApiResponse);
    }

    const planConfig = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
    const company = await storage.updateEntreprise(req.params.id, {
      plan: plan as PlanType,
      maxEmployees: planConfig.maxEmployees,
    } as any);

    if (!company) {
      return res.status(404).json({ success: false, error: "Entreprise non trouvée" } satisfies ApiResponse);
    }

    return res.json({ success: true, data: company } satisfies ApiResponse);
  } catch (error) {
    console.error("Error updating plan:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// GET /api/super-external/stats — Platform-wide statistics
superExternalRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const companies = await storage.getEntreprises();
    const totalCompanies = companies.length;

    let totalEmployees = 0;
    let totalUsers = 0;
    const planDistribution: Record<string, number> = {};

    for (const c of companies) {
      const empCount = await storage.countEmployes(c.id);
      totalEmployees += empCount;
      const users = await storage.getUtilisateurs(c.id);
      totalUsers += users.length;
      const plan = c.plan || "gratuit";
      planDistribution[plan] = (planDistribution[plan] || 0) + 1;
    }

    return res.json({
      success: true,
      data: {
        totalCompanies,
        totalEmployees,
        totalUsers,
        planDistribution,
      },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" } satisfies ApiResponse);
  }
});

// GET /api/super-external/plans — List available plans
superExternalRouter.get("/plans", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: Object.entries(PLAN_LIMITS).map(([key, config]) => ({
      id: key,
      ...config,
    })),
  } satisfies ApiResponse);
});
