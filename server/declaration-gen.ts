// ============================================================================
// PayrollHub — Regulatory Declaration Generator
// CNSS D-17, DGI DEU, Bank Wire Files
// ============================================================================

import PDFDocument from "pdfkit";
import type { Employe, Entreprise, BulletinPaie, PeriodePaie } from "../shared/types";
import { DeclarationType } from "../shared/types";

const PRIMARY = "#1e40af";
const LIGHT_BG = "#f1f5f9";
const BORDER = "#cbd5e1";

function fmt(n: number): string {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-TN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ============================================================================
// CNSS D-17 — Quarterly Declaration
// Standard format for CNSS contributions
// ============================================================================
export function generateCnssD17(
  entreprise: Entreprise,
  employes: Employe[],
  bulletins: BulletinPaie[],
  trimestre: number,
  annee: number,
): { pdf: InstanceType<typeof PDFDocument>; csv: string } {
  const pageW = 595.28 - 80;
  const doc = new PDFDocument({ size: "A4", margin: 40, layout: "landscape" });
  const landscapeW = 841.89 - 80;

  // Header
  doc.rect(40, 40, landscapeW, 50).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold")
    .text("DÉCLARATION TRIMESTRIELLE DES SALAIRES — CNSS D-17", 50, 50, { width: landscapeW - 20, align: "center" });
  doc.fontSize(9).font("Helvetica")
    .text(`${trimestre}ème Trimestre ${annee}`, 50, 68, { width: landscapeW - 20, align: "center" });

  let y = 105;
  // Company info
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica");
  doc.text(`Employeur: ${entreprise.nom}  |  Code CNSS: ${entreprise.codeCnss}  |  MF: ${entreprise.matriculeFiscal}`, 40, y);

  y += 25;
  // Table
  const cols = [40, 80, 200, 310, 400, 490, 580, 670];
  const colW = [40, 120, 110, 90, 90, 90, 90, 90];
  const headers = ["N°", "Nom & Prénom", "Matricule CNSS", "Salaire Brut", "CNSS Salarié", "CNSS Patronal", "Total CNSS", "Nb Jours"];

  doc.rect(40, y, landscapeW, 18).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 3, y + 5, { width: colW[i] - 6, align: i < 3 ? "left" : "right" });
  }
  y += 18;

  let totalBrut = 0, totalSal = 0, totalPat = 0, totalCnss = 0;
  const csvRows: string[] = [
    "N°;Nom;Prénom;Matricule CNSS;Salaire Brut;CNSS Salarié;CNSS Patronal;Total CNSS;Nb Jours",
  ];

  employes.forEach((emp, idx) => {
    const empBulletins = bulletins.filter(b => b.employeId === emp.id);
    if (empBulletins.length === 0) return;

    const brut = empBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const cnssSal = empBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const cnssPat = empBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
    const total = cnssSal + cnssPat;
    const nbJours = empBulletins.length * 26; // ~26 working days/month

    totalBrut += brut;
    totalSal += cnssSal;
    totalPat += cnssPat;
    totalCnss += total;

    const bg = idx % 2 === 0 ? LIGHT_BG : "#ffffff";
    doc.rect(40, y, landscapeW, 14).fill(bg);
    doc.fillColor("#0f172a").fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), cols[0] + 3, y + 3, { width: colW[0] - 6 });
    doc.text(`${emp.nom.toUpperCase()} ${emp.prenom}`, cols[1] + 3, y + 3, { width: colW[1] - 6 });
    doc.text(emp.matriculeCnss, cols[2] + 3, y + 3, { width: colW[2] - 6 });
    doc.text(fmt(brut), cols[3] + 3, y + 3, { width: colW[3] - 6, align: "right" });
    doc.text(fmt(cnssSal), cols[4] + 3, y + 3, { width: colW[4] - 6, align: "right" });
    doc.text(fmt(cnssPat), cols[5] + 3, y + 3, { width: colW[5] - 6, align: "right" });
    doc.text(fmt(total), cols[6] + 3, y + 3, { width: colW[6] - 6, align: "right" });
    doc.text(String(nbJours), cols[7] + 3, y + 3, { width: colW[7] - 6, align: "right" });
    y += 14;

    csvRows.push(
      `${idx + 1};${emp.nom};${emp.prenom};${emp.matriculeCnss};${brut.toFixed(3)};${cnssSal.toFixed(3)};${cnssPat.toFixed(3)};${total.toFixed(3)};${nbJours}`
    );
  });

  // Totals
  doc.rect(40, y, landscapeW, 18).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  doc.text("TOTAUX", cols[1] + 3, y + 5, { width: colW[1] - 6 });
  doc.text(fmt(totalBrut), cols[3] + 3, y + 5, { width: colW[3] - 6, align: "right" });
  doc.text(fmt(totalSal), cols[4] + 3, y + 5, { width: colW[4] - 6, align: "right" });
  doc.text(fmt(totalPat), cols[5] + 3, y + 5, { width: colW[5] - 6, align: "right" });
  doc.text(fmt(totalCnss), cols[6] + 3, y + 5, { width: colW[6] - 6, align: "right" });

  csvRows.push(`TOTAL;;;${totalBrut.toFixed(3)};${totalSal.toFixed(3)};${totalPat.toFixed(3)};${totalCnss.toFixed(3)};`);

  doc.end();
  return { pdf: doc, csv: csvRows.join("\n") };
}

