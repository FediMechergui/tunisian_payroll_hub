// ============================================================================
// PayrollHub — Payslip PDF Generator
// Server-side PDF generation using PDFKit
// ============================================================================

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { BulletinPaie, Entreprise, PeriodePaie } from "../shared/types";
import { PayElementType, SocialRegime } from "../shared/types";

const MOIS_LABELS = [
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

function fmt(n: number): string {
  return n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function generatePayslipPDF(
  bulletin: BulletinPaie,
  entreprise: Entreprise,
  periode: PeriodePaie
): typeof PDFDocument.prototype {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const emp = bulletin.employe;
  const moisLabel = MOIS_LABELS[periode.mois - 1] || `Mois ${periode.mois}`;
  const pageW = 595.28 - 80; // A4 width minus margins

  // --- Colors ---
  const PRIMARY = "#1e40af";
  const LIGHT_BG = "#f1f5f9";
  const BORDER = "#cbd5e1";

  // ===================================================================
  // HEADER
  // ===================================================================
  doc.rect(40, 40, pageW, 70).fill(PRIMARY);

  // Logo (if available)
  if (entreprise.logoUrl) {
    const logoPath = path.resolve(entreprise.logoUrl.replace(/^\//, ""));
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 48, { height: 54, fit: [80, 54] });
      } catch {}
    }
  }

  doc
    .fillColor("#ffffff")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("BULLETIN DE PAIE", 50, 55, { width: pageW - 20, align: "center" });
  doc
    .fontSize(11)
    .font("Helvetica")
    .text(`${moisLabel} ${periode.annee}`, 50, 78, {
      width: pageW - 20,
      align: "center",
    });

  // ===================================================================
  // COMPANY & EMPLOYEE INFO
  // ===================================================================
  let y = 125;

  // Company box
  doc
    .rect(40, y, pageW / 2 - 5, 90)
    .lineWidth(0.5)
    .stroke(BORDER);
  doc
    .fillColor(PRIMARY)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("EMPLOYEUR", 50, y + 5);
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(entreprise.nom, 50, y + 18);
  doc.text(entreprise.adresse, 50, y + 30);
  doc.text(`MF: ${entreprise.matriculeFiscal}`, 50, y + 42);
  doc.text(`CNSS: ${entreprise.codeCnss}`, 50, y + 54);
  if (entreprise.telephone)
    doc.text(`Tel: ${entreprise.telephone}`, 50, y + 66);

  // Employee box
  const exStart = 40 + pageW / 2 + 5;
  doc
    .rect(exStart, y, pageW / 2 - 5, 90)
    .lineWidth(0.5)
    .stroke(BORDER);
  const regimeLabel =
    entreprise.regimeSocial === SocialRegime.CNRPS ? "CNRPS" : "CNSS";
  doc
    .fillColor(PRIMARY)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("EMPLOYE", exStart + 10, y + 5);
  doc.fillColor("#334155").fontSize(9).font("Helvetica");
  doc.text(`${emp.prenom} ${emp.nom}`, exStart + 10, y + 18);
  doc.text(`CIN: ${emp.cin}`, exStart + 10, y + 30);
  doc.text(
    `Matricule ${regimeLabel}: ${emp.matriculeCnss || "N/A"}`,
    exStart + 10,
    y + 42
  );
  doc.text(`Poste: ${emp.poste}`, exStart + 10, y + 54);
  doc.text(`Cat: ${emp.categoriePro}`, exStart + 10, y + 66);

  y += 100;

  // ===================================================================
  // PAY ELEMENTS TABLE
  // ===================================================================
  const gains = bulletin.elements.filter(
    e =>
      ![
        PayElementType.CNSS_SALARIAL,
        PayElementType.CNSS_PATRONAL,
        PayElementType.IRPP,
        PayElementType.FOPROLOS,
        PayElementType.TFP,
        PayElementType.ACOMPTE,
        PayElementType.SAISIE_SALAIRE,
        PayElementType.RETENUE_PRET,
      ].includes(e.type)
  );
  const retenues = bulletin.elements.filter(e =>
    [
      PayElementType.CNSS_SALARIAL,
      PayElementType.IRPP,
      PayElementType.ACOMPTE,
      PayElementType.SAISIE_SALAIRE,
      PayElementType.RETENUE_PRET,
    ].includes(e.type)
  );
  const chargesPatronales = bulletin.elements.filter(e =>
    [
      PayElementType.CNSS_PATRONAL,
      PayElementType.FOPROLOS,
      PayElementType.TFP,
    ].includes(e.type)
  );

  // Table header
  doc.rect(40, y, pageW, 18).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");
  doc.text("RUBRIQUE", 50, y + 4, { width: pageW * 0.45 });
  doc.text("BASE", 50 + pageW * 0.45, y + 4, {
    width: pageW * 0.15,
    align: "right",
  });
  doc.text("TAUX", 50 + pageW * 0.6, y + 4, {
    width: pageW * 0.15,
    align: "right",
  });
  doc.text("MONTANT", 50 + pageW * 0.75, y + 4, {
    width: pageW * 0.2,
    align: "right",
  });
  y += 18;

  // --- GAINS ---
  doc.rect(40, y, pageW, 16).fill(LIGHT_BG);
  doc
    .fillColor(PRIMARY)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("GAINS", 50, y + 3);
  y += 16;

  for (const el of gains) {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
    doc.fillColor("#334155").fontSize(8).font("Helvetica");
    doc.text(el.libelle, 50, y + 2, { width: pageW * 0.45 });
    if (el.heures)
      doc.text(`${el.heures}h`, 50 + pageW * 0.45, y + 2, {
        width: pageW * 0.15,
        align: "right",
      });
    if (el.taux)
      doc.text(`${el.taux}%`, 50 + pageW * 0.6, y + 2, {
        width: pageW * 0.15,
        align: "right",
      });
    doc
      .font("Helvetica-Bold")
      .text(`${fmt(el.montant)}`, 50 + pageW * 0.75, y + 2, {
        width: pageW * 0.2,
        align: "right",
      });
    y += 14;
  }

  // Subtotal brut
  doc
    .moveTo(40, y)
    .lineTo(40 + pageW, y)
    .lineWidth(0.5)
    .stroke(BORDER);
  y += 3;
  doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold");
  doc.text("SALAIRE BRUT", 50, y, { width: pageW * 0.75 });
  doc.text(`${fmt(bulletin.salaireBrut)} TND`, 50 + pageW * 0.75, y, {
    width: pageW * 0.2,
    align: "right",
  });
  y += 18;

  // --- RETENUES ---
  doc.rect(40, y, pageW, 16).fill(LIGHT_BG);
  doc
    .fillColor("#dc2626")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("RETENUES SALARIALES", 50, y + 3);
  y += 16;

  for (const el of retenues) {
    doc.fillColor("#334155").fontSize(8).font("Helvetica");
    doc.text(el.libelle, 50, y + 2, { width: pageW * 0.55 });
    if (el.taux)
      doc.text(`${el.taux}%`, 50 + pageW * 0.6, y + 2, {
        width: pageW * 0.15,
        align: "right",
      });
    doc
      .font("Helvetica-Bold")
      .fillColor("#dc2626")
      .text(`-${fmt(el.montant)}`, 50 + pageW * 0.75, y + 2, {
        width: pageW * 0.2,
        align: "right",
      });
    y += 14;
  }

  // Subtotal retenues
  const totalRetenues = retenues.reduce((s, e) => s + e.montant, 0);
  doc
    .moveTo(40, y)
    .lineTo(40 + pageW, y)
    .lineWidth(0.5)
    .stroke(BORDER);
  y += 3;
  doc.fillColor("#dc2626").fontSize(9).font("Helvetica-Bold");
  doc.text("TOTAL RETENUES", 50, y, { width: pageW * 0.75 });
  doc.text(`-${fmt(totalRetenues)} TND`, 50 + pageW * 0.75, y, {
    width: pageW * 0.2,
    align: "right",
  });
  y += 22;

  // ===================================================================
  // NET À PAYER (big box)
  // ===================================================================
  doc.rect(40, y, pageW, 30).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold");
  doc.text("NET A PAYER", 50, y + 8, { width: pageW * 0.5 });
  doc.text(`${fmt(bulletin.netAPayer)} TND`, 50 + pageW * 0.5, y + 8, {
    width: pageW * 0.45,
    align: "right",
  });
  y += 40;

  // ===================================================================
  // CHARGES PATRONALES
  // ===================================================================
  doc.rect(40, y, pageW, 16).fill(LIGHT_BG);
  doc
    .fillColor("#6b7280")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("CHARGES PATRONALES (pour information)", 50, y + 3);
  y += 16;

  for (const el of chargesPatronales) {
    doc.fillColor("#6b7280").fontSize(8).font("Helvetica");
    doc.text(el.libelle, 50, y + 2, { width: pageW * 0.55 });
    if (el.taux)
      doc.text(`${el.taux}%`, 50 + pageW * 0.6, y + 2, {
        width: pageW * 0.15,
        align: "right",
      });
    doc
      .font("Helvetica-Bold")
      .text(`${fmt(el.montant)}`, 50 + pageW * 0.75, y + 2, {
        width: pageW * 0.2,
        align: "right",
      });
    y += 14;
  }

  // Total employer cost
  doc
    .moveTo(40, y)
    .lineTo(40 + pageW, y)
    .lineWidth(0.5)
    .stroke(BORDER);
  y += 3;
  doc.fillColor("#6b7280").fontSize(9).font("Helvetica-Bold");
  doc.text("COUT TOTAL EMPLOYEUR", 50, y, { width: pageW * 0.75 });
  doc.text(`${fmt(bulletin.coutTotalEmployeur)} TND`, 50 + pageW * 0.75, y, {
    width: pageW * 0.2,
    align: "right",
  });
  y += 22;

  // ===================================================================
  // PAYMENT INFO
  // ===================================================================
  doc
    .moveTo(40, y)
    .lineTo(40 + pageW, y)
    .lineWidth(0.3)
    .stroke(BORDER);
  y += 8;
  doc.fillColor("#64748b").fontSize(8).font("Helvetica");
  doc.text(`Mode de paiement: Virement bancaire`, 50, y);
  doc.text(`IBAN: ${emp.iban}`, 50, y + 12);
  if (emp.banque) doc.text(`Banque: ${emp.banque}`, 50, y + 24);
  y += 42;

  // ===================================================================
  // FOOTER
  // ===================================================================
  doc.fillColor("#94a3b8").fontSize(7).font("Helvetica");
  doc.text(
    `Document genere le ${new Date().toLocaleDateString("fr-TN")} | ${entreprise.nom} | Confidentiel`,
    40,
    780,
    { width: pageW, align: "center" }
  );

  return doc;
}
