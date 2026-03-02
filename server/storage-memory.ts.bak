// ============================================================================
// PayrollHub — In-Memory Storage Layer
// Provides CRUD operations for all entities. Seeded with defaults.
// ============================================================================

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import type {
  Entreprise,
  Utilisateur,
  Employe,
  PeriodePaie,
  ElementPaie,
  BulletinPaie,
  Conge,
  DocumentRH,
  Declaration,
  ReportConfig,
  ParametreReglementaire,
  DashboardStats,
  Notification,
  ApiKey,
} from "../shared/types";
import {
  UserRole,
  ContractType,
  LeaveType,
  MaritalStatus,
  SectorType,
  WorkRegime,
  PayPeriodStatus,
  LeaveStatus,
  DeclarationStatus,
  NotificationType,
  NotificationPriority,
  ApiPermission,
} from "../shared/types";

// Internal user type with password hash
export interface StoredUser extends Utilisateur {
  motDePasseHash: string;
}

class Storage {
  private entreprises = new Map<string, Entreprise>();
  private utilisateurs = new Map<string, StoredUser>();
  private employes = new Map<string, Employe>();
  private periodesPaie = new Map<string, PeriodePaie>();
  private elementsPaie = new Map<string, ElementPaie>();
  private conges = new Map<string, Conge>();
  private documents = new Map<string, DocumentRH>();
  private declarations = new Map<string, Declaration>();
  private reports = new Map<string, ReportConfig>();
  private parametres = new Map<string, ParametreReglementaire>();
  private bulletins = new Map<string, BulletinPaie>();
  // Phase 5
  private notifications = new Map<string, Notification>();
  private apiKeys = new Map<string, ApiKey>();

  // Performance cache with TTL
  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private CACHE_TTL = 30_000; // 30 seconds

  constructor() {
    this.seed();
  }