// ============================================================================
// DGI DEU — Annual Tax Declaration (Déclaration de l'Employeur Unique)
// ============================================================================
export function generateDgiDeu(
  entreprise: Entreprise,
  employes: Employe[],
  annualData: { employeId: string; brutAnnuel: number; cnssAnnuel: number; irppAnnuel: number; netAnnuel: number }[],
  annee: number,
): { pdf: InstanceType<typeof PDFDocument>; csv: string } {
  const doc = new PDFDocument({ size: "A4", margin: 40, layout: "landscape" });
  const landscapeW = 841.89 - 80;

  doc.rect(40, 40, landscapeW, 50).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold")
    .text("DÉCLARATION DE L'EMPLOYEUR UNIQUE — DGI", 50, 48, { width: landscapeW - 20, align: "center" });
  doc.fontSize(9).font("Helvetica")
    .text(`Année fiscale ${annee}`, 50, 68, { width: landscapeW - 20, align: "center" });

  let y = 105;
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica");
  doc.text(`Employeur: ${entreprise.nom}  |  MF: ${entreprise.matriculeFiscal}  |  CNSS: ${entreprise.codeCnss}`, 40, y);

  y += 25;
  const cols = [40, 70, 190, 270, 350, 430, 510, 590, 670];
  const colW = [30, 120, 80, 80, 80, 80, 80, 80, 90];
  const headers = ["N°", "Nom & Prénom", "CIN", "Brut Annuel", "CNSS", "Net Imposable", "IRPP", "CSS", "Net Payé"];

  doc.rect(40, y, landscapeW, 18).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 3, y + 5, { width: colW[i] - 6, align: i < 3 ? "left" : "right" });
  }
  y += 18;

  let tBrut = 0, tCnss = 0, tIrpp = 0, tNet = 0;
  const csvRows: string[] = [
    "N°;Nom;Prénom;CIN;Brut Annuel;CNSS;Net Imposable;IRPP;CSS;Net Payé",
  ];

  employes.forEach((emp, idx) => {
    const data = annualData.find(d => d.employeId === emp.id);
    if (!data) return;

    const netImposable = data.brutAnnuel - data.cnssAnnuel;
    const css = data.irppAnnuel * 0.013; // ~1.3% approximation for CSS component

    tBrut += data.brutAnnuel;
    tCnss += data.cnssAnnuel;
    tIrpp += data.irppAnnuel;
    tNet += data.netAnnuel;

    const bg = idx % 2 === 0 ? LIGHT_BG : "#ffffff";
    doc.rect(40, y, landscapeW, 14).fill(bg);
    doc.fillColor("#0f172a").fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), cols[0] + 3, y + 3, { width: colW[0] - 6 });
    doc.text(`${emp.nom.toUpperCase()} ${emp.prenom}`, cols[1] + 3, y + 3, { width: colW[1] - 6 });
    doc.text(emp.cin, cols[2] + 3, y + 3, { width: colW[2] - 6 });
    doc.text(fmt(data.brutAnnuel), cols[3] + 3, y + 3, { width: colW[3] - 6, align: "right" });
    doc.text(fmt(data.cnssAnnuel), cols[4] + 3, y + 3, { width: colW[4] - 6, align: "right" });
    doc.text(fmt(netImposable), cols[5] + 3, y + 3, { width: colW[5] - 6, align: "right" });
    doc.text(fmt(data.irppAnnuel), cols[6] + 3, y + 3, { width: colW[6] - 6, align: "right" });
    doc.text(fmt(css), cols[7] + 3, y + 3, { width: colW[7] - 6, align: "right" });
    doc.text(fmt(data.netAnnuel), cols[8] + 3, y + 3, { width: colW[8] - 6, align: "right" });
    y += 14;

    csvRows.push(
      `${idx + 1};${emp.nom};${emp.prenom};${emp.cin};${data.brutAnnuel.toFixed(3)};${data.cnssAnnuel.toFixed(3)};${netImposable.toFixed(3)};${data.irppAnnuel.toFixed(3)};${css.toFixed(3)};${data.netAnnuel.toFixed(3)}`
    );
  });

  // Totals
  doc.rect(40, y, landscapeW, 18).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
  doc.text("TOTAUX", cols[1] + 3, y + 5, { width: colW[1] - 6 });
  doc.text(fmt(tBrut), cols[3] + 3, y + 5, { width: colW[3] - 6, align: "right" });
  doc.text(fmt(tCnss), cols[4] + 3, y + 5, { width: colW[4] - 6, align: "right" });
  doc.text(fmt(tIrpp), cols[6] + 3, y + 5, { width: colW[6] - 6, align: "right" });
  doc.text(fmt(tNet), cols[8] + 3, y + 5, { width: colW[8] - 6, align: "right" });

  doc.end();
  return { pdf: doc, csv: csvRows.join("\n") };
}

