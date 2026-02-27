// ============================================================================
// PayrollHub — External API v1 Routes
// REST endpoints for third-party integrations with API key auth
// ============================================================================

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import type { ApiResponse, ApiKey, ApiPermission } from "../../shared/types";

export const externalApiRouter = Router();

// --- API Key Authentication Middleware ---

interface ApiKeyRequest extends Request {
  apiKey?: ApiKey;
  apiEntrepriseId?: string;
}

function requireApiKey(req: ApiKeyRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "API key required. Use Authorization: Bearer <api_key>",
    } satisfies ApiResponse);
  }

  const rawKey = authHeader.substring(7);
  const apiKey = storage.getApiKeyByRaw(rawKey);

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key",
    } satisfies ApiResponse);
  }

  // Rate limiting
  const rateCheck = storage.checkRateLimit(apiKey.id, apiKey.limiteRequetes);
  res.set("X-RateLimit-Limit", String(apiKey.limiteRequetes));
  res.set("X-RateLimit-Remaining", String(rateCheck.remaining));
  res.set("X-RateLimit-Reset", new Date(rateCheck.resetAt).toISOString());

  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Try again later.",
    } satisfies ApiResponse);
  }

  // Update last used timestamp
  storage.updateApiKeyLastUsed(apiKey.id);

  req.apiKey = apiKey;
  req.apiEntrepriseId = apiKey.entrepriseId;
  next();
}

function requirePermission(...perms: ApiPermission[]) {
  return (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({ success: false, error: "Not authenticated" } satisfies ApiResponse);
    }
    const hasPermission = perms.some(p => req.apiKey!.permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Missing required permission: ${perms.join(" or ")}`,
      } satisfies ApiResponse);
    }
    next();
  };
}

// Apply API key auth to all routes
externalApiRouter.use(requireApiKey as any);

// --- Documentation endpoint ---
externalApiRouter.get("/", (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      version: "1.0",
      description: "PayrollHub External API — Tunisian Payroll & HR",
      baseUrl: "/api/v1",
      authentication: "Bearer token via Authorization header",
      rateLimit: "Per-key hourly limit (see X-RateLimit-* headers)",
      endpoints: [
        {
          method: "GET", path: "/api/v1/employes",
          description: "List all employees", permission: "employes:read",
          parameters: [
            { name: "search", type: "string", required: false, description: "Search by name, CIN or department" },
            { name: "departement", type: "string", required: false, description: "Filter by department" },
            { name: "actif", type: "boolean", required: false, description: "Filter by active status" },
          ],
        },
        {
          method: "GET", path: "/api/v1/employes/:id",
          description: "Get employee detail", permission: "employes:read",
        },
        {
          method: "GET", path: "/api/v1/paie/periodes",
          description: "List payroll periods", permission: "paie:read",
        },
        {
          method: "GET", path: "/api/v1/paie/periodes/:id",
          description: "Get payroll period with bulletins", permission: "paie:read",
        },
        {
          method: "GET", path: "/api/v1/conges",
          description: "List leave requests", permission: "conges:read",
          parameters: [
            { name: "employeId", type: "string", required: false, description: "Filter by employee" },
            { name: "statut", type: "string", required: false, description: "Filter by status" },
          ],
        },
        {
          method: "POST", path: "/api/v1/conges",
          description: "Create leave request", permission: "conges:write",
        },
        {
          method: "GET", path: "/api/v1/dashboard/stats",
          description: "Get dashboard statistics", permission: "dashboard:read",
        },
        {
          method: "GET", path: "/api/v1/documents",
          description: "List generated documents", permission: "documents:read",
        },
      ],
    },
  } satisfies ApiResponse);
});

// --- Employees ---

externalApiRouter.get(
  "/employes",
  requirePermission("employes:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      let emps = storage.getEmployes(req.apiEntrepriseId!);

      // Optional filters
      const { search, departement, actif } = req.query;
      if (search) {
        const s = String(search).toLowerCase();
        emps = emps.filter(e =>
          `${e.nom} ${e.prenom} ${e.cin} ${e.departement}`.toLowerCase().includes(s)
        );
      }
      if (departement) {
        emps = emps.filter(e => e.departement === String(departement));
      }
      if (actif !== undefined) {
        const isActif = actif === "true";
        emps = emps.filter(e => e.actif === isActif);
      }

      return res.json({ success: true, data: emps } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

externalApiRouter.get(
  "/employes/:id",
  requirePermission("employes:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      const emp = storage.getEmploye(req.params.id);
      if (!emp || emp.entrepriseId !== req.apiEntrepriseId) {
        return res.status(404).json({ success: false, error: "Employee not found" } satisfies ApiResponse);
      }
      return res.json({ success: true, data: emp } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

// --- Payroll ---

externalApiRouter.get(
  "/paie/periodes",
  requirePermission("paie:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      const periodes = storage.getPeriodesPaie(req.apiEntrepriseId!);
      return res.json({ success: true, data: periodes } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

externalApiRouter.get(
  "/paie/periodes/:id",
  requirePermission("paie:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      const periode = storage.getPeriodePaie(req.params.id);
      if (!periode || periode.entrepriseId !== req.apiEntrepriseId) {
        return res.status(404).json({ success: false, error: "Period not found" } satisfies ApiResponse);
      }
      const bulletins = storage.getBulletins(periode.id);
      return res.json({ success: true, data: { periode, bulletins } } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

// --- Leaves ---

externalApiRouter.get(
  "/conges",
  requirePermission("conges:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      let conges = storage.getConges();
      // Filter to enterprise employees only
      const emps = storage.getEmployes(req.apiEntrepriseId!);
      const empIds = new Set(emps.map(e => e.id));
      conges = conges.filter(c => empIds.has(c.employeId));

      const { employeId, statut } = req.query;
      if (employeId) conges = conges.filter(c => c.employeId === String(employeId));
      if (statut) conges = conges.filter(c => c.statut === String(statut));

      return res.json({ success: true, data: conges } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

externalApiRouter.post(
  "/conges",
  requirePermission("conges:write" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      const { employeId, typeConge, dateDebut, dateFin, nbJours, motif } = req.body;
      if (!employeId || !typeConge || !dateDebut || !dateFin || !nbJours) {
        return res.status(400).json({ success: false, error: "Missing required fields" } satisfies ApiResponse);
      }
      // Verify employee belongs to this enterprise
      const emp = storage.getEmploye(employeId);
      if (!emp || emp.entrepriseId !== req.apiEntrepriseId) {
        return res.status(404).json({ success: false, error: "Employee not found" } satisfies ApiResponse);
      }

      const conge = storage.createConge({
        employeId, typeConge, dateDebut, dateFin, nbJours,
        motif: motif || "",
      });

      return res.status(201).json({ success: true, data: conge } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

// --- Dashboard ---

externalApiRouter.get(
  "/dashboard/stats",
  requirePermission("dashboard:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      const stats = storage.getCachedDashboardStats(req.apiEntrepriseId!);
      return res.json({ success: true, data: stats } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);

// --- Documents ---

externalApiRouter.get(
  "/documents",
  requirePermission("documents:read" as ApiPermission) as any,
  (req: ApiKeyRequest, res: Response) => {
    try {
      const docs = storage.getDocuments(req.apiEntrepriseId!);
      return res.json({ success: true, data: docs } satisfies ApiResponse);
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" } satisfies ApiResponse);
    }
  }
);
