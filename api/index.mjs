// server/vercel-entry.ts
import dotenv2 from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// server/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/payrollhub";
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("\u2705 Connected to MongoDB Atlas");
  } catch (error) {
    console.error("\u274C MongoDB connection error:", error);
    throw error;
  }
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting reconnect...");
  });
}

// server/storage.ts
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// shared/types.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["SUPER_EXTERNAL_ADMIN"] = "super_external_admin";
  UserRole2["SUPER_ADMIN"] = "super_admin";
  UserRole2["ADMIN_RH"] = "admin_rh";
  UserRole2["ADMIN_PAIE"] = "admin_paie";
  UserRole2["COMPTABLE"] = "comptable";
  UserRole2["MANAGER"] = "manager";
  UserRole2["EMPLOYE"] = "employe";
  return UserRole2;
})(UserRole || {});
var PlanType = /* @__PURE__ */ ((PlanType3) => {
  PlanType3["GRATUIT"] = "gratuit";
  PlanType3["STARTER"] = "starter";
  PlanType3["BUSINESS"] = "business";
  PlanType3["ENTERPRISE"] = "enterprise";
  return PlanType3;
})(PlanType || {});
var ContractType = /* @__PURE__ */ ((ContractType2) => {
  ContractType2["CDI"] = "CDI";
  ContractType2["CDD"] = "CDD";
  ContractType2["SIVP"] = "SIVP";
  ContractType2["KARAMA"] = "Karama";
  return ContractType2;
})(ContractType || {});
var LeaveType = /* @__PURE__ */ ((LeaveType2) => {
  LeaveType2["CONGE_PAYE"] = "conge_paye";
  LeaveType2["MALADIE"] = "maladie";
  LeaveType2["MATERNITE"] = "maternite";
  LeaveType2["PATERNITE"] = "paternite";
  LeaveType2["SANS_SOLDE"] = "sans_solde";
  LeaveType2["EXCEPTIONNEL"] = "exceptionnel";
  return LeaveType2;
})(LeaveType || {});
var PayElementType = /* @__PURE__ */ ((PayElementType3) => {
  PayElementType3["SALAIRE_BASE"] = "salaire_base";
  PayElementType3["PRIME_ANCIENNETE"] = "prime_anciennete";
  PayElementType3["PRIME_RENDEMENT"] = "prime_rendement";
  PayElementType3["PRIME_TRANSPORT"] = "prime_transport";
  PayElementType3["PRIME_PANIER"] = "prime_panier";
  PayElementType3["PRIME_REPRESENTATION"] = "prime_representation";
  PayElementType3["PRIME_BILAN"] = "prime_bilan";
  PayElementType3["INDEMNITE_DEPLACEMENT"] = "indemnite_deplacement";
  PayElementType3["INDEMNITE_NUIT"] = "indemnite_nuit";
  PayElementType3["HEURES_SUP"] = "heures_sup";
  PayElementType3["AVANTAGE_NATURE"] = "avantage_nature";
  PayElementType3["ACOMPTE"] = "acompte";
  PayElementType3["SAISIE_SALAIRE"] = "saisie_salaire";
  PayElementType3["REMBOURSEMENT"] = "remboursement";
  PayElementType3["CNSS_SALARIAL"] = "cnss_salarial";
  PayElementType3["CNSS_PATRONAL"] = "cnss_patronal";
  PayElementType3["IRPP"] = "irpp";
  PayElementType3["FOPROLOS"] = "foprolos";
  PayElementType3["TFP"] = "tfp";
  return PayElementType3;
})(PayElementType || {});
var PayPeriodStatus = /* @__PURE__ */ ((PayPeriodStatus4) => {
  PayPeriodStatus4["EN_COURS"] = "en_cours";
  PayPeriodStatus4["CALCULEE"] = "calculee";
  PayPeriodStatus4["VALIDEE"] = "validee";
  PayPeriodStatus4["FINALISEE"] = "finalisee";
  return PayPeriodStatus4;
})(PayPeriodStatus || {});
var MaritalStatus = /* @__PURE__ */ ((MaritalStatus2) => {
  MaritalStatus2["CELIBATAIRE"] = "celibataire";
  MaritalStatus2["MARIE"] = "marie";
  MaritalStatus2["DIVORCE"] = "divorce";
  MaritalStatus2["VEUF"] = "veuf";
  return MaritalStatus2;
})(MaritalStatus || {});
var SectorType = /* @__PURE__ */ ((SectorType2) => {
  SectorType2["INDUSTRIE"] = "industrie";
  SectorType2["SERVICES"] = "services";
  SectorType2["COMMERCE"] = "commerce";
  SectorType2["AGRICULTURE"] = "agriculture";
  SectorType2["BTP"] = "btp";
  SectorType2["TOURISME"] = "tourisme";
  SectorType2["SANTE"] = "sante";
  SectorType2["EDUCATION"] = "education";
  SectorType2["TRANSPORT"] = "transport";
  SectorType2["AUTRE"] = "autre";
  return SectorType2;
})(SectorType || {});
var WorkRegime = /* @__PURE__ */ ((WorkRegime2) => {
  WorkRegime2["REGIME_48H"] = "48h";
  WorkRegime2["REGIME_40H"] = "40h";
  return WorkRegime2;
})(WorkRegime || {});
var DocumentType = /* @__PURE__ */ ((DocumentType2) => {
  DocumentType2["ATTESTATION_TRAVAIL"] = "attestation_travail";
  DocumentType2["ATTESTATION_SALAIRE"] = "attestation_salaire";
  DocumentType2["ATTESTATION_CNSS"] = "attestation_cnss";
  DocumentType2["FICHE_PAIE_ANNUELLE"] = "fiche_paie_annuelle";
  DocumentType2["CERTIFICAT_TRAVAIL"] = "certificat_travail";
  return DocumentType2;
})(DocumentType || {});
var DeclarationType = /* @__PURE__ */ ((DeclarationType2) => {
  DeclarationType2["CNSS_D17"] = "cnss_d17";
  DeclarationType2["DGI_DEU"] = "dgi_deu";
  DeclarationType2["VIREMENT_BANCAIRE"] = "virement_bancaire";
  return DeclarationType2;
})(DeclarationType || {});
var DeclarationStatus = /* @__PURE__ */ ((DeclarationStatus2) => {
  DeclarationStatus2["BROUILLON"] = "brouillon";
  DeclarationStatus2["GENERE"] = "genere";
  DeclarationStatus2["SOUMIS"] = "soumis";
  return DeclarationStatus2;
})(DeclarationStatus || {});
var ReportType = /* @__PURE__ */ ((ReportType2) => {
  ReportType2["MASSE_SALARIALE"] = "masse_salariale";
  ReportType2["EFFECTIFS"] = "effectifs";
  ReportType2["CHARGES_SOCIALES"] = "charges_sociales";
  ReportType2["CONGES"] = "conges";
  ReportType2["COUT_DEPARTEMENT"] = "cout_departement";
  ReportType2["PERSONNALISE"] = "personnalise";
  return ReportType2;
})(ReportType || {});
var ApiPermission = /* @__PURE__ */ ((ApiPermission3) => {
  ApiPermission3["EMPLOYES_READ"] = "employes:read";
  ApiPermission3["EMPLOYES_WRITE"] = "employes:write";
  ApiPermission3["PAIE_READ"] = "paie:read";
  ApiPermission3["CONGES_READ"] = "conges:read";
  ApiPermission3["CONGES_WRITE"] = "conges:write";
  ApiPermission3["DASHBOARD_READ"] = "dashboard:read";
  ApiPermission3["DOCUMENTS_READ"] = "documents:read";
  return ApiPermission3;
})(ApiPermission || {});

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var JWT_COOKIE_NAME = "payrollhub_token";
var JWT_EXPIRY = "24h";
var ROLE_HIERARCHY = {
  super_external_admin: 7,
  super_admin: 6,
  admin_rh: 5,
  admin_paie: 4,
  comptable: 3,
  manager: 2,
  employe: 1
};
var PLAN_LIMITS = {
  gratuit: {
    maxEmployees: 5,
    label: "Gratuit",
    features: ["employees", "leaves"]
  },
  starter: {
    maxEmployees: 25,
    label: "Starter",
    features: ["employees", "leaves", "payroll", "documents"]
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
      "reports"
    ]
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
      "api"
    ]
  }
};
var DOCUMENT_REQUIRED_PAPERS = {
  attestation_travail: [],
  attestation_salaire: [],
  attestation_cnss: ["Copie CIN"],
  fiche_paie_annuelle: [],
  certificat_travail: ["Lettre de d\xE9mission ou document de fin de contrat"]
};

// server/models.ts
import mongoose2, { Schema } from "mongoose";
function addIdTransform(schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  });
  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  });
}
var entrepriseSchema = new Schema(
  {
    nom: { type: String, required: true },
    adresse: { type: String, required: true },
    matriculeFiscal: { type: String, required: true, unique: true, index: true },
    codeCnss: { type: String, required: true },
    secteurActivite: { type: String, enum: ["industrie", "services", "commerce", "agriculture", "btp", "tourisme", "sante", "education", "transport", "autre"], required: true },
    telephone: String,
    email: String,
    regimeTravail: { type: String, enum: ["48h", "40h"], required: true },
    // Plan system
    plan: { type: String, enum: ["gratuit", "starter", "business", "enterprise"], default: "gratuit" },
    maxEmployees: { type: Number, default: 5 },
    createdBy: { type: String, default: null }
    // super_external_admin userId
  },
  { timestamps: true }
);
addIdTransform(entrepriseSchema);
var EntrepriseModel = mongoose2.model("Entreprise", entrepriseSchema);
var utilisateurSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    motDePasseHash: { type: String, required: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "super_external_admin",
        "super_admin",
        "admin_rh",
        "admin_paie",
        "comptable",
        "manager",
        "employe"
      ],
      required: true
    },
    entrepriseId: { type: String, default: null },
    // null for super_external_admin
    employeId: String,
    actif: { type: Boolean, default: true }
  },
  { timestamps: true }
);
addIdTransform(utilisateurSchema);
var UtilisateurModel = mongoose2.model("Utilisateur", utilisateurSchema);
var employeSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    cin: { type: String, required: true },
    dateNaissance: { type: String, required: true },
    adresse: { type: String, required: true },
    telephone: String,
    email: String,
    situationFamiliale: { type: String, enum: ["celibataire", "marie", "divorce", "veuf"], required: true },
    nbEnfants: { type: Number, default: 0 },
    residenceFiscale: { type: String, required: true },
    matriculeCnss: { type: String, required: true },
    dateEmbauche: { type: String, required: true },
    dateFin: String,
    typeContrat: { type: String, enum: ["CDI", "CDD", "SIVP", "Karama"], required: true },
    categoriePro: { type: String, required: true },
    poste: { type: String, required: true },
    departement: { type: String, required: true },
    etablissement: String,
    salaireBase: { type: Number, required: true },
    iban: { type: String, required: true },
    banque: String,
    actif: { type: Boolean, default: true }
  },
  { timestamps: true }
);
addIdTransform(employeSchema);
employeSchema.index({ entrepriseId: 1, actif: 1 });
employeSchema.index({ nom: "text", prenom: "text", cin: "text", poste: "text", departement: "text" });
var EmployeModel = mongoose2.model("Employe", employeSchema);
var periodePaieSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    mois: { type: Number, required: true, min: 1, max: 12 },
    annee: { type: Number, required: true },
    dateDebut: { type: String, required: true },
    dateFin: { type: String, required: true },
    statut: {
      type: String,
      enum: ["en_cours", "calculee", "validee", "finalisee"],
      default: "en_cours"
    }
  },
  { timestamps: true }
);
addIdTransform(periodePaieSchema);
periodePaieSchema.index({ entrepriseId: 1, annee: -1, mois: -1 });
var PeriodePaieModel = mongoose2.model("PeriodePaie", periodePaieSchema);
var elementPaieSchema = new Schema({
  periodePaieId: { type: String, required: true, index: true },
  employeId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  libelle: { type: String, required: true },
  montant: { type: Number, required: true },
  estVariable: { type: Boolean, default: true },
  heures: Number,
  taux: Number
});
addIdTransform(elementPaieSchema);
var ElementPaieModel = mongoose2.model("ElementPaie", elementPaieSchema);
var bulletinPaieSchema = new Schema({
  periodePaieId: { type: String, required: true, index: true },
  employeId: { type: String, required: true, index: true },
  employe: { type: Schema.Types.Mixed, required: true },
  elements: [Schema.Types.Mixed],
  salaireBrut: { type: Number, required: true },
  cnssSalarial: { type: Number, required: true },
  cnssPatronal: { type: Number, required: true },
  salaireNetImposable: { type: Number, required: true },
  irpp: { type: Number, required: true },
  netAPayer: { type: Number, required: true },
  foprolos: { type: Number, required: true },
  tfp: { type: Number, required: true },
  coutTotalEmployeur: { type: Number, required: true },
  dateGeneration: { type: String, required: true }
});
addIdTransform(bulletinPaieSchema);
var BulletinPaieModel = mongoose2.model("BulletinPaie", bulletinPaieSchema);
var congeSchema = new Schema(
  {
    employeId: { type: String, required: true, index: true },
    typeConge: {
      type: String,
      enum: ["conge_paye", "maladie", "maternite", "paternite", "sans_solde", "exceptionnel"],
      required: true
    },
    dateDebut: { type: String, required: true },
    dateFin: { type: String, required: true },
    nbJours: { type: Number, required: true },
    statut: {
      type: String,
      enum: ["en_attente", "approuve", "rejete", "annule"],
      default: "en_attente"
    },
    motif: String,
    documentUrl: String,
    approuvePar: String,
    dateApprobation: String,
    // Uploaded supporting papers
    uploadedPapers: [
      {
        fileId: String,
        originalName: String,
        filename: String
      }
    ]
  },
  { timestamps: true }
);
addIdTransform(congeSchema);
var CongeModel = mongoose2.model("Conge", congeSchema);
var documentRHSchema = new Schema({
  employeId: { type: String, required: true, index: true },
  typeDocument: {
    type: String,
    enum: [
      "attestation_travail",
      "attestation_salaire",
      "attestation_cnss",
      "fiche_paie_annuelle",
      "certificat_travail"
    ],
    required: true
  },
  nomFichier: { type: String, required: true },
  titre: { type: String, required: true },
  dateCreation: { type: String, required: true },
  generePar: { type: String, required: true },
  entrepriseId: { type: String, required: true, index: true }
});
addIdTransform(documentRHSchema);
var DocumentRHModel = mongoose2.model("DocumentRH", documentRHSchema);
var documentRequestSchema = new Schema(
  {
    employeId: { type: String, required: true, index: true },
    entrepriseId: { type: String, required: true, index: true },
    typeDocument: {
      type: String,
      enum: [
        "attestation_travail",
        "attestation_salaire",
        "attestation_cnss",
        "fiche_paie_annuelle",
        "certificat_travail"
      ],
      required: true
    },
    statut: {
      type: String,
      enum: ["en_attente", "en_revision", "approuve", "rejete", "genere"],
      default: "en_attente"
    },
    motif: String,
    requiredPapers: [String],
    // list of required paper names
    uploadedPapers: [
      {
        fileId: String,
        originalName: String,
        filename: String,
        path: String,
        mimetype: String,
        size: Number
      }
    ],
    reviewedBy: String,
    reviewComment: String,
    dateReview: String,
    generatedDocumentId: String
    // link to DocumentRH once generated
  },
  { timestamps: true }
);
addIdTransform(documentRequestSchema);
var DocumentRequestModel = mongoose2.model("DocumentRequest", documentRequestSchema);
var uploadedFileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, required: true, index: true },
    entrepriseId: { type: String, index: true },
    category: { type: String, enum: ["paper", "document", "avatar", "other"], default: "paper" }
  },
  { timestamps: true }
);
addIdTransform(uploadedFileSchema);
var UploadedFileModel = mongoose2.model("UploadedFile", uploadedFileSchema);
var declarationSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    type: { type: String, enum: ["cnss_d17", "dgi_deu", "virement_bancaire"], required: true },
    periodeDebut: { type: String, required: true },
    periodeFin: { type: String, required: true },
    trimestre: Number,
    annee: { type: Number, required: true },
    statut: { type: String, enum: ["brouillon", "genere", "soumis"], default: "genere" },
    nomFichier: { type: String, required: true },
    nbEmployes: { type: Number, required: true },
    montantTotal: { type: Number, required: true },
    generePar: { type: String, required: true }
  },
  { timestamps: true }
);
addIdTransform(declarationSchema);
var DeclarationModel = mongoose2.model("Declaration", declarationSchema);
var reportConfigSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["masse_salariale", "effectifs", "charges_sociales", "conges", "cout_departement", "personnalise"],
      required: true
    },
    titre: { type: String, required: true },
    periodeDebut: { type: String, required: true },
    periodeFin: { type: String, required: true },
    filtres: { type: Schema.Types.Mixed },
    generePar: { type: String, required: true }
  },
  { timestamps: true }
);
addIdTransform(reportConfigSchema);
var ReportConfigModel = mongoose2.model("ReportConfig", reportConfigSchema);
var parametreSchema = new Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  valeur: { type: String, required: true },
  categorie: { type: String, required: true, index: true },
  dateDebutValidite: { type: String, required: true },
  dateFinValidite: String
});
addIdTransform(parametreSchema);
var ParametreModel = mongoose2.model("ParametreReglementaire", parametreSchema);
var notificationSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    destinataireId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    priorite: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    titre: { type: String, required: true },
    message: { type: String, required: true },
    lien: String,
    lu: { type: Boolean, default: false }
  },
  { timestamps: true }
);
addIdTransform(notificationSchema);
notificationSchema.index({ destinataireId: 1, lu: 1 });
var NotificationModel = mongoose2.model("Notification", notificationSchema);
var apiKeySchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    cle: { type: String, required: true },
    prefixe: { type: String, required: true },
    permissions: [String],
    actif: { type: Boolean, default: true },
    derniereUtilisation: String,
    limiteRequetes: { type: Number, default: 1e3 }
  },
  { timestamps: true }
);
addIdTransform(apiKeySchema);
var ApiKeyModel = mongoose2.model("ApiKey", apiKeySchema);

