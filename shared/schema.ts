// ============================================================================
// PayrollHub — Shared Zod Validation Schemas
// Used for form validation (frontend) and API validation (backend)
// ============================================================================

import { z } from "zod";
import {
  ContractType,
  MaritalStatus,
  SectorType,
  UserRole,
  WorkRegime,
} from "./types";

// --- Auth ---

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// --- Utilisateur ---

export const createUtilisateurSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  role: z.nativeEnum(UserRole),
  employeId: z.string().optional(),
});

// --- Entreprise ---

export const createEntrepriseSchema = z.object({
  nom: z.string().min(2, "Le nom de l'entreprise est requis"),
  adresse: z.string().min(5, "L'adresse est requise"),
  matriculeFiscal: z.string().min(5, "Le matricule fiscal est requis"),
  codeCnss: z.string().min(5, "Le code CNSS est requis"),
  secteurActivite: z.nativeEnum(SectorType),
  telephone: z.string().optional(),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  regimeTravail: z.nativeEnum(WorkRegime),
});

// --- Employé ---

export const createEmployeSchema = z.object({
  // Personal information
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le prénom est requis"),
  cin: z.string().min(8, "Le CIN doit contenir 8 caractères").max(8, "Le CIN doit contenir 8 caractères"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  adresse: z.string().min(5, "L'adresse est requise"),
  telephone: z.string().optional().or(z.literal("")),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  situationFamiliale: z.nativeEnum(MaritalStatus),
  nbEnfants: z.number().min(0, "Nombre invalide").max(20),
  residenceFiscale: z.string().min(2, "La résidence fiscale est requise"),

  // Employment information
  matriculeCnss: z.string().min(5, "Le matricule CNSS est requis"),
  dateEmbauche: z.string().min(1, "La date d'embauche est requise"),
  typeContrat: z.nativeEnum(ContractType),
  categoriePro: z.string().min(1, "La catégorie professionnelle est requise"),
  poste: z.string().min(2, "Le poste est requis"),
  departement: z.string().min(2, "Le département est requis"),
  etablissement: z.string().optional().or(z.literal("")),

  // Financial information
  salaireBase: z.number().min(0, "Le salaire doit être positif"),
  iban: z.string().min(10, "L'IBAN est requis"),
  banque: z.string().optional().or(z.literal("")),
});

export const updateEmployeSchema = createEmployeSchema.partial();

// --- Paramètre Réglementaire ---

export const updateParametreSchema = z.object({
  valeur: z.string().min(1, "La valeur est requise"),
  dateDebutValidite: z.string().optional(),
  dateFinValidite: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUtilisateurInput = z.infer<typeof createUtilisateurSchema>;
export type CreateEntrepriseInput = z.infer<typeof createEntrepriseSchema>;
export type CreateEmployeInput = z.infer<typeof createEmployeSchema>;
export type UpdateEmployeInput = z.infer<typeof updateEmployeSchema>;
export type UpdateParametreInput = z.infer<typeof updateParametreSchema>;
