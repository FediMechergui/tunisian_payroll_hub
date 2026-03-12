// ============================================================================
// PayrollHub — Document PDF Generator
// Work certificates, CNSS attestations, salary certificates, annual tax forms
// ============================================================================

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { Employe, Entreprise } from "../shared/types";
import { DocumentType, SocialRegime } from "../shared/types";

const PRIMARY = "#1e40af";
const LIGHT_BG = "#f1f5f9";
const BORDER = "#cbd5e1";

function fmt(n: number): string {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function numberToWords(n: number): string {
  // Simplified French number-to-words for amounts
  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
  ];
  const teens = [
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  if (n === 0) return "zéro";
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return tens[t - 1] + "-" + teens[u];
    return tens[t] + (u ? "-" + units[u] : "");
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const hStr = h === 1 ? "cent" : units[h] + " cent";
    return hStr + (rest ? " " + numberToWords(rest) : "");
  }
  if (n < 1000000) {
    const k = Math.floor(n / 1000);
    const rest = n % 1000;
    const kStr = k === 1 ? "mille" : numberToWords(k) + " mille";
    return kStr + (rest ? " " + numberToWords(rest) : "");
  }
  return String(n);
}

// ---------------------------------------------------------------------------
// Header shared by all documents
// ---------------------------------------------------------------------------
function drawHeader(
  doc: InstanceType<typeof PDFDocument>,
  entreprise: Entreprise,
  title: string,
  pageW: number
): number {
  doc.rect(40, 40, pageW, 65).fill(PRIMARY);

  // Logo (if available)
  if (entreprise.logoUrl) {
    const logoPath = path.resolve(entreprise.logoUrl.replace(/^\//, ""));
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 46, { height: 50, fit: [80, 50] });
      } catch {}
    }
  }

  doc
    .fillColor("#ffffff")
    .fontSize(17)
    .font("Helvetica-Bold")
    .text(title, 50, 52, { width: pageW - 20, align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(entreprise.nom, 50, 74, { width: pageW - 20, align: "center" });

  const regimeLabel =
    entreprise.regimeSocial === SocialRegime.CNRPS ? "CNRPS" : "CNSS";

  let y = 120;
  // Company info
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`${entreprise.adresse}`, 40, y);
  doc.text(
    `Matricule Fiscal: ${entreprise.matriculeFiscal}  |  Code ${regimeLabel}: ${entreprise.codeCnss}`,
    40,
    y + 12
  );
  if (entreprise.telephone)
    doc.text(`Tél: ${entreprise.telephone}`, 40, y + 24);

  y += 45;
  doc
    .moveTo(40, y)
    .lineTo(40 + pageW, y)
    .lineWidth(0.5)
    .stroke(BORDER);
  return y + 15;
}

// ---------------------------------------------------------------------------
// Footer shared by all documents
// ---------------------------------------------------------------------------
function drawFooter(
  doc: InstanceType<typeof PDFDocument>,
  entreprise: Entreprise,
  pageW: number
): void {
  const y = 720;
  doc
    .moveTo(40, y)
    .lineTo(40 + pageW, y)
    .lineWidth(0.5)
    .stroke(BORDER);
  doc
    .fillColor("#94a3b8")
    .fontSize(7)
    .font("Helvetica")
    .text(
      `Document généré automatiquement par PayrollHub — ${entreprise.nom}`,
      40,
      y + 8,
      {
        width: pageW,
        align: "center",
      }
    );
  doc.text(`Le ${formatDate(new Date().toISOString())}`, 40, y + 18, {
    width: pageW,
    align: "center",
  });
}