// server/storage.ts
var rateLimits = /* @__PURE__ */ new Map();
var MongoStorage = class {
  // ======================================================================
  // Seed â€” populate initial data if DB is empty
  // ======================================================================
  async seed() {
    const count = await EntrepriseModel.countDocuments();
    if (count > 0) {
      console.log("\xF0\u0178\u201C\xA6 Database already seeded, skipping...");
      return;
    }
    console.log("\xF0\u0178\u0152\xB1 Seeding database with initial data...");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const seaHash = await bcrypt.hash("SuperExt2025!", 10);
    await UtilisateurModel.create({
      email: "platform@payrollhub.tn",
      nom: "Platform",
      prenom: "Admin",
      role: "super_external_admin" /* SUPER_EXTERNAL_ADMIN */,
      entrepriseId: null,
      actif: true,
      motDePasseHash: seaHash
    });
    const entreprise = await EntrepriseModel.create({
      nom: "PayrollHub Demo SARL",
      adresse: "Lac 2, Tunis, Tunisie",
      matriculeFiscal: "1234567ABC",
      codeCnss: "12345678",
      secteurActivite: "services" /* SERVICES */,
      telephone: "+216 71 123 456",
      email: "contact@payrollhub-demo.tn",
      regimeTravail: "40h" /* REGIME_40H */,
      plan: "enterprise" /* ENTERPRISE */,
      maxEmployees: -1
    });
    const entrepriseId = entreprise._id.toString();
    const adminHash = await bcrypt.hash("Admin2025!", 10);
    await UtilisateurModel.create({
      email: "admin@payrollhub.tn",
      nom: "Admin",
      prenom: "Super",
      role: "super_admin" /* SUPER_ADMIN */,
      entrepriseId,
      actif: true,
      motDePasseHash: adminHash
    });
    const rhHash = await bcrypt.hash("Rh2025!", 10);
    const rhUser = await UtilisateurModel.create({
      email: "rh@payrollhub.tn",
      nom: "Ben Ali",
      prenom: "Fatma",
      role: "admin_rh" /* ADMIN_RH */,
      entrepriseId,
      actif: true,
      motDePasseHash: rhHash
    });
    const rhId = rhUser._id.toString();
    const params = [
      { nom: "SMIG_48H", description: "SMIG R\xC3\xA9gime 48h/semaine", valeur: "528.320", categorie: "smig", dateDebutValidite: "2025-01-01" },
      { nom: "SMIG_40H", description: "SMIG R\xC3\xA9gime 40h/semaine", valeur: "448.238", categorie: "smig", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_RETRAITE", description: "CNSS Salari\xC3\xA9 - Retraite & Invalidit\xC3\xA9", valeur: "4.99", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_MALADIE", description: "CNSS Salari\xC3\xA9 - Maladie & Maternit\xC3\xA9", valeur: "2.90", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_CONGE_MALADIE", description: "CNSS Salari\xC3\xA9 - Cong\xC3\xA9 de Maladie", valeur: "0.79", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_SAL_TOTAL", description: "CNSS Total Part Salariale", valeur: "9.68", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_RETRAITE", description: "CNSS Patronal - Retraite & Invalidit\xC3\xA9", valeur: "8.01", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_MALADIE", description: "CNSS Patronal - Maladie & Maternit\xC3\xA9", valeur: "4.25", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_ACCIDENT", description: "CNSS Patronal - Accidents du Travail", valeur: "0.40", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_CONGE_MALADIE", description: "CNSS Patronal - Cong\xC3\xA9 de Maladie", valeur: "0.79", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "CNSS_PAT_TOTAL", description: "CNSS Total Part Patronale", valeur: "17.07", categorie: "cnss", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_1", description: "IRPP 0 - 5 000 TND", valeur: "0", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_2", description: "IRPP 5 001 - 10 000 TND", valeur: "15.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_3", description: "IRPP 10 001 - 20 000 TND", valeur: "25.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_4", description: "IRPP 20 001 - 30 000 TND", valeur: "30.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_5", description: "IRPP 30 001 - 40 000 TND", valeur: "33.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_6", description: "IRPP 40 001 - 50 000 TND", valeur: "36.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_7", description: "IRPP 50 001 - 70 000 TND", valeur: "38.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_TRANCHE_8", description: "IRPP Au-del\xC3\xA0 de 70 000 TND", valeur: "40.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_FRAIS_PRO_TAUX", description: "Frais Professionnels (taux)", valeur: "10", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_FRAIS_PRO_PLAFOND", description: "Frais Professionnels (plafond annuel TND)", valeur: "2000", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_DEDUCTION_CHEF_FAMILLE", description: "D\xC3\xA9duction chef de famille (annuel TND)", valeur: "150", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "IRPP_DEDUCTION_ENFANT", description: "D\xC3\xA9duction par enfant (annuel TND)", valeur: "90", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "CSS_TAUX", description: "Contribution Sociale de Solidarit\xC3\xA9 (2023-2025)", valeur: "0.5", categorie: "irpp", dateDebutValidite: "2025-01-01" },
      { nom: "FOPROLOS_TAUX", description: "FOPROLOS (employeur)", valeur: "1", categorie: "autres", dateDebutValidite: "2025-01-01" },
      { nom: "TFP_INDUSTRIE", description: "TFP Secteur Industrie", valeur: "2", categorie: "autres", dateDebutValidite: "2025-01-01" },
      { nom: "TFP_SERVICES", description: "TFP Secteur Services", valeur: "1", categorie: "autres", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_25", description: "Heures suppl\xC3\xA9mentaires +25%", valeur: "25", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_50", description: "Heures suppl\xC3\xA9mentaires +50%", valeur: "50", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_75", description: "Heures suppl\xC3\xA9mentaires +75%", valeur: "75", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "HS_TAUX_NUIT", description: "Majoration travail de nuit (22h-6h)", valeur: "25", categorie: "heures_sup", dateDebutValidite: "2025-01-01" },
      { nom: "CONGE_PAYE_JOURS_AN", description: "Cong\xC3\xA9s pay\xC3\xA9s (jours/an minimum)", valeur: "12", categorie: "conges", dateDebutValidite: "2025-01-01" },
      { nom: "CONGE_MATERNITE_JOURS", description: "Cong\xC3\xA9 de maternit\xC3\xA9 (jours)", valeur: "98", categorie: "conges", dateDebutValidite: "2025-01-01" },
      { nom: "CONGE_PATERNITE_JOURS", description: "Cong\xC3\xA9 de paternit\xC3\xA9 (jours \xE2\u20AC\u201D secteur priv\xC3\xA9)", valeur: "2", categorie: "conges", dateDebutValidite: "2025-01-01" }
    ];
    await ParametreModel.insertMany(params);
    const sampleEmployees = [
      { entrepriseId, nom: "Bouazizi", prenom: "Mohamed", cin: "07123456", dateNaissance: "1990-03-15", adresse: "Rue de la Libert\xC3\xA9, Tunis", telephone: "+216 22 123 456", email: "m.bouazizi@email.tn", situationFamiliale: "marie" /* MARIE */, nbEnfants: 2, residenceFiscale: "Tunis", matriculeCnss: "CNS001234", dateEmbauche: "2020-09-01", typeContrat: "CDI" /* CDI */, categoriePro: "Cat\xC3\xA9gorie VII - Cadre", poste: "D\xC3\xA9veloppeur Senior", departement: "Informatique", salaireBase: 2500, iban: "TN59 1000 6035 1835 9847 8831", banque: "BIAT - Banque Internationale Arabe de Tunisie", actif: true },
      { entrepriseId, nom: "Trabelsi", prenom: "Amira", cin: "08234567", dateNaissance: "1988-07-22", adresse: "Avenue Habib Bourguiba, Sousse", telephone: "+216 23 234 567", email: "a.trabelsi@email.tn", situationFamiliale: "celibataire" /* CELIBATAIRE */, nbEnfants: 0, residenceFiscale: "Sousse", matriculeCnss: "CNS002345", dateEmbauche: "2019-03-15", typeContrat: "CDI" /* CDI */, categoriePro: "Cat\xC3\xA9gorie VIII - Cadre Sup\xC3\xA9rieur", poste: "Directrice Financi\xC3\xA8re", departement: "Finance et Comptabilit\xC3\xA9", salaireBase: 3800, iban: "TN59 1000 6035 1835 9847 9942", banque: "STB - Soci\xC3\xA9t\xC3\xA9 Tunisienne de Banque", actif: true },
      { entrepriseId, nom: "Jebali", prenom: "Youssef", cin: "09345678", dateNaissance: "1995-11-10", adresse: "Rue Ibn Khaldoun, Sfax", telephone: "+216 24 345 678", email: "y.jebali@email.tn", situationFamiliale: "marie" /* MARIE */, nbEnfants: 1, residenceFiscale: "Sfax", matriculeCnss: "CNS003456", dateEmbauche: "2023-01-10", typeContrat: "CDD" /* CDD */, categoriePro: "Cat\xC3\xA9gorie V - Technicien Sup\xC3\xA9rieur", poste: "Technicien Maintenance", departement: "Maintenance", salaireBase: 1200, iban: "TN59 1000 6035 1835 9847 1053", banque: "BNA - Banque Nationale Agricole", actif: true },
      { entrepriseId, nom: "Hamdi", prenom: "Salma", cin: "10456789", dateNaissance: "1997-05-28", adresse: "Avenue de la R\xC3\xA9publique, Nabeul", telephone: "+216 25 456 789", email: "s.hamdi@email.tn", situationFamiliale: "celibataire" /* CELIBATAIRE */, nbEnfants: 0, residenceFiscale: "Nabeul", matriculeCnss: "CNS004567", dateEmbauche: "2024-06-01", typeContrat: "SIVP" /* SIVP */, categoriePro: "Cat\xC3\xA9gorie IV - Technicien", poste: "Assistante RH", departement: "Ressources Humaines", salaireBase: 800, iban: "TN59 1000 6035 1835 9847 2164", banque: "Attijari Bank", actif: true },
      { entrepriseId, nom: "Chaabane", prenom: "Khalil", cin: "11567890", dateNaissance: "1985-12-03", adresse: "Rue de Marseille, Tunis", telephone: "+216 26 567 890", email: "k.chaabane@email.tn", situationFamiliale: "marie" /* MARIE */, nbEnfants: 3, residenceFiscale: "Tunis", matriculeCnss: "CNS005678", dateEmbauche: "2015-04-20", typeContrat: "CDI" /* CDI */, categoriePro: "Cat\xC3\xA9gorie IX - Directeur", poste: "Directeur Commercial", departement: "Commercial", salaireBase: 5e3, iban: "TN59 1000 6035 1835 9847 3275", banque: "Amen Bank", actif: true },
      { entrepriseId, nom: "Mejri", prenom: "Nour", cin: "12678901", dateNaissance: "1993-09-17", adresse: "Cit\xC3\xA9 El Manar, Tunis", telephone: "+216 27 678 901", email: "n.mejri@email.tn", situationFamiliale: "marie" /* MARIE */, nbEnfants: 1, residenceFiscale: "Tunis", matriculeCnss: "CNS006789", dateEmbauche: "2021-11-01", typeContrat: "CDI" /* CDI */, categoriePro: "Cat\xC3\xA9gorie VI - Agent de Ma\xC3\xAEtrise", poste: "Responsable Qualit\xC3\xA9", departement: "Qualit\xC3\xA9", salaireBase: 1800, iban: "TN59 1000 6035 1835 9847 4386", banque: "BH - Banque de l'Habitat", actif: true }
    ];
    const employees = await EmployeModel.insertMany(sampleEmployees);
    const employeeIds = employees.map((e) => e._id.toString());
    const empUserHash = await bcrypt.hash("Employe2025!", 10);
    await UtilisateurModel.create({
      email: "bouazizi@payrollhub.tn",
      nom: "Bouazizi",
      prenom: "Mohamed",
      role: "employe" /* EMPLOYE */,
      entrepriseId,
      employeId: employeeIds[0],
      actif: true,
      motDePasseHash: empUserHash
    });
    const mgrHash = await bcrypt.hash("Manager2025!", 10);
    await UtilisateurModel.create({
      email: "chaabane@payrollhub.tn",
      nom: "Chaabane",
      prenom: "Khalil",
      role: "manager" /* MANAGER */,
      entrepriseId,
      employeId: employeeIds[4],
      actif: true,
      motDePasseHash: mgrHash
    });
    await CongeModel.insertMany([
      { employeId: employeeIds[0], typeConge: "conge_paye" /* CONGE_PAYE */, dateDebut: "2026-03-10", dateFin: "2026-03-14", nbJours: 5, statut: "en_attente" /* EN_ATTENTE */, motif: "Vacances familiales" },
      { employeId: employeeIds[1], typeConge: "conge_paye" /* CONGE_PAYE */, dateDebut: "2026-02-17", dateFin: "2026-02-21", nbJours: 5, statut: "approuve" /* APPROUVE */, motif: "Cong\xC3\xA9 annuel", approuvePar: rhId, dateApprobation: "2026-02-10T09:00:00.000Z" },
      { employeId: employeeIds[2], typeConge: "maladie" /* MALADIE */, dateDebut: "2026-02-24", dateFin: "2026-02-26", nbJours: 3, statut: "en_attente" /* EN_ATTENTE */, motif: "Certificat m\xC3\xA9dical fourni" },
      { employeId: employeeIds[0], typeConge: "conge_paye" /* CONGE_PAYE */, dateDebut: "2026-01-06", dateFin: "2026-01-08", nbJours: 3, statut: "approuve" /* APPROUVE */, motif: "D\xC3\xA9m\xC3\xA9nagement", approuvePar: rhId, dateApprobation: "2025-12-28T14:00:00.000Z" },
      { employeId: employeeIds[3], typeConge: "exceptionnel" /* EXCEPTIONNEL */, dateDebut: "2026-03-01", dateFin: "2026-03-01", nbJours: 1, statut: "rejete" /* REJETE */, motif: "Rendez-vous administratif", approuvePar: rhId, dateApprobation: "2026-02-26T11:00:00.000Z" }
    ]);
    console.log("\xE2\u0153\u2026 Database seeded successfully");
  }
  // ======================================================================
  // Entreprise
  // ======================================================================
  async getEntreprises() {
    const docs = await EntrepriseModel.find().lean();
    return docs.map((d) => this.toEntreprise(d));
  }
  async getEntreprise(id) {
    try {
      const doc = await EntrepriseModel.findById(id).lean();
      return doc ? this.toEntreprise(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async getEntrepriseByMatricule(matriculeFiscal) {
    const doc = await EntrepriseModel.findOne({ matriculeFiscal }).lean();
    return doc ? this.toEntreprise(doc) : void 0;
  }
  async createEntreprise(data) {
    const planKey = data.plan || "gratuit" /* GRATUIT */;
    const maxEmp = PLAN_LIMITS[planKey]?.maxEmployees ?? 5;
    const doc = await EntrepriseModel.create({ ...data, maxEmployees: data.maxEmployees ?? maxEmp });
    return this.toEntreprise(doc.toObject());
  }
  async updateEntreprise(id, data) {
    const doc = await EntrepriseModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toEntreprise(doc) : void 0;
  }
  toEntreprise(d) {
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
      plan: d.plan || "gratuit" /* GRATUIT */,
      maxEmployees: d.maxEmployees ?? 5,
      createdBy: d.createdBy,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // Utilisateur
  // ======================================================================
  async getUtilisateurs(entrepriseId) {
    const filter = {};
    if (entrepriseId) filter.entrepriseId = entrepriseId;
    const docs = await UtilisateurModel.find(filter).lean();
    return docs.map((d) => {
      const u = this.toUser(d);
      const { motDePasseHash, ...rest } = u;
      return rest;
    });
  }
  async getUtilisateur(id) {
    try {
      const doc = await UtilisateurModel.findById(id).lean();
      return doc ? this.toUser(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async getUtilisateurByEmail(email) {
    const doc = await UtilisateurModel.findOne({ email }).lean();
    return doc ? this.toUser(doc) : void 0;
  }
  async createUtilisateur(data) {
    const doc = await UtilisateurModel.create({ ...data, actif: true });
    return this.toUser(doc.toObject());
  }
  async updateUtilisateur(id, data) {
    const doc = await UtilisateurModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toUser(doc) : void 0;
  }
  async deleteUtilisateur(id) {
    const doc = await UtilisateurModel.findByIdAndUpdate(id, { actif: false });
    return !!doc;
  }
  toUser(d) {
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
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // EmployÃ©
  // ======================================================================
  async getEmployes(entrepriseId, search) {
    const filter = { actif: true };
    if (entrepriseId) filter.entrepriseId = entrepriseId;
    if (search) {
      const s = search.toLowerCase();
      filter.$or = [
        { nom: { $regex: s, $options: "i" } },
        { prenom: { $regex: s, $options: "i" } },
        { cin: { $regex: s, $options: "i" } },
        { matriculeCnss: { $regex: s, $options: "i" } },
        { poste: { $regex: s, $options: "i" } },
        { departement: { $regex: s, $options: "i" } }
      ];
    }
    const docs = await EmployeModel.find(filter).lean();
    return docs.map((d) => this.toEmploye(d));
  }
  async getEmploye(id) {
    try {
      const doc = await EmployeModel.findById(id).lean();
      return doc ? this.toEmploye(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async createEmploye(data, entrepriseId) {
    const doc = await EmployeModel.create({ ...data, entrepriseId, actif: true });
    return this.toEmploye(doc.toObject());
  }
  async updateEmploye(id, data) {
    const doc = await EmployeModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toEmploye(doc) : void 0;
  }
  async deleteEmploye(id) {
    const doc = await EmployeModel.findByIdAndUpdate(id, { actif: false });
    return !!doc;
  }
  async countEmployes(entrepriseId) {
    return EmployeModel.countDocuments({ entrepriseId, actif: true });
  }
  toEmploye(d) {
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
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // ParamÃ¨tres RÃ©glementaires
  // ======================================================================
  async getParametres(categorie) {
    const filter = {};
    if (categorie) filter.categorie = categorie;
    const docs = await ParametreModel.find(filter).lean();
    return docs.map((d) => ({ id: (d._id || d.id)?.toString(), nom: d.nom, description: d.description, valeur: d.valeur, categorie: d.categorie, dateDebutValidite: d.dateDebutValidite, dateFinValidite: d.dateFinValidite ?? void 0 }));
  }
  async getParametre(id) {
    try {
      const doc = await ParametreModel.findById(id).lean();
      if (!doc) return void 0;
      return { id: doc._id.toString(), nom: doc.nom, description: doc.description, valeur: doc.valeur, categorie: doc.categorie, dateDebutValidite: doc.dateDebutValidite, dateFinValidite: doc.dateFinValidite ?? void 0 };
    } catch {
      return void 0;
    }
  }
  async updateParametre(id, data) {
    const doc = await ParametreModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return void 0;
    return { id: doc._id.toString(), nom: doc.nom, description: doc.description, valeur: doc.valeur, categorie: doc.categorie, dateDebutValidite: doc.dateDebutValidite, dateFinValidite: doc.dateFinValidite ?? void 0 };
  }
  // ======================================================================
  // PÃ©riodes de Paie
  // ======================================================================
  async getPeriodesPaie(entrepriseId) {
    const docs = await PeriodePaieModel.find({ entrepriseId }).sort({ annee: -1, mois: -1 }).lean();
    return docs.map((d) => this.toPeriodePaie(d));
  }
  async getPeriodePaie(id) {
    try {
      const doc = await PeriodePaieModel.findById(id).lean();
      return doc ? this.toPeriodePaie(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async getPeriodePaieByMonth(entrepriseId, mois, annee) {
    const doc = await PeriodePaieModel.findOne({ entrepriseId, mois, annee }).lean();
    return doc ? this.toPeriodePaie(doc) : void 0;
  }
  async createPeriodePaie(data) {
    const doc = await PeriodePaieModel.create({ ...data, statut: "en_cours" /* EN_COURS */ });
    return this.toPeriodePaie(doc.toObject());
  }
  async updatePeriodePaieStatut(id, statut) {
    const doc = await PeriodePaieModel.findByIdAndUpdate(id, { statut }, { new: true }).lean();
    return doc ? this.toPeriodePaie(doc) : void 0;
  }
  toPeriodePaie(d) {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      mois: d.mois,
      annee: d.annee,
      dateDebut: d.dateDebut,
      dateFin: d.dateFin,
      statut: d.statut,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // Ã‰lÃ©ments de Paie
  // ======================================================================
  async getElementsPaie(periodePaieId, employeId) {
    const filter = { periodePaieId };
    if (employeId) filter.employeId = employeId;
    const docs = await ElementPaieModel.find(filter).lean();
    return docs.map((d) => ({
      id: (d._id || d.id)?.toString(),
      periodePaieId: d.periodePaieId,
      employeId: d.employeId,
      type: d.type,
      libelle: d.libelle,
      montant: d.montant,
      estVariable: d.estVariable ?? true,
      heures: d.heures ?? void 0,
      taux: d.taux ?? void 0
    }));
  }
  async createElementPaie(data) {
    const doc = await ElementPaieModel.create(data);
    const d = doc.toObject();
    return {
      id: (d._id || d.id)?.toString(),
      periodePaieId: d.periodePaieId,
      employeId: d.employeId,
      type: d.type,
      libelle: d.libelle,
      montant: d.montant,
      estVariable: d.estVariable ?? true,
      heures: d.heures ?? void 0,
      taux: d.taux ?? void 0
    };
  }
  async deleteElementsPaie(periodePaieId, employeId) {
    const filter = { periodePaieId };
    if (employeId) filter.employeId = employeId;
    const result = await ElementPaieModel.deleteMany(filter);
    return result.deletedCount;
  }
  // ======================================================================
  // Bulletins de Paie
  // ======================================================================
  async getBulletins(periodePaieId) {
    const docs = await BulletinPaieModel.find({ periodePaieId }).lean();
    return docs.map((d) => this.toBulletin(d));
  }
  async getBulletin(id) {
    try {
      const doc = await BulletinPaieModel.findById(id).lean();
      return doc ? this.toBulletin(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async getBulletinsByEmploye(employeId) {
    const docs = await BulletinPaieModel.find({ employeId }).sort({ dateGeneration: -1 }).lean();
    return docs.map((d) => this.toBulletin(d));
  }
  async saveBulletins(bulletins) {
    for (const b of bulletins) {
      await BulletinPaieModel.findOneAndUpdate(
        { periodePaieId: b.periodePaieId, employeId: b.employeId },
        { $set: b },
        { upsert: true }
      );
    }
  }
  async deleteBulletins(periodePaieId) {
    const result = await BulletinPaieModel.deleteMany({ periodePaieId });
    return result.deletedCount;
  }
  toBulletin(d) {
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
      dateGeneration: d.dateGeneration
    };
  }
  // ======================================================================
  // CongÃ©s
  // ======================================================================
  async getConges(employeId) {
    const filter = {};
    if (employeId) filter.employeId = employeId;
    const docs = await CongeModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toConge(d));
  }
  async getCongesByEntreprise(entrepriseId) {
    const empIds = (await EmployeModel.find({ entrepriseId, actif: true }, "_id").lean()).map((e) => e._id.toString());
    const docs = await CongeModel.find({ employeId: { $in: empIds } }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toConge(d));
  }
  async getConge(id) {
    try {
      const doc = await CongeModel.findById(id).lean();
      return doc ? this.toConge(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async createConge(data) {
    const doc = await CongeModel.create({ ...data, statut: "en_attente" /* EN_ATTENTE */ });
    return this.toConge(doc.toObject());
  }
  async updateCongeStatut(id, statut, approuvePar) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const update = { statut };
    if (statut === "approuve" /* APPROUVE */ || statut === "rejete" /* REJETE */) {
      update.approuvePar = approuvePar;
      update.dateApprobation = now;
    }
    const doc = await CongeModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    return doc ? this.toConge(doc) : void 0;
  }
  async deleteConge(id) {
    const result = await CongeModel.findByIdAndDelete(id);
    return !!result;
  }
  async getLeaveBalance(employeId, year) {
    const param = await ParametreModel.findOne({ nom: "CONGE_PAYE_JOURS_AN" }).lean();
    const droitAnnuel = param ? parseFloat(param.valeur) : 12;
    const leaves = await CongeModel.find({
      employeId,
      typeConge: "conge_paye",
      dateDebut: { $regex: `^${year}` }
    }).lean();
    const consomme = leaves.filter((c) => c.statut === "approuve" /* APPROUVE */).reduce((s, c) => s + c.nbJours, 0);
    const enAttente = leaves.filter((c) => c.statut === "en_attente" /* EN_ATTENTE */).reduce((s, c) => s + c.nbJours, 0);
    return { droitAnnuel, consomme, enAttente, solde: droitAnnuel - consomme };
  }
  toConge(d) {
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
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // Documents RH
  // ======================================================================
  async getDocuments(entrepriseId) {
    const docs = await DocumentRHModel.find({ entrepriseId }).sort({ dateCreation: -1 }).lean();
    return docs.map((d) => this.toDocument(d));
  }
  async getDocumentsByEmploye(employeId) {
    const docs = await DocumentRHModel.find({ employeId }).sort({ dateCreation: -1 }).lean();
    return docs.map((d) => this.toDocument(d));
  }
  async getDocument(id) {
    try {
      const doc = await DocumentRHModel.findById(id).lean();
      return doc ? this.toDocument(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async createDocument(data) {
    const doc = await DocumentRHModel.create({ ...data, dateCreation: (/* @__PURE__ */ new Date()).toISOString() });
    return this.toDocument(doc.toObject());
  }
  async deleteDocument(id) {
    const result = await DocumentRHModel.findByIdAndDelete(id);
    return !!result;
  }
  toDocument(d) {
    return {
      id: (d._id || d.id)?.toString(),
      employeId: d.employeId,
      typeDocument: d.typeDocument,
      nomFichier: d.nomFichier,
      titre: d.titre,
      dateCreation: d.dateCreation,
      generePar: d.generePar,
      entrepriseId: d.entrepriseId
    };
  }
  // ======================================================================
  // Document Requests (NEW)
  // ======================================================================
  async getDocumentRequests(entrepriseId) {
    const docs = await DocumentRequestModel.find({ entrepriseId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toDocumentRequest(d));
  }
  async getDocumentRequestsByEmploye(employeId) {
    const docs = await DocumentRequestModel.find({ employeId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toDocumentRequest(d));
  }
  async getDocumentRequest(id) {
    try {
      const doc = await DocumentRequestModel.findById(id).lean();
      return doc ? this.toDocumentRequest(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async createDocumentRequest(data) {
    const doc = await DocumentRequestModel.create({ ...data, statut: "en_attente" });
    return this.toDocumentRequest(doc.toObject());
  }
  async updateDocumentRequest(id, data) {
    const doc = await DocumentRequestModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toDocumentRequest(doc) : void 0;
  }
  async deleteDocumentRequest(id) {
    const result = await DocumentRequestModel.findByIdAndDelete(id);
    return !!result;
  }
  toDocumentRequest(d) {
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
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // Declarations
  // ======================================================================
  async getDeclarations(entrepriseId) {
    const docs = await DeclarationModel.find({ entrepriseId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toDeclaration(d));
  }
  async getDeclaration(id) {
    try {
      const doc = await DeclarationModel.findById(id).lean();
      return doc ? this.toDeclaration(doc) : void 0;
    } catch {
      return void 0;
    }
  }
  async createDeclaration(data) {
    const doc = await DeclarationModel.create({ ...data, statut: "genere" /* GENERE */ });
    return this.toDeclaration(doc.toObject());
  }
  async updateDeclarationStatut(id, statut) {
    const doc = await DeclarationModel.findByIdAndUpdate(id, { statut }, { new: true }).lean();
    return doc ? this.toDeclaration(doc) : void 0;
  }
  async deleteDeclaration(id) {
    const result = await DeclarationModel.findByIdAndDelete(id);
    return !!result;
  }
  toDeclaration(d) {
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
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // Reports
  // ======================================================================
  async getReports(entrepriseId) {
    const docs = await ReportConfigModel.find({ entrepriseId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => ({
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      type: d.type,
      titre: d.titre,
      periodeDebut: d.periodeDebut,
      periodeFin: d.periodeFin,
      filtres: d.filtres,
      generePar: d.generePar,
      createdAt: String(d.createdAt ? d.createdAt.toISOString?.() ?? d.createdAt : (/* @__PURE__ */ new Date()).toISOString())
    }));
  }
  async getReport(id) {
    try {
      const doc = await ReportConfigModel.findById(id).lean();
      if (!doc) return void 0;
      return {
        id: (doc._id || doc.id)?.toString(),
        entrepriseId: doc.entrepriseId,
        type: doc.type,
        titre: doc.titre,
        periodeDebut: doc.periodeDebut,
        periodeFin: doc.periodeFin,
        filtres: doc.filtres,
        generePar: doc.generePar,
        createdAt: String(doc.createdAt ? doc.createdAt.toISOString?.() ?? doc.createdAt : (/* @__PURE__ */ new Date()).toISOString())
      };
    } catch {
      return void 0;
    }
  }
  async createReport(data) {
    const doc = await ReportConfigModel.create(data);
    const d = doc.toObject();
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      type: d.type,
      titre: d.titre,
      periodeDebut: d.periodeDebut,
      periodeFin: d.periodeFin,
      filtres: d.filtres,
      generePar: d.generePar,
      createdAt: String(d.createdAt ? d.createdAt.toISOString?.() ?? d.createdAt : (/* @__PURE__ */ new Date()).toISOString())
    };
  }
  async deleteReport(id) {
    const result = await ReportConfigModel.findByIdAndDelete(id);
    return !!result;
  }
  // ======================================================================
  // Dashboard Stats
  // ======================================================================
  async getDashboardStats(entrepriseId) {
    const emps = await this.getEmployes(entrepriseId);
    const contratsActifs = emps.filter((e) => e.actif).length;
    const congesEnAttente = await CongeModel.countDocuments({ statut: "en_attente" /* EN_ATTENTE */ });
    const deptMap = /* @__PURE__ */ new Map();
    for (const e of emps) deptMap.set(e.departement, (deptMap.get(e.departement) || 0) + 1);
    const employesParDepartement = Array.from(deptMap.entries()).map(([departement, count]) => ({ departement, count }));
    const contratMap = /* @__PURE__ */ new Map();
    for (const e of emps) contratMap.set(e.typeContrat, (contratMap.get(e.typeContrat) || 0) + 1);
    const employesParContrat = Array.from(contratMap.entries()).map(([type, count]) => ({ type, count }));
    const masseSalariale = emps.reduce((sum, e) => sum + e.salaireBase, 0);
    const months = ["Jan", "F\xC3\xA9v", "Mar", "Avr", "Mai", "Jun", "Jul", "Ao\xC3\xBB", "Sep", "Oct", "Nov", "D\xC3\xA9c"];
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
    const evolutionMasseSalariale = months.slice(0, currentMonth + 1).map((mois, i) => ({
      mois,
      montant: masseSalariale * (0.92 + i * 8e-3 + Math.random() * 0.02)
    }));
    const periodes = await this.getPeriodesPaie(entrepriseId);
    let payroll = void 0;
    if (periodes.length > 0) {
      const sorted = [...periodes].sort((a, b) => a.annee !== b.annee ? b.annee - a.annee : b.mois - a.mois);
      const latest = sorted[0];
      const latestBulletins = await this.getBulletins(latest.id);
      const totalBrut = latestBulletins.reduce((s, b) => s + b.salaireBrut, 0);
      const totalNet = latestBulletins.reduce((s, b) => s + b.netAPayer, 0);
      const totalCnss = latestBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
      const totalIrpp = latestBulletins.reduce((s, b) => s + b.irpp, 0);
      const coutEmployeur = latestBulletins.reduce((s, b) => s + b.coutTotalEmployeur, 0);
      const periodesCalculees = periodes.filter((p) => p.statut !== "en_cours" /* EN_COURS */).length;
      const periodesFinalisees = periodes.filter((p) => p.statut === "finalisee" /* FINALISEE */).length;
      const evolutionPayroll = [];
      for (const p of sorted.reverse()) {
        const buls = await this.getBulletins(p.id);
        evolutionPayroll.push({
          mois: `${months[p.mois - 1]} ${p.annee}`,
          brut: buls.reduce((s, b) => s + b.salaireBrut, 0),
          net: buls.reduce((s, b) => s + b.netAPayer, 0),
          coutEmployeur: buls.reduce((s, b) => s + b.coutTotalEmployeur, 0)
        });
      }
      payroll = { dernierePeriode: `${months[latest.mois - 1]} ${latest.annee}`, totalBrut, totalNet, totalCnss, totalIrpp, coutEmployeur, periodesCalculees, periodesFinalisees, evolutionPayroll };
    }
    const now2 = /* @__PURE__ */ new Date();
    const turnover = months.map((mois, idx) => {
      const entrees = emps.filter((e) => {
        const d = new Date(e.dateEmbauche);
        return d.getMonth() === idx && d.getFullYear() === now2.getFullYear();
      }).length;
      const sorties = emps.filter((e) => {
        if (!e.dateFin) return false;
        const d = new Date(e.dateFin);
        return d.getMonth() === idx && d.getFullYear() === now2.getFullYear();
      }).length;
      return { mois, entrees, sorties };
    }).slice(0, currentMonth + 1);
    const allConges = await this.getCongesByEntreprise(entrepriseId);
    const deptLeaves = /* @__PURE__ */ new Map();
    for (const e of emps) {
      if (!deptLeaves.has(e.departement)) deptLeaves.set(e.departement, { total: 0, jours: 0 });
      const dl = deptLeaves.get(e.departement);
      dl.total++;
      const empLeaves = allConges.filter((c) => c.employeId === e.id && c.statut === "approuve" /* APPROUVE */);
      dl.jours += empLeaves.reduce((s, c) => s + c.nbJours, 0);
    }
    const absenteisme = Array.from(deptLeaves.entries()).map(([departement, d]) => ({
      departement,
      taux: d.total > 0 ? Math.round(d.jours / (d.total * 22) * 100 * 10) / 10 : 0
    }));
    const coutParDepartement = Array.from(deptMap.entries()).map(([departement]) => {
      const deptEmps = emps.filter((e) => e.departement === departement);
      const brut = deptEmps.reduce((s, e) => s + e.salaireBase, 0);
      const charges = brut * 0.2807;
      return { departement, brut, charges, total: brut + charges };
    });
    const salairesTranches = [
      { min: 0, max: 500, label: "< 500" },
      { min: 500, max: 1e3, label: "500-1000" },
      { min: 1e3, max: 2e3, label: "1000-2000" },
      { min: 2e3, max: 3e3, label: "2000-3000" },
      { min: 3e3, max: 5e3, label: "3000-5000" },
      { min: 5e3, max: Infinity, label: "> 5000" }
    ];
    const repartitionSalaires = salairesTranches.map((t) => ({
      tranche: t.label,
      count: emps.filter((e) => e.salaireBase >= t.min && e.salaireBase < t.max).length
    }));
    const anciennete = [
      { min: 0, max: 1, label: "< 1 an" },
      { min: 1, max: 3, label: "1-3 ans" },
      { min: 3, max: 5, label: "3-5 ans" },
      { min: 5, max: 10, label: "5-10 ans" },
      { min: 10, max: Infinity, label: "> 10 ans" }
    ];
    const ancienneteDistribution = anciennete.map((t) => ({
      tranche: t.label,
      count: emps.filter((e) => {
        const years = (now2.getTime() - new Date(e.dateEmbauche).getTime()) / (365.25 * 24 * 60 * 60 * 1e3);
        return years >= t.min && years < t.max;
      }).length
    }));
    const docsGen = await DocumentRHModel.countDocuments({ entrepriseId });
    const declEnAttente = await DeclarationModel.countDocuments({ entrepriseId, statut: "genere" /* GENERE */ });
    return {
      totalEmployes: emps.length,
      contratsActifs,
      congesEnAttente,
      masseSalariale,
      employesParDepartement,
      employesParContrat,
      evolutionMasseSalariale,
      payroll,
      analytics: { turnover, absenteisme, coutParDepartement, repartitionSalaires, ancienneteDistribution, documentsGeneres: docsGen, declarationsEnAttente: declEnAttente }
    };
  }
  // Cache delegates (simple pass-through, no in-memory cache with MongoDB)
  async getCachedDashboardStats(entrepriseId) {
    return this.getDashboardStats(entrepriseId);
  }
  invalidateCache(_pattern) {
  }
  // ======================================================================
  // Notifications
  // ======================================================================
  async getNotifications(userId) {
    const docs = await NotificationModel.find({ destinataireId: userId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => this.toNotification(d));
  }
  async getUnreadCount(userId) {
    return NotificationModel.countDocuments({ destinataireId: userId, lu: false });
  }
  async createNotification(data) {
    const doc = await NotificationModel.create({ ...data, lu: false });
    return this.toNotification(doc.toObject());
  }
  async markNotificationRead(id, userId) {
    const result = await NotificationModel.findOneAndUpdate({ _id: id, destinataireId: userId }, { lu: true });
    return !!result;
  }
  async markAllNotificationsRead(userId) {
    const result = await NotificationModel.updateMany({ destinataireId: userId, lu: false }, { lu: true });
    return result.modifiedCount;
  }
  async deleteNotification(id, userId) {
    const result = await NotificationModel.findOneAndDelete({ _id: id, destinataireId: userId });
    return !!result;
  }
  async broadcastNotification(entrepriseId, minRole, data) {
    const roleLevel = {
      super_external_admin: 7,
      super_admin: 6,
      admin_rh: 5,
      admin_paie: 4,
      comptable: 3,
      manager: 2,
      employe: 1
    };
    const minLevel = roleLevel[minRole] || 0;
    const users = await UtilisateurModel.find({
      entrepriseId,
      actif: true
    }).lean();
    const filtered = users.filter((u) => (roleLevel[u.role] || 0) >= minLevel);
    const notifications = [];
    for (const u of filtered) {
      const n = await this.createNotification({ ...data, entrepriseId, destinataireId: u._id.toString() });
      notifications.push(n);
    }
    return notifications;
  }
  toNotification(d) {
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
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ======================================================================
  // API Keys
  // ======================================================================
  async getApiKeys(entrepriseId) {
    const docs = await ApiKeyModel.find({ entrepriseId }).lean();
    return docs.map((d) => {
      const k = this.toApiKey(d);
      const { cle, ...rest } = k;
      return rest;
    });
  }
  async getApiKeyByRaw(rawKey) {
    const doc = await ApiKeyModel.findOne({ cle: rawKey, actif: true }).lean();
    return doc ? this.toApiKey(doc) : void 0;
  }
  async createApiKey(data) {
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
      limiteRequetes: data.limiteRequetes
    });
    const key = this.toApiKey(doc.toObject());
    const { cle, ...safe } = key;
    return { apiKey: safe, rawKey };
  }
  async updateApiKeyLastUsed(id) {
    await ApiKeyModel.findByIdAndUpdate(id, { derniereUtilisation: (/* @__PURE__ */ new Date()).toISOString() });
  }
  async toggleApiKey(id, entrepriseId) {
    const doc = await ApiKeyModel.findOne({ _id: id, entrepriseId }).lean();
    if (!doc) return void 0;
    const updated = await ApiKeyModel.findByIdAndUpdate(id, { actif: !doc.actif }, { new: true }).lean();
    if (!updated) return void 0;
    const k = this.toApiKey(updated);
    const { cle, ...safe } = k;
    return safe;
  }
  async deleteApiKey(id, entrepriseId) {
    const result = await ApiKeyModel.findOneAndDelete({ _id: id, entrepriseId });
    return !!result;
  }
  // Rate limiting (kept in-memory)
  checkRateLimit(keyId, limit) {
    const now = Date.now();
    let entry = rateLimits.get(keyId);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 36e5 };
      rateLimits.set(keyId, entry);
    }
    entry.count++;
    const remaining = Math.max(0, limit - entry.count);
    return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
  }
  toApiKey(d) {
    return {
      id: (d._id || d.id)?.toString(),
      entrepriseId: d.entrepriseId,
      nom: d.nom,
      cle: d.cle,
      prefixe: d.prefixe,
      permissions: d.permissions,
      actif: d.actif,
      derniereUtilisation: d.derniereUtilisation,
      limiteRequetes: d.limiteRequetes,
      createdAt: d.createdAt?.toISOString?.() || d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: d.updatedAt?.toISOString?.() || d.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var storage = new MongoStorage();

// server/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";

// shared/schema.ts
import { z } from "zod";
var loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caract\xE8res")
});
var signupSchema = z.object({
  // Admin info
  adminNom: z.string().min(2, "Le nom est requis"),
  adminPrenom: z.string().min(2, "Le pr\xE9nom est requis"),
  adminEmail: z.string().email("Adresse email invalide"),
  adminPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res"),
  // Company info
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  matriculeFiscal: z.string().min(5, "Le matricule fiscal est requis"),
  codeCnss: z.string().min(5, "Le code CNSS est requis"),
  adresse: z.string().min(5, "L'adresse est requise"),
  secteurActivite: z.nativeEnum(SectorType),
  regimeTravail: z.nativeEnum(WorkRegime),
  telephone: z.string().optional().or(z.literal("")),
  plan: z.nativeEnum(PlanType)
});
var createUtilisateurSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res"),
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le pr\xE9nom est requis"),
  role: z.nativeEnum(UserRole),
  employeId: z.string().optional()
});
var createEntrepriseSchema = z.object({
  nom: z.string().min(2, "Le nom de l'entreprise est requis"),
  adresse: z.string().min(5, "L'adresse est requise"),
  matriculeFiscal: z.string().min(5, "Le matricule fiscal est requis"),
  codeCnss: z.string().min(5, "Le code CNSS est requis"),
  secteurActivite: z.nativeEnum(SectorType),
  telephone: z.string().optional(),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  regimeTravail: z.nativeEnum(WorkRegime),
  plan: z.nativeEnum(PlanType).optional()
});
var createEmployeSchema = z.object({
  // Personal information
  nom: z.string().min(2, "Le nom est requis"),
  prenom: z.string().min(2, "Le pr\xE9nom est requis"),
  cin: z.string().min(8, "Le CIN doit contenir 8 caract\xE8res").max(8, "Le CIN doit contenir 8 caract\xE8res"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  adresse: z.string().min(5, "L'adresse est requise"),
  telephone: z.string().optional().or(z.literal("")),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  situationFamiliale: z.nativeEnum(MaritalStatus),
  nbEnfants: z.number().min(0, "Nombre invalide").max(20),
  residenceFiscale: z.string().min(2, "La r\xE9sidence fiscale est requise"),
  // Employment information
  matriculeCnss: z.string().min(5, "Le matricule CNSS est requis"),
  dateEmbauche: z.string().min(1, "La date d'embauche est requise"),
  typeContrat: z.nativeEnum(ContractType),
  categoriePro: z.string().min(1, "La cat\xE9gorie professionnelle est requise"),
  poste: z.string().min(2, "Le poste est requis"),
  departement: z.string().min(2, "Le d\xE9partement est requis"),
  etablissement: z.string().optional().or(z.literal("")),
  // Financial information
  salaireBase: z.number().min(0, "Le salaire doit \xEAtre positif"),
  iban: z.string().min(10, "L'IBAN est requis"),
  banque: z.string().optional().or(z.literal(""))
});
var updateEmployeSchema = createEmployeSchema.partial();
var updateParametreSchema = z.object({
  valeur: z.string().min(1, "La valeur est requise"),
  dateDebutValidite: z.string().optional(),
  dateFinValidite: z.string().optional()
});
var createPeriodePaieSchema = z.object({
  mois: z.number().min(1).max(12),
  annee: z.number().min(2020).max(2100),
  dateDebut: z.string().min(1, "La date de d\xE9but est requise"),
  dateFin: z.string().min(1, "La date de fin est requise")
});
var createElementPaieSchema = z.object({
  employeId: z.string().min(1, "L'employ\xE9 est requis"),
  type: z.nativeEnum(PayElementType),
  libelle: z.string().min(1, "Le libell\xE9 est requis"),
  montant: z.number().min(0, "Le montant doit \xEAtre positif"),
  heures: z.number().min(0).optional(),
  taux: z.number().min(0).optional()
});
var batchElementsPaieSchema = z.object({
  periodePaieId: z.string().min(1),
  elements: z.array(createElementPaieSchema)
});
var createCongeSchema = z.object({
  employeId: z.string().min(1, "L'employ\xE9 est requis"),
  typeConge: z.nativeEnum(LeaveType),
  dateDebut: z.string().min(1, "La date de d\xE9but est requise"),
  dateFin: z.string().min(1, "La date de fin est requise"),
  nbJours: z.number().min(0.5, "Le nombre de jours doit \xEAtre au moins 0.5"),
  motif: z.string().optional().or(z.literal(""))
});
var updateCongeStatutSchema = z.object({
  statut: z.enum(["approuve", "rejete", "annule"]),
  motifRefus: z.string().optional()
});
var generateDocumentSchema = z.object({
  employeId: z.string().min(1, "L'employ\xE9 est requis"),
  typeDocument: z.nativeEnum(DocumentType),
  annee: z.number().min(2020).max(2100).optional()
});
var generateDeclarationSchema = z.object({
  type: z.nativeEnum(DeclarationType),
  trimestre: z.number().min(1).max(4).optional(),
  annee: z.number().min(2020).max(2100),
  periodeDebut: z.string().min(1, "La date de d\xE9but est requise"),
  periodeFin: z.string().min(1, "La date de fin est requise")
});
var generateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  titre: z.string().min(1, "Le titre est requis"),
  periodeDebut: z.string().min(1, "La date de d\xE9but est requise"),
  periodeFin: z.string().min(1, "La date de fin est requise"),
  filtres: z.record(z.string(), z.string()).optional()
});
var createApiKeySchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  permissions: z.array(z.nativeEnum(ApiPermission)).min(1, "Au moins une permission requise"),
  limiteRequetes: z.number().min(10).max(1e4).default(1e3)
});
var createCompanyWithAdminSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  adresse: z.string().min(5, "L'adresse est requise"),
  matriculeFiscal: z.string().min(5, "Le matricule fiscal est requis"),
  codeCnss: z.string().min(5, "Le code CNSS est requis"),
  secteurActivite: z.nativeEnum(SectorType),
  telephone: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal("")),
  regimeTravail: z.nativeEnum(WorkRegime),
  plan: z.nativeEnum(PlanType),
  adminEmail: z.string().email("Email admin invalide"),
  adminPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res"),
  adminNom: z.string().min(2, "Le nom est requis"),
  adminPrenom: z.string().min(2, "Le pr\xE9nom est requis")
});
var createDocumentRequestSchema = z.object({
  typeDocument: z.nativeEnum(DocumentType),
  motif: z.string().optional().or(z.literal(""))
});
var reviewDocumentRequestSchema = z.object({
  statut: z.enum(["approuve", "rejete"]),
  reviewComment: z.string().optional().or(z.literal(""))
});

// server/auth.ts
var JWT_SECRET = process.env.JWT_SECRET || "payrollhub-secret-key-2025-change-in-production";
function requireAuth(req, res, next) {
  const token = req.cookies?.[JWT_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, error: "Non authentifi\xE9" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: "Token invalide ou expir\xE9"
    });
  }
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Non authentifi\xE9"
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Acc\xE8s refus\xE9. R\xF4le insuffisant."
      });
    }
    next();
  };
}
function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Non authentifi\xE9"
      });
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: "Acc\xE8s refus\xE9. Niveau d'autorisation insuffisant."
      });
    }
    next();
  };
}
var authRouter = Router();
authRouter.post("/signup", async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", ")
      });
    }
    const d = parsed.data;
    const existing = await storage.getUtilisateurByEmail(d.adminEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Un compte avec cet email existe d\xE9j\xE0"
      });
    }
    const existingCompany = await storage.getEntrepriseByMatricule(
      d.matriculeFiscal
    );
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        error: "Une entreprise avec ce matricule fiscal existe d\xE9j\xE0"
      });
    }
    const planConfig = PLAN_LIMITS[d.plan] || PLAN_LIMITS.gratuit;
    const company = await storage.createEntreprise({
      nom: d.companyName,
      adresse: d.adresse,
      matriculeFiscal: d.matriculeFiscal,
      codeCnss: d.codeCnss,
      secteurActivite: d.secteurActivite,
      telephone: d.telephone,
      regimeTravail: d.regimeTravail,
      plan: d.plan,
      maxEmployees: planConfig.maxEmployees
    });
    const motDePasseHash = await bcrypt2.hash(d.adminPassword, 10);
    const user = await storage.createUtilisateur({
      email: d.adminEmail,
      motDePasseHash,
      nom: d.adminNom,
      prenom: d.adminPrenom,
      role: "super_admin",
      entrepriseId: company.id
    });
    const tokenPayload = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      entrepriseId: user.entrepriseId
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.cookie(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1e3,
      path: "/"
    });
    const { motDePasseHash: _, ...userData } = user;
    return res.status(201).json({
      success: true,
      data: { user: userData, token, company }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur"
    });
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        error: "Email et mot de passe requis"
      });
    }
    const user = await storage.getUtilisateurByEmail(email);
    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect"
      });
    }
    const isValid = await bcrypt2.compare(motDePasse, user.motDePasseHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect"
      });
    }
    const tokenPayload = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      entrepriseId: user.entrepriseId
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.cookie(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1e3,
      // 24h
      path: "/"
    });
    const { motDePasseHash, ...userData } = user;
    return res.json({
      success: true,
      data: { user: userData, token }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur"
    });
  }
});
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, { path: "/" });
  return res.json({
    success: true,
    message: "D\xE9connexion r\xE9ussie"
  });
});
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await storage.getUtilisateur(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Utilisateur non trouv\xE9"
    });
  }
  const { motDePasseHash, ...userData } = user;
  return res.json({ success: true, data: userData });
});

