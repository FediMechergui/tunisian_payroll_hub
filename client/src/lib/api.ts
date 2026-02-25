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
  Entreprise,
  ParametreReglementaire,
  DashboardStats,
  CreateEmployeRequest,
  UpdateEmployeRequest,
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
  (response) => response,
  (error) => {
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

export default api;
