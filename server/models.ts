// ============================================================================
// PayrollHub — Mongoose Models
// All MongoDB schemas and models for the application
// ============================================================================

import mongoose, { Schema, type Document } from "mongoose";

// --- Helper: Standard toJSON transform ---
function addIdTransform(schema: Schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
  schema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
}

// ============================================================================
// Entreprise (Company)
// ============================================================================

const entrepriseSchema = new Schema(
  {
    nom: { type: String, required: true },
    adresse: { type: String, required: true },
    matriculeFiscal: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    codeCnss: { type: String, required: true },
    secteurActivite: {
      type: String,
      enum: [
        "industrie",
        "services",
        "commerce",
        "agriculture",
        "btp",
        "tourisme",
        "sante",
        "education",
        "transport",
        "autre",
      ],
      required: true,
    },
    telephone: String,
    email: String,
    regimeTravail: { type: String, enum: ["48h", "40h"], required: true },
    regimeSocial: { type: String, enum: ["cnss", "cnrps"], default: "cnss" },
    // Plan system
    plan: {
      type: String,
      enum: ["gratuit", "starter", "business", "enterprise"],
      default: "gratuit",
    },
    maxEmployees: { type: Number, default: 5 },
    congesPayesParAn: { type: Number, default: 18 },
    logoUrl: String,
    createdBy: { type: String, default: null }, // super_external_admin userId
  },
  { timestamps: true }
);
addIdTransform(entrepriseSchema);
export const EntrepriseModel = mongoose.model("Entreprise", entrepriseSchema);

// ============================================================================
// Utilisateur (User)
// ============================================================================

const utilisateurSchema = new Schema(
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
        "employe",
      ],
      required: true,
    },
    entrepriseId: { type: String, default: null }, // null for super_external_admin
    employeId: String,
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);
addIdTransform(utilisateurSchema);
export const UtilisateurModel = mongoose.model(
  "Utilisateur",
  utilisateurSchema
);

// ============================================================================
// Employe (Employee)
// ============================================================================

const employeSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    cin: { type: String, required: true },
    dateNaissance: { type: String, required: true },
    adresse: { type: String, required: true },
    telephone: String,
    email: String,
    situationFamiliale: {
      type: String,
      enum: ["celibataire", "marie", "divorce", "veuf"],
      required: true,
    },
    nbEnfants: { type: Number, default: 0 },
    residenceFiscale: { type: String, required: true },
    matriculeCnss: { type: String, default: "" }, // Optional for SIVP contracts
    dateEmbauche: { type: String, required: true },
    dateFin: String,
    typeContrat: {
      type: String,
      enum: ["CDI", "CDD", "SIVP", "Karama"],
      required: true,
    },
    categoriePro: { type: String, required: true },
    poste: { type: String, required: true },
    departement: { type: String, required: true },
    etablissement: String,
    salaireBase: { type: Number, required: true },
    iban: { type: String, required: true },
    banque: String,
    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);
addIdTransform(employeSchema);
employeSchema.index({ entrepriseId: 1, actif: 1 });
employeSchema.index({
  nom: "text",
  prenom: "text",
  cin: "text",
  poste: "text",
  departement: "text",
});
export const EmployeModel = mongoose.model("Employe", employeSchema);

// ============================================================================
// PeriodePaie (Pay Period)
// ============================================================================

const periodePaieSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    mois: { type: Number, required: true, min: 1, max: 12 },
    annee: { type: Number, required: true },
    dateDebut: { type: String, required: true },
    dateFin: { type: String, required: true },
    statut: {
      type: String,
      enum: ["en_cours", "calculee", "validee", "finalisee"],
      default: "en_cours",
    },
  },
  { timestamps: true }
);
addIdTransform(periodePaieSchema);
periodePaieSchema.index({ entrepriseId: 1, annee: -1, mois: -1 });
export const PeriodePaieModel = mongoose.model(
  "PeriodePaie",
  periodePaieSchema
);

// ============================================================================
// ElementPaie (Pay Element)
// ============================================================================

const elementPaieSchema = new Schema({
  periodePaieId: { type: String, required: true, index: true },
  employeId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  libelle: { type: String, required: true },
  montant: { type: Number, required: true },
  estVariable: { type: Boolean, default: true },
  heures: Number,
  taux: Number,
});
addIdTransform(elementPaieSchema);
export const ElementPaieModel = mongoose.model(
  "ElementPaie",
  elementPaieSchema
);

// ============================================================================
// BulletinPaie (Payslip)
// ============================================================================

const bulletinPaieSchema = new Schema({
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
  dateGeneration: { type: String, required: true },
});
addIdTransform(bulletinPaieSchema);
export const BulletinPaieModel = mongoose.model(
  "BulletinPaie",
  bulletinPaieSchema
);

// ============================================================================
// Conge (Leave)
// ============================================================================

const congeSchema = new Schema(
  {
    employeId: { type: String, required: true, index: true },
    typeConge: {
      type: String,
      enum: [
        "conge_paye",
        "maladie",
        "maternite",
        "paternite",
        "sans_solde",
        "exceptionnel",
      ],
      required: true,
    },
    dateDebut: { type: String, required: true },
    dateFin: { type: String, required: true },
    nbJours: { type: Number, required: true },
    statut: {
      type: String,
      enum: ["en_attente", "approuve", "rejete", "annule"],
      default: "en_attente",
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
        filename: String,
      },
    ],
  },
  { timestamps: true }
);
addIdTransform(congeSchema);
export const CongeModel = mongoose.model("Conge", congeSchema);

// ============================================================================
// DocumentRH (HR Document)
// ============================================================================