// server/routes/employees.ts
import { Router as Router2 } from "express";
import bcrypt3 from "bcryptjs";

// server/notification-service.ts
var notificationService = {
  // Leave requested — notify managers & RH
  async onLeaveRequested(entrepriseId, employeNom, typeConge, dateDebut, dateFin) {
    await storage.broadcastNotification(entrepriseId, "manager" /* MANAGER */, {
      type: "conge_demande" /* CONGE_DEMANDE */,
      priorite: "medium" /* MEDIUM */,
      titre: "Nouvelle demande de cong\xE9",
      message: `${employeNom} a demand\xE9 un cong\xE9 (${typeConge}) du ${dateDebut} au ${dateFin}.`,
      lien: "/app/conges"
    });
  },
  // Leave approved/rejected — notify the employee
  async onLeaveDecision(entrepriseId, employeUserId, statut, typeConge) {
    if (!employeUserId) return;
    const type = statut === "approuve" ? "conge_approuve" /* CONGE_APPROUVE */ : "conge_rejete" /* CONGE_REJETE */;
    const statusLabel = statut === "approuve" ? "approuv\xE9" : "rejet\xE9";
    await storage.createNotification({
      entrepriseId,
      destinataireId: employeUserId,
      type,
      priorite: "high" /* HIGH */,
      titre: `Cong\xE9 ${statusLabel}`,
      message: `Votre demande de cong\xE9 (${typeConge}) a \xE9t\xE9 ${statusLabel}.`,
      lien: "/app/mon-espace"
    });
  },
  // Payroll calculated — notify RH & admin paie
  async onPayrollCalculated(entrepriseId, periodeLabel) {
    await storage.broadcastNotification(entrepriseId, "admin_paie" /* ADMIN_PAIE */, {
      type: "paie_calculee" /* PAIE_CALCULEE */,
      priorite: "medium" /* MEDIUM */,
      titre: "Paie calcul\xE9e",
      message: `Les bulletins de paie pour ${periodeLabel} ont \xE9t\xE9 calcul\xE9s.`,
      lien: "/app/paie"
    });
  },
  // Payroll validated — notify comptable+
  async onPayrollValidated(entrepriseId, periodeLabel) {
    await storage.broadcastNotification(entrepriseId, "comptable" /* COMPTABLE */, {
      type: "paie_validee" /* PAIE_VALIDEE */,
      priorite: "high" /* HIGH */,
      titre: "Paie valid\xE9e",
      message: `La paie ${periodeLabel} a \xE9t\xE9 valid\xE9e et est pr\xEAte pour finalisation.`,
      lien: "/app/paie"
    });
  },
  // Payroll finalized — notify all employees
  async onPayrollFinalized(entrepriseId, periodeLabel) {
    await storage.broadcastNotification(entrepriseId, "employe" /* EMPLOYE */, {
      type: "paie_finalisee" /* PAIE_FINALISEE */,
      priorite: "high" /* HIGH */,
      titre: "Bulletins de paie disponibles",
      message: `Les bulletins de paie de ${periodeLabel} sont disponibles dans votre espace.`,
      lien: "/app/mon-espace"
    });
  },
  // Document generated — notify the employee
  async onDocumentGenerated(entrepriseId, employeUserId, docType) {
    if (!employeUserId) return;
    await storage.createNotification({
      entrepriseId,
      destinataireId: employeUserId,
      type: "document_genere" /* DOCUMENT_GENERE */,
      priorite: "low" /* LOW */,
      titre: "Document g\xE9n\xE9r\xE9",
      message: `Un document (${docType}) a \xE9t\xE9 g\xE9n\xE9r\xE9 pour vous.`,
      lien: "/app/mon-espace"
    });
  },
  // Declaration generated — notify admin_paie+
  async onDeclarationGenerated(entrepriseId, declType) {
    await storage.broadcastNotification(entrepriseId, "admin_paie" /* ADMIN_PAIE */, {
      type: "declaration_generee" /* DECLARATION_GENEREE */,
      priorite: "medium" /* MEDIUM */,
      titre: "D\xE9claration g\xE9n\xE9r\xE9e",
      message: `Une d\xE9claration ${declType} a \xE9t\xE9 g\xE9n\xE9r\xE9e et est pr\xEAte pour soumission.`,
      lien: "/app/declarations"
    });
  },
  // Employee created — notify RH
  async onEmployeeCreated(entrepriseId, employeNom) {
    await storage.broadcastNotification(entrepriseId, "admin_rh" /* ADMIN_RH */, {
      type: "employe_cree" /* EMPLOYE_CREE */,
      priorite: "low" /* LOW */,
      titre: "Nouvel employ\xE9",
      message: `${employeNom} a \xE9t\xE9 ajout\xE9 \xE0 l'effectif.`,
      lien: "/app/employes"
    });
  },
  // Contract expiry alert (scheduled)
  async onContractExpiring(entrepriseId, employeNom, dateFin) {
    await storage.broadcastNotification(entrepriseId, "admin_rh" /* ADMIN_RH */, {
      type: "contrat_expiration" /* CONTRAT_EXPIRATION */,
      priorite: "urgent" /* URGENT */,
      titre: "Contrat en expiration",
      message: `Le contrat de ${employeNom} expire le ${dateFin}. Action requise.`,
      lien: "/app/employes"
    });
  },
  // System alert
  async systemAlert(entrepriseId, message) {
    await storage.broadcastNotification(entrepriseId, "admin_rh" /* ADMIN_RH */, {
      type: "alerte_systeme" /* ALERTE_SYSTEME */,
      priorite: "high" /* HIGH */,
      titre: "Alerte syst\xE8me",
      message
    });
  }
};

