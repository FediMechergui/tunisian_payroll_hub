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
  Conge,
  DocumentRH,
  ParametreReglementaire,
  DashboardStats,
} from "../shared/types";
import {
  UserRole,
  ContractType,
  MaritalStatus,
  SectorType,
  WorkRegime,
  PayPeriodStatus,
  LeaveStatus,
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
  private parametres = new Map<string, ParametreReglementaire>();

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

    for (const emp of sampleEmployees) {
      const id = uuidv4();
      this.employes.set(id, { id, ...emp, createdAt: now, updatedAt: now });
    }
  }

  // --- Entreprise ---
  getEntreprises(): Entreprise[] {
    return Array.from(this.entreprises.values());
  }

  getEntreprise(id: string): Entreprise | undefined {
    return this.entreprises.get(id);
  }

  createEntreprise(data: Omit<Entreprise, "id" | "createdAt" | "updatedAt">): Entreprise {
    const now = new Date().toISOString();
    const e: Entreprise = { id: uuidv4(), ...data, createdAt: now, updatedAt: now };
    this.entreprises.set(e.id, e);
    return e;
  }

  updateEntreprise(id: string, data: Partial<Entreprise>): Entreprise | undefined {
    const existing = this.entreprises.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.entreprises.set(id, updated);
    return updated;
  }

  // --- Utilisateur ---
  getUtilisateurs(entrepriseId?: string): Omit<StoredUser, "motDePasseHash">[] {
    let users = Array.from(this.utilisateurs.values());
    if (entrepriseId) users = users.filter((u) => u.entrepriseId === entrepriseId);
    return users.map(({ motDePasseHash, ...rest }) => rest);
  }

  getUtilisateur(id: string): StoredUser | undefined {
    return this.utilisateurs.get(id);
  }

  getUtilisateurByEmail(email: string): StoredUser | undefined {
    return Array.from(this.utilisateurs.values()).find((u) => u.email === email);
  }

  createUtilisateur(data: Omit<StoredUser, "id" | "createdAt" | "updatedAt" | "actif">): StoredUser {
    const now = new Date().toISOString();
    const u: StoredUser = { id: uuidv4(), ...data, actif: true, createdAt: now, updatedAt: now };
    this.utilisateurs.set(u.id, u);
    return u;
  }

  updateUtilisateur(id: string, data: Partial<StoredUser>): StoredUser | undefined {
    const existing = this.utilisateurs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
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
    let emps = Array.from(this.employes.values()).filter((e) => e.actif);
    if (entrepriseId) emps = emps.filter((e) => e.entrepriseId === entrepriseId);
    if (search) {
      const s = search.toLowerCase();
      emps = emps.filter(
        (e) =>
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

  createEmploye(data: Omit<Employe, "id" | "createdAt" | "updatedAt" | "actif">, entrepriseId: string): Employe {
    const now = new Date().toISOString();
    const e: Employe = { id: uuidv4(), ...data, entrepriseId, actif: true, createdAt: now, updatedAt: now };
    this.employes.set(e.id, e);
    return e;
  }

  updateEmploye(id: string, data: Partial<Employe>): Employe | undefined {
    const existing = this.employes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
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
    if (categorie) params = params.filter((p) => p.categorie === categorie);
    return params;
  }

  getParametre(id: string): ParametreReglementaire | undefined {
    return this.parametres.get(id);
  }

  updateParametre(id: string, data: Partial<ParametreReglementaire>): ParametreReglementaire | undefined {
    const existing = this.parametres.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id };
    this.parametres.set(id, updated);
    return updated;
  }

  // --- Congés ---
  getConges(employeId?: string): Conge[] {
    let c = Array.from(this.conges.values());
    if (employeId) c = c.filter((x) => x.employeId === employeId);
    return c;
  }

  // --- Dashboard Stats ---
  getDashboardStats(entrepriseId: string): DashboardStats {
    const emps = this.getEmployes(entrepriseId);
    const contratsActifs = emps.filter((e) => e.actif).length;
    const congesEnAttente = Array.from(this.conges.values()).filter(
      (c) => c.statut === LeaveStatus.EN_ATTENTE
    ).length;

    // Group by department
    const deptMap = new Map<string, number>();
    for (const e of emps) {
      deptMap.set(e.departement, (deptMap.get(e.departement) || 0) + 1);
    }
    const employesParDepartement = Array.from(deptMap.entries()).map(([departement, count]) => ({
      departement,
      count,
    }));

    // Group by contract type
    const contratMap = new Map<ContractType, number>();
    for (const e of emps) {
      contratMap.set(e.typeContrat, (contratMap.get(e.typeContrat) || 0) + 1);
    }
    const employesParContrat = Array.from(contratMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    // Mass salariale
    const masseSalariale = emps.reduce((sum, e) => sum + e.salaireBase, 0);

    // Simulated monthly evolution
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const currentMonth = new Date().getMonth();
    const evolutionMasseSalariale = months.slice(0, currentMonth + 1).map((mois, i) => ({
      mois,
      montant: masseSalariale * (0.92 + i * 0.008 + Math.random() * 0.02),
    }));

    return {
      totalEmployes: emps.length,
      contratsActifs,
      congesEnAttente,
      masseSalariale,
      employesParDepartement,
      employesParContrat,
      evolutionMasseSalariale,
    };
  }
}

export const storage = new Storage();