  private async seed() {
    // 1. Create default company
    const entrepriseId = uuidv4();
    const now = new Date().toISOString();

    this.entreprises.set(entrepriseId, {
      id: entrepriseId,
      nom: "PayrollHub Demo SARL",
      adresse: "Lac 2, Tunis, Tunisie",
      matriculeFiscal: "1234567ABC",
      codeCnss: "12345678",
      secteurActivite: SectorType.SERVICES,
      telephone: "+216 71 123 456",
      email: "contact@payrollhub-demo.tn",
      regimeTravail: WorkRegime.REGIME_40H,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create Super Admin user
    const adminId = uuidv4();
    const adminHash = await bcrypt.hash("Admin2025!", 10);
    this.utilisateurs.set(adminId, {
      id: adminId,
      email: "admin@payrollhub.tn",
      nom: "Admin",
      prenom: "Super",
      role: UserRole.SUPER_ADMIN,
      entrepriseId,
      actif: true,
      motDePasseHash: adminHash,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create HR Admin user
    const rhId = uuidv4();
    const rhHash = await bcrypt.hash("Rh2025!", 10);
    this.utilisateurs.set(rhId, {
      id: rhId,
      email: "rh@payrollhub.tn",
      nom: "Ben Ali",
      prenom: "Fatma",
      role: UserRole.ADMIN_RH,
      entrepriseId,
      actif: true,
      motDePasseHash: rhHash,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Seed regulatory parameters (2025 values)
    const params: Omit<ParametreReglementaire, "id">[] = [
      // SMIG
      {
        nom: "SMIG_48H",
        description: "SMIG Régime 48h/semaine",
        valeur: "528.320",
        categorie: "smig",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "SMIG_40H",
        description: "SMIG Régime 40h/semaine",
        valeur: "448.238",
        categorie: "smig",
        dateDebutValidite: "2025-01-01",
      },

      // CNSS
      {
        nom: "CNSS_SAL_RETRAITE",
        description: "CNSS Salarié - Retraite & Invalidité",
        valeur: "4.99",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_SAL_MALADIE",
        description: "CNSS Salarié - Maladie & Maternité",
        valeur: "2.90",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_SAL_CONGE_MALADIE",
        description: "CNSS Salarié - Congé de Maladie",
        valeur: "0.79",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_SAL_TOTAL",
        description: "CNSS Total Part Salariale",
        valeur: "9.68",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_PAT_RETRAITE",
        description: "CNSS Patronal - Retraite & Invalidité",
        valeur: "8.01",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_PAT_MALADIE",
        description: "CNSS Patronal - Maladie & Maternité",
        valeur: "4.25",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_PAT_ACCIDENT",
        description: "CNSS Patronal - Accidents du Travail",
        valeur: "0.40",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_PAT_CONGE_MALADIE",
        description: "CNSS Patronal - Congé de Maladie",
        valeur: "0.79",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CNSS_PAT_TOTAL",
        description: "CNSS Total Part Patronale",
        valeur: "17.07",
        categorie: "cnss",
        dateDebutValidite: "2025-01-01",
      },

      // IRPP Brackets (2025 with CSS)
      {
        nom: "IRPP_TRANCHE_1",
        description: "IRPP 0 - 5 000 TND",
        valeur: "0",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_2",
        description: "IRPP 5 001 - 10 000 TND",
        valeur: "15.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_3",
        description: "IRPP 10 001 - 20 000 TND",
        valeur: "25.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_4",
        description: "IRPP 20 001 - 30 000 TND",
        valeur: "30.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_5",
        description: "IRPP 30 001 - 40 000 TND",
        valeur: "33.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_6",
        description: "IRPP 40 001 - 50 000 TND",
        valeur: "36.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_7",
        description: "IRPP 50 001 - 70 000 TND",
        valeur: "38.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_TRANCHE_8",
        description: "IRPP Au-delà de 70 000 TND",
        valeur: "40.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },

      // IRPP Deductions
      {
        nom: "IRPP_FRAIS_PRO_TAUX",
        description: "Frais Professionnels (taux)",
        valeur: "10",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_FRAIS_PRO_PLAFOND",
        description: "Frais Professionnels (plafond annuel TND)",
        valeur: "2000",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_DEDUCTION_CHEF_FAMILLE",
        description: "Déduction chef de famille (annuel TND)",
        valeur: "150",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "IRPP_DEDUCTION_ENFANT",
        description: "Déduction par enfant (annuel TND)",
        valeur: "90",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },

      // CSS (Contribution Sociale de Solidarité) — included in IRPP bracket rates but tracked separately
      {
        nom: "CSS_TAUX",
        description: "Contribution Sociale de Solidarité (2023-2025)",
        valeur: "0.5",
        categorie: "irpp",
        dateDebutValidite: "2025-01-01",
      },

      // Other contributions
      {
        nom: "FOPROLOS_TAUX",
        description: "FOPROLOS (employeur)",
        valeur: "1",
        categorie: "autres",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "TFP_INDUSTRIE",
        description: "TFP Secteur Industrie",
        valeur: "2",
        categorie: "autres",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "TFP_SERVICES",
        description: "TFP Secteur Services",
        valeur: "1",
        categorie: "autres",
        dateDebutValidite: "2025-01-01",
      },

      // Overtime rates
      {
        nom: "HS_TAUX_25",
        description: "Heures supplémentaires +25%",
        valeur: "25",
        categorie: "heures_sup",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "HS_TAUX_50",
        description: "Heures supplémentaires +50%",
        valeur: "50",
        categorie: "heures_sup",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "HS_TAUX_75",
        description: "Heures supplémentaires +75%",
        valeur: "75",
        categorie: "heures_sup",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "HS_TAUX_NUIT",
        description: "Majoration travail de nuit (22h-6h)",
        valeur: "25",
        categorie: "heures_sup",
        dateDebutValidite: "2025-01-01",
      },

      // Leave
      {
        nom: "CONGE_PAYE_JOURS_AN",
        description: "Congés payés (jours/an minimum)",
        valeur: "12",
        categorie: "conges",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CONGE_MATERNITE_JOURS",
        description: "Congé de maternité (jours)",
        valeur: "98",
        categorie: "conges",
        dateDebutValidite: "2025-01-01",
      },
      {
        nom: "CONGE_PATERNITE_JOURS",
        description: "Congé de paternité (jours — secteur privé)",
        valeur: "2",
        categorie: "conges",
        dateDebutValidite: "2025-01-01",
      },
    ];

    for (const p of params) {
      const id = uuidv4();
      this.parametres.set(id, { id, ...p });
    }

    // 5. Seed sample employees
    const sampleEmployees: Omit<Employe, "id" | "createdAt" | "updatedAt">[] = [
      {
        entrepriseId,
        nom: "Bouazizi",
        prenom: "Mohamed",
        cin: "07123456",
        dateNaissance: "1990-03-15",
        adresse: "Rue de la Liberté, Tunis",
        telephone: "+216 22 123 456",
        email: "m.bouazizi@email.tn",
        situationFamiliale: MaritalStatus.MARIE,
        nbEnfants: 2,
        residenceFiscale: "Tunis",
        matriculeCnss: "CNS001234",
        dateEmbauche: "2020-09-01",
        typeContrat: ContractType.CDI,
        categoriePro: "Catégorie VII - Cadre",
        poste: "Développeur Senior",
        departement: "Informatique",
        salaireBase: 2500,
        iban: "TN59 1000 6035 1835 9847 8831",
        banque: "BIAT - Banque Internationale Arabe de Tunisie",
        actif: true,
      },
      {
        entrepriseId,
        nom: "Trabelsi",
        prenom: "Amira",
        cin: "08234567",
        dateNaissance: "1988-07-22",
        adresse: "Avenue Habib Bourguiba, Sousse",
        telephone: "+216 23 234 567",
        email: "a.trabelsi@email.tn",
        situationFamiliale: MaritalStatus.CELIBATAIRE,
        nbEnfants: 0,
        residenceFiscale: "Sousse",
        matriculeCnss: "CNS002345",
        dateEmbauche: "2019-03-15",
        typeContrat: ContractType.CDI,
        categoriePro: "Catégorie VIII - Cadre Supérieur",
        poste: "Directrice Financière",
        departement: "Finance et Comptabilité",
        salaireBase: 3800,
        iban: "TN59 1000 6035 1835 9847 9942",
        banque: "STB - Société Tunisienne de Banque",
        actif: true,
      },
      {
        entrepriseId,
        nom: "Jebali",
        prenom: "Youssef",
        cin: "09345678",
        dateNaissance: "1995-11-10",
        adresse: "Rue Ibn Khaldoun, Sfax",
        telephone: "+216 24 345 678",
        email: "y.jebali@email.tn",
        situationFamiliale: MaritalStatus.MARIE,
        nbEnfants: 1,
        residenceFiscale: "Sfax",
        matriculeCnss: "CNS003456",
        dateEmbauche: "2023-01-10",
        typeContrat: ContractType.CDD,
        categoriePro: "Catégorie V - Technicien Supérieur",
        poste: "Technicien Maintenance",
        departement: "Maintenance",
        salaireBase: 1200,
        iban: "TN59 1000 6035 1835 9847 1053",
        banque: "BNA - Banque Nationale Agricole",
        actif: true,
      },
      {
        entrepriseId,
        nom: "Hamdi",
        prenom: "Salma",
        cin: "10456789",
        dateNaissance: "1997-05-28",
        adresse: "Avenue de la République, Nabeul",
        telephone: "+216 25 456 789",
        email: "s.hamdi@email.tn",
        situationFamiliale: MaritalStatus.CELIBATAIRE,
        nbEnfants: 0,
        residenceFiscale: "Nabeul",
        matriculeCnss: "CNS004567",
        dateEmbauche: "2024-06-01",
        typeContrat: ContractType.SIVP,
        categoriePro: "Catégorie IV - Technicien",
        poste: "Assistante RH",
        departement: "Ressources Humaines",
        salaireBase: 800,
        iban: "TN59 1000 6035 1835 9847 2164",
        banque: "Attijari Bank",
        actif: true,
      },
      {
        entrepriseId,
        nom: "Chaabane",
        prenom: "Khalil",
        cin: "11567890",
        dateNaissance: "1985-12-03",
        adresse: "Rue de Marseille, Tunis",
        telephone: "+216 26 567 890",
        email: "k.chaabane@email.tn",
        situationFamiliale: MaritalStatus.MARIE,
        nbEnfants: 3,
        residenceFiscale: "Tunis",
        matriculeCnss: "CNS005678",
        dateEmbauche: "2015-04-20",
        typeContrat: ContractType.CDI,
        categoriePro: "Catégorie IX - Directeur",
        poste: "Directeur Commercial",
        departement: "Commercial",
        salaireBase: 5000,
        iban: "TN59 1000 6035 1835 9847 3275",
        banque: "Amen Bank",
        actif: true,
      },
      {
        entrepriseId,
        nom: "Mejri",
        prenom: "Nour",
        cin: "12678901",
        dateNaissance: "1993-09-17",
        adresse: "Cité El Manar, Tunis",
        telephone: "+216 27 678 901",
        email: "n.mejri@email.tn",
        situationFamiliale: MaritalStatus.MARIE,
        nbEnfants: 1,
        residenceFiscale: "Tunis",
        matriculeCnss: "CNS006789",
        dateEmbauche: "2021-11-01",
        typeContrat: ContractType.CDI,
        categoriePro: "Catégorie VI - Agent de Maîtrise",
        poste: "Responsable Qualité",
        departement: "Qualité",
        salaireBase: 1800,
        iban: "TN59 1000 6035 1835 9847 4386",
        banque: "BH - Banque de l'Habitat",
        actif: true,
      },
    ];

    const employeeIds: string[] = [];
    for (const emp of sampleEmployees) {
      const id = uuidv4();
      this.employes.set(id, { id, ...emp, createdAt: now, updatedAt: now });
      employeeIds.push(id);
    }

    // 6. Create employee self-service user (linked to first employee: Bouazizi)
    const empUserId = uuidv4();
    const empUserHash = await bcrypt.hash("Employe2025!", 10);
    this.utilisateurs.set(empUserId, {
      id: empUserId,
      email: "bouazizi@payrollhub.tn",
      nom: "Bouazizi",
      prenom: "Mohamed",
      role: UserRole.EMPLOYE,
      entrepriseId,
      employeId: employeeIds[0],
      actif: true,
      motDePasseHash: empUserHash,
      createdAt: now,
      updatedAt: now,
    });

    // 7. Create manager user (linked to fifth employee: Chaabane - Directeur Commercial)
    const mgrUserId = uuidv4();
    const mgrHash = await bcrypt.hash("Manager2025!", 10);
    this.utilisateurs.set(mgrUserId, {
      id: mgrUserId,
      email: "chaabane@payrollhub.tn",
      nom: "Chaabane",
      prenom: "Khalil",
      role: UserRole.MANAGER,
      entrepriseId,
      employeId: employeeIds[4],
      actif: true,
      motDePasseHash: mgrHash,
      createdAt: now,
      updatedAt: now,
    });

    // 8. Seed sample leave requests
    const leaveSeeds: Omit<Conge, "id" | "createdAt" | "updatedAt">[] = [
      {
        employeId: employeeIds[0], // Bouazizi
        typeConge: LeaveType.CONGE_PAYE,
        dateDebut: "2026-03-10",
        dateFin: "2026-03-14",
        nbJours: 5,
        statut: LeaveStatus.EN_ATTENTE,
        motif: "Vacances familiales",
      },
      {
        employeId: employeeIds[1], // Trabelsi
        typeConge: LeaveType.CONGE_PAYE,
        dateDebut: "2026-02-17",
        dateFin: "2026-02-21",
        nbJours: 5,
        statut: LeaveStatus.APPROUVE,
        motif: "Congé annuel",
        approuvePar: rhId,
        dateApprobation: "2026-02-10T09:00:00.000Z",
      },
      {
        employeId: employeeIds[2], // Jebali
        typeConge: LeaveType.MALADIE,
        dateDebut: "2026-02-24",
        dateFin: "2026-02-26",
        nbJours: 3,
        statut: LeaveStatus.EN_ATTENTE,
        motif: "Certificat médical fourni",
      },
      {
        employeId: employeeIds[0], // Bouazizi
        typeConge: LeaveType.CONGE_PAYE,
        dateDebut: "2026-01-06",
        dateFin: "2026-01-08",
        nbJours: 3,
        statut: LeaveStatus.APPROUVE,
        motif: "Déménagement",
        approuvePar: rhId,
        dateApprobation: "2025-12-28T14:00:00.000Z",
      },
      {
        employeId: employeeIds[3], // Hamdi
        typeConge: LeaveType.EXCEPTIONNEL,
        dateDebut: "2026-03-01",
        dateFin: "2026-03-01",
        nbJours: 1,
        statut: LeaveStatus.REJETE,
        motif: "Rendez-vous administratif",
        approuvePar: rhId,
        dateApprobation: "2026-02-26T11:00:00.000Z",
      },
    ];

    for (const leave of leaveSeeds) {
      const id = uuidv4();
      this.conges.set(id, { id, ...leave, createdAt: now, updatedAt: now });
    }
  }

  // --- Entreprise ---
  getEntreprises(): Entreprise[] {
    return Array.from(this.entreprises.values());
  }

  getEntreprise(id: string): Entreprise | undefined {
    return this.entreprises.get(id);
  }

  createEntreprise(
    data: Omit<Entreprise, "id" | "createdAt" | "updatedAt">
  ): Entreprise {
    const now = new Date().toISOString();
    const e: Entreprise = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.entreprises.set(e.id, e);
    return e;
  }

  updateEntreprise(
    id: string,
    data: Partial<Entreprise>
  ): Entreprise | undefined {
    const existing = this.entreprises.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.entreprises.set(id, updated);
    return updated;
  }

  // --- Utilisateur ---
  getUtilisateurs(entrepriseId?: string): Omit<StoredUser, "motDePasseHash">[] {
    let users = Array.from(this.utilisateurs.values());
    if (entrepriseId)
      users = users.filter(u => u.entrepriseId === entrepriseId);
    return users.map(({ motDePasseHash, ...rest }) => rest);
  }

  getUtilisateur(id: string): StoredUser | undefined {
    return this.utilisateurs.get(id);
  }

  getUtilisateurByEmail(email: string): StoredUser | undefined {
    return Array.from(this.utilisateurs.values()).find(u => u.email === email);
  }

  createUtilisateur(
    data: Omit<StoredUser, "id" | "createdAt" | "updatedAt" | "actif">
  ): StoredUser {
    const now = new Date().toISOString();
    const u: StoredUser = {
      id: uuidv4(),
      ...data,
      actif: true,
      createdAt: now,
      updatedAt: now,
    };
    this.utilisateurs.set(u.id, u);
    return u;
  }

  updateUtilisateur(
    id: string,
    data: Partial<StoredUser>
  ): StoredUser | undefined {
    const existing = this.utilisateurs.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.utilisateurs.set(id, updated);
    return updated;
  }

  deleteUtilisateur(id: string): boolean {
    const existing = this.utilisateurs.get(id);
    if (!existing) return false;
    existing.actif = false;
    existing.updatedAt = new Date().toISOString();
    return true;
  }

  // --- Employé ---
  getEmployes(entrepriseId?: string, search?: string): Employe[] {
    let emps = Array.from(this.employes.values()).filter(e => e.actif);
    if (entrepriseId) emps = emps.filter(e => e.entrepriseId === entrepriseId);
    if (search) {
      const s = search.toLowerCase();
      emps = emps.filter(
        e =>
          e.nom.toLowerCase().includes(s) ||
          e.prenom.toLowerCase().includes(s) ||
          e.cin.includes(s) ||
          e.matriculeCnss.toLowerCase().includes(s) ||
          e.poste.toLowerCase().includes(s) ||
          e.departement.toLowerCase().includes(s)
      );
    }
    return emps;
  }

  getEmploye(id: string): Employe | undefined {
    return this.employes.get(id);
  }

  createEmploye(
    data: Omit<Employe, "id" | "createdAt" | "updatedAt" | "actif">,
    entrepriseId: string
  ): Employe {
    const now = new Date().toISOString();
    const e: Employe = {
      id: uuidv4(),
      ...data,
      entrepriseId,
      actif: true,
      createdAt: now,
      updatedAt: now,
    };
    this.employes.set(e.id, e);
    return e;
  }

  updateEmploye(id: string, data: Partial<Employe>): Employe | undefined {
    const existing = this.employes.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.employes.set(id, updated);
    return updated;
  }

  deleteEmploye(id: string): boolean {
    const existing = this.employes.get(id);
    if (!existing) return false;
    existing.actif = false;
    existing.updatedAt = new Date().toISOString();
    return true;
  }

  // --- Paramètre Réglementaire ---
  getParametres(categorie?: string): ParametreReglementaire[] {
    let params = Array.from(this.parametres.values());
    if (categorie) params = params.filter(p => p.categorie === categorie);
    return params;
  }

  getParametre(id: string): ParametreReglementaire | undefined {
    return this.parametres.get(id);
  }

  updateParametre(
    id: string,
    data: Partial<ParametreReglementaire>
  ): ParametreReglementaire | undefined {
    const existing = this.parametres.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id };
    this.parametres.set(id, updated);
    return updated;
  }

  // --- Période de Paie ---
  getPeriodesPaie(entrepriseId: string): PeriodePaie[] {
    return Array.from(this.periodesPaie.values())
      .filter(p => p.entrepriseId === entrepriseId)
      .sort((a, b) => {
        if (a.annee !== b.annee) return b.annee - a.annee;
        return b.mois - a.mois;
      });
  }

  getPeriodePaie(id: string): PeriodePaie | undefined {
    return this.periodesPaie.get(id);
  }

  getPeriodePaieByMonth(
    entrepriseId: string,
    mois: number,
    annee: number
  ): PeriodePaie | undefined {
    return Array.from(this.periodesPaie.values()).find(
      p =>
        p.entrepriseId === entrepriseId && p.mois === mois && p.annee === annee
    );
  }

  createPeriodePaie(
    data: Omit<PeriodePaie, "id" | "createdAt" | "updatedAt" | "statut">
  ): PeriodePaie {
    const now = new Date().toISOString();
    const p: PeriodePaie = {
      id: uuidv4(),
      ...data,
      statut: PayPeriodStatus.EN_COURS,
      createdAt: now,
      updatedAt: now,
    };
    this.periodesPaie.set(p.id, p);
    return p;
  }

  updatePeriodePaieStatut(
    id: string,
    statut: PayPeriodStatus
  ): PeriodePaie | undefined {
    const existing = this.periodesPaie.get(id);
    if (!existing) return undefined;
    existing.statut = statut;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  // --- Éléments de Paie ---
  getElementsPaie(periodePaieId: string, employeId?: string): ElementPaie[] {
    let els = Array.from(this.elementsPaie.values()).filter(
      e => e.periodePaieId === periodePaieId
    );
    if (employeId) els = els.filter(e => e.employeId === employeId);
    return els;
  }

  createElementPaie(data: Omit<ElementPaie, "id">): ElementPaie {
    const el: ElementPaie = { id: uuidv4(), ...data };
    this.elementsPaie.set(el.id, el);
    return el;
  }

  deleteElementsPaie(periodePaieId: string, employeId?: string): number {
    let count = 0;
    const toDelete: string[] = [];
    this.elementsPaie.forEach((el, id) => {
      if (
        el.periodePaieId === periodePaieId &&
        (!employeId || el.employeId === employeId)
      ) {
        toDelete.push(id);
      }
    });
    for (const id of toDelete) {
      this.elementsPaie.delete(id);
      count++;
    }
    return count;
  }

  // --- Bulletins de Paie ---
  getBulletins(periodePaieId: string): BulletinPaie[] {
    return Array.from(this.bulletins.values()).filter(
      b => b.periodePaieId === periodePaieId
    );
  }

  getBulletin(id: string): BulletinPaie | undefined {
    return this.bulletins.get(id);
  }

  getBulletinsByEmploye(employeId: string): BulletinPaie[] {
    return Array.from(this.bulletins.values())
      .filter(b => b.employeId === employeId)
      .sort((a, b) => b.dateGeneration.localeCompare(a.dateGeneration));
  }

  saveBulletins(bulletins: BulletinPaie[]): void {
    for (const b of bulletins) {
      this.bulletins.set(b.id, b);
    }
  }

  deleteBulletins(periodePaieId: string): number {
    let count = 0;
    const toDelete: string[] = [];
    this.bulletins.forEach((b, id) => {
      if (b.periodePaieId === periodePaieId) {
        toDelete.push(id);
      }
    });
    for (const id of toDelete) {
      this.bulletins.delete(id);
      count++;
    }
    return count;
  }

  // --- Congés ---
  getConges(employeId?: string): Conge[] {
    let c = Array.from(this.conges.values());
    if (employeId) c = c.filter(x => x.employeId === employeId);
    return c.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getCongesByEntreprise(entrepriseId: string): Conge[] {
    const empIds = new Set(this.getEmployes(entrepriseId).map(e => e.id));
    return Array.from(this.conges.values())
      .filter(c => empIds.has(c.employeId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getConge(id: string): Conge | undefined {
    return this.conges.get(id);
  }

  createConge(
    data: Omit<Conge, "id" | "statut" | "createdAt" | "updatedAt">
  ): Conge {
    const now = new Date().toISOString();
    const c: Conge = {
      id: uuidv4(),
      ...data,
      statut: LeaveStatus.EN_ATTENTE,
      createdAt: now,
      updatedAt: now,
    };
    this.conges.set(c.id, c);
    return c;
  }

  updateCongeStatut(
    id: string,
    statut: LeaveStatus,
    approuvePar?: string
  ): Conge | undefined {
    const c = this.conges.get(id);
    if (!c) return undefined;
    const now = new Date().toISOString();
    const updated: Conge = {
      ...c,
      statut,
      approuvePar:
        statut === LeaveStatus.APPROUVE || statut === LeaveStatus.REJETE
          ? approuvePar
          : c.approuvePar,
      dateApprobation:
        statut === LeaveStatus.APPROUVE || statut === LeaveStatus.REJETE
          ? now
          : c.dateApprobation,
      updatedAt: now,
    };
    this.conges.set(id, updated);
    return updated;
  }

  deleteConge(id: string): boolean {
    return this.conges.delete(id);
  }

  /**
   * Compute leave balance for an employee for a given year.
   * Statutory entitlement per Tunisian law:
   *  - Congé payé: 12 days/year (or from parameter CONGE_PAYE_JOURS_AN)
   * Returns { droitAnnuel, consomme, enAttente, solde }
   */
  getLeaveBalance(
    employeId: string,
    year: number
  ): {
    droitAnnuel: number;
    consomme: number;
    enAttente: number;
    solde: number;
  } {
    // Get statutory entitlement from params
    const param = Array.from(this.parametres.values()).find(
      p => p.nom === "CONGE_PAYE_JOURS_AN"
    );
    const droitAnnuel = param ? parseFloat(param.valeur) : 12;

    const leaves = Array.from(this.conges.values()).filter(
      c =>
        c.employeId === employeId &&
        c.typeConge === "conge_paye" &&
        new Date(c.dateDebut).getFullYear() === year
    );

    const consomme = leaves
      .filter(c => c.statut === LeaveStatus.APPROUVE)
      .reduce((s, c) => s + c.nbJours, 0);

    const enAttente = leaves
      .filter(c => c.statut === LeaveStatus.EN_ATTENTE)
      .reduce((s, c) => s + c.nbJours, 0);

    return {
      droitAnnuel,
      consomme,
      enAttente,
      solde: droitAnnuel - consomme,
    };
  }

  // --- Documents RH ---
  getDocuments(entrepriseId: string): DocumentRH[] {
    return Array.from(this.documents.values())
      .filter(d => d.entrepriseId === entrepriseId)
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  }

  getDocumentsByEmploye(employeId: string): DocumentRH[] {
    return Array.from(this.documents.values())
      .filter(d => d.employeId === employeId)
      .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  }

  getDocument(id: string): DocumentRH | undefined {
    return this.documents.get(id);
  }

  createDocument(data: Omit<DocumentRH, "id" | "dateCreation">): DocumentRH {
    const d: DocumentRH = {
      id: uuidv4(),
      ...data,
      dateCreation: new Date().toISOString(),
    };
    this.documents.set(d.id, d);
    return d;
  }

  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  // --- Declarations ---
  getDeclarations(entrepriseId: string): Declaration[] {
    return Array.from(this.declarations.values())
      .filter(d => d.entrepriseId === entrepriseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getDeclaration(id: string): Declaration | undefined {
    return this.declarations.get(id);
  }

  createDeclaration(data: Omit<Declaration, "id" | "statut" | "createdAt" | "updatedAt">): Declaration {
    const now = new Date().toISOString();
    const d: Declaration = {
      id: uuidv4(),
      ...data,
      statut: DeclarationStatus.GENERE,
      createdAt: now,
      updatedAt: now,
    };
    this.declarations.set(d.id, d);
    return d;
  }

  updateDeclarationStatut(id: string, statut: DeclarationStatus): Declaration | undefined {
    const d = this.declarations.get(id);
    if (!d) return undefined;
    d.statut = statut;
    d.updatedAt = new Date().toISOString();
    return d;
  }

  deleteDeclaration(id: string): boolean {
    return this.declarations.delete(id);
  }

  // --- Reports ---
  getReports(entrepriseId: string): ReportConfig[] {
    return Array.from(this.reports.values())
      .filter(r => r.entrepriseId === entrepriseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getReport(id: string): ReportConfig | undefined {
    return this.reports.get(id);
  }

  createReport(data: Omit<ReportConfig, "id" | "createdAt">): ReportConfig {
    const r: ReportConfig = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.reports.set(r.id, r);
    return r;
  }

  deleteReport(id: string): boolean {
    return this.reports.delete(id);
  }

  // --- Dashboard Stats ---
  getDashboardStats(entrepriseId: string): DashboardStats {
    const emps = this.getEmployes(entrepriseId);
    const contratsActifs = emps.filter(e => e.actif).length;
    const congesEnAttente = Array.from(this.conges.values()).filter(
      c => c.statut === LeaveStatus.EN_ATTENTE
    ).length;

    // Group by department
    const deptMap = new Map<string, number>();
    for (const e of emps) {
      deptMap.set(e.departement, (deptMap.get(e.departement) || 0) + 1);
    }
    const employesParDepartement = Array.from(deptMap.entries()).map(
      ([departement, count]) => ({
        departement,
        count,
      })
    );

    // Group by contract type
    const contratMap = new Map<ContractType, number>();
    for (const e of emps) {
      contratMap.set(e.typeContrat, (contratMap.get(e.typeContrat) || 0) + 1);
    }
    const employesParContrat = Array.from(contratMap.entries()).map(
      ([type, count]) => ({
        type,
        count,
      })
    );

    // Mass salariale
    const masseSalariale = emps.reduce((sum, e) => sum + e.salaireBase, 0);

    // Simulated monthly evolution (fallback when no payroll data)
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const currentMonth = new Date().getMonth();
    const evolutionMasseSalariale = months
      .slice(0, currentMonth + 1)
      .map((mois, i) => ({
        mois,
        montant: masseSalariale * (0.92 + i * 0.008 + Math.random() * 0.02),
      }));

    // Phase 2 — Payroll analytics from real bulletins
    const periodes = this.getPeriodesPaie(entrepriseId);
    let payroll: DashboardStats["payroll"] = undefined;

    if (periodes.length > 0) {
      // Sort by year desc, month desc to get latest first
      const sorted = [...periodes].sort((a, b) =>
        a.annee !== b.annee ? b.annee - a.annee : b.mois - a.mois
      );
      const latest = sorted[0];
      const latestBulletins = this.getBulletins(latest.id);

      const totalBrut = latestBulletins.reduce((s, b) => s + b.salaireBrut, 0);
      const totalNet = latestBulletins.reduce((s, b) => s + b.netAPayer, 0);
      const totalCnss = latestBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
      const totalIrpp = latestBulletins.reduce((s, b) => s + b.irpp, 0);
      const coutEmployeur = latestBulletins.reduce(
        (s, b) => s + b.coutTotalEmployeur,
        0
      );

      const periodesCalculees = periodes.filter(
        p => p.statut !== PayPeriodStatus.EN_COURS
      ).length;
      const periodesFinalisees = periodes.filter(
        p => p.statut === PayPeriodStatus.FINALISEE
      ).length;

      // Build evolution from all periods with bulletins
      const monthLabels = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      const evolutionPayroll = sorted.reverse().map(p => {
        const buls = this.getBulletins(p.id);
        return {
          mois: `${monthLabels[p.mois - 1]} ${p.annee}`,
          brut: buls.reduce((s, b) => s + b.salaireBrut, 0),
          net: buls.reduce((s, b) => s + b.netAPayer, 0),
          coutEmployeur: buls.reduce((s, b) => s + b.coutTotalEmployeur, 0),
        };
      });

      payroll = {
        dernierePeriode: `${monthLabels[latest.mois - 1]} ${latest.annee}`,
        totalBrut,
        totalNet,
        totalCnss,
        totalIrpp,
        coutEmployeur,
        periodesCalculees,
        periodesFinalisees,
        evolutionPayroll,
      };
    }

    // Phase 4 — Advanced analytics
    // Turnover (entries/exits) — simulated from hire/end dates
    const turnoverMonths = months.map((mois: string, idx: number) => {
      const entrees = emps.filter(e => {
        const d = new Date(e.dateEmbauche);
        return d.getMonth() === idx && d.getFullYear() === new Date().getFullYear();
      }).length;
      const sorties = emps.filter(e => {
        if (!e.dateFin) return false;
        const d = new Date(e.dateFin);
        return d.getMonth() === idx && d.getFullYear() === new Date().getFullYear();
      }).length;
      return { mois, entrees, sorties };
    }).slice(0, currentMonth + 1);

    // Absenteeism by department
    const deptLeaves = new Map<string, { total: number; jours: number }>();
    for (const e of emps) {
      if (!deptLeaves.has(e.departement)) {
        deptLeaves.set(e.departement, { total: 0, jours: 0 });
      }
      const dl = deptLeaves.get(e.departement)!;
      dl.total++;
      const empLeaves = Array.from(this.conges.values())
        .filter(c => c.employeId === e.id && (c.statut === LeaveStatus.APPROUVE));
      dl.jours += empLeaves.reduce((s, c) => s + c.nbJours, 0);
    }
    const absenteisme = Array.from(deptLeaves.entries()).map(([departement, d]) => ({
      departement,
      taux: d.total > 0 ? Math.round((d.jours / (d.total * 22) * 100) * 10) / 10 : 0,
    }));

    // Cost per department
    const coutParDepartement = Array.from(deptMap.entries()).map(([departement]) => {
      const deptEmps = emps.filter(e => e.departement === departement);
      const brut = deptEmps.reduce((s, e) => s + e.salaireBase, 0);
      const charges = brut * 0.2807; // ~28.07% employer charges (CNSS + FOPROLOS + TFP)
      return { departement, brut, charges, total: brut + charges };
    });

    // Salary distribution
    const salairesTranches = [
      { min: 0, max: 500, label: "< 500" },
      { min: 500, max: 1000, label: "500-1000" },
      { min: 1000, max: 2000, label: "1000-2000" },
      { min: 2000, max: 3000, label: "2000-3000" },
      { min: 3000, max: 5000, label: "3000-5000" },
      { min: 5000, max: Infinity, label: "> 5000" },
    ];
    const repartitionSalaires = salairesTranches.map(t => ({
      tranche: t.label,
      count: emps.filter(e => e.salaireBase >= t.min && e.salaireBase < t.max).length,
    }));

    // Seniority distribution
    const now2 = new Date();
    const anciennete = [
      { min: 0, max: 1, label: "< 1 an" },
      { min: 1, max: 3, label: "1-3 ans" },
      { min: 3, max: 5, label: "3-5 ans" },
      { min: 5, max: 10, label: "5-10 ans" },
      { min: 10, max: Infinity, label: "> 10 ans" },
    ];
    const ancienneteDistribution = anciennete.map(t => ({
      tranche: t.label,
      count: emps.filter(e => {
        const years = (now2.getTime() - new Date(e.dateEmbauche).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return years >= t.min && years < t.max;
      }).length,
    }));

    const documentsGeneres = this.getDocuments(entrepriseId).length;
    const declarationsEnAttente = this.getDeclarations(entrepriseId)
      .filter(d => d.statut === DeclarationStatus.GENERE).length;

    const analytics: DashboardStats["analytics"] = {
      turnover: turnoverMonths,
      absenteisme,
      coutParDepartement,
      repartitionSalaires,
      ancienneteDistribution,
      documentsGeneres,
      declarationsEnAttente,
    };

    return {
      totalEmployes: emps.length,
      contratsActifs,
      congesEnAttente,
      masseSalariale,
      employesParDepartement,
      employesParContrat,
      evolutionMasseSalariale,
      payroll,
      analytics,
    };
  }

  // --- Phase 5: Cache helpers ---

  private getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.CACHE_TTL });
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  getCachedDashboardStats(entrepriseId: string): DashboardStats {
    const key = `dashboard:${entrepriseId}`;
    const cached = this.getCached<DashboardStats>(key);
    if (cached) return cached;
    const stats = this.getDashboardStats(entrepriseId);
    this.setCache(key, stats);
    return stats;
  }

  // --- Phase 5: Notifications ---

  getNotifications(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.destinataireId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values())
      .filter(n => n.destinataireId === userId && !n.lu).length;
  }

  createNotification(data: Omit<Notification, "id" | "lu" | "createdAt">): Notification {
    const n: Notification = {
      id: uuidv4(),
      ...data,
      lu: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(n.id, n);
    return n;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const n = this.notifications.get(id);
    if (!n || n.destinataireId !== userId) return false;
    n.lu = true;
    return true;
  }

  markAllNotificationsRead(userId: string): number {
    let count = 0;
    for (const n of Array.from(this.notifications.values())) {
      if (n.destinataireId === userId && !n.lu) {
        n.lu = true;
        count++;
      }
    }
    return count;
  }

  deleteNotification(id: string, userId: string): boolean {
    const n = this.notifications.get(id);
    if (!n || n.destinataireId !== userId) return false;
    return this.notifications.delete(id);
  }

  // Broadcast a notification to all users with a minimum role in an enterprise
  broadcastNotification(
    entrepriseId: string,
    minRole: UserRole,
    data: Omit<Notification, "id" | "lu" | "createdAt" | "destinataireId" | "entrepriseId">
  ): Notification[] {
    const roleLevel: Record<string, number> = {
      super_admin: 6, admin_rh: 5, admin_paie: 4, comptable: 3, manager: 2, employe: 1,
    };
    const minLevel = roleLevel[minRole] || 0;
    const users = Array.from(this.utilisateurs.values())
      .filter(u => u.entrepriseId === entrepriseId && u.actif && (roleLevel[u.role] || 0) >= minLevel);

    return users.map(u =>
      this.createNotification({ ...data, entrepriseId, destinataireId: u.id })
    );
  }

  // --- Phase 5: API Keys ---

  getApiKeys(entrepriseId: string): Omit<ApiKey, "cle">[] {
    return Array.from(this.apiKeys.values())
      .filter(k => k.entrepriseId === entrepriseId)
      .map(({ cle, ...rest }) => rest);
  }

  getApiKeyByRaw(rawKey: string): ApiKey | undefined {
    // rawKey format: "ph_<id>_<secret>"
    for (const k of Array.from(this.apiKeys.values())) {
      if (k.actif && k.cle === rawKey) return k;
    }
    return undefined;
  }

  createApiKey(data: {
    entrepriseId: string;
    nom: string;
    permissions: string[];
    limiteRequetes: number;
  }): { apiKey: Omit<ApiKey, "cle">; rawKey: string } {
    const now = new Date().toISOString();
    const id = uuidv4();
    const secret = uuidv4().replace(/-/g, "");
    const rawKey = `ph_${id.substring(0, 8)}_${secret}`;
    const prefixe = rawKey.substring(0, 12) + "...";

    const key: ApiKey = {
      id,
      entrepriseId: data.entrepriseId,
      nom: data.nom,
      cle: rawKey,
      prefixe,
      permissions: data.permissions as ApiPermission[],
      actif: true,
      limiteRequetes: data.limiteRequetes,
      createdAt: now,
      updatedAt: now,
    };
    this.apiKeys.set(id, key);

    const { cle, ...safe } = key;
    return { apiKey: safe, rawKey };
  }

  updateApiKeyLastUsed(id: string): void {
    const k = this.apiKeys.get(id);
    if (k) k.derniereUtilisation = new Date().toISOString();
  }

  toggleApiKey(id: string, entrepriseId: string): ApiKey | undefined {
    const k = this.apiKeys.get(id);
    if (!k || k.entrepriseId !== entrepriseId) return undefined;
    k.actif = !k.actif;
    k.updatedAt = new Date().toISOString();
    const { cle, ...safe } = k;
    return safe as ApiKey;
  }

  deleteApiKey(id: string, entrepriseId: string): boolean {
    const k = this.apiKeys.get(id);
    if (!k || k.entrepriseId !== entrepriseId) return false;
    return this.apiKeys.delete(id);
  }

  // Rate limiting for API keys
  private rateLimits = new Map<string, { count: number; resetAt: number }>();

  checkRateLimit(keyId: string, limit: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let entry = this.rateLimits.get(keyId);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 3600_000 }; // 1 hour window
      this.rateLimits.set(keyId, entry);
    }
    entry.count++;
    const remaining = Math.max(0, limit - entry.count);
    return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
  }
}

export const storage = new Storage();