// server/routes/employees.ts
var employeesRouter = Router2();
employeesRouter.use(requireAuth);
employeesRouter.get("/", async (req, res) => {
  const { search, page = "1", pageSize = "20" } = req.query;
  const emps = await storage.getEmployes(
    req.user.entrepriseId,
    search
  );
  const p = parseInt(page, 10);
  const ps = parseInt(pageSize, 10);
  const start = (p - 1) * ps;
  const items = emps.slice(start, start + ps);
  return res.json({
    success: true,
    data: {
      items,
      total: emps.length,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(emps.length / ps)
    }
  });
});
employeesRouter.get("/:id/contracts", async (req, res) => {
  const emp = await storage.getEmploye(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employ\xE9 non trouv\xE9" });
  }
  const contract = {
    id: `contract-${emp.id}`,
    employeId: emp.id,
    typeContrat: emp.typeContrat,
    dateDebut: emp.dateEmbauche,
    dateFin: emp.dateFin || null,
    categoriePro: emp.categoriePro,
    poste: emp.poste,
    departement: emp.departement,
    salaireBase: emp.salaireBase,
    actif: emp.actif
  };
  return res.json({ success: true, data: [contract] });
});
employeesRouter.get("/:id", async (req, res) => {
  const emp = await storage.getEmploye(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employ\xE9 non trouv\xE9" });
  }
  return res.json({ success: true, data: emp });
});
employeesRouter.post(
  "/",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    try {
      const entreprise = await storage.getEntreprise(req.user.entrepriseId);
      if (entreprise) {
        const currentCount = await storage.countEmployes(
          req.user.entrepriseId
        );
        const maxAllowed = entreprise.maxEmployees ?? PLAN_LIMITS[entreprise.plan]?.maxEmployees ?? 5;
        if (maxAllowed !== -1 && currentCount >= maxAllowed) {
          return res.status(403).json({
            success: false,
            error: `Limite du plan atteinte (${maxAllowed} employ\xE9s max pour le plan ${entreprise.plan}). Veuillez upgrader votre plan.`
          });
        }
      }
      const {
        createAccount,
        accountEmail,
        accountPassword,
        accountRole,
        ...employeeData
      } = req.body;
      const emp = await storage.createEmploye(
        employeeData,
        req.user.entrepriseId
      );
      let linkedUser = null;
      if (createAccount && accountEmail && accountPassword) {
        const existing = await storage.getUtilisateurByEmail(accountEmail);
        if (existing) {
          return res.status(201).json({
            success: true,
            data: emp,
            warning: "Employ\xE9 cr\xE9\xE9, mais un compte avec cet email existe d\xE9j\xE0. Aucun nouveau compte cr\xE9\xE9."
          });
        }
        const ROLE_HIERARCHY2 = {
          employe: 1,
          manager: 2,
          comptable: 3,
          admin_paie: 4,
          admin_rh: 5,
          super_admin: 6
        };
        const callerLevel = ROLE_HIERARCHY2[req.user.role] || 0;
        const targetRole = accountRole || "employe" /* EMPLOYE */;
        const targetLevel = ROLE_HIERARCHY2[targetRole] || 0;
        if (targetLevel >= callerLevel) {
          return res.status(201).json({
            success: true,
            data: emp,
            warning: "Employ\xE9 cr\xE9\xE9, mais vous ne pouvez pas cr\xE9er un compte avec un r\xF4le \xE9gal ou sup\xE9rieur au v\xF4tre."
          });
        }
        const motDePasseHash = await bcrypt3.hash(accountPassword, 10);
        linkedUser = await storage.createUtilisateur({
          email: accountEmail,
          motDePasseHash,
          nom: emp.nom,
          prenom: emp.prenom,
          role: targetRole,
          entrepriseId: req.user.entrepriseId,
          employeId: emp.id
        });
      }
      await storage.invalidateCache("dashboard");
      await notificationService.onEmployeeCreated(
        req.user.entrepriseId,
        `${emp.prenom} ${emp.nom}`
      );
      return res.status(201).json({
        success: true,
        data: emp,
        ...linkedUser ? {
          accountCreated: true,
          accountEmail: linkedUser.email,
          accountRole: linkedUser.role
        } : {}
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Erreur lors de la cr\xE9ation de l'employ\xE9"
      });
    }
  }
);
employeesRouter.put(
  "/:id",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const emp = await storage.updateEmploye(req.params.id, req.body);
    if (!emp) {
      return res.status(404).json({ success: false, error: "Employ\xE9 non trouv\xE9" });
    }
    return res.json({ success: true, data: emp });
  }
);
employeesRouter.delete(
  "/:id",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const success = await storage.deleteEmploye(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: "Employ\xE9 non trouv\xE9" });
    }
    return res.json({ success: true, message: "Employ\xE9 archiv\xE9 avec succ\xE8s" });
  }
);

// server/routes/users.ts
import { Router as Router3 } from "express";
import bcrypt4 from "bcryptjs";
var usersRouter = Router3();
usersRouter.use(requireAuth);
usersRouter.use(requireRole("super_admin" /* SUPER_ADMIN */));
usersRouter.get("/", async (req, res) => {
  const users = await storage.getUtilisateurs(req.user.entrepriseId);
  return res.json({ success: true, data: users });
});
usersRouter.post("/", async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom, role, employeId } = req.body;
    if (!email || !motDePasse || !nom || !prenom || !role) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent \xEAtre remplis"
      });
    }
    const existing = await storage.getUtilisateurByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Un utilisateur avec cet email existe d\xE9j\xE0"
      });
    }
    const motDePasseHash = await bcrypt4.hash(motDePasse, 10);
    const user = await storage.createUtilisateur({
      email,
      motDePasseHash,
      nom,
      prenom,
      role,
      entrepriseId: req.user.entrepriseId,
      employeId
    });
    const { motDePasseHash: _, ...userData } = user;
    return res.status(201).json({ success: true, data: userData });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la cr\xE9ation de l'utilisateur"
    });
  }
});
usersRouter.put("/:id", async (req, res) => {
  const user = await storage.updateUtilisateur(req.params.id, req.body);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouv\xE9" });
  }
  const { motDePasseHash: _, ...userData } = user;
  return res.json({ success: true, data: userData });
});
usersRouter.delete("/:id", async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({
      success: false,
      error: "Vous ne pouvez pas supprimer votre propre compte"
    });
  }
  const success = await storage.deleteUtilisateur(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouv\xE9" });
  }
  return res.json({ success: true, message: "Utilisateur d\xE9sactiv\xE9" });
});

// server/routes/entreprises.ts
import { Router as Router4 } from "express";
var entreprisesRouter = Router4();
entreprisesRouter.use(requireAuth);
entreprisesRouter.get("/", async (req, res) => {
  const entreprises = await storage.getEntreprises();
  return res.json({ success: true, data: entreprises });
});
entreprisesRouter.get("/:id", async (req, res) => {
  const e = await storage.getEntreprise(req.params.id);
  if (!e) {
    return res.status(404).json({ success: false, error: "Entreprise non trouv\xE9e" });
  }
  return res.json({ success: true, data: e });
});
entreprisesRouter.post(
  "/",
  requireRole("super_admin" /* SUPER_ADMIN */),
  async (req, res) => {
    try {
      const e = await storage.createEntreprise(req.body);
      return res.status(201).json({ success: true, data: e });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Erreur lors de la cr\xE9ation de l'entreprise"
      });
    }
  }
);
entreprisesRouter.put(
  "/:id",
  requireRole("super_admin" /* SUPER_ADMIN */),
  async (req, res) => {
    const e = await storage.updateEntreprise(req.params.id, req.body);
    if (!e) {
      return res.status(404).json({ success: false, error: "Entreprise non trouv\xE9e" });
    }
    return res.json({ success: true, data: e });
  }
);

// server/routes/parametres.ts
import { Router as Router5 } from "express";
var parametresRouter = Router5();
parametresRouter.use(requireAuth);
parametresRouter.get("/", async (req, res) => {
  const { categorie } = req.query;
  const params = await storage.getParametres(categorie);
  return res.json({ success: true, data: params });
});
parametresRouter.put(
  "/:id",
  requireRole("super_admin" /* SUPER_ADMIN */),
  async (req, res) => {
    const param = await storage.updateParametre(req.params.id, req.body);
    if (!param) {
      return res.status(404).json({
        success: false,
        error: "Param\xE8tre non trouv\xE9"
      });
    }
    return res.json({ success: true, data: param });
  }
);

// server/routes/dashboard.ts
import { Router as Router6 } from "express";
var dashboardRouter = Router6();
dashboardRouter.use(requireAuth);
dashboardRouter.get("/stats", async (req, res) => {
  const stats = await storage.getCachedDashboardStats(req.user.entrepriseId);
  return res.json({ success: true, data: stats });
});

// server/routes/payroll.ts
import { Router as Router7 } from "express";

// server/payroll-engine.ts
import { v4 as uuidv42 } from "uuid";
async function loadParams() {
  const params = await storage.getParametres();
  const get = (nom) => {
    const p = params.find((x) => x.nom === nom);
    return p ? parseFloat(p.valeur) : 0;
  };
  return {
    cnssEmployeTotal: get("CNSS_SAL_TOTAL"),
    cnssPatronalTotal: get("CNSS_PAT_TOTAL"),
    irppBrackets: [
      { min: 0, max: 5e3, rate: get("IRPP_TRANCHE_1") },
      { min: 5e3, max: 1e4, rate: get("IRPP_TRANCHE_2") },
      { min: 1e4, max: 2e4, rate: get("IRPP_TRANCHE_3") },
      { min: 2e4, max: 3e4, rate: get("IRPP_TRANCHE_4") },
      { min: 3e4, max: 4e4, rate: get("IRPP_TRANCHE_5") },
      { min: 4e4, max: 5e4, rate: get("IRPP_TRANCHE_6") },
      { min: 5e4, max: 7e4, rate: get("IRPP_TRANCHE_7") },
      { min: 7e4, max: Infinity, rate: get("IRPP_TRANCHE_8") }
    ],
    fraisProTaux: get("IRPP_FRAIS_PRO_TAUX"),
    fraisProPlafond: get("IRPP_FRAIS_PRO_PLAFOND"),
    deductionChefFamille: get("IRPP_DEDUCTION_CHEF_FAMILLE"),
    deductionEnfant: get("IRPP_DEDUCTION_ENFANT"),
    foprolosTaux: get("FOPROLOS_TAUX"),
    tfpIndustrie: get("TFP_INDUSTRIE"),
    tfpServices: get("TFP_SERVICES")
  };
}
function calculateIRPPAnnual(revenuAnnuelImposable, brackets) {
  if (revenuAnnuelImposable <= 0) return 0;
  let totalTax = 0;
  let remaining = revenuAnnuelImposable;
  for (const bracket of brackets) {
    const bracketSize = bracket.max === Infinity ? remaining : bracket.max - bracket.min;
    const taxable = Math.min(remaining, bracketSize);
    if (taxable <= 0) break;
    totalTax += taxable * (bracket.rate / 100);
    remaining -= taxable;
  }
  return totalTax;
}
async function calculatePayroll(employe, entreprise, periodePaieId, variableElements) {
  const p = await loadParams();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const elements = [];
  elements.push({
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    type: "salaire_base" /* SALAIRE_BASE */,
    libelle: "Salaire de Base",
    montant: employe.salaireBase,
    estVariable: false
  });
  for (const el of variableElements) {
    elements.push({
      id: uuidv42(),
      periodePaieId,
      ...el
    });
  }
  const gains = elements.filter(
    (e) => ![
      "acompte" /* ACOMPTE */,
      "saisie_salaire" /* SAISIE_SALAIRE */,
      "cnss_salarial" /* CNSS_SALARIAL */,
      "cnss_patronal" /* CNSS_PATRONAL */,
      "irpp" /* IRPP */,
      "foprolos" /* FOPROLOS */,
      "tfp" /* TFP */
    ].includes(e.type)
  );
  const deductionsFromBrut = elements.filter(
    (e) => ["acompte" /* ACOMPTE */, "saisie_salaire" /* SAISIE_SALAIRE */].includes(e.type)
  );
  const salaireBrut = gains.reduce((s, e) => s + e.montant, 0) - deductionsFromBrut.reduce((s, e) => s + e.montant, 0);
  const cnssSalarial = round(salaireBrut * (p.cnssEmployeTotal / 100));
  const cnssPatronal = round(salaireBrut * (p.cnssPatronalTotal / 100));
  elements.push({
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    type: "cnss_salarial" /* CNSS_SALARIAL */,
    libelle: `CNSS Salariale (${p.cnssEmployeTotal}%)`,
    montant: cnssSalarial,
    estVariable: false,
    taux: p.cnssEmployeTotal
  });
  elements.push({
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    type: "cnss_patronal" /* CNSS_PATRONAL */,
    libelle: `CNSS Patronale (${p.cnssPatronalTotal}%)`,
    montant: cnssPatronal,
    estVariable: false,
    taux: p.cnssPatronalTotal
  });
  const revenuMensuelNet = salaireBrut - cnssSalarial;
  const revenuAnnuelNet = revenuMensuelNet * 12;
  const fraisPro = Math.min(
    revenuAnnuelNet * (p.fraisProTaux / 100),
    p.fraisProPlafond
  );
  let deductionsFamiliales = 0;
  if (employe.situationFamiliale === "marie" /* MARIE */) {
    deductionsFamiliales += p.deductionChefFamille;
  }
  deductionsFamiliales += employe.nbEnfants * p.deductionEnfant;
  const revenuAnnuelImposable = Math.max(
    0,
    revenuAnnuelNet - fraisPro - deductionsFamiliales
  );
  const irppAnnuel = round(
    calculateIRPPAnnual(revenuAnnuelImposable, p.irppBrackets)
  );
  const irppMensuel = round(irppAnnuel / 12);
  elements.push({
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    type: "irpp" /* IRPP */,
    libelle: "IRPP (Retenue \xE0 la source)",
    montant: irppMensuel,
    estVariable: false
  });
  const foprolos = round(salaireBrut * (p.foprolosTaux / 100));
  const tfpRate = entreprise.secteurActivite === "industrie" /* INDUSTRIE */ ? p.tfpIndustrie : p.tfpServices;
  const tfp = round(salaireBrut * (tfpRate / 100));
  elements.push({
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    type: "foprolos" /* FOPROLOS */,
    libelle: `FOPROLOS (${p.foprolosTaux}%)`,
    montant: foprolos,
    estVariable: false,
    taux: p.foprolosTaux
  });
  elements.push({
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    type: "tfp" /* TFP */,
    libelle: `TFP (${tfpRate}%)`,
    montant: tfp,
    estVariable: false,
    taux: tfpRate
  });
  const netAPayer = round(salaireBrut - cnssSalarial - irppMensuel);
  const coutTotalEmployeur = round(salaireBrut + cnssPatronal + foprolos + tfp);
  const salaireNetImposable = round(revenuAnnuelImposable / 12);
  const bulletin = {
    id: uuidv42(),
    periodePaieId,
    employeId: employe.id,
    employe,
    elements,
    salaireBrut: round(salaireBrut),
    cnssSalarial,
    cnssPatronal,
    salaireNetImposable,
    irpp: irppMensuel,
    netAPayer,
    foprolos,
    tfp,
    coutTotalEmployeur,
    dateGeneration: now
  };
  return {
    bulletin,
    details: {
      salaireBrut: round(salaireBrut),
      cnssSalarial,
      cnssPatronal,
      revenuAnnuelNet: round(revenuAnnuelNet),
      fraisPro: round(fraisPro),
      deductionsFamiliales,
      revenuAnnuelImposable: round(revenuAnnuelImposable),
      irppAnnuel,
      irppMensuel,
      foprolos,
      tfp,
      netAPayer,
      coutTotalEmployeur
    }
  };
}
async function runPayrollForPeriod(periodePaieId, entrepriseId) {
  const entreprise = await storage.getEntreprise(entrepriseId);
  if (!entreprise) throw new Error("Entreprise introuvable");
  const allEmployes = await storage.getEmployes(entrepriseId);
  const employes = allEmployes.filter((e) => e.actif);
  const bulletins = [];
  for (const emp of employes) {
    const rawElements = await storage.getElementsPaie(periodePaieId, emp.id);
    const variableElements = rawElements.map((el) => ({
      employeId: el.employeId,
      type: el.type,
      libelle: el.libelle,
      montant: el.montant,
      estVariable: el.estVariable,
      heures: el.heures,
      taux: el.taux
    }));
    const result = await calculatePayroll(
      emp,
      entreprise,
      periodePaieId,
      variableElements
    );
    bulletins.push(result.bulletin);
  }
  return bulletins;
}
function round(n) {
  return Math.round(n * 1e3) / 1e3;
}

// server/payslip-pdf.ts
import PDFDocument from "pdfkit";
var MOIS_LABELS = [
  "Janvier",
  "F\xE9vrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Ao\xFBt",
  "Septembre",
  "Octobre",
  "Novembre",
  "D\xE9cembre"
];
function fmt(n) {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function generatePayslipPDF(bulletin, entreprise, periode) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const emp = bulletin.employe;
  const moisLabel = MOIS_LABELS[periode.mois - 1] || `Mois ${periode.mois}`;
  const pageW = 595.28 - 80;
  const PRIMARY3 = "#1e40af";
  const LIGHT_BG3 = "#f1f5f9";
  const BORDER3 = "#cbd5e1";
  doc.rect(40, 40, pageW, 70).fill(PRIMARY3);
  doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold").text("BULLETIN DE PAIE", 50, 55, { width: pageW - 20, align: "center" });
  doc.fontSize(11).font("Helvetica").text(`${moisLabel} ${periode.annee}`, 50, 78, { width: pageW - 20, align: "center" });
  let y = 125;
  doc.rect(40, y, pageW / 2 - 5, 90).lineWidth(0.5).stroke(BORDER3);
  doc.fillColor(PRIMARY3).fontSize(9).font("Helvetica-Bold").text("EMPLOYEUR", 50, y + 5);
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(entreprise.nom, 50, y + 18);
  doc.text(entreprise.adresse, 50, y + 30);
  doc.text(`MF: ${entreprise.matriculeFiscal}`, 50, y + 42);
  doc.text(`CNSS: ${entreprise.codeCnss}`, 50, y + 54);
  if (entreprise.telephone) doc.text(`Tel: ${entreprise.telephone}`, 50, y + 66);
  const exStart = 40 + pageW / 2 + 5;
  doc.rect(exStart, y, pageW / 2 - 5, 90).lineWidth(0.5).stroke(BORDER3);
  doc.fillColor(PRIMARY3).fontSize(9).font("Helvetica-Bold").text("EMPLOYE", exStart + 10, y + 5);
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`${emp.prenom} ${emp.nom}`, exStart + 10, y + 18);
  doc.text(`CIN: ${emp.cin}`, exStart + 10, y + 30);
  doc.text(`Matricule CNSS: ${emp.matriculeCnss}`, exStart + 10, y + 42);
  doc.text(`Poste: ${emp.poste}`, exStart + 10, y + 54);
  doc.text(`Cat: ${emp.categoriePro}`, exStart + 10, y + 66);
  y += 100;
  const gains = bulletin.elements.filter(
    (e) => ![
      "cnss_salarial" /* CNSS_SALARIAL */,
      "cnss_patronal" /* CNSS_PATRONAL */,
      "irpp" /* IRPP */,
      "foprolos" /* FOPROLOS */,
      "tfp" /* TFP */,
      "acompte" /* ACOMPTE */,
      "saisie_salaire" /* SAISIE_SALAIRE */
    ].includes(e.type)
  );
  const retenues = bulletin.elements.filter(
    (e) => [
      "cnss_salarial" /* CNSS_SALARIAL */,
      "irpp" /* IRPP */,
      "acompte" /* ACOMPTE */,
      "saisie_salaire" /* SAISIE_SALAIRE */
    ].includes(e.type)
  );
  const chargesPatronales = bulletin.elements.filter(
    (e) => ["cnss_patronal" /* CNSS_PATRONAL */, "foprolos" /* FOPROLOS */, "tfp" /* TFP */].includes(e.type)
  );
  doc.rect(40, y, pageW, 18).fill(PRIMARY3);
  doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");
  doc.text("RUBRIQUE", 50, y + 4, { width: pageW * 0.45 });
  doc.text("BASE", 50 + pageW * 0.45, y + 4, { width: pageW * 0.15, align: "right" });
  doc.text("TAUX", 50 + pageW * 0.6, y + 4, { width: pageW * 0.15, align: "right" });
  doc.text("MONTANT", 50 + pageW * 0.75, y + 4, { width: pageW * 0.2, align: "right" });
  y += 18;
  doc.rect(40, y, pageW, 16).fill(LIGHT_BG3);
  doc.fillColor(PRIMARY3).fontSize(9).font("Helvetica-Bold").text("GAINS", 50, y + 3);
  y += 16;
  for (const el of gains) {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
    doc.fillColor("#334155").fontSize(8).font("Helvetica");
    doc.text(el.libelle, 50, y + 2, { width: pageW * 0.45 });
    if (el.heures) doc.text(`${el.heures}h`, 50 + pageW * 0.45, y + 2, { width: pageW * 0.15, align: "right" });
    if (el.taux) doc.text(`${el.taux}%`, 50 + pageW * 0.6, y + 2, { width: pageW * 0.15, align: "right" });
    doc.font("Helvetica-Bold").text(`${fmt(el.montant)}`, 50 + pageW * 0.75, y + 2, { width: pageW * 0.2, align: "right" });
    y += 14;
  }
  doc.moveTo(40, y).lineTo(40 + pageW, y).lineWidth(0.5).stroke(BORDER3);
  y += 3;
  doc.fillColor(PRIMARY3).fontSize(9).font("Helvetica-Bold");
  doc.text("SALAIRE BRUT", 50, y, { width: pageW * 0.75 });
  doc.text(`${fmt(bulletin.salaireBrut)} TND`, 50 + pageW * 0.75, y, { width: pageW * 0.2, align: "right" });
  y += 18;
  doc.rect(40, y, pageW, 16).fill(LIGHT_BG3);
  doc.fillColor("#dc2626").fontSize(9).font("Helvetica-Bold").text("RETENUES SALARIALES", 50, y + 3);
  y += 16;
  for (const el of retenues) {
    doc.fillColor("#334155").fontSize(8).font("Helvetica");
    doc.text(el.libelle, 50, y + 2, { width: pageW * 0.55 });
    if (el.taux) doc.text(`${el.taux}%`, 50 + pageW * 0.6, y + 2, { width: pageW * 0.15, align: "right" });
    doc.font("Helvetica-Bold").fillColor("#dc2626").text(`-${fmt(el.montant)}`, 50 + pageW * 0.75, y + 2, { width: pageW * 0.2, align: "right" });
    y += 14;
  }
  const totalRetenues = retenues.reduce((s, e) => s + e.montant, 0);
  doc.moveTo(40, y).lineTo(40 + pageW, y).lineWidth(0.5).stroke(BORDER3);
  y += 3;
  doc.fillColor("#dc2626").fontSize(9).font("Helvetica-Bold");
  doc.text("TOTAL RETENUES", 50, y, { width: pageW * 0.75 });
  doc.text(`-${fmt(totalRetenues)} TND`, 50 + pageW * 0.75, y, { width: pageW * 0.2, align: "right" });
  y += 22;
  doc.rect(40, y, pageW, 30).fill(PRIMARY3);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold");
  doc.text("NET A PAYER", 50, y + 8, { width: pageW * 0.5 });
  doc.text(`${fmt(bulletin.netAPayer)} TND`, 50 + pageW * 0.5, y + 8, { width: pageW * 0.45, align: "right" });
  y += 40;
  doc.rect(40, y, pageW, 16).fill(LIGHT_BG3);
  doc.fillColor("#6b7280").fontSize(9).font("Helvetica-Bold").text("CHARGES PATRONALES (pour information)", 50, y + 3);
  y += 16;
  for (const el of chargesPatronales) {
    doc.fillColor("#6b7280").fontSize(8).font("Helvetica");
    doc.text(el.libelle, 50, y + 2, { width: pageW * 0.55 });
    if (el.taux) doc.text(`${el.taux}%`, 50 + pageW * 0.6, y + 2, { width: pageW * 0.15, align: "right" });
    doc.font("Helvetica-Bold").text(`${fmt(el.montant)}`, 50 + pageW * 0.75, y + 2, { width: pageW * 0.2, align: "right" });
    y += 14;
  }
  doc.moveTo(40, y).lineTo(40 + pageW, y).lineWidth(0.5).stroke(BORDER3);
  y += 3;
  doc.fillColor("#6b7280").fontSize(9).font("Helvetica-Bold");
  doc.text("COUT TOTAL EMPLOYEUR", 50, y, { width: pageW * 0.75 });
  doc.text(`${fmt(bulletin.coutTotalEmployeur)} TND`, 50 + pageW * 0.75, y, { width: pageW * 0.2, align: "right" });
  y += 22;
  doc.moveTo(40, y).lineTo(40 + pageW, y).lineWidth(0.3).stroke(BORDER3);
  y += 8;
  doc.fillColor("#64748b").fontSize(8).font("Helvetica");
  doc.text(`Mode de paiement: Virement bancaire`, 50, y);
  doc.text(`IBAN: ${emp.iban}`, 50, y + 12);
  if (emp.banque) doc.text(`Banque: ${emp.banque}`, 50, y + 24);
  y += 42;
  doc.fillColor("#94a3b8").fontSize(7).font("Helvetica");
  doc.text(
    `Document genere le ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-TN")} | ${entreprise.nom} | Confidentiel`,
    40,
    780,
    { width: pageW, align: "center" }
  );
  return doc;
}