// ============================================================================
// ATTESTATION DE TRAVAIL
// ============================================================================
export function generateAttestationTravail(
  employe: Employe,
  entreprise: Entreprise
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;

  let y = drawHeader(doc, entreprise, "ATTESTATION DE TRAVAIL", pageW);

  y += 20;
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");

  const today = formatDate(new Date().toISOString());
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });

  y += 40;
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(PRIMARY)
    .text("Le Directeur des Ressources Humaines atteste que :", 40, y, {
      width: pageW,
      align: "center",
    });

  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");

  const lines = [
    `M./Mme ${employe.prenom} ${employe.nom.toUpperCase()},`,
    `né(e) le ${formatDate(employe.dateNaissance)},`,
    `titulaire du CIN n° ${employe.cin},`,
    `matricule ${entreprise.regimeSocial === SocialRegime.CNRPS ? "CNRPS" : "CNSS"} : ${employe.matriculeCnss || "N/A"},`,
    "",
    `est employé(e) au sein de notre société ${entreprise.nom}`,
    `depuis le ${formatDate(employe.dateEmbauche)},`,
    `en qualité de ${employe.poste},`,
    `au département ${employe.departement},`,
    `sous contrat de type ${employe.typeContrat}.`,
    "",
    "Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.",
  ];

  for (const line of lines) {
    doc.text(line, 60, y, { width: pageW - 40 });
    y += line === "" ? 12 : 18;
  }

  // Signature block
  y += 40;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur des Ressources Humaines", 300, y, {
    width: 220,
    align: "center",
  });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);
  y += 5;
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#64748b")
    .text("(Signature et cachet)", 300, y, { width: 220, align: "center" });

  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}

// ============================================================================
// ATTESTATION DE SALAIRE
// ============================================================================
export function generateAttestationSalaire(
  employe: Employe,
  entreprise: Entreprise
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;

  let y = drawHeader(doc, entreprise, "ATTESTATION DE SALAIRE", pageW);

  y += 20;
  const today = formatDate(new Date().toISOString());
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });

  y += 40;
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(PRIMARY)
    .text("Le soussigné atteste que :", 40, y, {
      width: pageW,
      align: "center",
    });

  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");

  const salaireMensuel = employe.salaireBase;
  const salaireAnnuel = salaireMensuel * 12;

  const lines = [
    `M./Mme ${employe.prenom} ${employe.nom.toUpperCase()},`,
    `titulaire du CIN n° ${employe.cin},`,
    `occupant le poste de ${employe.poste},`,
    "",
    `perçoit un salaire mensuel brut de ${fmt(salaireMensuel)} TND`,
    `(${numberToWords(Math.floor(salaireMensuel))} dinars),`,
    "",
    `soit un salaire annuel brut de ${fmt(salaireAnnuel)} TND.`,
    "",
    "Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.",
  ];

  for (const line of lines) {
    doc.text(line, 60, y, { width: pageW - 40 });
    y += line === "" ? 12 : 18;
  }

  y += 40;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur des Ressources Humaines", 300, y, {
    width: 220,
    align: "center",
  });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);

  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}

// ============================================================================
// ATTESTATION CNSS
// ============================================================================
export function generateAttestationCNSS(
  employe: Employe,
  entreprise: Entreprise
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;

  const regimeLabel =
    entreprise.regimeSocial === SocialRegime.CNRPS ? "CNRPS" : "CNSS";
  let y = drawHeader(
    doc,
    entreprise,
    `ATTESTATION D'AFFILIATION ${regimeLabel}`,
    pageW
  );

  y += 20;
  const today = formatDate(new Date().toISOString());
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });

  y += 40;
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(PRIMARY)
    .text(
      `Attestation d'affiliation à la ${regimeLabel === "CNRPS" ? "CNRPS" : "CNSS"}`,
      40,
      y,
      { width: pageW, align: "center" }
    );

  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");

  // Info box
  doc
    .rect(50, y, pageW - 20, 120)
    .lineWidth(0.5)
    .stroke(BORDER);
  doc.rect(50, y, pageW - 20, 120).fill(LIGHT_BG);

  y += 12;
  doc.fillColor("#0f172a").fontSize(10);
  const infos = [
    ["Employeur :", entreprise.nom],
    [`Code ${regimeLabel} Employeur :`, entreprise.codeCnss],
    ["Matricule Fiscal :", entreprise.matriculeFiscal],
    ["", ""],
    ["Employé(e) :", `${employe.prenom} ${employe.nom.toUpperCase()}`],
    ["CIN :", employe.cin],
    [`Matricule ${regimeLabel} :`, employe.matriculeCnss || "N/A"],
    ["Date d'embauche :", formatDate(employe.dateEmbauche)],
  ];

  for (const [label, value] of infos) {
    if (label === "") {
      y += 8;
      continue;
    }
    doc
      .font("Helvetica-Bold")
      .text(label, 65, y, { continued: true, width: 180 });
    doc.font("Helvetica").text(` ${value}`, { width: 300 });
    y += 14;
  }

  y += 30;
  doc.fontSize(10).font("Helvetica").fillColor("#0f172a");
  doc.text(
    `Nous attestons par la présente que l'employé(e) mentionné(e) ci-dessus est bien affilié(e) ` +
      `à la ${regimeLabel === "CNRPS" ? "Caisse Nationale de Retraite et de Prévoyance Sociale (CNRPS)" : "Caisse Nationale de Sécurité Sociale (CNSS)"} sous notre code employeur. ` +
      "Les cotisations sociales sont régulièrement versées conformément à la législation tunisienne en vigueur.",
    60,
    y,
    { width: pageW - 40, lineGap: 4 }
  );

  y += 70;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur des Ressources Humaines", 300, y, {
    width: 220,
    align: "center",
  });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);

  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}

