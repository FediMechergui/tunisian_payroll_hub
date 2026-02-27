// ============================================================================
// PayrollHub — Shared Type Definitions
// All entities, enums, and DTOs used across frontend and backend
// ============================================================================

// --- Enums ---

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN_RH = "admin_rh",
  ADMIN_PAIE = "admin_paie",
  COMPTABLE = "comptable",
  MANAGER = "manager",
  EMPLOYE = "employe",
}

export enum ContractType {
  CDI = "CDI",
  CDD = "CDD",
  SIVP = "SIVP",
  KARAMA = "Karama",
}

export enum LeaveType {
  CONGE_PAYE = "conge_paye",
  MALADIE = "maladie",
  MATERNITE = "maternite",
  PATERNITE = "paternite",
  SANS_SOLDE = "sans_solde",
  EXCEPTIONNEL = "exceptionnel",
}

export enum LeaveStatus {
  EN_ATTENTE = "en_attente",
  APPROUVE = "approuve",
  REJETE = "rejete",
  ANNULE = "annule",
}

export enum PayElementType {
  SALAIRE_BASE = "salaire_base",
  PRIME_ANCIENNETE = "prime_anciennete",
  PRIME_RENDEMENT = "prime_rendement",
  PRIME_TRANSPORT = "prime_transport",
  PRIME_PANIER = "prime_panier",
  PRIME_REPRESENTATION = "prime_representation",
  PRIME_BILAN = "prime_bilan",
  INDEMNITE_DEPLACEMENT = "indemnite_deplacement",
  INDEMNITE_NUIT = "indemnite_nuit",
  HEURES_SUP = "heures_sup",
  AVANTAGE_NATURE = "avantage_nature",
  ACOMPTE = "acompte",
  SAISIE_SALAIRE = "saisie_salaire",
  REMBOURSEMENT = "remboursement",
  CNSS_SALARIAL = "cnss_salarial",
  CNSS_PATRONAL = "cnss_patronal",
  IRPP = "irpp",
  FOPROLOS = "foprolos",
  TFP = "tfp",
}

export enum PayPeriodStatus {
  EN_COURS = "en_cours",
  CALCULEE = "calculee",
  VALIDEE = "validee",
  FINALISEE = "finalisee",
}

export enum MaritalStatus {
  CELIBATAIRE = "celibataire",
  MARIE = "marie",
  DIVORCE = "divorce",
  VEUF = "veuf",
}

export enum SectorType {
  INDUSTRIE = "industrie",
  SERVICES = "services",
}

export enum WorkRegime {
  REGIME_48H = "48h",
  REGIME_40H = "40h",
}

export enum DocumentType {
  ATTESTATION_TRAVAIL = "attestation_travail",
  ATTESTATION_SALAIRE = "attestation_salaire",
  ATTESTATION_CNSS = "attestation_cnss",
  FICHE_PAIE_ANNUELLE = "fiche_paie_annuelle",
  CERTIFICAT_TRAVAIL = "certificat_travail",
}

export enum DeclarationType {
  CNSS_D17 = "cnss_d17",
  DGI_DEU = "dgi_deu",
  VIREMENT_BANCAIRE = "virement_bancaire",
}

export enum DeclarationStatus {
  BROUILLON = "brouillon",
  GENERE = "genere",
  SOUMIS = "soumis",
}

export enum ReportType {
  MASSE_SALARIALE = "masse_salariale",
  EFFECTIFS = "effectifs",
  CHARGES_SOCIALES = "charges_sociales",
  CONGES = "conges",
  COUT_DEPARTEMENT = "cout_departement",
  PERSONNALISE = "personnalise",
}

// --- Entity Interfaces ---

export interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  matriculeFiscal: string;
  codeCnss: string;
  secteurActivite: SectorType;
  telephone?: string;
  email?: string;
  regimeTravail: WorkRegime;
  createdAt: string;
  updatedAt: string;
}

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  entrepriseId: string;
  employeId?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employe {
  id: string;
  entrepriseId: string;
  // Personal info
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  adresse: string;
  telephone?: string;
  email?: string;
  situationFamiliale: MaritalStatus;
  nbEnfants: number;
  residenceFiscale: string;
  // Employment info
  matriculeCnss: string;
  dateEmbauche: string;
  dateFin?: string;
  typeContrat: ContractType;
  categoriePro: string;
  poste: string;
  departement: string;
  etablissement?: string;
  // Financial info
  salaireBase: number;
  iban: string;
  banque?: string;
  // Status
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodePaie {
  id: string;
  entrepriseId: string;
  mois: number;
  annee: number;
  dateDebut: string;
  dateFin: string;
  statut: PayPeriodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ElementPaie {
  id: string;
  periodePaieId: string;
  employeId: string;
  type: PayElementType;
  libelle: string;
  montant: number;
  estVariable: boolean;
  heures?: number;
  taux?: number;
}

export interface Conge {
  id: string;
  employeId: string;
  typeConge: LeaveType;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  statut: LeaveStatus;
  motif?: string;
  documentUrl?: string;
  approuvePar?: string;
  dateApprobation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRH {
  id: string;
  employeId: string;
  typeDocument: DocumentType;
  nomFichier: string;
  titre: string;
  dateCreation: string;
  generePar: string;
  entrepriseId: string;
}

export interface Declaration {
  id: string;
  entrepriseId: string;
  type: DeclarationType;
  periodeDebut: string;
  periodeFin: string;
  trimestre?: number;
  annee: number;
  statut: DeclarationStatus;
  nomFichier: string;
  nbEmployes: number;
  montantTotal: number;
  generePar: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfig {
  id: string;
  entrepriseId: string;
  type: ReportType;
  titre: string;
  periodeDebut: string;
  periodeFin: string;
  filtres?: Record<string, string>;
  generePar: string;
  createdAt: string;
}

export interface ParametreReglementaire {
  id: string;
  nom: string;
  description: string;
  valeur: string;
  categorie: string;
  dateDebutValidite: string;
  dateFinValidite?: string;
}

export interface BulletinPaie {
  id: string;
  periodePaieId: string;
  employeId: string;
  employe: Employe;
  elements: ElementPaie[];
  salaireBrut: number;
  cnssSalarial: number;
  cnssPatronal: number;
  salaireNetImposable: number;
  irpp: number;
  netAPayer: number;
  foprolos: number;
  tfp: number;
  coutTotalEmployeur: number;
  dateGeneration: string;
}

// --- DTOs ---

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  user: Omit<Utilisateur, "motDePasseHash">;
  token: string;
}

export interface CreateEmployeRequest {
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: string;
  adresse: string;
  telephone?: string;
  email?: string;
  situationFamiliale: MaritalStatus;
  nbEnfants: number;
  residenceFiscale: string;
  matriculeCnss: string;
  dateEmbauche: string;
  typeContrat: ContractType;
  categoriePro: string;
  poste: string;
  departement: string;
  etablissement?: string;
  salaireBase: number;
  iban: string;
  banque?: string;
}

export interface UpdateEmployeRequest extends Partial<CreateEmployeRequest> {}

export interface CreateUtilisateurRequest {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  role: UserRole;
  employeId?: string;
}

export interface CreateEntrepriseRequest {
  nom: string;
  adresse: string;
  matriculeFiscal: string;
  codeCnss: string;
  secteurActivite: SectorType;
  telephone?: string;
  email?: string;
  regimeTravail: WorkRegime;
}

export interface DashboardStats {
  totalEmployes: number;
  contratsActifs: number;
  congesEnAttente: number;
  masseSalariale: number;
  employesParDepartement: { departement: string; count: number }[];
  employesParContrat: { type: ContractType; count: number }[];
  evolutionMasseSalariale: { mois: string; montant: number }[];
  // Phase 2 — Payroll analytics
  payroll?: {
    dernierePeriode: string;
    totalBrut: number;
    totalNet: number;
    totalCnss: number;
    totalIrpp: number;
    coutEmployeur: number;
    periodesCalculees: number;
    periodesFinalisees: number;
    evolutionPayroll: {
      mois: string;
      brut: number;
      net: number;
      coutEmployeur: number;
    }[];
  };
  // Phase 4 — Advanced analytics
  analytics?: {
    turnover: { mois: string; entrees: number; sorties: number }[];
    absenteisme: { departement: string; taux: number }[];
    coutParDepartement: { departement: string; brut: number; charges: number; total: number }[];
    repartitionSalaires: { tranche: string; count: number }[];
    ancienneteDistribution: { tranche: string; count: number }[];
    documentsGeneres: number;
    declarationsEnAttente: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