// server/routes/payroll.ts
var payrollRouter = Router7();
payrollRouter.use(requireAuth);
payrollRouter.get("/periodes", async (req, res) => {
  const periodes = await storage.getPeriodesPaie(req.user.entrepriseId);
  return res.json({ success: true, data: periodes });
});
payrollRouter.get("/periodes/:id", async (req, res) => {
  const periode = await storage.getPeriodePaie(req.params.id);
  if (!periode) {
    return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
  }
  const bulletins = await storage.getBulletins(periode.id);
  return res.json({
    success: true,
    data: {
      periode,
      bulletins,
      summary: {
        totalBulletins: bulletins.length,
        totalBrut: bulletins.reduce(
          (s, b) => s + b.salaireBrut,
          0
        ),
        totalNet: bulletins.reduce((s, b) => s + b.netAPayer, 0),
        totalCnss: bulletins.reduce(
          (s, b) => s + b.cnssSalarial + b.cnssPatronal,
          0
        ),
        totalIrpp: bulletins.reduce((s, b) => s + b.irpp, 0),
        totalCoutEmployeur: bulletins.reduce(
          (s, b) => s + b.coutTotalEmployeur,
          0
        )
      }
    }
  });
});
payrollRouter.post(
  "/periodes",
  requireMinRole("admin_paie" /* ADMIN_PAIE */),
  async (req, res) => {
    const parsed = createPeriodePaieSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        data: parsed.error.issues
      });
    }
    const existing = await storage.getPeriodePaieByMonth(
      req.user.entrepriseId,
      parsed.data.mois,
      parsed.data.annee
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Une p\xE9riode existe d\xE9j\xE0 pour ce mois"
      });
    }
    const periode = await storage.createPeriodePaie({
      entrepriseId: req.user.entrepriseId,
      mois: parsed.data.mois,
      annee: parsed.data.annee,
      dateDebut: parsed.data.dateDebut,
      dateFin: parsed.data.dateFin
    });
    return res.status(201).json({ success: true, data: periode });
  }
);
payrollRouter.put(
  "/periodes/:id/statut",
  requireMinRole("admin_paie" /* ADMIN_PAIE */),
  async (req, res) => {
    const { statut } = req.body;
    if (!Object.values(PayPeriodStatus).includes(statut)) {
      return res.status(400).json({ success: false, error: "Statut invalide" });
    }
    const periode = await storage.updatePeriodePaieStatut(
      req.params.id,
      statut
    );
    if (!periode) {
      return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
    }
    return res.json({ success: true, data: periode });
  }
);
payrollRouter.get(
  "/periodes/:id/elements",
  async (req, res) => {
    const { employeId } = req.query;
    const elements = await storage.getElementsPaie(
      req.params.id,
      employeId
    );
    return res.json({ success: true, data: elements });
  }
);
payrollRouter.post(
  "/periodes/:id/elements",
  requireMinRole("admin_paie" /* ADMIN_PAIE */),
  async (req, res) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
    }
    if (periode.statut === "finalisee" /* FINALISEE */) {
      return res.status(400).json({
        success: false,
        error: "P\xE9riode finalis\xE9e, modification impossible"
      });
    }
    const { elements } = req.body;
    if (!Array.isArray(elements)) {
      return res.status(400).json({ success: false, error: "Un tableau d'\xE9l\xE9ments est requis" });
    }
    const created = [];
    for (const el of elements) {
      const parsed = createElementPaieSchema.safeParse(el);
      if (!parsed.success) continue;
      const element = await storage.createElementPaie({
        periodePaieId: req.params.id,
        employeId: parsed.data.employeId,
        type: parsed.data.type,
        libelle: parsed.data.libelle,
        montant: parsed.data.montant,
        estVariable: true,
        heures: parsed.data.heures,
        taux: parsed.data.taux
      });
      created.push(element);
    }
    return res.status(201).json({ success: true, data: created });
  }
);
payrollRouter.delete(
  "/periodes/:id/elements",
  requireMinRole("admin_paie" /* ADMIN_PAIE */),
  async (req, res) => {
    const { employeId } = req.query;
    const count = await storage.deleteElementsPaie(
      req.params.id,
      employeId
    );
    return res.json({ success: true, data: { deleted: count } });
  }
);
payrollRouter.post(
  "/periodes/:id/calculer",
  requireMinRole("admin_paie" /* ADMIN_PAIE */),
  async (req, res) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
    }
    if (periode.statut === "finalisee" /* FINALISEE */) {
      return res.status(400).json({ success: false, error: "P\xE9riode d\xE9j\xE0 finalis\xE9e" });
    }
    try {
      await storage.deleteBulletins(periode.id);
      const bulletins = await runPayrollForPeriod(
        periode.id,
        periode.entrepriseId
      );
      await storage.saveBulletins(bulletins);
      await storage.updatePeriodePaieStatut(
        periode.id,
        "calculee" /* CALCULEE */
      );
      const summary = {
        totalBulletins: bulletins.length,
        totalBrut: bulletins.reduce((s, b) => s + b.salaireBrut, 0),
        totalNet: bulletins.reduce((s, b) => s + b.netAPayer, 0),
        totalCnss: bulletins.reduce(
          (s, b) => s + b.cnssSalarial + b.cnssPatronal,
          0
        ),
        totalIrpp: bulletins.reduce((s, b) => s + b.irpp, 0),
        totalCoutEmployeur: bulletins.reduce(
          (s, b) => s + b.coutTotalEmployeur,
          0
        )
      };
      const monthNames = [
        "Jan",
        "F\xE9v",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Ao\xFB",
        "Sep",
        "Oct",
        "Nov",
        "D\xE9c"
      ];
      const pLabel = `${monthNames[periode.mois - 1]} ${periode.annee}`;
      await notificationService.onPayrollCalculated(
        req.user.entrepriseId,
        pLabel
      );
      await storage.invalidateCache("dashboard");
      return res.json({ success: true, data: { bulletins, summary } });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || "Erreur de calcul" });
    }
  }
);
payrollRouter.post(
  "/periodes/:id/valider",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
    }
    if (periode.statut !== "calculee" /* CALCULEE */) {
      return res.status(400).json({
        success: false,
        error: "La p\xE9riode doit \xEAtre calcul\xE9e avant validation"
      });
    }
    await storage.updatePeriodePaieStatut(periode.id, "validee" /* VALIDEE */);
    const months = [
      "Jan",
      "F\xE9v",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Ao\xFB",
      "Sep",
      "Oct",
      "Nov",
      "D\xE9c"
    ];
    const label = `${months[periode.mois - 1]} ${periode.annee}`;
    await notificationService.onPayrollValidated(req.user.entrepriseId, label);
    await storage.invalidateCache("dashboard");
    return res.json({ success: true, data: { message: "P\xE9riode valid\xE9e" } });
  }
);
payrollRouter.post(
  "/periodes/:id/finaliser",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const periode = await storage.getPeriodePaie(req.params.id);
    if (!periode) {
      return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
    }
    if (periode.statut !== "validee" /* VALIDEE */) {
      return res.status(400).json({
        success: false,
        error: "La p\xE9riode doit \xEAtre valid\xE9e avant finalisation"
      });
    }
    await storage.updatePeriodePaieStatut(
      periode.id,
      "finalisee" /* FINALISEE */
    );
    const months2 = [
      "Jan",
      "F\xE9v",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Ao\xFB",
      "Sep",
      "Oct",
      "Nov",
      "D\xE9c"
    ];
    const label2 = `${months2[periode.mois - 1]} ${periode.annee}`;
    await notificationService.onPayrollFinalized(
      req.user.entrepriseId,
      label2
    );
    await storage.invalidateCache("dashboard");
    return res.json({ success: true, data: { message: "P\xE9riode finalis\xE9e" } });
  }
);
payrollRouter.get("/bulletins/:id", async (req, res) => {
  const bulletin = await storage.getBulletin(req.params.id);
  if (!bulletin) {
    return res.status(404).json({ success: false, error: "Bulletin introuvable" });
  }
  return res.json({ success: true, data: bulletin });
});
payrollRouter.get("/bulletins/:id/pdf", async (req, res) => {
  const bulletin = await storage.getBulletin(req.params.id);
  if (!bulletin) {
    return res.status(404).json({ success: false, error: "Bulletin introuvable" });
  }
  const entreprise = await storage.getEntreprise(bulletin.employe.entrepriseId);
  if (!entreprise) {
    return res.status(404).json({ success: false, error: "Entreprise introuvable" });
  }
  const periode = await storage.getPeriodePaie(bulletin.periodePaieId);
  if (!periode) {
    return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
  }
  const moisLabels = [
    "Janvier",
    "F\xE9vrier",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Ao\xFBt",
    "Septembre",
    "Octobre",
    "Novembre",
    "D\xE9cembre"
  ];
  const filename = `bulletin_${bulletin.employe.nom}_${bulletin.employe.prenom}_${moisLabels[periode.mois - 1]}_${periode.annee}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  const stream = generatePayslipPDF(bulletin, entreprise, periode);
  stream.pipe(res);
  stream.end();
});
payrollRouter.get(
  "/employes/:id/bulletins",
  async (req, res) => {
    const employe = await storage.getEmploye(req.params.id);
    if (!employe) {
      return res.status(404).json({ success: false, error: "Employ\xE9 introuvable" });
    }
    const bulletins = await storage.getBulletinsByEmploye(req.params.id);
    return res.json({ success: true, data: bulletins });
  }
);

// server/routes/conges.ts
import { Router as Router8 } from "express";
var congesRouter = Router8();
congesRouter.use(requireAuth);
congesRouter.get("/", async (req, res) => {
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const managerLevel = ROLE_HIERARCHY["manager" /* MANAGER */] || 0;
  let conges;
  if (userLevel >= managerLevel) {
    conges = await storage.getCongesByEntreprise(req.user.entrepriseId);
  } else {
    const user = await storage.getUtilisateur(req.user.id);
    if (!user?.employeId) {
      return res.json({ success: true, data: [] });
    }
    conges = await storage.getConges(user.employeId);
  }
  const enriched = [];
  for (const c of conges) {
    const emp = await storage.getEmploye(c.employeId);
    enriched.push({
      ...c,
      employe: emp ? {
        nom: emp.nom,
        prenom: emp.prenom,
        departement: emp.departement,
        poste: emp.poste
      } : void 0
    });
  }
  return res.json({ success: true, data: enriched });
});
congesRouter.get("/:id", async (req, res) => {
  const conge = await storage.getConge(req.params.id);
  if (!conge) {
    return res.status(404).json({ success: false, error: "Cong\xE9 introuvable" });
  }
  const emp = await storage.getEmploye(conge.employeId);
  return res.json({
    success: true,
    data: {
      ...conge,
      employe: emp ? {
        nom: emp.nom,
        prenom: emp.prenom,
        departement: emp.departement,
        poste: emp.poste
      } : void 0
    }
  });
});
congesRouter.post("/", async (req, res) => {
  const parsed = createCongeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Donn\xE9es invalides",
      details: parsed.error.flatten().fieldErrors
    });
  }
  const { employeId, typeConge, dateDebut, dateFin, nbJours, motif } = parsed.data;
  const emp = await storage.getEmploye(employeId);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employ\xE9 introuvable" });
  }
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const managerLevel = ROLE_HIERARCHY["manager" /* MANAGER */] || 0;
  if (userLevel < managerLevel) {
    const user = await storage.getUtilisateur(req.user.id);
    if (user?.employeId !== employeId) {
      return res.status(403).json({
        success: false,
        error: "Vous ne pouvez demander un cong\xE9 que pour vous-m\xEAme"
      });
    }
  }
  if (typeConge === "conge_paye") {
    const year = new Date(dateDebut).getFullYear();
    const balance = await storage.getLeaveBalance(employeId, year);
    if (balance.solde - balance.enAttente < nbJours) {
      return res.status(400).json({
        success: false,
        error: `Solde insuffisant. Disponible: ${balance.solde - balance.enAttente} jours (droit: ${balance.droitAnnuel}, consomm\xE9: ${balance.consomme}, en attente: ${balance.enAttente})`
      });
    }
  }
  const conge = await storage.createConge({
    employeId,
    typeConge,
    dateDebut,
    dateFin,
    nbJours,
    motif: motif || void 0
  });
  await storage.invalidateCache("dashboard");
  await notificationService.onLeaveRequested(
    req.user.entrepriseId,
    `${emp.prenom} ${emp.nom}`,
    typeConge,
    dateDebut,
    dateFin
  );
  return res.status(201).json({ success: true, data: conge });
});
congesRouter.put(
  "/:id/statut",
  requireMinRole("manager" /* MANAGER */),
  async (req, res) => {
    const parsed = updateCongeStatutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: parsed.error.flatten().fieldErrors
      });
    }
    const conge = await storage.getConge(req.params.id);
    if (!conge) {
      return res.status(404).json({ success: false, error: "Cong\xE9 introuvable" });
    }
    if (conge.statut !== "en_attente" /* EN_ATTENTE */) {
      return res.status(400).json({
        success: false,
        error: `Impossible de modifier un cong\xE9 d\xE9j\xE0 ${conge.statut}`
      });
    }
    const newStatut = parsed.data.statut === "approuve" ? "approuve" /* APPROUVE */ : parsed.data.statut === "rejete" ? "rejete" /* REJETE */ : "annule" /* ANNULE */;
    const updated = await storage.updateCongeStatut(
      req.params.id,
      newStatut,
      req.user.id
    );
    if (parsed.data.statut === "approuve" || parsed.data.statut === "rejete") {
      const emp = await storage.getEmploye(conge.employeId);
      const users = await storage.getUtilisateurs(req.user.entrepriseId);
      const empUser = users.find((u) => u.employeId === conge.employeId);
      await notificationService.onLeaveDecision(
        req.user.entrepriseId,
        empUser?.id,
        parsed.data.statut,
        conge.typeConge
      );
    }
    await storage.invalidateCache("dashboard");
    return res.json({ success: true, data: updated });
  }
);
congesRouter.put("/:id/annuler", async (req, res) => {
  const conge = await storage.getConge(req.params.id);
  if (!conge) {
    return res.status(404).json({ success: false, error: "Cong\xE9 introuvable" });
  }
  if (conge.statut !== "en_attente" /* EN_ATTENTE */) {
    return res.status(400).json({
      success: false,
      error: "Seuls les cong\xE9s en attente peuvent \xEAtre annul\xE9s"
    });
  }
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const managerLevel = ROLE_HIERARCHY["manager" /* MANAGER */] || 0;
  if (userLevel < managerLevel) {
    const user = await storage.getUtilisateur(req.user.id);
    if (user?.employeId !== conge.employeId) {
      return res.status(403).json({
        success: false,
        error: "Vous ne pouvez annuler que vos propres demandes"
      });
    }
  }
  const updated = await storage.updateCongeStatut(
    req.params.id,
    "annule" /* ANNULE */
  );
  return res.json({ success: true, data: updated });
});
congesRouter.get("/balance/:employeId", async (req, res) => {
  const emp = await storage.getEmploye(req.params.employeId);
  if (!emp) {
    return res.status(404).json({ success: false, error: "Employ\xE9 introuvable" });
  }
  const year = req.query.year ? parseInt(req.query.year, 10) : (/* @__PURE__ */ new Date()).getFullYear();
  const balance = await storage.getLeaveBalance(req.params.employeId, year);
  return res.json({ success: true, data: balance });
});
congesRouter.get("/my-balance", (_req, res) => {
  return res.status(400).json({ success: false, error: "Use /balance/:employeId" });
});
congesRouter.delete(
  "/:id",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const conge = await storage.getConge(req.params.id);
    if (!conge) {
      return res.status(404).json({ success: false, error: "Cong\xE9 introuvable" });
    }
    await storage.deleteConge(req.params.id);
    return res.json({ success: true, message: "Cong\xE9 supprim\xE9" });
  }
);

// server/routes/documents.ts
import { Router as Router9 } from "express";

// server/document-pdf.ts
import PDFDocument2 from "pdfkit";
var PRIMARY = "#1e40af";
var LIGHT_BG = "#f1f5f9";
var BORDER = "#cbd5e1";
function fmt2(n) {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
function numberToWords(n) {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
  if (n === 0) return "z\xE9ro";
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return tens[t - 1] + "-" + teens[u];
    return tens[t] + (u ? "-" + units[u] : "");
  }
  if (n < 1e3) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const hStr = h === 1 ? "cent" : units[h] + " cent";
    return hStr + (rest ? " " + numberToWords(rest) : "");
  }
  if (n < 1e6) {
    const k = Math.floor(n / 1e3);
    const rest = n % 1e3;
    const kStr = k === 1 ? "mille" : numberToWords(k) + " mille";
    return kStr + (rest ? " " + numberToWords(rest) : "");
  }
  return String(n);
}
function drawHeader(doc, entreprise, title, pageW) {
  doc.rect(40, 40, pageW, 65).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(17).font("Helvetica-Bold").text(title, 50, 52, { width: pageW - 20, align: "center" });
  doc.fontSize(10).font("Helvetica").text(entreprise.nom, 50, 74, { width: pageW - 20, align: "center" });
  let y = 120;
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`${entreprise.adresse}`, 40, y);
  doc.text(`Matricule Fiscal: ${entreprise.matriculeFiscal}  |  Code CNSS: ${entreprise.codeCnss}`, 40, y + 12);
  if (entreprise.telephone) doc.text(`T\xE9l: ${entreprise.telephone}`, 40, y + 24);
  y += 45;
  doc.moveTo(40, y).lineTo(40 + pageW, y).lineWidth(0.5).stroke(BORDER);
  return y + 15;
}
function drawFooter(doc, entreprise, pageW) {
  const y = 720;
  doc.moveTo(40, y).lineTo(40 + pageW, y).lineWidth(0.5).stroke(BORDER);
  doc.fillColor("#94a3b8").fontSize(7).font("Helvetica").text(`Document g\xE9n\xE9r\xE9 automatiquement par PayrollHub \u2014 ${entreprise.nom}`, 40, y + 8, {
    width: pageW,
    align: "center"
  });
  doc.text(`Le ${formatDate((/* @__PURE__ */ new Date()).toISOString())}`, 40, y + 18, {
    width: pageW,
    align: "center"
  });
}
function generateAttestationTravail(employe, entreprise) {
  const doc = new PDFDocument2({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;
  let y = drawHeader(doc, entreprise, "ATTESTATION DE TRAVAIL", pageW);
  y += 20;
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  const today = formatDate((/* @__PURE__ */ new Date()).toISOString());
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });
  y += 40;
  doc.fontSize(12).font("Helvetica-Bold").fillColor(PRIMARY).text("Le Directeur des Ressources Humaines atteste que :", 40, y, { width: pageW, align: "center" });
  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");
  const lines = [
    `M./Mme ${employe.prenom} ${employe.nom.toUpperCase()},`,
    `n\xE9(e) le ${formatDate(employe.dateNaissance)},`,
    `titulaire du CIN n\xB0 ${employe.cin},`,
    `matricule CNSS : ${employe.matriculeCnss},`,
    "",
    `est employ\xE9(e) au sein de notre soci\xE9t\xE9 ${entreprise.nom}`,
    `depuis le ${formatDate(employe.dateEmbauche)},`,
    `en qualit\xE9 de ${employe.poste},`,
    `au d\xE9partement ${employe.departement},`,
    `sous contrat de type ${employe.typeContrat}.`,
    "",
    "Cette attestation est d\xE9livr\xE9e \xE0 l'int\xE9ress\xE9(e) pour servir et valoir ce que de droit."
  ];
  for (const line of lines) {
    doc.text(line, 60, y, { width: pageW - 40 });
    y += line === "" ? 12 : 18;
  }
  y += 40;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur des Ressources Humaines", 300, y, { width: 220, align: "center" });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);
  y += 5;
  doc.fontSize(8).font("Helvetica").fillColor("#64748b").text("(Signature et cachet)", 300, y, { width: 220, align: "center" });
  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}
function generateAttestationSalaire(employe, entreprise) {
  const doc = new PDFDocument2({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;
  let y = drawHeader(doc, entreprise, "ATTESTATION DE SALAIRE", pageW);
  y += 20;
  const today = formatDate((/* @__PURE__ */ new Date()).toISOString());
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });
  y += 40;
  doc.fontSize(12).font("Helvetica-Bold").fillColor(PRIMARY).text("Le soussign\xE9 atteste que :", 40, y, { width: pageW, align: "center" });
  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");
  const salaireMensuel = employe.salaireBase;
  const salaireAnnuel = salaireMensuel * 12;
  const lines = [
    `M./Mme ${employe.prenom} ${employe.nom.toUpperCase()},`,
    `titulaire du CIN n\xB0 ${employe.cin},`,
    `occupant le poste de ${employe.poste},`,
    "",
    `per\xE7oit un salaire mensuel brut de ${fmt2(salaireMensuel)} TND`,
    `(${numberToWords(Math.floor(salaireMensuel))} dinars),`,
    "",
    `soit un salaire annuel brut de ${fmt2(salaireAnnuel)} TND.`,
    "",
    "Cette attestation est d\xE9livr\xE9e \xE0 l'int\xE9ress\xE9(e) pour servir et valoir ce que de droit."
  ];
  for (const line of lines) {
    doc.text(line, 60, y, { width: pageW - 40 });
    y += line === "" ? 12 : 18;
  }
  y += 40;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur des Ressources Humaines", 300, y, { width: 220, align: "center" });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);
  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}
function generateAttestationCNSS(employe, entreprise) {
  const doc = new PDFDocument2({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;
  let y = drawHeader(doc, entreprise, "ATTESTATION D'AFFILIATION CNSS", pageW);
  y += 20;
  const today = formatDate((/* @__PURE__ */ new Date()).toISOString());
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });
  y += 40;
  doc.fontSize(12).font("Helvetica-Bold").fillColor(PRIMARY).text("Attestation d'affiliation \xE0 la CNSS", 40, y, { width: pageW, align: "center" });
  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");
  doc.rect(50, y, pageW - 20, 120).lineWidth(0.5).stroke(BORDER);
  doc.rect(50, y, pageW - 20, 120).fill(LIGHT_BG);
  y += 12;
  doc.fillColor("#0f172a").fontSize(10);
  const infos = [
    ["Employeur :", entreprise.nom],
    ["Code CNSS Employeur :", entreprise.codeCnss],
    ["Matricule Fiscal :", entreprise.matriculeFiscal],
    ["", ""],
    ["Employ\xE9(e) :", `${employe.prenom} ${employe.nom.toUpperCase()}`],
    ["CIN :", employe.cin],
    ["Matricule CNSS :", employe.matriculeCnss],
    ["Date d'embauche :", formatDate(employe.dateEmbauche)]
  ];
  for (const [label, value] of infos) {
    if (label === "") {
      y += 8;
      continue;
    }
    doc.font("Helvetica-Bold").text(label, 65, y, { continued: true, width: 180 });
    doc.font("Helvetica").text(` ${value}`, { width: 300 });
    y += 14;
  }
  y += 30;
  doc.fontSize(10).font("Helvetica").fillColor("#0f172a");
  doc.text(
    "Nous attestons par la pr\xE9sente que l'employ\xE9(e) mentionn\xE9(e) ci-dessus est bien affili\xE9(e) \xE0 la Caisse Nationale de S\xE9curit\xE9 Sociale (CNSS) sous notre code employeur. Les cotisations sociales sont r\xE9guli\xE8rement vers\xE9es conform\xE9ment \xE0 la l\xE9gislation tunisienne en vigueur.",
    60,
    y,
    { width: pageW - 40, lineGap: 4 }
  );
  y += 70;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur des Ressources Humaines", 300, y, { width: 220, align: "center" });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);
  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}
function generateCertificatTravail(employe, entreprise) {
  const doc = new PDFDocument2({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;
  let y = drawHeader(doc, entreprise, "CERTIFICAT DE TRAVAIL", pageW);
  y += 20;
  const today = formatDate((/* @__PURE__ */ new Date()).toISOString());
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });
  y += 40;
  doc.fontSize(12).font("Helvetica-Bold").fillColor(PRIMARY).text("Le Directeur G\xE9n\xE9ral certifie que :", 40, y, { width: pageW, align: "center" });
  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");
  const dateFin = employe.dateFin ? formatDate(employe.dateFin) : formatDate((/* @__PURE__ */ new Date()).toISOString());
  const lines = [
    `M./Mme ${employe.prenom} ${employe.nom.toUpperCase()},`,
    `n\xE9(e) le ${formatDate(employe.dateNaissance)},`,
    `titulaire du CIN n\xB0 ${employe.cin},`,
    "",
    `a \xE9t\xE9 employ\xE9(e) dans notre entreprise du ${formatDate(employe.dateEmbauche)}`,
    `au ${dateFin},`,
    `en qualit\xE9 de ${employe.poste},`,
    `au d\xE9partement ${employe.departement},`,
    `sous contrat de type ${employe.typeContrat}.`,
    "",
    "Pendant la dur\xE9e de son emploi, l'int\xE9ress\xE9(e) a fait preuve de comp\xE9tence",
    "et nous lui d\xE9livrons le pr\xE9sent certificat en conformit\xE9 avec les",
    "dispositions de l'article 14 du Code du Travail tunisien.",
    "",
    "Le pr\xE9sent certificat est d\xE9livr\xE9 pour servir et valoir ce que de droit."
  ];
  for (const line of lines) {
    doc.text(line, 60, y, { width: pageW - 40 });
    y += line === "" ? 12 : 18;
  }
  y += 40;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur G\xE9n\xE9ral", 300, y, { width: 220, align: "center" });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);
  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}
function generateFichePaieAnnuelle(employe, entreprise, annee, bulletins) {
  const doc = new PDFDocument2({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;
  let y = drawHeader(doc, entreprise, `\xC9TAT R\xC9CAPITULATIF ANNUEL ${annee}`, pageW);
  y += 10;
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold").text("EMPLOY\xC9(E)", 40, y);
  y += 14;
  doc.font("Helvetica").fontSize(9);
  doc.text(`${employe.prenom} ${employe.nom.toUpperCase()}  |  CIN: ${employe.cin}  |  CNSS: ${employe.matriculeCnss}`, 40, y);
  y += 12;
  doc.text(`Poste: ${employe.poste}  |  D\xE9partement: ${employe.departement}`, 40, y);
  y += 25;
  const cols = [40, 140, 230, 320, 410];
  const colW = [100, 90, 90, 90, 90];
  const headers = ["Mois", "Brut (TND)", "CNSS (TND)", "IRPP (TND)", "Net (TND)"];
  const MOIS = ["Janvier", "F\xE9vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao\xFBt", "Septembre", "Octobre", "Novembre", "D\xE9cembre"];
  doc.rect(40, y, pageW, 20).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 4, y + 5, { width: colW[i] - 8, align: i === 0 ? "left" : "right" });
  }
  y += 20;
  let totalBrut = 0, totalCnss = 0, totalIrpp = 0, totalNet = 0;
  for (const b of bulletins.sort((a, c) => a.mois - c.mois)) {
    const bg = bulletins.indexOf(b) % 2 === 0 ? LIGHT_BG : "#ffffff";
    doc.rect(40, y, pageW, 16).fill(bg);
    doc.fillColor("#0f172a").fontSize(8).font("Helvetica");
    doc.text(MOIS[b.mois - 1] || String(b.mois), cols[0] + 4, y + 4, { width: colW[0] - 8 });
    doc.text(fmt2(b.brut), cols[1] + 4, y + 4, { width: colW[1] - 8, align: "right" });
    doc.text(fmt2(b.cnss), cols[2] + 4, y + 4, { width: colW[2] - 8, align: "right" });
    doc.text(fmt2(b.irpp), cols[3] + 4, y + 4, { width: colW[3] - 8, align: "right" });
    doc.text(fmt2(b.net), cols[4] + 4, y + 4, { width: colW[4] - 8, align: "right" });
    totalBrut += b.brut;
    totalCnss += b.cnss;
    totalIrpp += b.irpp;
    totalNet += b.net;
    y += 16;
  }
  doc.rect(40, y, pageW, 20).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  doc.text("TOTAL ANNUEL", cols[0] + 4, y + 5, { width: colW[0] - 8 });
  doc.text(fmt2(totalBrut), cols[1] + 4, y + 5, { width: colW[1] - 8, align: "right" });
  doc.text(fmt2(totalCnss), cols[2] + 4, y + 5, { width: colW[2] - 8, align: "right" });
  doc.text(fmt2(totalIrpp), cols[3] + 4, y + 5, { width: colW[3] - 8, align: "right" });
  doc.text(fmt2(totalNet), cols[4] + 4, y + 5, { width: colW[4] - 8, align: "right" });
  y += 35;
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`Net imposable annuel : ${fmt2(totalBrut - totalCnss)} TND`, 40, y);
  y += 14;
  doc.text(`Retenue IRPP annuelle : ${fmt2(totalIrpp)} TND`, 40, y);
  y += 14;
  doc.text(`Total CNSS salariale : ${fmt2(totalCnss)} TND`, 40, y);
  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}
function generateDocument(type, employe, entreprise, options) {
  switch (type) {
    case "attestation_travail" /* ATTESTATION_TRAVAIL */:
      return generateAttestationTravail(employe, entreprise);
    case "attestation_salaire" /* ATTESTATION_SALAIRE */:
      return generateAttestationSalaire(employe, entreprise);
    case "attestation_cnss" /* ATTESTATION_CNSS */:
      return generateAttestationCNSS(employe, entreprise);
    case "certificat_travail" /* CERTIFICAT_TRAVAIL */:
      return generateCertificatTravail(employe, entreprise);
    case "fiche_paie_annuelle" /* FICHE_PAIE_ANNUELLE */:
      return generateFichePaieAnnuelle(
        employe,
        entreprise,
        options?.annee || (/* @__PURE__ */ new Date()).getFullYear(),
        options?.bulletins || []
      );
    default:
      throw new Error(`Type de document non support\xE9: ${type}`);
  }
}

// server/routes/documents.ts
var documentsRouter = Router9();
documentsRouter.use(requireAuth);
var DOC_LABELS = {
  ["attestation_travail" /* ATTESTATION_TRAVAIL */]: "Attestation de Travail",
  ["attestation_salaire" /* ATTESTATION_SALAIRE */]: "Attestation de Salaire",
  ["attestation_cnss" /* ATTESTATION_CNSS */]: "Attestation CNSS",
  ["fiche_paie_annuelle" /* FICHE_PAIE_ANNUELLE */]: "Fiche de Paie Annuelle",
  ["certificat_travail" /* CERTIFICAT_TRAVAIL */]: "Certificat de Travail"
};
documentsRouter.get("/", async (req, res) => {
  const docs = await storage.getDocuments(req.user.entrepriseId);
  const enriched = [];
  for (const d of docs) {
    const emp = await storage.getEmploye(d.employeId);
    enriched.push({
      ...d,
      employe: emp ? {
        nom: emp.nom,
        prenom: emp.prenom,
        departement: emp.departement,
        poste: emp.poste
      } : void 0
    });
  }
  return res.json({ success: true, data: enriched });
});
documentsRouter.get(
  "/employe/:employeId",
  async (req, res) => {
    const docs = await storage.getDocumentsByEmploye(req.params.employeId);
    return res.json({ success: true, data: docs });
  }
);
documentsRouter.post(
  "/generate",
  requireMinRole("manager" /* MANAGER */),
  async (req, res) => {
    const parsed = generateDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message || "Donn\xE9es invalides"
      });
    }
    const { employeId, typeDocument, annee } = parsed.data;
    const employe = await storage.getEmploye(employeId);
    if (!employe)
      return res.status(404).json({ success: false, error: "Employ\xE9 introuvable" });
    const entreprise = await storage.getEntreprise(req.user.entrepriseId);
    if (!entreprise)
      return res.status(404).json({ success: false, error: "Entreprise introuvable" });
    try {
      let bulletinData;
      if (typeDocument === "fiche_paie_annuelle" /* FICHE_PAIE_ANNUELLE */) {
        const allBulletins = await storage.getBulletinsByEmploye(employeId);
        const targetYear = annee || (/* @__PURE__ */ new Date()).getFullYear();
        const filtered = [];
        for (const b of allBulletins) {
          const periode = await storage.getPeriodePaie(b.periodePaieId);
          if (periode && periode.annee === targetYear) {
            filtered.push({
              mois: periode.mois,
              brut: b.salaireBrut,
              cnss: b.cnssSalarial,
              irpp: b.irpp,
              net: b.netAPayer
            });
          }
        }
        bulletinData = filtered;
      }
      const nomFichier = `${typeDocument}_${employe.nom}_${employe.prenom}_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`;
      const docRecord = await storage.createDocument({
        employeId,
        typeDocument,
        nomFichier,
        titre: DOC_LABELS[typeDocument] || typeDocument,
        generePar: req.user.id,
        entrepriseId: req.user.entrepriseId
      });
      const pdfStream = generateDocument(typeDocument, employe, entreprise, {
        annee: annee || (/* @__PURE__ */ new Date()).getFullYear(),
        bulletins: bulletinData
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomFichier}"`
      );
      pdfStream.pipe(res);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || "Erreur lors de la g\xE9n\xE9ration"
      });
    }
  }
);
documentsRouter.get("/:id/download", async (req, res) => {
  const doc = await storage.getDocument(req.params.id);
  if (!doc)
    return res.status(404).json({ success: false, error: "Document introuvable" });
  const employe = await storage.getEmploye(doc.employeId);
  if (!employe)
    return res.status(404).json({ success: false, error: "Employ\xE9 introuvable" });
  const entreprise = await storage.getEntreprise(req.user.entrepriseId);
  if (!entreprise)
    return res.status(404).json({ success: false, error: "Entreprise introuvable" });
  try {
    let bulletinData;
    if (doc.typeDocument === "fiche_paie_annuelle" /* FICHE_PAIE_ANNUELLE */) {
      const allBulletins = await storage.getBulletinsByEmploye(doc.employeId);
      const filtered = [];
      for (const b of allBulletins) {
        const periode = await storage.getPeriodePaie(b.periodePaieId);
        if (periode) {
          filtered.push({
            mois: periode.mois,
            brut: b.salaireBrut,
            cnss: b.cnssSalarial,
            irpp: b.irpp,
            net: b.netAPayer
          });
        }
      }
      bulletinData = filtered;
    }
    const pdfStream = generateDocument(doc.typeDocument, employe, entreprise, {
      bulletins: bulletinData
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.nomFichier}"`
    );
    pdfStream.pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de la g\xE9n\xE9ration"
    });
  }
});
documentsRouter.delete(
  "/:id",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const deleted = await storage.deleteDocument(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, error: "Document introuvable" });
    return res.json({ success: true, message: "Document supprim\xE9" });
  }
);

