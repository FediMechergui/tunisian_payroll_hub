// ============================================================================
// PayrollHub â€” MongoDB Storage Layer
// Async CRUD operations backed by Mongoose models
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
  DocumentRequest,
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
  PlanType,
  ApiPermission,
} from "../shared/types";
import { PLAN_LIMITS } from "../shared/const";
import {
  EntrepriseModel,
  UtilisateurModel,
  EmployeModel,
  PeriodePaieModel,
  ElementPaieModel,
  BulletinPaieModel,
  CongeModel,
  DocumentRHModel,
  DocumentRequestModel,
  DeclarationModel,
  ReportConfigModel,
  ParametreModel,
  NotificationModel,
  ApiKeyModel,
} from "./models";

// Internal user type with password hash
export interface StoredUser extends Utilisateur {
  motDePasseHash: string;
}

// Rate limiting (kept in-memory for performance)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

class MongoStorage {
  // ======================================================================
  // Seed â€” populate initial data if DB is empty
  // ======================================================================
  async seed(): Promise<void> {
    const count = await EntrepriseModel.countDocuments();
    if (count > 0) {
      console.log("ðŸ“¦ Database already seeded, skipping...");
      return;
    }

    console.log("ðŸŒ± Seeding database with initial data...");
    const now = new Date().toISOString();

    // 0. Create Super External Admin
    const seaHash = await bcrypt.hash("SuperExt2025!", 10);
    await UtilisateurModel.create({
      email: "platform@payrollhub.tn",
      nom: "Platform",
      prenom: "Admin",
      role: UserRole.SUPER_EXTERNAL_ADMIN,
      entrepriseId: null,
      actif: true,
      motDePasseHash: seaHash,
    });

    // 1. Create default company
    const entreprise = await EntrepriseModel.create({
      nom: "PayrollHub Demo SARL",
      adresse: "Lac 2, Tunis, Tunisie",
      matriculeFiscal: "1234567ABC",
      codeCnss: "12345678",
      secteurActivite: SectorType.SERVICES,
      telephone: "+216 71 123 456",
      email: "contact@payrollhub-demo.tn",
      regimeTravail: WorkRegime.REGIME_40H,
      plan: PlanType.ENTERPRISE,
      maxEmployees: -1,
    });
    const entrepriseId = entreprise._id.toString();

    // 2. Create Super Admin user
    const adminHash = await bcrypt.hash("Admin2025!", 10);
    await UtilisateurModel.create({
      email: "admin@payrollhub.tn",
      nom: "Admin",
      prenom: "Super",
      role: UserRole.SUPER_ADMIN,
      entrepriseId,
      actif: true,
      motDePasseHash: adminHash,
    });

    // 3. Create HR Admin user
    const rhHash = await bcrypt.hash("Rh2025!", 10);
    const rhUser = await UtilisateurModel.create({
      email: "rh@payrollhub.tn",
      nom: "Ben Ali",
      prenom: "Fatma",
      role: UserRole.ADMIN_RH,
      entrepriseId,
      actif: true,
      motDePasseHash: rhHash,
    });
    const rhId = rhUser._id.toString();

    // 4. Seed regulatory parameters (2025 values)
    const params = [
      { nom: "SMIG_48H", description: "SMIG RÃ©gime 48h/semaine", valeur: "528.320", categorie: "smig", dateDebutValidite: "2025-01-01" },
      { nom: "SMIG_40H", description: "SMIG RÃ©gime 40h/semaine", valeur: "448.238", categorie: "smig", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_RETRAITE", description: "CNSS SalariÃ© - Retraite & InvaliditÃ©", valeur: "4.99", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_MALADIE", description: "CNSS SalariÃ© - Maladie & MaternitÃ©", valeur: "2.90", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_CONGE_MALADIE", description: "CNSS SalariÃ© - CongÃ© de Maladie", valeur: "0.79", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_TOTAL", description: "CNSS Total Part Salariale", valeur: "9.68", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_RETRAITE", description: "CNSS Patronal - Retraite & InvaliditÃ©", valeur: "8.01", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_MALADIE", description: "CNSS Patronal - Maladie & MaternitÃ©", valeur: "4.25", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_ACCIDENT", description: "CNSS Patronal - Accidents du Travail", valeur: "0.40", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_CONGE_MALADIE", description: "CNSS Patronal - CongÃ© de Maladie", valeur: "0.79", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_TOTAL", description: "CNSS Total Part Patronale", valeur: "17.07", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_1", description: "IRPP 0 - 5 000 TND", valeur: "0", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_2", description: "IRPP 5 001 - 10 000 TND", valeur: "15.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_3", description: "IRPP 10 001 - 20 000 TND", valeur: "25.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_4", description: "IRPP 20 001 - 30 000 TND", valeur: "30.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_5", description: "IRPP 30 001 - 40 000 TND", valeur: "33.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_6", description: "IRPP 40 001 - 50 000 TND", valeur: "36.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_7", description: "IRPP 50 001 - 70 000 TND", valeur: "38.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_8", description: "IRPP Au-delÃ  de 70 000 TND", valeur: "40.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_FRAIS_PRO_TAUX", description: "Frais Professionnels (taux)", valeur: "10", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_FRAIS_PRO_PLAFOND", description: "Frais Professionnels (plafond annuel TND)", valeur: "2000", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_DEDUCTION_CHEF_FAMILLE", description: "DÃ©duction chef de famille (annuel TND)", valeur: "150", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_DEDUCTION_ENFANT", description: "DÃ©duction par enfant (annuel TND)", valeur: "90", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "CSS_TAUX", description: "Contribution Sociale de SolidaritÃ© (2023-2025)", valeur: "0.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "FOPROLOS_TAUX", description: "FOPROLOS (employeur)", valeur: "1", categorie: "autres", dateDebutValidite: "2025-01-01" },
      { nom: "TFP_INDUSTRIE", description: "TFP Secteur Industrie", valeur: "2", categorie: "autres", dateDebutValidite: "2025-01-01" },
      { nom: "TFP_SERVICES", description: "TFP Secteur Services", valeur: "1", categorie: "autres", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_25", description: "Heures supplÃ©mentaires +25%", valeur: "25", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_50", description: "Heures supplÃ©mentaires +50%", valeur: "50", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_75", description: "Heures supplÃ©mentaires +75%", valeur: "75", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_NUIT", description: "Majoration travail de nuit (22h-6h)", valeur: "25", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "CONGE_PAYE_JOURS_AN", description: "CongÃ©s payÃ©s (jours/an minimum)", valeur: "12", categorie: "conges", dateDebutValidite: "2025-01-01" },
      { nom: "CONGE_MATERNITE_JOURS", description: "CongÃ© de maternitÃ© (jours)", valeur: "98", categorie: "conges", dateDebutValidite: "2025-01-01" },
      { nom: "CONGE_PATERNITE_JOURS", description: "CongÃ© de paternitÃ© (jours â€” secteur privÃ©)", valeur: "2", categorie: "conges", dateDebutValidite: "2025-01-01" },
    ];
    await ParametreModel.insertMany(params);

    // 5. Seed sample employees
    const sampleEmployees = [
      { entrepriseId, nom: "Bouazizi", prenom: "Mohamed", cin: "07123456", dateNaissance: "1990-03-15", adresse: "Rue de la LibertÃ©, Tunis", telephone: "+216 22 123 456", email: "m.bouazizi@email.tn", situationFamiliale: MaritalStatus.MARIE, nbEnfants: 2, residenceFiscale: "Tunis", matriculeCnss: "CNS001234", dateEmbauche: "2020-09-01", typeContrat: ContractType.CDI, categoriePro: "CatÃ©gorie VII - Cadre", poste: "DÃ©veloppeur Senior", departement: "Informatique", salaireBase: 2500, iban: "TN59 1000 6035 1835 9847 8831", banque: "BIAT - Banque Internationale Arabe de Tunisie", actif: true },
      { entrepriseId, nom: "Trabelsi", prenom: "Amira", cin: "08234567", dateNaissance: "1988-07-22", adresse: "Avenue Habib Bourguiba, Sousse", telephone: "+216 23 234 567", email: "a.trabelsi@email.tn", situationFamiliale: MaritalStatus.CELIBATAIRE, nbEnfants: 0, residenceFiscale: "Sousse", matriculeCnss: "CNS002345", dateEmbauche: "2019-03-15", typeContrat: ContractType.CDI, categoriePro: "CatÃ©gorie VIII - Cadre SupÃ©rieur", poste: "Directrice FinanciÃ¨re", departement: "Finance et ComptabilitÃ©", salaireBase: 3800, iban: "TN59 1000 6035 1835 9847 9942", banque: "STB - SociÃ©tÃ© Tunisienne de Banque", actif: true },
      { entrepriseId, nom: "Jebali", prenom: "Youssef", cin: "09345678", dateNaissance: "1995-11-10", adresse: "Rue Ibn Khaldoun, Sfax", telephone: "+216 24 345 678", email: "y.jebali@email.tn", situationFamiliale: MaritalStatus.MARIE, nbEnfants: 1, residenceFiscale: "Sfax", matriculeCnss: "CNS003456", dateEmbauche: "2023-01-10", typeContrat: ContractType.CDD, categoriePro: "CatÃ©gorie V - Technicien SupÃ©rieur", poste: "Technicien Maintenance", departement: "Maintenance", salaireBase: 1200, iban: "TN59 1000 6035 1835 9847 1053", banque: "BNA - Banque Nationale Agricole", actif: true },
      { entrepriseId, nom: "Hamdi", prenom: "Salma", cin: "10456789", dateNaissance: "1997-05-28", adresse: "Avenue de la RÃ©publique, Nabeul", telephone: "+216 25 456 789", email: "s.hamdi@email.tn", situationFamiliale: MaritalStatus.CELIBATAIRE, nbEnfants: 0, residenceFiscale: "Nabeul", matriculeCnss: "CNS004567", dateEmbauche: "2024-06-01", typeContrat: ContractType.SIVP, categoriePro: "CatÃ©gorie IV - Technicien", poste: "Assistante RH", departement: "Ressources Humaines", salaireBase: 800, iban: "TN59 1000 6035 1835 9847 2164", banque: "Attijari Bank", actif: true },
      { entrepriseId, nom: "Chaabane", prenom: "Khalil", cin: "11567890", dateNaissance: "1985-12-03", adresse: "Rue de Marseille, Tunis", telephone: "+216 26 567 890", email: "k.chaabane@email.tn", situationFamiliale: MaritalStatus.MARIE, nbEnfants: 3, residenceFiscale: "Tunis", matriculeCnss: "CNS005678", dateEmbauche: "2015-04-20", typeContrat: ContractType.CDI, categoriePro: "CatÃ©gorie IX - Directeur", poste: "Directeur Commercial", departement: "Commercial", salaireBase: 5000, iban: "TN59 1000 6035 1835 9847 3275", banque: "Amen Bank", actif: true },
      { entrepriseId, nom: "Mejri", prenom: "Nour", cin: "12678901", dateNaissance: "1993-09-17", adresse: "CitÃ© El Manar, Tunis", telephone: "+216 27 678 901", email: "n.mejri@email.tn", situationFamiliale: MaritalStatus.MARIE, nbEnfants: 1, residenceFiscale: "Tunis", matriculeCnss: "CNS006789", dateEmbauche: "2021-11-01", typeContrat: ContractType.CDI, categoriePro: "CatÃ©gorie VI - Agent de MaÃ®trise", poste: "Responsable QualitÃ©", departement: "QualitÃ©", salaireBase: 1800, iban: "TN59 1000 6035 1835 9847 4386", banque: "BH - Banque de l'Habitat", actif: true },
    ];

    const employees = await EmployeModel.insertMany(sampleEmployees);
    const employeeIds = employees.map(e => e._id.toString());

    // 6. Employee self-service user (linked to Bouazizi)
    const empUserHash = await bcrypt.hash("Employe2025!", 10);
    await UtilisateurModel.create({
      email: "bouazizi@payrollhub.tn",
      nom: "Bouazizi",
      prenom: "Mohamed",
      role: UserRole.EMPLOYE,
      entrepriseId,
      employeId: employeeIds[0],
      actif: true,
      motDePasseHash: empUserHash,
    });

    // 7. Manager user (linked to Chaabane)
    const mgrHash = await bcrypt.hash("Manager2025!", 10);
    await UtilisateurModel.create({
      email: "chaabane@payrollhub.tn",
      nom: "Chaabane",
      prenom: "Khalil",
      role: UserRole.MANAGER,
      entrepriseId,
      employeId: employeeIds[4],
      actif: true,
      motDePasseHash: mgrHash,
    });

    // 8. Seed sample leave requests
    await CongeModel.insertMany([
      { employeId: employeeIds[0], typeConge: LeaveType.CONGE_PAYE, dateDebut: "2026-03-10", dateFin: "2026-03-14", nbJours: 5, statut: LeaveStatus.EN_ATTENTE, motif: "Vacances familiales" },
      { employeId: employeeIds[1], typeConge: LeaveType.CONGE_PAYE, dateDebut: "2026-02-17", dateFin: "2026-02-21", nbJours: 5, statut: LeaveStatus.APPROUVE, motif: "CongÃ© annuel", approuvePar: rhId, dateApprobation: "2026-02-10T09:00:00.000Z" },
      { employeId: employeeIds[2], typeConge: LeaveType.MALADIE, dateDebut: "2026-02-24", dateFin: "2026-02-26", nbJours: 3, statut: LeaveStatus.EN_ATTENTE, motif: "Certificat mÃ©dical fourni" },
      { employeId: employeeIds[0], typeConge: LeaveType.CONGE_PAYE, dateDebut: "2026-01-06", dateFin: "2026-01-08", nbJours: 3, statut: LeaveStatus.APPROUVE, motif: "DÃ©mÃ©nagement", approuvePar: rhId, dateApprobation: "2025-12-28T14:00:00.000Z" },
      { employeId: employeeIds[3], typeConge: LeaveType.EXCEPTIONNEL, dateDebut: "2026-03-01", dateFin: "2026-03-01", nbJours: 1, statut: LeaveStatus.REJETE, motif: "Rendez-vous administratif", approuvePar: rhId, dateApprobation: "2026-02-26T11:00:00.000Z" },
    ]);

    console.log("âœ… Database seeded successfully");
  }

  // ======================================================================
  // Entreprise
  // ======================================================================
  async getEntreprises(): Promise<Entreprise[]> {
    const docs = await EntrepriseModel.find().lean();
    return docs.map(d => this.toEntreprise(d));
  }

  async getEntreprise(id: string): Promise<Entreprise | undefined> {
    try {
      const doc = await EntrepriseModel.findById(id).lean();
      return doc ? this.toEntreprise(doc) : undefined;
    } catch { return undefined; }
  }

  async getEntrepriseByMatricule(matriculeFiscal: string): Promise<Entreprise | undefined> {
    const doc = await EntrepriseModel.findOne({ matriculeFiscal }).lean();
    return doc ? this.toEntreprise(doc) : undefined;
  }

  async createEntreprise(data: Omit<Entreprise, "id" | "createdAt" | "updatedAt">): Promise<Entreprise> {
    const planKey = (data.plan || PlanType.GRATUIT) as keyof typeof PLAN_LIMITS;
    const maxEmp = PLAN_LIMITS[planKey]?.maxEmployees ?? 5;
    const doc = await EntrepriseModel.create({ ...data, maxEmployees: data.maxEmployees ?? maxEmp });
    return this.toEntreprise(doc.toObject());
  }

  async updateEntreprise(id: string, data: Partial<Entreprise>): Promise<Entreprise | undefined> {
    const doc = await EntrepriseModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toEntreprise(doc) : undefined;
  }

  private toEntreprise(d: any): Entreprise {
    return {
      id: (d._id || d.id)?.toString(),
      nom: d.nom,
      adresse: d.adresse,
      matriculeFiscal: d.matriculeFiscal,
      codeCnss: d.codeCnss,
      secteurActivite: d.secteurActivite,
      telephone: d.telephone,
      email: d.email,
      regimeTravail: d.regimeTravail,
      plan: d.plan || PlanType.GRATUIT,
      maxEmployees: d.maxEmployees ?? 5,
      createdBy: d.createdBy,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // Utilisateur
  // ======================================================================
  async getUtilisateurs(entrepriseId?: string): Promise<Omit<StoredUser, "motDePasseHash">[]> {
    const filter: any = {};
    if (entrepriseId) filter.entrepriseId = entrepriseId;
    const docs = await UtilisateurModel.find(filter).lean();
    return docs.map(d => {
      const u = this.toUser(d);
      const { motDePasseHash, ...rest } = u;
      return rest;
    });
  }

  async getUtilisateur(id: string): Promise<StoredUser | undefined> {
    try {
      const doc = await UtilisateurModel.findById(id).lean();
      return doc ? this.toUser(doc) : undefined;
    } catch { return undefined; }
  }

  async getUtilisateurByEmail(email: string): Promise<StoredUser | undefined> {
    const doc = await UtilisateurModel.findOne({ email }).lean();
    return doc ? this.toUser(doc) : undefined;
  }

  async createUtilisateur(data: Omit<StoredUser, "id" | "createdAt" | "updatedAt" | "actif">): Promise<StoredUser> {
    const doc = await UtilisateurModel.create({ ...data, actif: true });
    return this.toUser(doc.toObject());
  }

  async updateUtilisateur(id: string, data: Partial<StoredUser>): Promise<StoredUser | undefined> {
    const doc = await UtilisateurModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toUser(doc) : undefined;
  }

  async deleteUtilisateur(id: string): Promise<boolean> {
    const doc = await UtilisateurModel.findByIdAndUpdate(id, { actif: false });
    return !!doc;
  }

  private toUser(d: any): StoredUser {
    return {
      id: (d._id || d.id)?.toString(),
      email: d.email,
      nom: d.nom,
      prenom: d.prenom,
      role: d.role,
      entrepriseId: d.entrepriseId || "",
      employeId: d.employeId,
      actif: d.actif,
      motDePasseHash: d.motDePasseHash,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // EmployÃ©
  // ======================================================================
  async getEmployes(entrepriseId?: string, search?: string): Promise<Employe[]> {
    const filter: any = { actif: true };
    if (entrepriseId) filter.entrepriseId = entrepriseId;
    if (search) {
      const s = search.toLowerCase();
      filter.$or = [
        { nom: { $regex: s, $options: "i" } },
        { prenom: { $regex: s, $options: "i" } },
        { cin: { $regex: s, $options: "i" } },
        { matriculeCnss: { $regex: s, $options: "i" } },
        { poste: { $regex: s, $options: "i" } },
        { departement: { $regex: s, $options: "i" } },
      ];
    }
    const docs = await EmployeModel.find(filter).lean();
    return docs.map(d => this.toEmploye(d));
  }

  async getEmploye(id: string): Promise<Employe | undefined> {
    try {
      const doc = await EmployeModel.findById(id).lean();
      return doc ? this.toEmploye(doc) : undefined;
    } catch { return undefined; }
  }

  async createEmploye(data: Omit<Employe, "id" | "createdAt" | "updatedAt" | "actif">, entrepriseId: string): Promise<Employe> {
    const doc = await EmployeModel.create({ ...data, entrepriseId, actif: true });
    return this.toEmploye(doc.toObject());
  }

  async updateEmploye(id: string, data: Partial<Employe>): Promise<Employe | undefined> {
    const doc = await EmployeModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toEmploye(doc) : undefined;
  }

  async deleteEmploye(id: string): Promise<boolean> {
    const doc = await EmployeModel.findByIdAndUpdate(id, { actif: false });
    return !!doc;
  }

  async countEmployes(entrepriseId: string): Promise<number> {
    return EmployeModel.countDocuments({ entrepriseId, actif: true });
  }

  private toEmploye(d: any): Employe {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      nom: d.nom,
      prenom: d.prenom,
      cin: d.cin,
      dateNaissance: d.dateNaissance,
      adresse: d.adresse,
      telephone: d.telephone,
      email: d.email,
      situationFamiliale: d.situationFamiliale,
      nbEnfants: d.nbEnfants,
      residenceFiscale: d.residenceFiscale,
      matriculeCnss: d.matriculeCnss,
      dateEmbauche: d.dateEmbauche,
      dateFin: d.dateFin,
      typeContrat: d.typeContrat,
      categoriePro: d.categoriePro,
      poste: d.poste,
      departement: d.departement,
      etablissement: d.etablissement,
      salaireBase: d.salaireBase,
      iban: d.iban,
      banque: d.banque,
      actif: d.actif,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // ParamÃ¨tres RÃ©glementaires
  // ======================================================================
  async getParametres(categorie?: string): Promise<ParametreReglementaire[]> {
    const filter: any = {};
    if (categorie) filter.categorie = categorie;
    const docs = await ParametreModel.find(filter).lean();
    return docs.map(d => ({ id: (d._id || d.id)?.toString(), nom: d.nom, description: d.description, valeur: d.valeur, categorie: d.categorie, dateDebutValidite: d.dateDebutValidite, dateFinValidite: d.dateFinValidite ?? undefined }));
  }

  async getParametre(id: string): Promise<ParametreReglementaire | undefined> {
    try {
      const doc = await ParametreModel.findById(id).lean();
      if (!doc) return undefined;
      return { id: doc._id.toString(), nom: doc.nom, description: doc.description, valeur: doc.valeur, categorie: doc.categorie, dateDebutValidite: doc.dateDebutValidite, dateFinValidite: doc.dateFinValidite ?? undefined };
    } catch { return undefined; }
  }

  async updateParametre(id: string, data: Partial<ParametreReglementaire>): Promise<ParametreReglementaire | undefined> {
    const doc = await ParametreModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return undefined;
    return { id: doc._id.toString(), nom: doc.nom, description: doc.description, valeur: doc.valeur, categorie: doc.categorie, dateDebutValidite: doc.dateDebutValidite, dateFinValidite: doc.dateFinValidite ?? undefined };
  }

  // ======================================================================
  // PÃ©riodes de Paie
  // ======================================================================
  async getPeriodesPaie(entrepriseId: string): Promise<PeriodePaie[]> {
    const docs = await PeriodePaieModel.find({ entrepriseId }).sort({ annee: -1, mois: -1 }).lean();
    return docs.map(d => this.toPeriodePaie(d));
  }

  async getPeriodePaie(id: string): Promise<PeriodePaie | undefined> {
    try {
      const doc = await PeriodePaieModel.findById(id).lean();
      return doc ? this.toPeriodePaie(doc) : undefined;
    } catch { return undefined; }
  }

  async getPeriodePaieByMonth(entrepriseId: string, mois: number, annee: number): Promise<PeriodePaie | undefined> {
    const doc = await PeriodePaieModel.findOne({ entrepriseId, mois, annee }).lean();
    return doc ? this.toPeriodePaie(doc) : undefined;
  }

  async createPeriodePaie(data: Omit<PeriodePaie, "id" | "createdAt" | "updatedAt" | "statut">): Promise<PeriodePaie> {
    const doc = await PeriodePaieModel.create({ ...data, statut: PayPeriodStatus.EN_COURS });
    return this.toPeriodePaie(doc.toObject());
  }

  async updatePeriodePaieStatut(id: string, statut: PayPeriodStatus): Promise<PeriodePaie | undefined> {
    const doc = await PeriodePaieModel.findByIdAndUpdate(id, { statut }, { new: true }).lean();
    return doc ? this.toPeriodePaie(doc) : undefined;
  }

  private toPeriodePaie(d: any): PeriodePaie {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      mois: d.mois,
      annee: d.annee,
      dateDebut: d.dateDebut,
      dateFin: d.dateFin,
      statut: d.statut,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // Ã‰lÃ©ments de Paie
  // ======================================================================
  async getElementsPaie(periodePaieId: string, employeId?: string): Promise<ElementPaie[]> {
    const filter: any = { periodePaieId };
    if (employeId) filter.employeId = employeId;
    const docs = await ElementPaieModel.find(filter).lean();
    return docs.map(d => ({
      id: (d._id || d.id)?.toString(), periodePaieId: d.periodePaieId, employeId: d.employeId,
      type: d.type as any, libelle: d.libelle, montant: d.montant, estVariable: d.estVariable ?? true,
      heures: d.heures ?? undefined, taux: d.taux ?? undefined,
    }));
  }

  async createElementPaie(data: Omit<ElementPaie, "id">): Promise<ElementPaie> {
    const doc = await ElementPaieModel.create(data);
    const d = doc.toObject();
    return {
      id: (d._id || d.id)?.toString(), periodePaieId: d.periodePaieId, employeId: d.employeId,
      type: d.type as any, libelle: d.libelle, montant: d.montant, estVariable: d.estVariable ?? true,
      heures: d.heures ?? undefined, taux: d.taux ?? undefined,
    };
  }

  async deleteElementsPaie(periodePaieId: string, employeId?: string): Promise<number> {
    const filter: any = { periodePaieId };
    if (employeId) filter.employeId = employeId;
    const result = await ElementPaieModel.deleteMany(filter);
    return result.deletedCount;
  }

  // ======================================================================
  // Bulletins de Paie
  // ======================================================================
  async getBulletins(periodePaieId: string): Promise<BulletinPaie[]> {
    const docs = await BulletinPaieModel.find({ periodePaieId }).lean();
    return docs.map(d => this.toBulletin(d));
  }

  async getBulletin(id: string): Promise<BulletinPaie | undefined> {
    try {
      const doc = await BulletinPaieModel.findById(id).lean();
      return doc ? this.toBulletin(doc) : undefined;
    } catch { return undefined; }
  }

  async getBulletinsByEmploye(employeId: string): Promise<BulletinPaie[]> {
    const docs = await BulletinPaieModel.find({ employeId }).sort({ dateGeneration: -1 }).lean();
    return docs.map(d => this.toBulletin(d));
  }

  async saveBulletins(bulletins: BulletinPaie[]): Promise<void> {
    for (const b of bulletins) {
      await BulletinPaieModel.findOneAndUpdate(
        { periodePaieId: b.periodePaieId, employeId: b.employeId },
        { $set: b },
        { upsert: true }
      );
    }
  }

  async deleteBulletins(periodePaieId: string): Promise<number> {
    const result = await BulletinPaieModel.deleteMany({ periodePaieId });
    return result.deletedCount;
  }

  private toBulletin(d: any): BulletinPaie {
    return {
      id: (d._id || d.id)?.toString(),
      periodePaieId: d.periodePaieId,
      employeId: d.employeId,
      employe: d.employe,
      elements: d.elements || [],
      salaireBrut: d.salaireBrut,
      cnssSalarial: d.cnssSalarial,
      cnssPatronal: d.cnssPatronal,
      salaireNetImposable: d.salaireNetImposable,
      irpp: d.irpp,
      netAPayer: d.netAPayer,
      foprolos: d.foprolos,
      tfp: d.tfp,
      coutTotalEmployeur: d.coutTotalEmployeur,
      dateGeneration: d.dateGeneration,
    };
  }

  // ======================================================================
  // CongÃ©s
  // ======================================================================
  async getConges(employeId?: string): Promise<Conge[]> {
    const filter: any = {};
    if (employeId) filter.employeId = employeId;
    const docs = await CongeModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toConge(d));
  }

  async getCongesByEntreprise(entrepriseId: string): Promise<Conge[]> {
    const empIds = (await EmployeModel.find({ entrepriseId, actif: true }, "_id").lean()).map(e => e._id.toString());
    const docs = await CongeModel.find({ employeId: { $in: empIds } }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toConge(d));
  }

  async getConge(id: string): Promise<Conge | undefined> {
    try {
      const doc = await CongeModel.findById(id).lean();
      return doc ? this.toConge(doc) : undefined;
    } catch { return undefined; }
  }

  async createConge(data: Omit<Conge, "id" | "statut" | "createdAt" | "updatedAt">): Promise<Conge> {
    const doc = await CongeModel.create({ ...data, statut: LeaveStatus.EN_ATTENTE });
    return this.toConge(doc.toObject());
  }

  async updateCongeStatut(id: string, statut: LeaveStatus, approuvePar?: string): Promise<Conge | undefined> {
    const now = new Date().toISOString();
    const update: any = { statut };
    if (statut === LeaveStatus.APPROUVE || statut === LeaveStatus.REJETE) {
      update.approuvePar = approuvePar;
      update.dateApprobation = now;
    }
    const doc = await CongeModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    return doc ? this.toConge(doc) : undefined;
  }

  async deleteConge(id: string): Promise<boolean> {
    const result = await CongeModel.findByIdAndDelete(id);
    return !!result;
  }

  async getLeaveBalance(employeId: string, year: number): Promise<{ droitAnnuel: number; consomme: number; enAttente: number; solde: number }> {
    const param = await ParametreModel.findOne({ nom: "CONGE_PAYE_JOURS_AN" }).lean();
    const droitAnnuel = param ? parseFloat(param.valeur) : 12;

    const leaves = await CongeModel.find({
      employeId,
      typeConge: "conge_paye",
      dateDebut: { $regex: `^${year}` },
    }).lean();

    const consomme = leaves.filter(c => c.statut === LeaveStatus.APPROUVE).reduce((s, c) => s + c.nbJours, 0);
    const enAttente = leaves.filter(c => c.statut === LeaveStatus.EN_ATTENTE).reduce((s, c) => s + c.nbJours, 0);

    return { droitAnnuel, consomme, enAttente, solde: droitAnnuel - consomme };
  }

  private toConge(d: any): Conge {
    return {
      id: (d._id || d.id)?.toString(),
      employeId: d.employeId,
      typeConge: d.typeConge,
      dateDebut: d.dateDebut,
      dateFin: d.dateFin,
      nbJours: d.nbJours,
      statut: d.statut,
      motif: d.motif,
      documentUrl: d.documentUrl,
      approuvePar: d.approuvePar,
      dateApprobation: d.dateApprobation,
      uploadedPapers: d.uploadedPapers || [],
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // Documents RH
  // ======================================================================
  async getDocuments(entrepriseId: string): Promise<DocumentRH[]> {
    const docs = await DocumentRHModel.find({ entrepriseId }).sort({ dateCreation: -1 }).lean();
    return docs.map(d => this.toDocument(d));
  }

  async getDocumentsByEmploye(employeId: string): Promise<DocumentRH[]> {
    const docs = await DocumentRHModel.find({ employeId }).sort({ dateCreation: -1 }).lean();
    return docs.map(d => this.toDocument(d));
  }

  async getDocument(id: string): Promise<DocumentRH | undefined> {
    try {
      const doc = await DocumentRHModel.findById(id).lean();
      return doc ? this.toDocument(doc) : undefined;
    } catch { return undefined; }
  }

  async createDocument(data: Omit<DocumentRH, "id" | "dateCreation">): Promise<DocumentRH> {
    const doc = await DocumentRHModel.create({ ...data, dateCreation: new Date().toISOString() });
    return this.toDocument(doc.toObject());
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await DocumentRHModel.findByIdAndDelete(id);
    return !!result;
  }

  private toDocument(d: any): DocumentRH {
    return {
      id: (d._id || d.id)?.toString(),
      employeId: d.employeId,
      typeDocument: d.typeDocument,
      nomFichier: d.nomFichier,
      titre: d.titre,
      dateCreation: d.dateCreation,
      generePar: d.generePar,
      entrepriseId: d.entrepriseId,
    };
  }

  // ======================================================================
  // Document Requests (NEW)
  // ======================================================================
  async getDocumentRequests(entrepriseId: string): Promise<DocumentRequest[]> {
    const docs = await DocumentRequestModel.find({ entrepriseId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toDocumentRequest(d));
  }

  async getDocumentRequestsByEmploye(employeId: string): Promise<DocumentRequest[]> {
    const docs = await DocumentRequestModel.find({ employeId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toDocumentRequest(d));
  }

  async getDocumentRequest(id: string): Promise<DocumentRequest | undefined> {
    try {
      const doc = await DocumentRequestModel.findById(id).lean();
      return doc ? this.toDocumentRequest(doc) : undefined;
    } catch { return undefined; }
  }

  async createDocumentRequest(data: Omit<DocumentRequest, "id" | "statut" | "createdAt" | "updatedAt">): Promise<DocumentRequest> {
    const doc = await DocumentRequestModel.create({ ...data, statut: "en_attente" });
    return this.toDocumentRequest(doc.toObject());
  }

  async updateDocumentRequest(id: string, data: Partial<DocumentRequest>): Promise<DocumentRequest | undefined> {
    const doc = await DocumentRequestModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toDocumentRequest(doc) : undefined;
  }

  async deleteDocumentRequest(id: string): Promise<boolean> {
    const result = await DocumentRequestModel.findByIdAndDelete(id);
    return !!result;
  }

  private toDocumentRequest(d: any): DocumentRequest {
    return {
      id: (d._id || d.id)?.toString(),
      employeId: d.employeId,
      entrepriseId: d.entrepriseId,
      typeDocument: d.typeDocument,
      statut: d.statut,
      motif: d.motif,
      requiredPapers: d.requiredPapers || [],
      uploadedPapers: d.uploadedPapers || [],
      reviewedBy: d.reviewedBy,
      reviewComment: d.reviewComment,
      dateReview: d.dateReview,
      generatedDocumentId: d.generatedDocumentId,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // Declarations
  // ======================================================================
  async getDeclarations(entrepriseId: string): Promise<Declaration[]> {
    const docs = await DeclarationModel.find({ entrepriseId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toDeclaration(d));
  }

  async getDeclaration(id: string): Promise<Declaration | undefined> {
    try {
      const doc = await DeclarationModel.findById(id).lean();
      return doc ? this.toDeclaration(doc) : undefined;
    } catch { return undefined; }
  }

  async createDeclaration(data: Omit<Declaration, "id" | "statut" | "createdAt" | "updatedAt">): Promise<Declaration> {
    const doc = await DeclarationModel.create({ ...data, statut: DeclarationStatus.GENERE });
    return this.toDeclaration(doc.toObject());
  }

  async updateDeclarationStatut(id: string, statut: DeclarationStatus): Promise<Declaration | undefined> {
    const doc = await DeclarationModel.findByIdAndUpdate(id, { statut }, { new: true }).lean();
    return doc ? this.toDeclaration(doc) : undefined;
  }

  async deleteDeclaration(id: string): Promise<boolean> {
    const result = await DeclarationModel.findByIdAndDelete(id);
    return !!result;
  }

  private toDeclaration(d: any): Declaration {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      type: d.type,
      periodeDebut: d.periodeDebut,
      periodeFin: d.periodeFin,
      trimestre: d.trimestre,
      annee: d.annee,
      statut: d.statut,
      nomFichier: d.nomFichier,
      nbEmployes: d.nbEmployes,
      montantTotal: d.montantTotal,
      generePar: d.generePar,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // Reports
  // ======================================================================
  async getReports(entrepriseId: string): Promise<ReportConfig[]> {
    const docs = await ReportConfigModel.find({ entrepriseId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => ({
      id: (d._id || d.id)?.toString(), entrepriseId: d.entrepriseId, type: d.type as any,
      titre: d.titre, periodeDebut: d.periodeDebut, periodeFin: d.periodeFin,
      filtres: d.filtres as any, generePar: d.generePar,
      createdAt: String(d.createdAt ? (d.createdAt as any).toISOString?.() ?? d.createdAt : new Date().toISOString()),
    }));
  }

  async getReport(id: string): Promise<ReportConfig | undefined> {
    try {
      const doc = await ReportConfigModel.findById(id).lean();
      if (!doc) return undefined;
      return {
        id: (doc._id || doc.id)?.toString(), entrepriseId: doc.entrepriseId, type: doc.type as any,
        titre: doc.titre, periodeDebut: doc.periodeDebut, periodeFin: doc.periodeFin,
        filtres: doc.filtres as any, generePar: doc.generePar,
        createdAt: String(doc.createdAt ? (doc.createdAt as any).toISOString?.() ?? doc.createdAt : new Date().toISOString()),
      };
    } catch { return undefined; }
  }

  async createReport(data: Omit<ReportConfig, "id" | "createdAt">): Promise<ReportConfig> {
    const doc = await ReportConfigModel.create(data);
    const d = doc.toObject();
    return {
      id: (d._id || d.id)?.toString(), entrepriseId: d.entrepriseId, type: d.type as any,
      titre: d.titre, periodeDebut: d.periodeDebut, periodeFin: d.periodeFin,
      filtres: d.filtres as any, generePar: d.generePar,
      createdAt: String(d.createdAt ? (d.createdAt as any).toISOString?.() ?? d.createdAt : new Date().toISOString()),
    };
  }

  async deleteReport(id: string): Promise<boolean> {
    const result = await ReportConfigModel.findByIdAndDelete(id);
    return !!result;
  }

  // ======================================================================
  // Dashboard Stats
  // ======================================================================
  async getDashboardStats(entrepriseId: string): Promise<DashboardStats> {
    const emps = await this.getEmployes(entrepriseId);
    const contratsActifs = emps.filter(e => e.actif).length;
    const congesEnAttente = await CongeModel.countDocuments({ statut: LeaveStatus.EN_ATTENTE });

    // Group by department
    const deptMap = new Map<string, number>();
    for (const e of emps) deptMap.set(e.departement, (deptMap.get(e.departement) || 0) + 1);
    const employesParDepartement = Array.from(deptMap.entries()).map(([departement, count]) => ({ departement, count }));

    // Group by contract type
    const contratMap = new Map<ContractType, number>();
    for (const e of emps) contratMap.set(e.typeContrat, (contratMap.get(e.typeContrat) || 0) + 1);
    const employesParContrat = Array.from(contratMap.entries()).map(([type, count]) => ({ type, count }));

    const masseSalariale = emps.reduce((sum, e) => sum + e.salaireBase, 0);

    const months = ["Jan", "FÃ©v", "Mar", "Avr", "Mai", "Jun", "Jul", "AoÃ»", "Sep", "Oct", "Nov", "DÃ©c"];
    const currentMonth = new Date().getMonth();
    const evolutionMasseSalariale = months.slice(0, currentMonth + 1).map((mois, i) => ({
      mois, montant: masseSalariale * (0.92 + i * 0.008 + Math.random() * 0.02),
    }));

    // Payroll analytics
    const periodes = await this.getPeriodesPaie(entrepriseId);
    let payroll: DashboardStats["payroll"] = undefined;

    if (periodes.length > 0) {
      const sorted = [...periodes].sort((a, b) => a.annee !== b.annee ? b.annee - a.annee : b.mois - a.mois);
      const latest = sorted[0];
      const latestBulletins = await this.getBulletins(latest.id);

      const totalBrut = latestBulletins.reduce((s, b) => s + b.salaireBrut, 0);
      const totalNet = latestBulletins.reduce((s, b) => s + b.netAPayer, 0);
      const totalCnss = latestBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
      const totalIrpp = latestBulletins.reduce((s, b) => s + b.irpp, 0);
      const coutEmployeur = latestBulletins.reduce((s, b) => s + b.coutTotalEmployeur, 0);
      const periodesCalculees = periodes.filter(p => p.statut !== PayPeriodStatus.EN_COURS).length;
      const periodesFinalisees = periodes.filter(p => p.statut === PayPeriodStatus.FINALISEE).length;

      const evolutionPayroll: { mois: string; brut: number; net: number; coutEmployeur: number }[] = [];
      for (const p of sorted.reverse()) {
        const buls = await this.getBulletins(p.id);
        evolutionPayroll.push({
          mois: `${months[p.mois - 1]} ${p.annee}`,
          brut: buls.reduce((s, b) => s + b.salaireBrut, 0),
          net: buls.reduce((s, b) => s + b.netAPayer, 0),
          coutEmployeur: buls.reduce((s, b) => s + b.coutTotalEmployeur, 0),
        });
      }

      payroll = { dernierePeriode: `${months[latest.mois - 1]} ${latest.annee}`, totalBrut, totalNet, totalCnss, totalIrpp, coutEmployeur, periodesCalculees, periodesFinalisees, evolutionPayroll };
    }

    // Advanced analytics
    const now2 = new Date();
    const turnover = months.map((mois, idx) => {
      const entrees = emps.filter(e => { const d = new Date(e.dateEmbauche); return d.getMonth() === idx && d.getFullYear() === now2.getFullYear(); }).length;
      const sorties = emps.filter(e => { if (!e.dateFin) return false; const d = new Date(e.dateFin); return d.getMonth() === idx && d.getFullYear() === now2.getFullYear(); }).length;
      return { mois, entrees, sorties };
    }).slice(0, currentMonth + 1);

    const allConges = await this.getCongesByEntreprise(entrepriseId);
    const deptLeaves = new Map<string, { total: number; jours: number }>();
    for (const e of emps) {
      if (!deptLeaves.has(e.departement)) deptLeaves.set(e.departement, { total: 0, jours: 0 });
      const dl = deptLeaves.get(e.departement)!;
      dl.total++;
      const empLeaves = allConges.filter(c => c.employeId === e.id && c.statut === LeaveStatus.APPROUVE);
      dl.jours += empLeaves.reduce((s, c) => s + c.nbJours, 0);
    }
    const absenteisme = Array.from(deptLeaves.entries()).map(([departement, d]) => ({
      departement, taux: d.total > 0 ? Math.round((d.jours / (d.total * 22) * 100) * 10) / 10 : 0,
    }));

    const coutParDepartement = Array.from(deptMap.entries()).map(([departement]) => {
      const deptEmps = emps.filter(e => e.departement === departement);
      const brut = deptEmps.reduce((s, e) => s + e.salaireBase, 0);
      const charges = brut * 0.2807;
      return { departement, brut, charges, total: brut + charges };
    });

    const salairesTranches = [
      { min: 0, max: 500, label: "< 500" }, { min: 500, max: 1000, label: "500-1000" },
      { min: 1000, max: 2000, label: "1000-2000" }, { min: 2000, max: 3000, label: "2000-3000" },
      { min: 3000, max: 5000, label: "3000-5000" }, { min: 5000, max: Infinity, label: "> 5000" },
    ];
    const repartitionSalaires = salairesTranches.map(t => ({
      tranche: t.label, count: emps.filter(e => e.salaireBase >= t.min && e.salaireBase < t.max).length,
    }));

    const anciennete = [
      { min: 0, max: 1, label: "< 1 an" }, { min: 1, max: 3, label: "1-3 ans" },
      { min: 3, max: 5, label: "3-5 ans" }, { min: 5, max: 10, label: "5-10 ans" },
      { min: 10, max: Infinity, label: "> 10 ans" },
    ];
    const ancienneteDistribution = anciennete.map(t => ({
      tranche: t.label, count: emps.filter(e => {
        const years = (now2.getTime() - new Date(e.dateEmbauche).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return years >= t.min && years < t.max;
      }).length,
    }));

    const docsGen = await DocumentRHModel.countDocuments({ entrepriseId });
    const declEnAttente = await DeclarationModel.countDocuments({ entrepriseId, statut: DeclarationStatus.GENERE });

    return {
      totalEmployes: emps.length, contratsActifs, congesEnAttente, masseSalariale,
      employesParDepartement, employesParContrat, evolutionMasseSalariale, payroll,
      analytics: { turnover, absenteisme, coutParDepartement, repartitionSalaires, ancienneteDistribution, documentsGeneres: docsGen, declarationsEnAttente: declEnAttente },
    };
  }

  // Cache delegates (simple pass-through, no in-memory cache with MongoDB)
  async getCachedDashboardStats(entrepriseId: string): Promise<DashboardStats> {
    return this.getDashboardStats(entrepriseId);
  }

  invalidateCache(_pattern?: string): void {
    // No-op with MongoDB (queries always fresh)
  }

  // ======================================================================
  // Notifications
  // ======================================================================
  async getNotifications(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ destinataireId: userId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toNotification(d));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ destinataireId: userId, lu: false });
  }

  async createNotification(data: Omit<Notification, "id" | "lu" | "createdAt">): Promise<Notification> {
    const doc = await NotificationModel.create({ ...data, lu: false });
    return this.toNotification(doc.toObject());
  }

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const result = await NotificationModel.findOneAndUpdate({ _id: id, destinataireId: userId }, { lu: true });
    return !!result;
  }

  async markAllNotificationsRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany({ destinataireId: userId, lu: false }, { lu: true });
    return result.modifiedCount;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await NotificationModel.findOneAndDelete({ _id: id, destinataireId: userId });
    return !!result;
  }

  async broadcastNotification(
    entrepriseId: string,
    minRole: UserRole,
    data: Omit<Notification, "id" | "lu" | "createdAt" | "destinataireId" | "entrepriseId">
  ): Promise<Notification[]> {
    const roleLevel: Record<string, number> = {
      super_external_admin: 7, super_admin: 6, admin_rh: 5, admin_paie: 4, comptable: 3, manager: 2, employe: 1,
    };
    const minLevel = roleLevel[minRole] || 0;
    const users = await UtilisateurModel.find({
      entrepriseId, actif: true,
    }).lean();

    const filtered = users.filter(u => (roleLevel[u.role] || 0) >= minLevel);
    const notifications: Notification[] = [];
    for (const u of filtered) {
      const n = await this.createNotification({ ...data, entrepriseId, destinataireId: u._id.toString() });
      notifications.push(n);
    }
    return notifications;
  }

  private toNotification(d: any): Notification {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      destinataireId: d.destinataireId,
      type: d.type,
      priorite: d.priorite,
      titre: d.titre,
      message: d.message,
      lien: d.lien,
      lu: d.lu,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
    };
  }

  // ======================================================================
  // API Keys
  // ======================================================================
  async getApiKeys(entrepriseId: string): Promise<Omit<ApiKey, "cle">[]> {
    const docs = await ApiKeyModel.find({ entrepriseId }).lean();
    return docs.map(d => {
      const k = this.toApiKey(d);
      const { cle, ...rest } = k;
      return rest;
    });
  }

  async getApiKeyByRaw(rawKey: string): Promise<ApiKey | undefined> {
    const doc = await ApiKeyModel.findOne({ cle: rawKey, actif: true }).lean();
    return doc ? this.toApiKey(doc) : undefined;
  }

  async createApiKey(data: { entrepriseId: string; nom: string; permissions: string[]; limiteRequetes: number }): Promise<{ apiKey: Omit<ApiKey, "cle">; rawKey: string }> {
    const id = uuidv4();
    const secret = uuidv4().replace(/-/g, "");
    const rawKey = `ph_${id.substring(0, 8)}_${secret}`;
    const prefixe = rawKey.substring(0, 12) + "...";

    const doc = await ApiKeyModel.create({
      entrepriseId: data.entrepriseId,
      nom: data.nom,
      cle: rawKey,
      prefixe,
      permissions: data.permissions,
      actif: true,
      limiteRequetes: data.limiteRequetes,
    });

    const key = this.toApiKey(doc.toObject());
    const { cle, ...safe } = key;
    return { apiKey: safe, rawKey };
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await ApiKeyModel.findByIdAndUpdate(id, { derniereUtilisation: new Date().toISOString() });
  }

  async toggleApiKey(id: string, entrepriseId: string): Promise<ApiKey | undefined> {
    const doc = await ApiKeyModel.findOne({ _id: id, entrepriseId }).lean();
    if (!doc) return undefined;
    const updated = await ApiKeyModel.findByIdAndUpdate(id, { actif: !doc.actif }, { new: true }).lean();
    if (!updated) return undefined;
    const k = this.toApiKey(updated);
    const { cle, ...safe } = k;
    return safe as ApiKey;
  }

  async deleteApiKey(id: string, entrepriseId: string): Promise<boolean> {
    const result = await ApiKeyModel.findOneAndDelete({ _id: id, entrepriseId });
    return !!result;
  }

  // Rate limiting (kept in-memory)
  checkRateLimit(keyId: string, limit: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let entry = rateLimits.get(keyId);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 3600_000 };
      rateLimits.set(keyId, entry);
    }
    entry.count++;
    const remaining = Math.max(0, limit - entry.count);
    return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
  }

  private toApiKey(d: any): ApiKey {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      nom: d.nom,
      cle: d.cle,
      prefixe: d.prefixe,
      permissions: d.permissions as ApiPermission[],
      actif: d.actif,
      derniereUtilisation: d.derniereUtilisation,
      limiteRequetes: d.limiteRequetes,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || new Date().toISOString(),
    };
  }
}

export const storage = new MongoStorage();