const documentRHSchema = new Schema({
  employeId: { type: String, required: true, index: true },
  typeDocument: {
    type: String,
    enum: [
      "attestation_travail",
      "attestation_salaire",
      "attestation_cnss",
      "fiche_paie_annuelle",
      "certificat_travail",
    ],
    required: true,
  },
  nomFichier: { type: String, required: true },
  titre: { type: String, required: true },
  dateCreation: { type: String, required: true },
  generePar: { type: String, required: true },
  entrepriseId: { type: String, required: true, index: true },
});
addIdTransform(documentRHSchema);
export const DocumentRHModel = mongoose.model("DocumentRH", documentRHSchema);

// ============================================================================
// DocumentRequest (NEW - Document Request with uploaded papers)
// ============================================================================

const documentRequestSchema = new Schema(
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
        "certificat_travail",
      ],
      required: true,
    },
    statut: {
      type: String,
      enum: ["en_attente", "en_revision", "approuve", "rejete", "genere"],
      default: "en_attente",
    },
    motif: String,
    requiredPapers: [String], // list of required paper names
    uploadedPapers: [
      {
        fileId: String,
        originalName: String,
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      },
    ],
    reviewedBy: String,
    reviewComment: String,
    dateReview: String,
    generatedDocumentId: String, // link to DocumentRH once generated
  },
  { timestamps: true }
);
addIdTransform(documentRequestSchema);
export const DocumentRequestModel = mongoose.model(
  "DocumentRequest",
  documentRequestSchema
);

// ============================================================================
// UploadedFile (Metadata for uploaded files)
// ============================================================================

const uploadedFileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, required: true, index: true },
    entrepriseId: { type: String, index: true },
    category: {
      type: String,
      enum: ["paper", "document", "avatar", "other"],
      default: "paper",
    },
  },
  { timestamps: true }
);
addIdTransform(uploadedFileSchema);
export const UploadedFileModel = mongoose.model(
  "UploadedFile",
  uploadedFileSchema
);

// ============================================================================
// Declaration
// ============================================================================

const declarationSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["cnss_d17", "cnrps_d17", "dgi_deu", "virement_bancaire"],
      required: true,
    },
    periodeDebut: { type: String, required: true },
    periodeFin: { type: String, required: true },
    trimestre: Number,
    annee: { type: Number, required: true },
    statut: {
      type: String,
      enum: ["brouillon", "genere", "soumis"],
      default: "genere",
    },
    nomFichier: { type: String, required: true },
    nbEmployes: { type: Number, required: true },
    montantTotal: { type: Number, required: true },
    generePar: { type: String, required: true },
  },
  { timestamps: true }
);
addIdTransform(declarationSchema);
export const DeclarationModel = mongoose.model(
  "Declaration",
  declarationSchema
);

// ============================================================================
// ReportConfig
// ============================================================================

const reportConfigSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "masse_salariale",
        "effectifs",
        "charges_sociales",
        "conges",
        "cout_departement",
        "personnalise",
      ],
      required: true,
    },
    titre: { type: String, required: true },
    periodeDebut: { type: String, required: true },
    periodeFin: { type: String, required: true },
    filtres: { type: Schema.Types.Mixed },
    generePar: { type: String, required: true },
  },
  { timestamps: true }
);
addIdTransform(reportConfigSchema);
export const ReportConfigModel = mongoose.model(
  "ReportConfig",
  reportConfigSchema
);

// ============================================================================
// ParametreReglementaire (Regulatory Parameters)
// ============================================================================

const parametreSchema = new Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  valeur: { type: String, required: true },
  categorie: { type: String, required: true, index: true },
  dateDebutValidite: { type: String, required: true },
  dateFinValidite: String,
});
addIdTransform(parametreSchema);
export const ParametreModel = mongoose.model(
  "ParametreReglementaire",
  parametreSchema
);

// ============================================================================
// Notification
// ============================================================================

const notificationSchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    destinataireId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    priorite: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    titre: { type: String, required: true },
    message: { type: String, required: true },
    lien: String,
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);
addIdTransform(notificationSchema);
notificationSchema.index({ destinataireId: 1, lu: 1 });
export const NotificationModel = mongoose.model(
  "Notification",
  notificationSchema
);

// ============================================================================
// ApiKey
// ============================================================================

const apiKeySchema = new Schema(
  {
    entrepriseId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    cle: { type: String, required: true },
    prefixe: { type: String, required: true },
    permissions: [String],
    actif: { type: Boolean, default: true },
    derniereUtilisation: String,
    limiteRequetes: { type: Number, default: 1000 },
  },
  { timestamps: true }
);
addIdTransform(apiKeySchema);
export const ApiKeyModel = mongoose.model("ApiKey", apiKeySchema);

// ============================================================================
// Pret (Loan)
// ============================================================================

const pretSchema = new Schema(
  {
    employeId: { type: String, required: true, index: true },
    entrepriseId: { type: String, required: true, index: true },
    montantTotal: { type: Number, required: true },
    montantMensuel: { type: Number, required: true },
    montantRembourse: { type: Number, default: 0 },
    soldeRestant: { type: Number, required: true },
    nbMensualites: { type: Number, required: true },
    nbMensualitesPayees: { type: Number, default: 0 },
    motif: { type: String, required: true },
    statut: {
      type: String,
      enum: ["en_attente", "en_cours", "rembourse", "annule"],
      default: "en_cours",
    },
    dateDebut: { type: String, required: true },
    dateFin: String,
    approuvePar: String,
  },
  { timestamps: true }
);
addIdTransform(pretSchema);
pretSchema.index({ entrepriseId: 1, statut: 1 });
export const PretModel = mongoose.model("Pret", pretSchema);