// server/routes/declarations.ts
import { Router as Router10 } from "express";

// server/declaration-gen.ts
import PDFDocument3 from "pdfkit";
var PRIMARY2 = "#1e40af";
var LIGHT_BG2 = "#f1f5f9";
var BORDER2 = "#cbd5e1";
function fmt3(n) {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function generateCnssD17(entreprise, employes, bulletins, trimestre, annee) {
  const pageW = 595.28 - 80;
  const doc = new PDFDocument3({ size: "A4", margin: 40, layout: "landscape" });
  const landscapeW = 841.89 - 80;
  doc.rect(40, 40, landscapeW, 50).fill(PRIMARY2);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text("D\xC9CLARATION TRIMESTRIELLE DES SALAIRES \u2014 CNSS D-17", 50, 50, { width: landscapeW - 20, align: "center" });
  doc.fontSize(9).font("Helvetica").text(`${trimestre}\xE8me Trimestre ${annee}`, 50, 68, { width: landscapeW - 20, align: "center" });
  let y = 105;
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica");
  doc.text(`Employeur: ${entreprise.nom}  |  Code CNSS: ${entreprise.codeCnss}  |  MF: ${entreprise.matriculeFiscal}`, 40, y);
  y += 25;
  const cols = [40, 80, 200, 310, 400, 490, 580, 670];
  const colW = [40, 120, 110, 90, 90, 90, 90, 90];
  const headers = ["N\xB0", "Nom & Pr\xE9nom", "Matricule CNSS", "Salaire Brut", "CNSS Salari\xE9", "CNSS Patronal", "Total CNSS", "Nb Jours"];
  doc.rect(40, y, landscapeW, 18).fill(PRIMARY2);
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 3, y + 5, { width: colW[i] - 6, align: i < 3 ? "left" : "right" });
  }
  y += 18;
  let totalBrut = 0, totalSal = 0, totalPat = 0, totalCnss = 0;
  const csvRows = [
    "N\xB0;Nom;Pr\xE9nom;Matricule CNSS;Salaire Brut;CNSS Salari\xE9;CNSS Patronal;Total CNSS;Nb Jours"
  ];
  employes.forEach((emp, idx) => {
    const empBulletins = bulletins.filter((b) => b.employeId === emp.id);
    if (empBulletins.length === 0) return;
    const brut = empBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const cnssSal = empBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const cnssPat = empBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
    const total = cnssSal + cnssPat;
    const nbJours = empBulletins.length * 26;
    totalBrut += brut;
    totalSal += cnssSal;
    totalPat += cnssPat;
    totalCnss += total;
    const bg = idx % 2 === 0 ? LIGHT_BG2 : "#ffffff";
    doc.rect(40, y, landscapeW, 14).fill(bg);
    doc.fillColor("#0f172a").fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), cols[0] + 3, y + 3, { width: colW[0] - 6 });
    doc.text(`${emp.nom.toUpperCase()} ${emp.prenom}`, cols[1] + 3, y + 3, { width: colW[1] - 6 });
    doc.text(emp.matriculeCnss, cols[2] + 3, y + 3, { width: colW[2] - 6 });
    doc.text(fmt3(brut), cols[3] + 3, y + 3, { width: colW[3] - 6, align: "right" });
    doc.text(fmt3(cnssSal), cols[4] + 3, y + 3, { width: colW[4] - 6, align: "right" });
    doc.text(fmt3(cnssPat), cols[5] + 3, y + 3, { width: colW[5] - 6, align: "right" });
    doc.text(fmt3(total), cols[6] + 3, y + 3, { width: colW[6] - 6, align: "right" });
    doc.text(String(nbJours), cols[7] + 3, y + 3, { width: colW[7] - 6, align: "right" });
    y += 14;
    csvRows.push(
      `${idx + 1};${emp.nom};${emp.prenom};${emp.matriculeCnss};${brut.toFixed(3)};${cnssSal.toFixed(3)};${cnssPat.toFixed(3)};${total.toFixed(3)};${nbJours}`
    );
  });
  doc.rect(40, y, landscapeW, 18).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  doc.text("TOTAUX", cols[1] + 3, y + 5, { width: colW[1] - 6 });
  doc.text(fmt3(totalBrut), cols[3] + 3, y + 5, { width: colW[3] - 6, align: "right" });
  doc.text(fmt3(totalSal), cols[4] + 3, y + 5, { width: colW[4] - 6, align: "right" });
  doc.text(fmt3(totalPat), cols[5] + 3, y + 5, { width: colW[5] - 6, align: "right" });
  doc.text(fmt3(totalCnss), cols[6] + 3, y + 5, { width: colW[6] - 6, align: "right" });
  csvRows.push(`TOTAL;;;${totalBrut.toFixed(3)};${totalSal.toFixed(3)};${totalPat.toFixed(3)};${totalCnss.toFixed(3)};`);
  doc.end();
  return { pdf: doc, csv: csvRows.join("\n") };
}
function generateDgiDeu(entreprise, employes, annualData, annee) {
  const doc = new PDFDocument3({ size: "A4", margin: 40, layout: "landscape" });
  const landscapeW = 841.89 - 80;
  doc.rect(40, 40, landscapeW, 50).fill(PRIMARY2);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text("D\xC9CLARATION DE L'EMPLOYEUR UNIQUE \u2014 DGI", 50, 48, { width: landscapeW - 20, align: "center" });
  doc.fontSize(9).font("Helvetica").text(`Ann\xE9e fiscale ${annee}`, 50, 68, { width: landscapeW - 20, align: "center" });
  let y = 105;
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica");
  doc.text(`Employeur: ${entreprise.nom}  |  MF: ${entreprise.matriculeFiscal}  |  CNSS: ${entreprise.codeCnss}`, 40, y);
  y += 25;
  const cols = [40, 70, 190, 270, 350, 430, 510, 590, 670];
  const colW = [30, 120, 80, 80, 80, 80, 80, 80, 90];
  const headers = ["N\xB0", "Nom & Pr\xE9nom", "CIN", "Brut Annuel", "CNSS", "Net Imposable", "IRPP", "CSS", "Net Pay\xE9"];
  doc.rect(40, y, landscapeW, 18).fill(PRIMARY2);
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 3, y + 5, { width: colW[i] - 6, align: i < 3 ? "left" : "right" });
  }
  y += 18;
  let tBrut = 0, tCnss = 0, tIrpp = 0, tNet = 0;
  const csvRows = [
    "N\xB0;Nom;Pr\xE9nom;CIN;Brut Annuel;CNSS;Net Imposable;IRPP;CSS;Net Pay\xE9"
  ];
  employes.forEach((emp, idx) => {
    const data = annualData.find((d) => d.employeId === emp.id);
    if (!data) return;
    const netImposable = data.brutAnnuel - data.cnssAnnuel;
    const css = data.irppAnnuel * 0.013;
    tBrut += data.brutAnnuel;
    tCnss += data.cnssAnnuel;
    tIrpp += data.irppAnnuel;
    tNet += data.netAnnuel;
    const bg = idx % 2 === 0 ? LIGHT_BG2 : "#ffffff";
    doc.rect(40, y, landscapeW, 14).fill(bg);
    doc.fillColor("#0f172a").fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), cols[0] + 3, y + 3, { width: colW[0] - 6 });
    doc.text(`${emp.nom.toUpperCase()} ${emp.prenom}`, cols[1] + 3, y + 3, { width: colW[1] - 6 });
    doc.text(emp.cin, cols[2] + 3, y + 3, { width: colW[2] - 6 });
    doc.text(fmt3(data.brutAnnuel), cols[3] + 3, y + 3, { width: colW[3] - 6, align: "right" });
    doc.text(fmt3(data.cnssAnnuel), cols[4] + 3, y + 3, { width: colW[4] - 6, align: "right" });
    doc.text(fmt3(netImposable), cols[5] + 3, y + 3, { width: colW[5] - 6, align: "right" });
    doc.text(fmt3(data.irppAnnuel), cols[6] + 3, y + 3, { width: colW[6] - 6, align: "right" });
    doc.text(fmt3(css), cols[7] + 3, y + 3, { width: colW[7] - 6, align: "right" });
    doc.text(fmt3(data.netAnnuel), cols[8] + 3, y + 3, { width: colW[8] - 6, align: "right" });
    y += 14;
    csvRows.push(
      `${idx + 1};${emp.nom};${emp.prenom};${emp.cin};${data.brutAnnuel.toFixed(3)};${data.cnssAnnuel.toFixed(3)};${netImposable.toFixed(3)};${data.irppAnnuel.toFixed(3)};${css.toFixed(3)};${data.netAnnuel.toFixed(3)}`
    );
  });
  doc.rect(40, y, landscapeW, 18).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  doc.text("TOTAUX", cols[1] + 3, y + 5, { width: colW[1] - 6 });
  doc.text(fmt3(tBrut), cols[3] + 3, y + 5, { width: colW[3] - 6, align: "right" });
  doc.text(fmt3(tCnss), cols[4] + 3, y + 5, { width: colW[4] - 6, align: "right" });
  doc.text(fmt3(tIrpp), cols[6] + 3, y + 5, { width: colW[6] - 6, align: "right" });
  doc.text(fmt3(tNet), cols[8] + 3, y + 5, { width: colW[8] - 6, align: "right" });
  doc.end();
  return { pdf: doc, csv: csvRows.join("\n") };
}
function generateVirementBancaire(entreprise, employes, bulletins, periode) {
  const MOIS = ["Janvier", "F\xE9vrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Ao\xFBt", "Septembre", "Octobre", "Novembre", "D\xE9cembre"];
  const pageW = 595.28 - 80;
  const doc = new PDFDocument3({ size: "A4", margin: 40 });
  doc.rect(40, 40, pageW, 50).fill(PRIMARY2);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text("ORDRE DE VIREMENT BANCAIRE \u2014 SALAIRES", 50, 48, { width: pageW - 20, align: "center" });
  doc.fontSize(9).font("Helvetica").text(`${MOIS[periode.mois - 1]} ${periode.annee}`, 50, 68, { width: pageW - 20, align: "center" });
  let y = 105;
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica");
  doc.text(`Employeur: ${entreprise.nom}  |  MF: ${entreprise.matriculeFiscal}`, 40, y);
  y += 25;
  const cols = [40, 70, 190, 310, 420];
  const colW = [30, 120, 120, 110, 95];
  const headers = ["N\xB0", "Nom & Pr\xE9nom", "IBAN", "Banque", "Montant (TND)"];
  doc.rect(40, y, pageW, 18).fill(PRIMARY2);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 3, y + 5, { width: colW[i] - 6, align: i < 4 ? "left" : "right" });
  }
  y += 18;
  let totalVirement = 0;
  const wireLines = [
    `RIB;MONTANT;BENEFICIAIRE;REFERENCE`
  ];
  employes.forEach((emp, idx) => {
    const bulletin = bulletins.find((b) => b.employeId === emp.id);
    if (!bulletin) return;
    const montant = bulletin.netAPayer;
    totalVirement += montant;
    const bg = idx % 2 === 0 ? LIGHT_BG2 : "#ffffff";
    doc.rect(40, y, pageW, 14).fill(bg);
    doc.fillColor("#0f172a").fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), cols[0] + 3, y + 3, { width: colW[0] - 6 });
    doc.text(`${emp.nom.toUpperCase()} ${emp.prenom}`, cols[1] + 3, y + 3, { width: colW[1] - 6 });
    doc.text(emp.iban.substring(0, 24), cols[2] + 3, y + 3, { width: colW[2] - 6 });
    doc.text(emp.banque?.substring(0, 15) || "", cols[3] + 3, y + 3, { width: colW[3] - 6 });
    doc.text(fmt3(montant), cols[4] + 3, y + 3, { width: colW[4] - 6, align: "right" });
    y += 14;
    const ref = `SAL-${periode.annee}${String(periode.mois).padStart(2, "0")}-${emp.matriculeCnss}`;
    wireLines.push(
      `${emp.iban.replace(/\s/g, "")};${montant.toFixed(3)};${emp.nom.toUpperCase()} ${emp.prenom};${ref}`
    );
  });
  doc.rect(40, y, pageW, 18).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  doc.text("TOTAL DES VIREMENTS", cols[1] + 3, y + 5, { width: colW[1] + colW[2] + colW[3] - 6 });
  doc.text(fmt3(totalVirement), cols[4] + 3, y + 5, { width: colW[4] - 6, align: "right" });
  y += 35;
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`Nombre de virements : ${employes.filter((e) => bulletins.some((b) => b.employeId === e.id)).length}`, 40, y);
  y += 14;
  doc.text(`Montant total : ${fmt3(totalVirement)} TND`, 40, y);
  y += 40;
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Signature autoris\xE9e", 300, y, { width: 200, align: "center" });
  y += 30;
  doc.rect(320, y, 160, 0.5).fill(BORDER2);
  doc.end();
  return { pdf: doc, wireFile: wireLines.join("\n") };
}

