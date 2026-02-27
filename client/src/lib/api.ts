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

export default api;
