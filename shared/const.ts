export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const JWT_COOKIE_NAME = "payrollhub_token";
export const JWT_EXPIRY = "24h";

// Role hierarchy for RBAC
export const ROLE_HIERARCHY = {
  super_external_admin: 7,
  super_admin: 6,
  admin_rh: 5,
  admin_paie: 4,
  comptable: 3,
  manager: 2,
  employe: 1,
} as const;

// Plan-based employee limits
export const PLAN_LIMITS = {
  gratuit: {
    maxEmployees: 5,
    label: "Gratuit",
    features: ["employees", "leaves"],
  },
  starter: {
    maxEmployees: 25,
    label: "Starter",
    features: ["employees", "leaves", "payroll", "documents"],
  },
  business: {
    maxEmployees: 100,
    label: "Business",
    features: [
      "employees",
      "leaves",
      "payroll",
      "documents",
      "declarations",
      "reports",
    ],
  },
  enterprise: {
    maxEmployees: -1,
    label: "Entreprise",
    features: [
      "employees",
      "leaves",
      "payroll",
      "documents",
      "declarations",
      "reports",
      "analytics",
      "api",
    ],
  },
} as const;

// Required papers for document requests
export const DOCUMENT_REQUIRED_PAPERS: Record<string, string[]> = {
  attestation_travail: [],
  attestation_salaire: [],
  attestation_cnss: ["Copie CIN"],
  fiche_paie_annuelle: [],
  certificat_travail: ["Lettre de démission ou document de fin de contrat"],
};

// Required papers for leave requests
export const LEAVE_REQUIRED_PAPERS: Record<string, string[]> = {
  conge_paye: [],
  maladie: ["Certificat médical"],
  maternite: ["Certificat médical", "Déclaration de grossesse"],
  paternite: ["Acte de naissance"],
  sans_solde: [],
  exceptionnel: ["Justificatif"],
};

// Departments commonly used in Tunisian companies
export const DEPARTEMENTS = [
  "Direction Générale",
  "Ressources Humaines",
  "Finance et Comptabilité",
  "Commercial",
  "Marketing",
  "Production",
  "Logistique",
  "Informatique",
  "Juridique",
  "Qualité",
  "Maintenance",
  "Achat",
  "Administration",
] as const;

// Professional categories per Tunisian conventions
export const CATEGORIES_PRO = [
  "Catégorie I - Manœuvre",
  "Catégorie II - Ouvrier Spécialisé",
  "Catégorie III - Ouvrier Qualifié",
  "Catégorie IV - Technicien",
  "Catégorie V - Technicien Supérieur",
  "Catégorie VI - Agent de Maîtrise",
  "Catégorie VII - Cadre",
  "Catégorie VIII - Cadre Supérieur",
  "Catégorie IX - Directeur",
  "Hors Catégorie",
] as const;

// Tunisian banks
export const BANQUES_TN = [
  "STB - Société Tunisienne de Banque",
  "BNA - Banque Nationale Agricole",
  "BH - Banque de l'Habitat",
  "Attijari Bank",
  "BIAT - Banque Internationale Arabe de Tunisie",
  "Amen Bank",
  "UIB - Union Internationale de Banques",
  "BT - Banque de Tunisie",
  "ATB - Arab Tunisian Bank",
  "ABC - Arab Banking Corporation",
  "Zitouna Bank",
  "BTK - Banque Tuniso-Koweitienne",
  "QNB Tunisia",
  "Wifak International Bank",
  "Autre",
] as const;