// server/routes/declarations.ts
var declarationsRouter = Router10();
declarationsRouter.use(requireAuth);
declarationsRouter.use(requireMinRole("admin_paie" /* ADMIN_PAIE */));
var DECL_LABELS = {
  ["cnss_d17" /* CNSS_D17 */]: "CNSS D-17",
  ["dgi_deu" /* DGI_DEU */]: "DGI DEU",
  ["virement_bancaire" /* VIREMENT_BANCAIRE */]: "Virement Bancaire"
};
declarationsRouter.get("/", async (req, res) => {
  const decls = await storage.getDeclarations(req.user.entrepriseId);
  return res.json({ success: true, data: decls });
});
declarationsRouter.post("/generate", async (req, res) => {
  const parsed = generateDeclarationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || "Donn\xE9es invalides"
    });
  }
  const { type, trimestre, annee, periodeDebut, periodeFin } = parsed.data;
  const entrepriseId = req.user.entrepriseId;
  const entreprise = await storage.getEntreprise(entrepriseId);
  if (!entreprise)
    return res.status(404).json({ success: false, error: "Entreprise introuvable" });
  const employes = await storage.getEmployes(entrepriseId);
  const periodes = await storage.getPeriodesPaie(entrepriseId);
  try {
    if (type === "cnss_d17" /* CNSS_D17 */) {
      const trimestreMonths = trimestre ? [
        (trimestre - 1) * 3 + 1,
        (trimestre - 1) * 3 + 2,
        (trimestre - 1) * 3 + 3
      ] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const relevantPeriodes = periodes.filter(
        (p) => p.annee === annee && trimestreMonths.includes(p.mois)
      );
      const allBulletins = [];
      for (const p of relevantPeriodes) {
        const b = await storage.getBulletins(p.id);
        allBulletins.push(...b);
      }
      if (allBulletins.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Aucun bulletin trouv\xE9 pour cette p\xE9riode. Calculez d'abord la paie."
        });
      }
      const nomFichier = `CNSS_D17_T${trimestre || 0}_${annee}.pdf`;
      const totalCnss = allBulletins.reduce(
        (s, b) => s + b.cnssSalarial + b.cnssPatronal,
        0
      );
      const declRecord = await storage.createDeclaration({
        entrepriseId,
        type,
        periodeDebut,
        periodeFin,
        trimestre,
        annee,
        nomFichier,
        nbEmployes: employes.length,
        montantTotal: totalCnss,
        generePar: req.user.id
      });
      const { pdf, csv } = generateCnssD17(
        entreprise,
        employes,
        allBulletins,
        trimestre || 1,
        annee
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomFichier}"`
      );
      pdf.pipe(res);
    } else if (type === "dgi_deu" /* DGI_DEU */) {
      const yearPeriodes = periodes.filter((p) => p.annee === annee);
      const allBulletins = [];
      for (const p of yearPeriodes) {
        const b = await storage.getBulletins(p.id);
        allBulletins.push(...b);
      }
      if (allBulletins.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Aucun bulletin trouv\xE9 pour cette ann\xE9e."
        });
      }
      const empMap = /* @__PURE__ */ new Map();
      for (const b of allBulletins) {
        const existing = empMap.get(b.employeId) || {
          brutAnnuel: 0,
          cnssAnnuel: 0,
          irppAnnuel: 0,
          netAnnuel: 0
        };
        existing.brutAnnuel += b.salaireBrut;
        existing.cnssAnnuel += b.cnssSalarial;
        existing.irppAnnuel += b.irpp;
        existing.netAnnuel += b.netAPayer;
        empMap.set(b.employeId, existing);
      }
      const annualData = Array.from(empMap.entries()).map(
        ([employeId, data]) => ({ employeId, ...data })
      );
      const totalIrpp = annualData.reduce((s, d) => s + d.irppAnnuel, 0);
      const nomFichier = `DGI_DEU_${annee}.pdf`;
      await storage.createDeclaration({
        entrepriseId,
        type,
        periodeDebut,
        periodeFin,
        annee,
        nomFichier,
        nbEmployes: annualData.length,
        montantTotal: totalIrpp,
        generePar: req.user.id
      });
      const { pdf } = generateDgiDeu(entreprise, employes, annualData, annee);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomFichier}"`
      );
      pdf.pipe(res);
    } else if (type === "virement_bancaire" /* VIREMENT_BANCAIRE */) {
      const startDate = new Date(periodeDebut);
      const mois = startDate.getMonth() + 1;
      const targetPeriode = periodes.find(
        (p) => p.annee === annee && p.mois === mois
      );
      if (!targetPeriode) {
        return res.status(400).json({ success: false, error: "P\xE9riode de paie introuvable." });
      }
      const bulletins = await storage.getBulletins(targetPeriode.id);
      if (bulletins.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Aucun bulletin calcul\xE9 pour cette p\xE9riode."
        });
      }
      const totalVirement = bulletins.reduce(
        (s, b) => s + b.netAPayer,
        0
      );
      const MOIS = [
        "Janvier",
        "F\xE9vrier",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Ao\xFBt",
        "Septembre",
        "Octobre",
        "Novembre",
        "D\xE9cembre"
      ];
      const nomFichier = `Virement_${MOIS[mois - 1]}_${annee}.pdf`;
      await storage.createDeclaration({
        entrepriseId,
        type,
        periodeDebut,
        periodeFin,
        annee,
        nomFichier,
        nbEmployes: bulletins.length,
        montantTotal: totalVirement,
        generePar: req.user.id
      });
      const { pdf } = generateVirementBancaire(
        entreprise,
        employes,
        bulletins,
        targetPeriode
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomFichier}"`
      );
      pdf.pipe(res);
    } else {
      return res.status(400).json({ success: false, error: "Type de d\xE9claration non support\xE9" });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de la g\xE9n\xE9ration"
    });
  }
});
declarationsRouter.get("/:id/download", async (req, res) => {
  const decl = await storage.getDeclaration(req.params.id);
  if (!decl)
    return res.status(404).json({ success: false, error: "D\xE9claration introuvable" });
  const entreprise = await storage.getEntreprise(decl.entrepriseId);
  if (!entreprise)
    return res.status(404).json({ success: false, error: "Entreprise introuvable" });
  const employes = await storage.getEmployes(decl.entrepriseId);
  const periodes = await storage.getPeriodesPaie(decl.entrepriseId);
  try {
    if (decl.type === "cnss_d17" /* CNSS_D17 */) {
      const trimestreMonths = decl.trimestre ? [
        (decl.trimestre - 1) * 3 + 1,
        (decl.trimestre - 1) * 3 + 2,
        (decl.trimestre - 1) * 3 + 3
      ] : [1, 2, 3];
      const relevantPeriodes = periodes.filter(
        (p) => p.annee === decl.annee && trimestreMonths.includes(p.mois)
      );
      const allBulletins = [];
      for (const p of relevantPeriodes) {
        const b = await storage.getBulletins(p.id);
        allBulletins.push(...b);
      }
      const { pdf } = generateCnssD17(
        entreprise,
        employes,
        allBulletins,
        decl.trimestre || 1,
        decl.annee
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${decl.nomFichier}"`
      );
      pdf.pipe(res);
    } else if (decl.type === "dgi_deu" /* DGI_DEU */) {
      const yearPeriodes = periodes.filter((p) => p.annee === decl.annee);
      const allBulletins = [];
      for (const p of yearPeriodes) {
        const b = await storage.getBulletins(p.id);
        allBulletins.push(...b);
      }
      const empMap = /* @__PURE__ */ new Map();
      for (const b of allBulletins) {
        const existing = empMap.get(b.employeId) || {
          brutAnnuel: 0,
          cnssAnnuel: 0,
          irppAnnuel: 0,
          netAnnuel: 0
        };
        existing.brutAnnuel += b.salaireBrut;
        existing.cnssAnnuel += b.cnssSalarial;
        existing.irppAnnuel += b.irpp;
        existing.netAnnuel += b.netAPayer;
        empMap.set(b.employeId, existing);
      }
      const annualData = Array.from(empMap.entries()).map(
        ([employeId, data]) => ({ employeId, ...data })
      );
      const { pdf } = generateDgiDeu(
        entreprise,
        employes,
        annualData,
        decl.annee
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${decl.nomFichier}"`
      );
      pdf.pipe(res);
    } else if (decl.type === "virement_bancaire" /* VIREMENT_BANCAIRE */) {
      const startDate = new Date(decl.periodeDebut);
      const mois = startDate.getMonth() + 1;
      const targetPeriode = periodes.find(
        (p) => p.annee === decl.annee && p.mois === mois
      );
      if (!targetPeriode)
        return res.status(404).json({ success: false, error: "P\xE9riode introuvable" });
      const bulletins = await storage.getBulletins(targetPeriode.id);
      const { pdf } = generateVirementBancaire(
        entreprise,
        employes,
        bulletins,
        targetPeriode
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${decl.nomFichier}"`
      );
      pdf.pipe(res);
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Erreur" });
  }
});
declarationsRouter.put("/:id/statut", async (req, res) => {
  const { statut } = req.body;
  if (!statut || !Object.values(DeclarationStatus).includes(statut)) {
    return res.status(400).json({ success: false, error: "Statut invalide" });
  }
  const updated = await storage.updateDeclarationStatut(req.params.id, statut);
  if (!updated)
    return res.status(404).json({ success: false, error: "D\xE9claration introuvable" });
  return res.json({ success: true, data: updated });
});
declarationsRouter.delete(
  "/:id",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const deleted = await storage.deleteDeclaration(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, error: "D\xE9claration introuvable" });
    return res.json({ success: true, message: "D\xE9claration supprim\xE9e" });
  }
);
declarationsRouter.get("/:id/csv", async (req, res) => {
  const decl = await storage.getDeclaration(req.params.id);
  if (!decl)
    return res.status(404).json({ success: false, error: "D\xE9claration introuvable" });
  const entreprise = await storage.getEntreprise(decl.entrepriseId);
  if (!entreprise)
    return res.status(404).json({ success: false, error: "Entreprise introuvable" });
  const employes = await storage.getEmployes(decl.entrepriseId);
  const periodes = await storage.getPeriodesPaie(decl.entrepriseId);
  try {
    let csvContent = "";
    if (decl.type === "cnss_d17" /* CNSS_D17 */) {
      const trimestreMonths = decl.trimestre ? [
        (decl.trimestre - 1) * 3 + 1,
        (decl.trimestre - 1) * 3 + 2,
        (decl.trimestre - 1) * 3 + 3
      ] : [1, 2, 3];
      const relevantPeriodes = periodes.filter(
        (p) => p.annee === decl.annee && trimestreMonths.includes(p.mois)
      );
      const allBulletins = [];
      for (const p of relevantPeriodes) {
        const b = await storage.getBulletins(p.id);
        allBulletins.push(...b);
      }
      const { csv } = generateCnssD17(
        entreprise,
        employes,
        allBulletins,
        decl.trimestre || 1,
        decl.annee
      );
      csvContent = csv;
    } else if (decl.type === "dgi_deu" /* DGI_DEU */) {
      const yearPeriodes = periodes.filter((p) => p.annee === decl.annee);
      const allBulletins = [];
      for (const p of yearPeriodes) {
        const b = await storage.getBulletins(p.id);
        allBulletins.push(...b);
      }
      const empMap = /* @__PURE__ */ new Map();
      for (const b of allBulletins) {
        const existing = empMap.get(b.employeId) || {
          brutAnnuel: 0,
          cnssAnnuel: 0,
          irppAnnuel: 0,
          netAnnuel: 0
        };
        existing.brutAnnuel += b.salaireBrut;
        existing.cnssAnnuel += b.cnssSalarial;
        existing.irppAnnuel += b.irpp;
        existing.netAnnuel += b.netAPayer;
        empMap.set(b.employeId, existing);
      }
      const annualData = Array.from(empMap.entries()).map(
        ([employeId, data]) => ({ employeId, ...data })
      );
      const { csv } = generateDgiDeu(
        entreprise,
        employes,
        annualData,
        decl.annee
      );
      csvContent = csv;
    } else {
      return res.status(400).json({
        success: false,
        error: "Export CSV non disponible pour ce type"
      });
    }
    const csvFilename = decl.nomFichier.replace(".pdf", ".csv");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${csvFilename}"`
    );
    res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Erreur" });
  }
});

// server/routes/reports.ts
import { Router as Router11 } from "express";
import PDFDocument4 from "pdfkit";
var reportsRouter = Router11();
reportsRouter.use(requireAuth);
reportsRouter.use(requireMinRole("comptable" /* COMPTABLE */));
var fmt4 = (n) => n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
var MOIS_NOMS = [
  "Janvier",
  "F\xE9vrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Ao\xFBt",
  "Septembre",
  "Octobre",
  "Novembre",
  "D\xE9cembre"
];
reportsRouter.get("/", async (req, res) => {
  const reports = await storage.getReports(req.user.entrepriseId);
  return res.json({ success: true, data: reports });
});
reportsRouter.post("/generate", async (req, res) => {
  const parsed = generateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || "Donn\xE9es invalides"
    });
  }
  const { type, titre, periodeDebut, periodeFin, filtres } = parsed.data;
  const entrepriseId = req.user.entrepriseId;
  const entreprise = await storage.getEntreprise(entrepriseId);
  if (!entreprise)
    return res.status(404).json({ success: false, error: "Entreprise introuvable" });
  const employes = await storage.getEmployes(entrepriseId);
  const periodes = await storage.getPeriodesPaie(entrepriseId);
  const startDate = new Date(periodeDebut);
  const endDate = new Date(periodeFin);
  const relevantPeriodes = periodes.filter((p) => {
    const periodeDate = new Date(p.annee, p.mois - 1, 1);
    return periodeDate >= startDate && periodeDate <= endDate;
  });
  const allBulletins = [];
  for (const p of relevantPeriodes) {
    const b = await storage.getBulletins(p.id);
    allBulletins.push(...b);
  }
  let filteredEmployes = employes;
  if (filtres?.departement) {
    filteredEmployes = employes.filter(
      (e) => e.departement === filtres.departement
    );
  }
  const empIds = new Set(filteredEmployes.map((e) => e.id));
  const filteredBulletins = allBulletins.filter((b) => empIds.has(b.employeId));
  const report = await storage.createReport({
    entrepriseId,
    type,
    titre,
    periodeDebut,
    periodeFin,
    filtres: filtres || void 0,
    generePar: req.user.id
  });
  try {
    const format = req.query.format === "csv" ? "csv" : "pdf";
    if (format === "csv") {
      const csv = generateReportCSV(
        type,
        filteredEmployes,
        filteredBulletins,
        relevantPeriodes,
        titre
      );
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${titre.replace(/\s/g, "_")}.csv"`
      );
      return res.send(csv);
    }
    const pdf = await generateReportPDF(
      type,
      entreprise,
      filteredEmployes,
      filteredBulletins,
      relevantPeriodes,
      titre,
      periodeDebut,
      periodeFin
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${titre.replace(/\s/g, "_")}.pdf"`
    );
    pdf.pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de la g\xE9n\xE9ration"
    });
  }
});
reportsRouter.get("/:id", async (req, res) => {
  const report = await storage.getReport(req.params.id);
  if (!report)
    return res.status(404).json({ success: false, error: "Rapport introuvable" });
  return res.json({ success: true, data: report });
});
reportsRouter.delete(
  "/:id",
  requireMinRole("admin_rh" /* ADMIN_RH */),
  async (req, res) => {
    const deleted = await storage.deleteReport(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, error: "Rapport introuvable" });
    return res.json({ success: true, message: "Rapport supprim\xE9" });
  }
);
async function generateReportPDF(type, entreprise, employes, bulletins, periodes, titre, periodeDebut, periodeFin) {
  const doc = new PDFDocument4({ size: "A4", layout: "landscape", margin: 40 });
  doc.fontSize(16).font("Helvetica-Bold").text(entreprise.nom, 40, 40);
  doc.fontSize(10).font("Helvetica").text(`MF: ${entreprise.mf || "N/A"}`, 40, 60);
  doc.fontSize(14).font("Helvetica-Bold").text(titre, 40, 90, { align: "center" });
  doc.fontSize(9).font("Helvetica").text(
    `P\xE9riode: ${periodeDebut} \u2192 ${periodeFin}  |  G\xE9n\xE9r\xE9 le ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-TN")}`,
    40,
    112,
    { align: "center" }
  );
  doc.moveDown(2);
  switch (type) {
    case "masse_salariale" /* MASSE_SALARIALE */:
      generateMasseSalarialePDF(doc, employes, bulletins, periodes);
      break;
    case "effectifs" /* EFFECTIFS */:
      generateEffectifsPDF(doc, employes);
      break;
    case "charges_sociales" /* CHARGES_SOCIALES */:
      generateChargesSocialesPDF(doc, employes, bulletins, periodes);
      break;
    case "conges" /* CONGES */:
      await generateCongesPDF(doc, employes, entreprise.id);
      break;
    case "cout_departement" /* COUT_DEPARTEMENT */:
      generateCoutDeptPDF(doc, employes, bulletins);
      break;
    case "personnalise" /* PERSONNALISE */:
      generatePersonnalisePDF(doc, employes, bulletins);
      break;
  }
  doc.end();
  return doc;
}
function generateMasseSalarialePDF(doc, employes, bulletins, periodes) {
  const y = doc.y;
  const cols = [40, 140, 250, 350, 440, 530, 620, 700];
  const headers = [
    "Mois",
    "Nb Bulletins",
    "Brut Total",
    "CNSS Sal.",
    "CNSS Pat.",
    "IRPP",
    "Net Total",
    "Co\xFBt Total"
  ];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 90 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();
  doc.font("Helvetica").fontSize(8);
  let currentY = y + 18;
  let grandBrut = 0, grandNet = 0, grandCout = 0;
  for (const p of periodes.sort(
    (a, b) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois)
  )) {
    const pBulletins = bulletins.filter((b) => b.periodePaieId === p.id);
    if (pBulletins.length === 0) continue;
    const brut = pBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const cnssSal = pBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const cnssPat = pBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
    const irpp = pBulletins.reduce((s, b) => s + b.irpp, 0);
    const net = pBulletins.reduce((s, b) => s + b.netAPayer, 0);
    const cout = brut + cnssPat;
    grandBrut += brut;
    grandNet += net;
    grandCout += cout;
    const label = `${MOIS_NOMS[p.mois - 1]} ${p.annee}`;
    doc.text(label, cols[0], currentY, { width: 100 });
    doc.text(String(pBulletins.length), cols[1], currentY, { width: 90 });
    doc.text(fmt4(brut), cols[2], currentY, { width: 90 });
    doc.text(fmt4(cnssSal), cols[3], currentY, { width: 90 });
    doc.text(fmt4(cnssPat), cols[4], currentY, { width: 90 });
    doc.text(fmt4(irpp), cols[5], currentY, { width: 90 });
    doc.text(fmt4(net), cols[6], currentY, { width: 90 });
    doc.text(fmt4(cout), cols[7], currentY, { width: 90 });
    currentY += 14;
    if (currentY > 540) {
      doc.addPage();
      currentY = 40;
    }
  }
  doc.moveTo(40, currentY).lineTo(780, currentY).stroke();
  currentY += 6;
  doc.font("Helvetica-Bold");
  doc.text("TOTAL", cols[0], currentY);
  doc.text(fmt4(grandBrut), cols[2], currentY, { width: 90 });
  doc.text(fmt4(grandNet), cols[6], currentY, { width: 90 });
  doc.text(fmt4(grandCout), cols[7], currentY, { width: 90 });
}
function generateEffectifsPDF(doc, employes) {
  const byDept = /* @__PURE__ */ new Map();
  for (const e of employes) {
    const arr = byDept.get(e.departement) || [];
    arr.push(e);
    byDept.set(e.departement, arr);
  }
  let currentY = doc.y;
  doc.fontSize(8).font("Helvetica-Bold");
  const cols = [40, 200, 340, 450, 560, 680];
  [
    "D\xE9partement",
    "Nb Employ\xE9s",
    "CDI",
    "CDD",
    "CIVP/KARAMA",
    "Anciennet\xE9 Moy."
  ].forEach((h, i) => doc.text(h, cols[i], currentY, { width: 130 }));
  doc.moveTo(40, currentY + 12).lineTo(780, currentY + 12).stroke();
  currentY += 18;
  doc.font("Helvetica");
  const now = /* @__PURE__ */ new Date();
  for (const [dept, emps] of Array.from(byDept.entries()).sort()) {
    const cdi = emps.filter((e) => e.typeContrat === "CDI" /* CDI */).length;
    const cdd = emps.filter((e) => e.typeContrat === "CDD" /* CDD */).length;
    const civpKarama = emps.filter(
      (e) => e.typeContrat === "SIVP" /* SIVP */ || e.typeContrat === "Karama" /* KARAMA */
    ).length;
    const anciennete = emps.reduce((s, e) => {
      const hire = new Date(e.dateEmbauche);
      return s + (now.getTime() - hire.getTime()) / (365.25 * 864e5);
    }, 0) / emps.length;
    doc.text(dept, cols[0], currentY, { width: 150 });
    doc.text(String(emps.length), cols[1], currentY, { width: 130 });
    doc.text(String(cdi), cols[2], currentY, { width: 100 });
    doc.text(String(cdd), cols[3], currentY, { width: 100 });
    doc.text(String(civpKarama), cols[4], currentY, { width: 100 });
    doc.text(`${anciennete.toFixed(1)} ans`, cols[5], currentY, { width: 100 });
    currentY += 14;
  }
  doc.moveTo(40, currentY).lineTo(780, currentY).stroke();
  currentY += 6;
  doc.font("Helvetica-Bold");
  doc.text(`Total: ${employes.length} employ\xE9s`, 40, currentY);
}
function generateChargesSocialesPDF(doc, employes, bulletins, periodes) {
  const y = doc.y;
  const cols = [40, 140, 250, 360, 470, 580, 680];
  const headers = [
    "Mois",
    "CNSS Salarial",
    "CNSS Patronal",
    "FOPROLOS",
    "TFP",
    "IRPP + CSS",
    "Total Charges"
  ];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 100 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();
  let currentY = y + 18;
  doc.font("Helvetica");
  for (const p of periodes.sort(
    (a, b) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois)
  )) {
    const pBulletins = bulletins.filter((b) => b.periodePaieId === p.id);
    if (pBulletins.length === 0) continue;
    const cnssSal = pBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const cnssPat = pBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
    const brut = pBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const foprolos = brut * 0.01;
    const tfp = brut * 0.02;
    const irppCss = pBulletins.reduce((s, b) => s + b.irpp, 0);
    const total = cnssSal + cnssPat + foprolos + tfp + irppCss;
    const label = `${MOIS_NOMS[p.mois - 1]} ${p.annee}`;
    doc.text(label, cols[0], currentY, { width: 100 });
    doc.text(fmt4(cnssSal), cols[1], currentY, { width: 100 });
    doc.text(fmt4(cnssPat), cols[2], currentY, { width: 100 });
    doc.text(fmt4(foprolos), cols[3], currentY, { width: 100 });
    doc.text(fmt4(tfp), cols[4], currentY, { width: 100 });
    doc.text(fmt4(irppCss), cols[5], currentY, { width: 100 });
    doc.text(fmt4(total), cols[6], currentY, { width: 100 });
    currentY += 14;
    if (currentY > 540) {
      doc.addPage();
      currentY = 40;
    }
  }
}
async function generateCongesPDF(doc, employes, entrepriseId) {
  const y = doc.y;
  const cols = [40, 200, 320, 440, 560, 680];
  const headers = [
    "Employ\xE9",
    "D\xE9partement",
    "Total Demandes",
    "Approuv\xE9s",
    "En attente",
    "Solde"
  ];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 110 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();
  let currentY = y + 18;
  doc.font("Helvetica");
  const allConges = await storage.getConges(entrepriseId);
  for (const emp of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
    const empConges = allConges.filter((c) => c.employeId === emp.id);
    const approuves = empConges.filter(
      (c) => c.statut === "approuve" /* APPROUVE */
    ).length;
    const enAttente = empConges.filter(
      (c) => c.statut === "en_attente" /* EN_ATTENTE */
    ).length;
    const joursApprouves = empConges.filter((c) => c.statut === "approuve" /* APPROUVE */).reduce((s, c) => s + c.nbJours, 0);
    doc.text(`${emp.nom} ${emp.prenom}`, cols[0], currentY, { width: 150 });
    doc.text(emp.departement, cols[1], currentY, { width: 110 });
    doc.text(String(empConges.length), cols[2], currentY, { width: 110 });
    doc.text(String(approuves), cols[3], currentY, { width: 110 });
    doc.text(String(enAttente), cols[4], currentY, { width: 110 });
    doc.text(`${joursApprouves} j`, cols[5], currentY, { width: 100 });
    currentY += 14;
    if (currentY > 540) {
      doc.addPage();
      currentY = 40;
    }
  }
}
function generateCoutDeptPDF(doc, employes, bulletins) {
  const y = doc.y;
  const cols = [40, 180, 300, 420, 540, 660];
  const headers = ["D\xE9partement", "Nb Employ\xE9s", "Brut Total", "Charges Pat.", "Co\xFBt Total", "Co\xFBt/Employ\xE9"];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 110 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();
  let currentY = y + 18;
  doc.font("Helvetica");
  const byDept = /* @__PURE__ */ new Map();
  for (const b of bulletins) {
    const emp = employes.find((e) => e.id === b.employeId);
    if (!emp) continue;
    const dept = emp.departement;
    const existing = byDept.get(dept) || { emps: /* @__PURE__ */ new Set(), brut: 0, charges: 0 };
    existing.emps.add(b.employeId);
    existing.brut += b.salaireBrut;
    existing.charges += b.cnssPatronal + b.salaireBrut * 0.03;
    byDept.set(dept, existing);
  }
  for (const [dept, data] of Array.from(byDept.entries()).sort()) {
    const nbEmps = data.emps.size;
    const cout = data.brut + data.charges;
    doc.text(dept, cols[0], currentY, { width: 130 });
    doc.text(String(nbEmps), cols[1], currentY, { width: 110 });
    doc.text(fmt4(data.brut), cols[2], currentY, { width: 110 });
    doc.text(fmt4(data.charges), cols[3], currentY, { width: 110 });
    doc.text(fmt4(cout), cols[4], currentY, { width: 110 });
    doc.text(fmt4(cout / nbEmps), cols[5], currentY, { width: 110 });
    currentY += 14;
  }
}
function generatePersonnalisePDF(doc, employes, bulletins) {
  const y = doc.y;
  const cols = [40, 160, 270, 360, 440, 520, 600, 680];
  const headers = ["Employ\xE9", "D\xE9partement", "Brut", "CNSS Sal.", "IRPP", "Net", "Nb Bulletins", "Moy. Net"];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 80 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();
  let currentY = y + 18;
  doc.font("Helvetica");
  for (const emp of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
    const empBulletins = bulletins.filter((b) => b.employeId === emp.id);
    if (empBulletins.length === 0) continue;
    const brut = empBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const cnss = empBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const irpp = empBulletins.reduce((s, b) => s + b.irpp, 0);
    const net = empBulletins.reduce((s, b) => s + b.netAPayer, 0);
    doc.text(`${emp.nom} ${emp.prenom}`, cols[0], currentY, { width: 110 });
    doc.text(emp.departement, cols[1], currentY, { width: 100 });
    doc.text(fmt4(brut), cols[2], currentY, { width: 80 });
    doc.text(fmt4(cnss), cols[3], currentY, { width: 80 });
    doc.text(fmt4(irpp), cols[4], currentY, { width: 80 });
    doc.text(fmt4(net), cols[5], currentY, { width: 80 });
    doc.text(String(empBulletins.length), cols[6], currentY, { width: 80 });
    doc.text(fmt4(net / empBulletins.length), cols[7], currentY, { width: 80 });
    currentY += 14;
    if (currentY > 540) {
      doc.addPage();
      currentY = 40;
    }
  }
}
function generateReportCSV(type, employes, bulletins, periodes, _titre) {
  const lines = [];
  switch (type) {
    case "masse_salariale" /* MASSE_SALARIALE */: {
      lines.push("Mois;Nb Bulletins;Brut Total;CNSS Sal.;CNSS Pat.;IRPP;Net Total;Co\xFBt Total");
      for (const p of periodes.sort((a, b) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois))) {
        const pBulletins = bulletins.filter((b) => b.periodePaieId === p.id);
        if (pBulletins.length === 0) continue;
        const brut = pBulletins.reduce((s, b) => s + b.salaireBrut, 0);
        const cnssSal = pBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
        const cnssPat = pBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
        const irpp = pBulletins.reduce((s, b) => s + b.irpp, 0);
        const net = pBulletins.reduce((s, b) => s + b.netAPayer, 0);
        lines.push([`${MOIS_NOMS[p.mois - 1]} ${p.annee}`, pBulletins.length, brut.toFixed(3), cnssSal.toFixed(3), cnssPat.toFixed(3), irpp.toFixed(3), net.toFixed(3), (brut + cnssPat).toFixed(3)].join(";"));
      }
      break;
    }
    case "effectifs" /* EFFECTIFS */: {
      lines.push("Employ\xE9;D\xE9partement;Poste;Type Contrat;Date Embauche;Salaire Brut");
      for (const e of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
        lines.push([`${e.nom} ${e.prenom}`, e.departement, e.poste, e.typeContrat, e.dateEmbauche, e.salaireBase.toFixed(3)].join(";"));
      }
      break;
    }
    case "charges_sociales" /* CHARGES_SOCIALES */: {
      lines.push("Mois;CNSS Salarial;CNSS Patronal;FOPROLOS;TFP;IRPP+CSS;Total Charges");
      for (const p of periodes.sort((a, b) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois))) {
        const pBulletins = bulletins.filter((b) => b.periodePaieId === p.id);
        if (pBulletins.length === 0) continue;
        const cnssSal = pBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
        const cnssPat = pBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
        const brut = pBulletins.reduce((s, b) => s + b.salaireBrut, 0);
        const foprolos = brut * 0.01;
        const tfp = brut * 0.02;
        const irppCss = pBulletins.reduce((s, b) => s + b.irpp, 0);
        lines.push([`${MOIS_NOMS[p.mois - 1]} ${p.annee}`, cnssSal.toFixed(3), cnssPat.toFixed(3), foprolos.toFixed(3), tfp.toFixed(3), irppCss.toFixed(3), (cnssSal + cnssPat + foprolos + tfp + irppCss).toFixed(3)].join(";"));
      }
      break;
    }
    case "personnalise" /* PERSONNALISE */:
    default: {
      lines.push("Employ\xE9;D\xE9partement;Brut Total;CNSS Salarial;IRPP;Net Total;Nb Bulletins;Moyenne Net");
      for (const emp of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
        const empBulletins = bulletins.filter((b) => b.employeId === emp.id);
        if (empBulletins.length === 0) continue;
        const brut = empBulletins.reduce((s, b) => s + b.salaireBrut, 0);
        const cnss = empBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
        const irpp = empBulletins.reduce((s, b) => s + b.irpp, 0);
        const net = empBulletins.reduce((s, b) => s + b.netAPayer, 0);
        lines.push([`${emp.nom} ${emp.prenom}`, emp.departement, brut.toFixed(3), cnss.toFixed(3), irpp.toFixed(3), net.toFixed(3), empBulletins.length, (net / empBulletins.length).toFixed(3)].join(";"));
      }
      break;
    }
  }
  return lines.join("\n");
}