// ============================================================================
// CERTIFICAT DE TRAVAIL (Employment Certificate - end of contract)
// ============================================================================
export function generateCertificatTravail(
  employe: Employe,
  entreprise: Entreprise
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;

  let y = drawHeader(doc, entreprise, "CERTIFICAT DE TRAVAIL", pageW);

  y += 20;
  const today = formatDate(new Date().toISOString());
  doc.fillColor("#0f172a").fontSize(11).font("Helvetica");
  doc.text(`Tunis, le ${today}`, 40, y, { width: pageW, align: "right" });

  y += 40;
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(PRIMARY)
    .text("Le Directeur Général certifie que :", 40, y, {
      width: pageW,
      align: "center",
    });

  y += 40;
  doc.fontSize(11).font("Helvetica").fillColor("#0f172a");

  const dateFin = employe.dateFin
    ? formatDate(employe.dateFin)
    : formatDate(new Date().toISOString());

  const lines = [
    `M./Mme ${employe.prenom} ${employe.nom.toUpperCase()},`,
    `né(e) le ${formatDate(employe.dateNaissance)},`,
    `titulaire du CIN n° ${employe.cin},`,
    "",
    `a été employé(e) dans notre entreprise du ${formatDate(employe.dateEmbauche)}`,
    `au ${dateFin},`,
    `en qualité de ${employe.poste},`,
    `au département ${employe.departement},`,
    `sous contrat de type ${employe.typeContrat}.`,
    "",
    "Pendant la durée de son emploi, l'intéressé(e) a fait preuve de compétence",
    "et nous lui délivrons le présent certificat en conformité avec les",
    "dispositions de l'article 14 du Code du Travail tunisien.",
    "",
    "Le présent certificat est délivré pour servir et valoir ce que de droit.",
  ];

  for (const line of lines) {
    doc.text(line, 60, y, { width: pageW - 40 });
    y += line === "" ? 12 : 18;
  }

  y += 40;
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Le Directeur Général", 300, y, { width: 220, align: "center" });
  y += 35;
  doc.rect(320, y, 180, 0.5).fill(BORDER);

  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}