// ============================================================================
// VIREMENT BANCAIRE (Bank Wire File)
// Generates a bank-compatible wire file and PDF summary
// ============================================================================
export function generateVirementBancaire(
  entreprise: Entreprise,
  employes: Employe[],
  bulletins: BulletinPaie[],
  periode: PeriodePaie,
): { pdf: InstanceType<typeof PDFDocument>; wireFile: string } {
  const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const pageW = 595.28 - 80;
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  doc.rect(40, 40, pageW, 50).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold")
    .text("ORDRE DE VIREMENT BANCAIRE — SALAIRES", 50, 48, { width: pageW - 20, align: "center" });
  doc.fontSize(9).font("Helvetica")
    .text(`${MOIS[periode.mois - 1]} ${periode.annee}`, 50, 68, { width: pageW - 20, align: "center" });

  let y = 105;
  doc.fillColor("#0f172a").fontSize(9).font("Helvetica");
  doc.text(`Employeur: ${entreprise.nom}  |  MF: ${entreprise.matriculeFiscal}`, 40, y);

  y += 25;
  const cols = [40, 70, 190, 310, 420];
  const colW = [30, 120, 120, 110, 95];
  const headers = ["N°", "Nom & Prénom", "IBAN", "Banque", "Montant (TND)"];

  doc.rect(40, y, pageW, 18).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cols[i] + 3, y + 5, { width: colW[i] - 6, align: i < 4 ? "left" : "right" });
  }
  y += 18;

  let totalVirement = 0;
  // Wire file format: IBAN;AMOUNT;BENEFICIARY;REFERENCE
  const wireLines: string[] = [
    `RIB;MONTANT;BENEFICIAIRE;REFERENCE`,
  ];

  employes.forEach((emp, idx) => {
    const bulletin = bulletins.find(b => b.employeId === emp.id);
    if (!bulletin) return;

    const montant = bulletin.netAPayer;
    totalVirement += montant;

    const bg = idx % 2 === 0 ? LIGHT_BG : "#ffffff";
    doc.rect(40, y, pageW, 14).fill(bg);
    doc.fillColor("#0f172a").fontSize(7).font("Helvetica");
    doc.text(String(idx + 1), cols[0] + 3, y + 3, { width: colW[0] - 6 });
    doc.text(`${emp.nom.toUpperCase()} ${emp.prenom}`, cols[1] + 3, y + 3, { width: colW[1] - 6 });
    doc.text(emp.iban.substring(0, 24), cols[2] + 3, y + 3, { width: colW[2] - 6 });
    doc.text(emp.banque?.substring(0, 15) || "", cols[3] + 3, y + 3, { width: colW[3] - 6 });
    doc.text(fmt(montant), cols[4] + 3, y + 3, { width: colW[4] - 6, align: "right" });
    y += 14;

    const ref = `SAL-${periode.annee}${String(periode.mois).padStart(2, "0")}-${emp.matriculeCnss}`;
    wireLines.push(
      `${emp.iban.replace(/\s/g, "")};${montant.toFixed(3)};${emp.nom.toUpperCase()} ${emp.prenom};${ref}`
    );
  });

  // Total
  doc.rect(40, y, pageW, 18).fill("#1e293b");
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
  doc.text("TOTAL DES VIREMENTS", cols[1] + 3, y + 5, { width: colW[1] + colW[2] + colW[3] - 6 });
  doc.text(fmt(totalVirement), cols[4] + 3, y + 5, { width: colW[4] - 6, align: "right" });

  y += 35;
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`Nombre de virements : ${employes.filter(e => bulletins.some(b => b.employeId === e.id)).length}`, 40, y);
  y += 14;
  doc.text(`Montant total : ${fmt(totalVirement)} TND`, 40, y);

  // Signature
  y += 40;
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#334155");
  doc.text("Signature autorisée", 300, y, { width: 200, align: "center" });
  y += 30;
  doc.rect(320, y, 160, 0.5).fill(BORDER);

  doc.end();
  return { pdf: doc, wireFile: wireLines.join("\n") };
}