// server/routes/notifications.ts
import { Router as Router12 } from "express";
var notificationsRouter = Router12();
notificationsRouter.use(requireAuth);
notificationsRouter.get("/", async (req, res) => {
  try {
    const notifications = await storage.getNotifications(req.user.id);
    const unreadCount = await storage.getUnreadCount(req.user.id);
    return res.json({
      success: true,
      data: { notifications, unreadCount }
    });
  } catch (error) {
    console.error("List notifications error:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
notificationsRouter.get(
  "/unread-count",
  async (req, res) => {
    try {
      const count = await storage.getUnreadCount(req.user.id);
      return res.json({ success: true, data: count });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Erreur serveur"
      });
    }
  }
);
notificationsRouter.put("/:id/read", async (req, res) => {
  try {
    const ok = await storage.markNotificationRead(req.params.id, req.user.id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Notification introuvable"
      });
    }
    return res.json({
      success: true,
      message: "Marqu\xE9e comme lue"
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
notificationsRouter.put("/read-all", async (req, res) => {
  try {
    const count = await storage.markAllNotificationsRead(req.user.id);
    return res.json({
      success: true,
      data: count,
      message: `${count} notifications marqu\xE9es comme lues`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
notificationsRouter.delete("/:id", async (req, res) => {
  try {
    const ok = await storage.deleteNotification(req.params.id, req.user.id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Notification introuvable"
      });
    }
    return res.json({
      success: true,
      message: "Notification supprim\xE9e"
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// server/routes/api-keys.ts
import { Router as Router13 } from "express";
var apiKeysRouter = Router13();
apiKeysRouter.use(requireAuth, requireMinRole("admin_rh" /* ADMIN_RH */));
apiKeysRouter.get("/", async (req, res) => {
  try {
    const keys = await storage.getApiKeys(req.user.entrepriseId);
    return res.json({ success: true, data: keys });
  } catch (error) {
    console.error("List API keys error:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
apiKeysRouter.post("/", async (req, res) => {
  try {
    const parsed = createApiKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", ")
      });
    }
    const result = await storage.createApiKey({
      entrepriseId: req.user.entrepriseId,
      nom: parsed.data.nom,
      permissions: parsed.data.permissions,
      limiteRequetes: parsed.data.limiteRequetes ?? 1e3
    });
    await storage.broadcastNotification(
      req.user.entrepriseId,
      "admin_rh" /* ADMIN_RH */,
      {
        type: "alerte_systeme" /* ALERTE_SYSTEME */,
        priorite: "medium" /* MEDIUM */,
        titre: "Nouvelle cl\xE9 API cr\xE9\xE9e",
        message: `La cl\xE9 API "${result.apiKey.nom}" a \xE9t\xE9 cr\xE9\xE9e par ${req.user.prenom} ${req.user.nom}.`,
        lien: "/app/api-keys"
      }
    );
    return res.status(201).json({
      success: true,
      data: {
        ...result.apiKey,
        rawKey: result.rawKey
        // Only returned once!
      },
      message: "Cl\xE9 API cr\xE9\xE9e. Copiez la cl\xE9 maintenant, elle ne sera plus affich\xE9e."
    });
  } catch (error) {
    console.error("Create API key error:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
apiKeysRouter.put("/:id/toggle", async (req, res) => {
  try {
    const key = await storage.toggleApiKey(
      req.params.id,
      req.user.entrepriseId
    );
    if (!key) {
      return res.status(404).json({
        success: false,
        error: "Cl\xE9 API introuvable"
      });
    }
    return res.json({ success: true, data: key });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
apiKeysRouter.delete("/:id", async (req, res) => {
  try {
    const ok = await storage.deleteApiKey(
      req.params.id,
      req.user.entrepriseId
    );
    if (!ok) {
      return res.status(404).json({
        success: false,
        error: "Cl\xE9 API introuvable"
      });
    }
    return res.json({
      success: true,
      message: "Cl\xE9 API supprim\xE9e"
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// server/routes/external-api.ts
import { Router as Router14 } from "express";
var externalApiRouter = Router14();
async function requireApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "API key required. Use Authorization: Bearer <api_key>"
    });
  }
  const rawKey = authHeader.substring(7);
  const apiKey = await storage.getApiKeyByRaw(rawKey);
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key"
    });
  }
  const rateCheck = storage.checkRateLimit(apiKey.id, apiKey.limiteRequetes);
  res.set("X-RateLimit-Limit", String(apiKey.limiteRequetes));
  res.set("X-RateLimit-Remaining", String(rateCheck.remaining));
  res.set("X-RateLimit-Reset", new Date(rateCheck.resetAt).toISOString());
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Try again later."
    });
  }
  await storage.updateApiKeyLastUsed(apiKey.id);
  req.apiKey = apiKey;
  req.apiEntrepriseId = apiKey.entrepriseId;
  next();
}
function requirePermission(...perms) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }
    const hasPermission = perms.some((p) => req.apiKey.permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Missing required permission: ${perms.join(" or ")}`
      });
    }
    next();
  };
}
externalApiRouter.use(requireApiKey);
externalApiRouter.get("/", (_req, res) => {
  return res.json({
    success: true,
    data: {
      version: "1.0",
      description: "PayrollHub External API \u2014 Tunisian Payroll & HR",
      baseUrl: "/api/v1",
      authentication: "Bearer token via Authorization header",
      rateLimit: "Per-key hourly limit (see X-RateLimit-* headers)",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/employes",
          description: "List all employees",
          permission: "employes:read",
          parameters: [
            {
              name: "search",
              type: "string",
              required: false,
              description: "Search by name, CIN or department"
            },
            {
              name: "departement",
              type: "string",
              required: false,
              description: "Filter by department"
            },
            {
              name: "actif",
              type: "boolean",
              required: false,
              description: "Filter by active status"
            }
          ]
        },
        {
          method: "GET",
          path: "/api/v1/employes/:id",
          description: "Get employee detail",
          permission: "employes:read"
        },
        {
          method: "GET",
          path: "/api/v1/paie/periodes",
          description: "List payroll periods",
          permission: "paie:read"
        },
        {
          method: "GET",
          path: "/api/v1/paie/periodes/:id",
          description: "Get payroll period with bulletins",
          permission: "paie:read"
        },
        {
          method: "GET",
          path: "/api/v1/conges",
          description: "List leave requests",
          permission: "conges:read",
          parameters: [
            {
              name: "employeId",
              type: "string",
              required: false,
              description: "Filter by employee"
            },
            {
              name: "statut",
              type: "string",
              required: false,
              description: "Filter by status"
            }
          ]
        },
        {
          method: "POST",
          path: "/api/v1/conges",
          description: "Create leave request",
          permission: "conges:write"
        },
        {
          method: "GET",
          path: "/api/v1/dashboard/stats",
          description: "Get dashboard statistics",
          permission: "dashboard:read"
        },
        {
          method: "GET",
          path: "/api/v1/documents",
          description: "List generated documents",
          permission: "documents:read"
        }
      ]
    }
  });
});
externalApiRouter.get(
  "/employes",
  requirePermission("employes:read"),
  async (req, res) => {
    try {
      let emps = await storage.getEmployes(req.apiEntrepriseId);
      const { search, departement, actif } = req.query;
      if (search) {
        const s = String(search).toLowerCase();
        emps = emps.filter(
          (e) => `${e.nom} ${e.prenom} ${e.cin} ${e.departement}`.toLowerCase().includes(s)
        );
      }
      if (departement) {
        emps = emps.filter((e) => e.departement === String(departement));
      }
      if (actif !== void 0) {
        const isActif = actif === "true";
        emps = emps.filter((e) => e.actif === isActif);
      }
      return res.json({ success: true, data: emps });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.get(
  "/employes/:id",
  requirePermission("employes:read"),
  async (req, res) => {
    try {
      const emp = await storage.getEmploye(req.params.id);
      if (!emp || emp.entrepriseId !== req.apiEntrepriseId) {
        return res.status(404).json({
          success: false,
          error: "Employee not found"
        });
      }
      return res.json({ success: true, data: emp });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.get(
  "/paie/periodes",
  requirePermission("paie:read"),
  async (req, res) => {
    try {
      const periodes = await storage.getPeriodesPaie(req.apiEntrepriseId);
      return res.json({ success: true, data: periodes });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.get(
  "/paie/periodes/:id",
  requirePermission("paie:read"),
  async (req, res) => {
    try {
      const periode = await storage.getPeriodePaie(req.params.id);
      if (!periode || periode.entrepriseId !== req.apiEntrepriseId) {
        return res.status(404).json({
          success: false,
          error: "Period not found"
        });
      }
      const bulletins = await storage.getBulletins(periode.id);
      return res.json({
        success: true,
        data: { periode, bulletins }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.get(
  "/conges",
  requirePermission("conges:read"),
  async (req, res) => {
    try {
      let conges = await storage.getConges();
      const emps = await storage.getEmployes(req.apiEntrepriseId);
      const empIds = new Set(emps.map((e) => e.id));
      conges = conges.filter((c) => empIds.has(c.employeId));
      const { employeId, statut } = req.query;
      if (employeId)
        conges = conges.filter((c) => c.employeId === String(employeId));
      if (statut)
        conges = conges.filter((c) => c.statut === String(statut));
      return res.json({ success: true, data: conges });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.post(
  "/conges",
  requirePermission("conges:write"),
  async (req, res) => {
    try {
      const { employeId, typeConge, dateDebut, dateFin, nbJours, motif } = req.body;
      if (!employeId || !typeConge || !dateDebut || !dateFin || !nbJours) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields"
        });
      }
      const emp = await storage.getEmploye(employeId);
      if (!emp || emp.entrepriseId !== req.apiEntrepriseId) {
        return res.status(404).json({
          success: false,
          error: "Employee not found"
        });
      }
      const conge = await storage.createConge({
        employeId,
        typeConge,
        dateDebut,
        dateFin,
        nbJours,
        motif: motif || ""
      });
      return res.status(201).json({ success: true, data: conge });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.get(
  "/dashboard/stats",
  requirePermission("dashboard:read"),
  async (req, res) => {
    try {
      const stats = await storage.getCachedDashboardStats(req.apiEntrepriseId);
      return res.json({ success: true, data: stats });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);
externalApiRouter.get(
  "/documents",
  requirePermission("documents:read"),
  async (req, res) => {
    try {
      const docs = await storage.getDocuments(req.apiEntrepriseId);
      return res.json({ success: true, data: docs });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

// server/routes/super-external.ts
import { Router as Router15 } from "express";
import bcrypt5 from "bcryptjs";
var superExternalRouter = Router15();
superExternalRouter.use(requireAuth, requireRole("super_external_admin" /* SUPER_EXTERNAL_ADMIN */));
superExternalRouter.get("/companies", async (_req, res) => {
  try {
    const companies = await storage.getEntreprises();
    const enriched = await Promise.all(
      companies.map(async (c) => {
        const empCount = await storage.countEmployes(c.id);
        const users = await storage.getUtilisateurs(c.id);
        return { ...c, plan: c.plan || "gratuit", employeeCount: empCount, userCount: users.length };
      })
    );
    return res.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
superExternalRouter.get("/companies/:id", async (req, res) => {
  try {
    const company = await storage.getEntreprise(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: "Entreprise non trouv\xE9e" });
    }
    const employeeCount = await storage.countEmployes(company.id);
    const users = await storage.getUtilisateurs(company.id);
    return res.json({ success: true, data: { company: { ...company, plan: company.plan || "gratuit" }, employeeCount, users } });
  } catch (error) {
    console.error("Error fetching company:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
superExternalRouter.post("/companies", async (req, res) => {
  try {
    const parsed = createCompanyWithAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", ")
      });
    }
    const data = parsed.data;
    const existing = await storage.getEntrepriseByMatricule(data.matriculeFiscal);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Une entreprise avec ce matricule fiscal existe d\xE9j\xE0"
      });
    }
    const existingUser = await storage.getUtilisateurByEmail(data.adminEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Un utilisateur avec cet email existe d\xE9j\xE0"
      });
    }
    const planKey = data.plan;
    const planConfig = PLAN_LIMITS[planKey];
    const company = await storage.createEntreprise({
      nom: data.companyName,
      adresse: data.adresse,
      matriculeFiscal: data.matriculeFiscal,
      codeCnss: data.codeCnss,
      secteurActivite: data.secteurActivite,
      telephone: data.telephone,
      email: data.companyEmail,
      regimeTravail: data.regimeTravail,
      plan: data.plan,
      maxEmployees: planConfig.maxEmployees,
      createdBy: req.user.id
    });
    const passwordHash = await bcrypt5.hash(data.adminPassword, 10);
    const admin = await storage.createUtilisateur({
      email: data.adminEmail,
      motDePasseHash: passwordHash,
      nom: data.adminNom,
      prenom: data.adminPrenom,
      role: "super_admin" /* SUPER_ADMIN */,
      entrepriseId: company.id
    });
    const { motDePasseHash, ...adminData } = admin;
    return res.status(201).json({
      success: true,
      data: {
        company,
        admin: adminData
      },
      message: "Entreprise et administrateur cr\xE9\xE9s avec succ\xE8s"
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
superExternalRouter.put("/companies/:id/plan", async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !PLAN_LIMITS[plan]) {
      return res.status(400).json({ success: false, error: "Plan invalide" });
    }
    const planConfig = PLAN_LIMITS[plan];
    const company = await storage.updateEntreprise(req.params.id, {
      plan,
      maxEmployees: planConfig.maxEmployees
    });
    if (!company) {
      return res.status(404).json({ success: false, error: "Entreprise non trouv\xE9e" });
    }
    return res.json({ success: true, data: company });
  } catch (error) {
    console.error("Error updating plan:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
superExternalRouter.get("/stats", async (_req, res) => {
  try {
    const companies = await storage.getEntreprises();
    const totalCompanies = companies.length;
    let totalEmployees = 0;
    let totalUsers = 0;
    const planDistribution = {};
    for (const c of companies) {
      const empCount = await storage.countEmployes(c.id);
      totalEmployees += empCount;
      const users = await storage.getUtilisateurs(c.id);
      totalUsers += users.length;
      const plan = c.plan || "gratuit";
      planDistribution[plan] = (planDistribution[plan] || 0) + 1;
    }
    return res.json({
      success: true,
      data: {
        totalCompanies,
        totalEmployees,
        totalUsers,
        planDistribution
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
superExternalRouter.get("/plans", (_req, res) => {
  return res.json({
    success: true,
    data: Object.entries(PLAN_LIMITS).map(([key, config]) => ({
      id: key,
      ...config
    }))
  });
});

// server/routes/document-requests.ts
import { Router as Router16 } from "express";

// server/multer-config.ts
import multer from "multer";
import path from "path";
import { v4 as uuidv43 } from "uuid";
var UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
var paperStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(UPLOAD_DIR, "papers"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv43()}${ext}`;
    cb(null, uniqueName);
  }
});
var documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(UPLOAD_DIR, "documents"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv43()}${ext}`;
    cb(null, uniqueName);
  }
});
function fileFilter(_req, file, cb) {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autoris\xE9: ${file.mimetype}`));
  }
}
var uploadPapers = multer({
  storage: paperStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB
    files: 5
  }
});
var uploadDocuments = multer({
  storage: documentStorage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    // 20MB
    files: 1
  }
});

// server/routes/document-requests.ts
var documentRequestsRouter = Router16();
documentRequestsRouter.use(requireAuth);
documentRequestsRouter.post("/", async (req, res) => {
  try {
    const parsed = createDocumentRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", ")
      });
    }
    const user = req.user;
    if (!user.entrepriseId) {
      return res.status(400).json({ success: false, error: "Utilisateur non li\xE9 \xE0 une entreprise" });
    }
    const fullUser = await storage.getUtilisateur(user.id);
    if (!fullUser?.employeId) {
      return res.status(400).json({ success: false, error: "Aucun employ\xE9 li\xE9 \xE0 votre compte" });
    }
    const requiredPapers = DOCUMENT_REQUIRED_PAPERS[parsed.data.typeDocument] || [];
    const request = await storage.createDocumentRequest({
      employeId: fullUser.employeId,
      entrepriseId: user.entrepriseId,
      typeDocument: parsed.data.typeDocument,
      motif: parsed.data.motif,
      requiredPapers,
      uploadedPapers: [],
      reviewedBy: void 0,
      reviewComment: void 0,
      dateReview: void 0,
      generatedDocumentId: void 0
    });
    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error("Error creating document request:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
documentRequestsRouter.post("/:id/upload", uploadPapers.array("papers", 5), async (req, res) => {
  try {
    const request = await storage.getDocumentRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: "Demande non trouv\xE9e" });
    }
    const fullUser = await storage.getUtilisateur(req.user.id);
    if (!fullUser?.employeId || request.employeId !== fullUser.employeId) {
      return res.status(403).json({ success: false, error: "Acc\xE8s refus\xE9" });
    }
    if (request.statut !== "en_attente" /* EN_ATTENTE */ && request.statut !== "rejete" /* REJETE */) {
      return res.status(400).json({ success: false, error: "Impossible d'ajouter des fichiers \xE0 cette demande" });
    }
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: "Aucun fichier fourni" });
    }
    const uploadedPapers = [];
    for (const file of files) {
      const fileMeta = await UploadedFileModel.create({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: req.user.id,
        entrepriseId: req.user.entrepriseId,
        category: "paper"
      });
      uploadedPapers.push({
        fileId: fileMeta._id.toString(),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      });
    }
    const existingPapers = request.uploadedPapers || [];
    const updated = await storage.updateDocumentRequest(req.params.id, {
      uploadedPapers: [...existingPapers, ...uploadedPapers],
      statut: "en_attente" /* EN_ATTENTE */
      // Reset to pending if was rejected
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error uploading papers:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
documentRequestsRouter.get("/", async (req, res) => {
  try {
    const user = req.user;
    if (user.role === "employe" /* EMPLOYE */) {
      const fullUser = await storage.getUtilisateur(user.id);
      if (!fullUser?.employeId) {
        return res.json({ success: true, data: [] });
      }
      const requests = await storage.getDocumentRequestsByEmploye(fullUser.employeId);
      return res.json({ success: true, data: requests });
    }
    if (user.entrepriseId) {
      const requests = await storage.getDocumentRequests(user.entrepriseId);
      return res.json({ success: true, data: requests });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error fetching document requests:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
documentRequestsRouter.get("/:id", async (req, res) => {
  try {
    const request = await storage.getDocumentRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: "Demande non trouv\xE9e" });
    }
    const employee = await storage.getEmploye(request.employeId);
    return res.json({ success: true, data: { ...request, employe: employee } });
  } catch (error) {
    console.error("Error fetching document request:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
documentRequestsRouter.put("/:id/review", requireMinRole("manager" /* MANAGER */), async (req, res) => {
  try {
    const parsed = reviewDocumentRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.issues.map((e) => e.message).join(", ")
      });
    }
    const request = await storage.getDocumentRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: "Demande non trouv\xE9e" });
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newStatut = parsed.data.statut === "approuve" ? "approuve" /* APPROUVE */ : "rejete" /* REJETE */;
    const updated = await storage.updateDocumentRequest(req.params.id, {
      statut: newStatut,
      reviewedBy: req.user.id,
      reviewComment: parsed.data.reviewComment,
      dateReview: now
    });
    if (updated) {
      const employee = await storage.getEmploye(updated.employeId);
      const users = await storage.getUtilisateurs(updated.entrepriseId);
      const empUser = users.find((u) => u.employeId === updated.employeId);
      if (empUser) {
        await storage.createNotification({
          entrepriseId: updated.entrepriseId,
          destinataireId: empUser.id,
          type: "document_genere",
          priorite: "medium",
          titre: newStatut === "approuve" /* APPROUVE */ ? "Demande de document approuv\xE9e" : "Demande de document rejet\xE9e",
          message: newStatut === "approuve" /* APPROUVE */ ? `Votre demande de ${updated.typeDocument.replace(/_/g, " ")} a \xE9t\xE9 approuv\xE9e.` : `Votre demande de ${updated.typeDocument.replace(/_/g, " ")} a \xE9t\xE9 rejet\xE9e. ${parsed.data.reviewComment || ""}`,
          lien: "/app/mon-espace"
        });
      }
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error reviewing document request:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
documentRequestsRouter.delete("/:id", async (req, res) => {
  try {
    const request = await storage.getDocumentRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: "Demande non trouv\xE9e" });
    }
    const fullUser = await storage.getUtilisateur(req.user.id);
    if (req.user.role === "employe" /* EMPLOYE */ && request.employeId !== fullUser?.employeId) {
      return res.status(403).json({ success: false, error: "Acc\xE8s refus\xE9" });
    }
    await storage.deleteDocumentRequest(req.params.id);
    return res.json({ success: true, message: "Demande supprim\xE9e" });
  } catch (error) {
    console.error("Error deleting document request:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});
documentRequestsRouter.get("/required-papers/:type", (_req, res) => {
  const type = _req.params.type;
  const papers = DOCUMENT_REQUIRED_PAPERS[type] || [];
  return res.json({ success: true, data: papers });
});

// server/vercel-entry.ts
dotenv2.config();
var app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/users", usersRouter);
app.use("/api/entreprises", entreprisesRouter);
app.use("/api/parametres", parametresRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/conges", congesRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/declarations", declarationsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/v1", externalApiRouter);
app.use("/api/super-external", superExternalRouter);
app.use("/api/document-requests", documentRequestsRouter);
var dbConnected = false;
async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    await storage.seed();
    dbConnected = true;
  }
}
var handler = async (req, res) => {
  await ensureDB();
  return app(req, res);
};
var vercel_entry_default = handler;
export {
  vercel_entry_default as default
};