// ============================================================================
// FICHE DE PAIE ANNUELLE (Annual Tax Summary)
// ============================================================================
export function generateFichePaieAnnuelle(
  employe: Employe,
  entreprise: Entreprise,
  annee: number,
  bulletins: {
    mois: number;
    brut: number;
    cnss: number;
    irpp: number;
    net: number;
  }[]
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const pageW = 595.28 - 80;

  let y = drawHeader(
    doc,
    entreprise,
    `ÉTAT RÉCAPITULATIF ANNUEL ${annee}`,
    pageW
  );

  // Employee info
  y += 10;
  doc
    .fillColor("#0f172a")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("EMPLOYÉ(E)", 40, y);
  y += 14;
  doc.font("Helvetica").fontSize(9);
  const regimeLabelAnnuel =
    entreprise.regimeSocial === SocialRegime.CNRPS ? "CNRPS" : "CNSS";
  doc.text(
    `${employe.prenom} ${employe.nom.toUpperCase()}  |  CIN: ${employe.cin}  |  ${regimeLabelAnnuel}: ${employe.matriculeCnss || "N/A"}`,
    40,
    y
  );
  y += 12;
  doc.text(
    `Poste: ${employe.poste}  |  Département: ${employe.departement}`,
    40,
    y
  );

  y += 25;
  // Table header
  const cols = [40, 140, 230, 320, 410];
  const colW = [100, 90, 90, 90, 90];
  const headers = [
    "Mois",
    "Brut (TND)",
    "CNSS (TND)",
    "IRPP (TND)",
    "Net (TND)",
  ];
  const MOIS = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  doc.rect(40, y, pageW, 20).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 4, y + 5, {
      width: colW[i] - 8,
      align: i === 0 ? "left" : "right",
    });
  }
  y += 20;

  let totalBrut = 0,
    totalCnss = 0,
    totalIrpp = 0,
    totalNet = 0;

  for (const b of bulletins.sort((a, c) => a.mois - c.mois)) {
    const bg = bulletins.indexOf(b) % 2 === 0 ? LIGHT_BG : "#ffffff";
    doc.rect(40, y, pageW, 16).fill(bg);
    doc.fillColor("#0f172a").fontSize(8).font("Helvetica");
    doc.text(MOIS[b.mois - 1] || String(b.mois), cols[0] + 4, y + 4, {
      width: colW[0] - 8,
    });
    doc.text(fmt(b.brut), cols[1] + 4, y + 4, {
      width: colW[1] - 8,
      align: "right",
    });
    doc.text(fmt(b.cnss), cols[2] + 4, y + 4, {
      width: colW[2] - 8,
      align: "right",
    });
    doc.text(fmt(b.irpp), cols[3] + 4, y + 4, {
      width: colW[3] - 8,
      align: "right",
    });
    doc.text(fmt(b.net), cols[4] + 4, y + 4, {
      width: colW[4] - 8,
      align: "right",
    });
    totalBrut += b.brut;
    totalCnss += b.cnss;
    totalIrpp += b.irpp;
    totalNet += b.net;
    y += 16;
  }

  // Totals row
  doc.rect(40, y, pageW, 20).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  doc.text("TOTAL ANNUEL", cols[0] + 4, y + 5, { width: colW[0] - 8 });
  doc.text(fmt(totalBrut), cols[1] + 4, y + 5, {
    width: colW[1] - 8,
    align: "right",
  });
  doc.text(fmt(totalCnss), cols[2] + 4, y + 5, {
    width: colW[2] - 8,
    align: "right",
  });
  doc.text(fmt(totalIrpp), cols[3] + 4, y + 5, {
    width: colW[3] - 8,
    align: "right",
  });
  doc.text(fmt(totalNet), cols[4] + 4, y + 5, {
    width: colW[4] - 8,
    align: "right",
  });

  y += 35;
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`Net imposable annuel : ${fmt(totalBrut - totalCnss)} TND`, 40, y);
  y += 14;
  doc.text(`Retenue IRPP annuelle : ${fmt(totalIrpp)} TND`, 40, y);
  y += 14;
  doc.text(
    `Total ${regimeLabelAnnuel} salariale : ${fmt(totalCnss)} TND`,
    40,
    y
  );

  drawFooter(doc, entreprise, pageW);
  doc.end();
  return doc;
}

// ============================================================================
// Dispatcher
// ============================================================================
export function generateDocument(
  type: DocumentType,
  employe: Employe,
  entreprise: Entreprise,
  options?: { annee?: number; bulletins?: { mois: number; brut: number; cnss: number; irpp: number; net: number }[] },
): InstanceType<typeof PDFDocument> {
  switch (type) {
    case DocumentType.ATTESTATION_TRAVAIL:
      return generateAttestationTravail(employe, entreprise);
    case DocumentType.ATTESTATION_SALAIRE:
      return generateAttestationSalaire(employe, entreprise);
    case DocumentType.ATTESTATION_CNSS:
      return generateAttestationCNSS(employe, entreprise);
    case DocumentType.CERTIFICAT_TRAVAIL:
      return generateCertificatTravail(employe, entreprise);
    case DocumentType.FICHE_PAIE_ANNUELLE:
      return generateFichePaieAnnuelle(
        employe,
        entreprise,
        options?.annee || new Date().getFullYear(),
        options?.bulletins || [],
      );
    default:
      throw new Error(`Type de document non supporté: ${type}`);
  }
}
