// ============================================================================
// PayrollHub — API Client
// Axios instance with interceptors for auth
// ============================================================================

import axios from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Employe,
  Utilisateur,
  Conge,
  Entreprise,
  ParametreReglementaire,
  DashboardStats,
  CreateEmployeRequest,
  UpdateEmployeRequest,
  PeriodePaie,
  BulletinPaie,
  ElementPaie,
  DocumentRH,
  Declaration,
  ReportConfig,
  Notification,
  ApiKey,
  ApiPermission,
  DocumentRequest,
  CreateCompanyWithAdminRequest,
  Loan,
} from "@shared/types";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect if we're in the /app section
      if (window.location.pathname.startsWith("/app")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth API ---

export const authApi = {
  login: (email: string, motDePasse: string) =>
    api.post<ApiResponse<{ user: Utilisateur; token: string }>>("/auth/login", {
      email,
      motDePasse,
    }),

  signup: (data: {
    adminNom: string;
    adminPrenom: string;
    adminEmail: string;
    adminPassword: string;
    companyName: string;
    matriculeFiscal: string;
    codeCnss: string;
    adresse: string;
    secteurActivite: string;
    regimeTravail: string;
    regimeSocial?: string;
    congesPayesParAn?: number;
    telephone?: string;
    plan: string;
  }) =>
    api.post<ApiResponse<{ user: Utilisateur; token: string; company: any }>>(
      "/auth/signup",
      data
    ),

  logout: () => api.post<ApiResponse>("/auth/logout"),

  me: () => api.get<ApiResponse<Utilisateur>>("/auth/me"),
};

// --- Employees API ---

export const employeesApi = {
  list: (params?: { search?: string; page?: number; pageSize?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Employe>>>("/employees", { params }),

  get: (id: string) => api.get<ApiResponse<Employe>>(`/employees/${id}`),

  create: (data: CreateEmployeRequest) =>
    api.post<ApiResponse<Employe>>("/employees", data),

  update: (id: string, data: UpdateEmployeRequest) =>
    api.put<ApiResponse<Employe>>(`/employees/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/employees/${id}`),
};

// --- Users API ---

export const usersApi = {
  list: () => api.get<ApiResponse<Utilisateur[]>>("/users"),

  create: (data: {
    email: string;
    motDePasse: string;
    nom: string;
    prenom: string;
    role: string;
    employeId?: string;
  }) => api.post<ApiResponse<Utilisateur>>("/users", data),

  update: (id: string, data: Partial<Utilisateur>) =>
    api.put<ApiResponse<Utilisateur>>(`/users/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/users/${id}`),
};

// --- Entreprises API ---

export const entreprisesApi = {
  list: () => api.get<ApiResponse<Entreprise[]>>("/entreprises"),

  get: (id: string) => api.get<ApiResponse<Entreprise>>(`/entreprises/${id}`),

  update: (id: string, data: Partial<Entreprise>) =>
    api.put<ApiResponse<Entreprise>>(`/entreprises/${id}`, data),

  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return api.post<ApiResponse<Entreprise>>(
      `/entreprises/${id}/logo`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};

// --- Parametres API ---

export const parametresApi = {
  list: (categorie?: string) =>
    api.get<ApiResponse<ParametreReglementaire[]>>("/parametres", {
      params: categorie ? { categorie } : {},
    }),

  update: (id: string, data: Partial<ParametreReglementaire>) =>
    api.put<ApiResponse<ParametreReglementaire>>(`/parametres/${id}`, data),
};

// --- Dashboard API ---

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};

// --- Payroll API ---

export const payrollApi = {
  // Periods
  listPeriodes: () => api.get<ApiResponse<PeriodePaie[]>>("/payroll/periodes"),

  getPeriode: (id: string) =>
    api.get<
      ApiResponse<{
        periode: PeriodePaie;
        bulletins: BulletinPaie[];
        summary: any;
      }>
    >(`/payroll/periodes/${id}`),

  createPeriode: (data: {
    mois: number;
    annee: number;
    dateDebut: string;
    dateFin: string;
  }) => api.post<ApiResponse<PeriodePaie>>("/payroll/periodes", data),

  updateStatut: (id: string, statut: string) =>
    api.put<ApiResponse<PeriodePaie>>(`/payroll/periodes/${id}/statut`, {
      statut,
    }),

  // Elements (variable inputs)
  getElements: (periodeId: string, employeId?: string) =>
    api.get<ApiResponse<ElementPaie[]>>(
      `/payroll/periodes/${periodeId}/elements`,
      {
        params: employeId ? { employeId } : {},
      }
    ),

  addElements: (periodeId: string, elements: any[]) =>
    api.post<ApiResponse<ElementPaie[]>>(
      `/payroll/periodes/${periodeId}/elements`,
      { elements }
    ),

  clearElements: (periodeId: string, employeId?: string) =>
    api.delete<ApiResponse>(`/payroll/periodes/${periodeId}/elements`, {
      params: employeId ? { employeId } : {},
    }),

  // Calculation
  calculer: (periodeId: string) =>
    api.post<ApiResponse<{ bulletins: BulletinPaie[]; summary: any }>>(
      `/payroll/periodes/${periodeId}/calculer`
    ),

  valider: (periodeId: string) =>
    api.post<ApiResponse>(`/payroll/periodes/${periodeId}/valider`),

  finaliser: (periodeId: string) =>
    api.post<ApiResponse>(`/payroll/periodes/${periodeId}/finaliser`),

  // Bulletins
  getBulletin: (id: string) =>
    api.get<ApiResponse<BulletinPaie>>(`/payroll/bulletins/${id}`),

  downloadPDF: (id: string) =>
    api.get(`/payroll/bulletins/${id}/pdf`, { responseType: "blob" }),

  getEmployeBulletins: (employeId: string) =>
    api.get<ApiResponse<BulletinPaie[]>>(
      `/payroll/employes/${employeId}/bulletins`
    ),
};

// --- Congés API ---

export const congesApi = {
  list: () =>
    api.get<
      ApiResponse<
        (Conge & {
          employe?: {
            nom: string;
            prenom: string;
            departement: string;
            poste: string;
          };
        })[]
      >
    >("/conges"),

  get: (id: string) =>
    api.get<
      ApiResponse<
        Conge & {
          employe?: {
            nom: string;
            prenom: string;
            departement: string;
            poste: string;
          };
        }
      >
    >(`/conges/${id}`),

  create: (data: {
    employeId: string;
    typeConge: string;
    dateDebut: string;
    dateFin: string;
    nbJours: number;
    motif?: string;
  }) => api.post<ApiResponse<Conge>>("/conges", data),

  updateStatut: (
    id: string,
    statut: "approuve" | "rejete" | "annule",
    motifRefus?: string
  ) =>
    api.put<ApiResponse<Conge>>(`/conges/${id}/statut`, { statut, motifRefus }),

  cancel: (id: string) => api.put<ApiResponse<Conge>>(`/conges/${id}/annuler`),

  delete: (id: string) => api.delete<ApiResponse>(`/conges/${id}`),

  getBalance: (employeId: string, year?: number) =>
    api.get<
      ApiResponse<{
        droitAnnuel: number;
        consomme: number;
        enAttente: number;
        solde: number;
      }>
    >(`/conges/balance/${employeId}`, { params: year ? { year } : {} }),
};

// --- Documents API ---

export const documentsApi = {
  list: () =>
    api.get<
      ApiResponse<
        (DocumentRH & {
          employe?: { nom: string; prenom: string; departement: string };
        })[]
      >
    >("/documents"),

  listByEmploye: (employeId: string) =>
    api.get<ApiResponse<DocumentRH[]>>(`/documents/employe/${employeId}`),

  generate: (data: {
    employeId: string;
    typeDocument: string;
    annee?: number;
    mois?: number;
  }) => api.post("/documents/generate", data, { responseType: "blob" }),

  download: (id: string) =>
    api.get(`/documents/${id}/download`, { responseType: "blob" }),

  delete: (id: string) => api.delete<ApiResponse>(`/documents/${id}`),
};

// --- Declarations API ---

export const declarationsApi = {
  list: () => api.get<ApiResponse<Declaration[]>>("/declarations"),

  generate: (data: {
    type: string;
    trimestre?: number;
    annee: number;
    periodeDebut: string;
    periodeFin: string;
  }) => api.post("/declarations/generate", data, { responseType: "blob" }),

  download: (id: string) =>
    api.get(`/declarations/${id}/download`, { responseType: "blob" }),

  downloadCsv: (id: string) =>
    api.get(`/declarations/${id}/csv`, { responseType: "blob" }),

  updateStatut: (id: string, statut: string) =>
    api.put<ApiResponse<Declaration>>(`/declarations/${id}/statut`, { statut }),

  delete: (id: string) => api.delete<ApiResponse>(`/declarations/${id}`),
};

// --- Reports API ---

export const reportsApi = {
  list: () => api.get<ApiResponse<ReportConfig[]>>("/reports"),

  generate: (
    data: {
      type: string;
      titre: string;
      periodeDebut: string;
      periodeFin: string;
      filtres?: { departement?: string };
    },
    format: "pdf" | "csv" = "pdf"
  ) =>
    api.post(`/reports/generate?format=${format}`, data, {
      responseType: "blob",
    }),

  get: (id: string) => api.get<ApiResponse<ReportConfig>>(`/reports/${id}`),

  delete: (id: string) => api.delete<ApiResponse>(`/reports/${id}`),
};

// --- Notifications API ---

export const notificationsApi = {
  list: () =>
    api.get<
      ApiResponse<{ notifications: Notification[]; unreadCount: number }>
    >("/notifications"),

  unreadCount: () =>
    api.get<ApiResponse<number>>("/notifications/unread-count"),

  markRead: (id: string) => api.put<ApiResponse>(`/notifications/${id}/read`),

  markAllRead: () => api.put<ApiResponse>("/notifications/read-all"),

  delete: (id: string) => api.delete<ApiResponse>(`/notifications/${id}`),
};

// --- API Keys API ---

export const apiKeysApi = {
  list: () => api.get<ApiResponse<Omit<ApiKey, "cle">[]>>("/api-keys"),

  create: (data: {
    nom: string;
    permissions: string[];
    limiteRequetes: number;
  }) =>
    api.post<ApiResponse<Omit<ApiKey, "cle"> & { rawKey: string }>>(
      "/api-keys",
      data
    ),

  toggle: (id: string) =>
    api.put<ApiResponse<ApiKey>>(`/api-keys/${id}/toggle`),

  delete: (id: string) => api.delete<ApiResponse>(`/api-keys/${id}`),
};

// --- Loans API ---

export const loansApi = {
  list: (employeId?: string) =>
    api.get<ApiResponse<Loan[]>>("/loans", {
      params: employeId ? { employeId } : {},
    }),

  get: (id: string) => api.get<ApiResponse<Loan>>(`/loans/${id}`),

  create: (data: {
    employeId: string;
    montantTotal: number;
    nbMensualites: number;
    motif: string;
    dateDebut: string;
  }) => api.post<ApiResponse<Loan>>("/loans", data),

  request: (data: {
    montantTotal: number;
    nbMensualites: number;
    motif: string;
    dateDebut: string;
  }) => api.post<ApiResponse<Loan>>("/loans/request", data),

  updateStatus: (id: string, statut: string) =>
    api.put<ApiResponse<Loan>>(`/loans/${id}/status`, { statut }),

  getActiveByEmployee: (employeId: string) =>
    api.get<ApiResponse<Loan[]>>(`/loans/employee/${employeId}/active`),
};

// --- Super External Admin API ---

export const superExternalApi = {
  listCompanies: () =>
    api.get<
      ApiResponse<(Entreprise & { employeeCount: number; userCount: number })[]>
    >("/super-external/companies"),

  getCompany: (id: string) =>
    api.get<
      ApiResponse<{
        company: Entreprise;
        users: Utilisateur[];
        employeeCount: number;
      }>
    >(`/super-external/companies/${id}`),

  createCompany: (data: CreateCompanyWithAdminRequest) =>
    api.post<ApiResponse<{ entreprise: Entreprise; admin: Utilisateur }>>(
      "/super-external/companies",
      data
    ),

  updatePlan: (id: string, plan: string) =>
    api.put<ApiResponse<Entreprise>>(`/super-external/companies/${id}/plan`, {
      plan,
    }),

  getStats: () =>
    api.get<
      ApiResponse<{
        totalCompanies: number;
        totalUsers: number;
        totalEmployees: number;
        companiesByPlan: Record<string, number>;
      }>
    >("/super-external/stats"),

  getPlans: () => api.get<ApiResponse<any>>("/super-external/plans"),
};

// --- Document Requests API ---

export const documentRequestsApi = {
  list: () =>
    api.get<
      ApiResponse<
        (DocumentRequest & {
          employe?: { nom: string; prenom: string; departement: string };
        })[]
      >
    >("/document-requests"),

  get: (id: string) =>
    api.get<
      ApiResponse<
        DocumentRequest & {
          employe?: { nom: string; prenom: string; departement: string };
        }
      >
    >(`/document-requests/${id}`),

  create: (data: { typeDocument: string; motif?: string; urgence?: string }) =>
    api.post<ApiResponse<DocumentRequest>>("/document-requests", data),

  uploadPapers: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append("papers", f));
    return api.post<ApiResponse<DocumentRequest>>(
      `/document-requests/${id}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  review: (id: string, statut: string, commentaire?: string) =>
    api.put<ApiResponse<DocumentRequest>>(`/document-requests/${id}/review`, {
      statut,
      commentaire,
    }),

  cancel: (id: string) => api.delete<ApiResponse>(`/document-requests/${id}`),

  download: (id: string) =>
    api.get(`/document-requests/${id}/download`, { responseType: "blob" }),

  getRequiredPapers: (type: string) =>
    api.get<ApiResponse<string[]>>(
      `/document-requests/required-papers/${type}`
    ),
};

export default api;
