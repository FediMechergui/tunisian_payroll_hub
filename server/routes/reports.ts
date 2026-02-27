// ============================================================================
// PayrollHub — Reports API Routes
// Custom report builder with CSV/PDF export
// ============================================================================

import { Router, type Request, type Response } from "express";
import PDFDocument from "pdfkit";
import { storage } from "../storage";
import { requireAuth, requireMinRole } from "../auth";
import { generateReportSchema } from "../../shared/schema";
import { ReportType, UserRole, ContractType, LeaveStatus, type Employe, type BulletinPaie } from "../../shared/types";

export const reportsRouter = Router();
reportsRouter.use(requireAuth);
reportsRouter.use(requireMinRole(UserRole.COMPTABLE));

// ── helpers ───────────────────────────────────────────────────────────
const fmt = (n: number) => n.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// ── GET /api/reports — list reports ──────────────────────────────────
reportsRouter.get("/", (req: Request, res: Response) => {
  const reports = storage.getReports(req.user!.entrepriseId);
  return res.json({ success: true, data: reports });
});

// ── POST /api/reports/generate — generate a new report ───────────────
reportsRouter.post("/generate", (req: Request, res: Response) => {
  const parsed = generateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Données invalides" });
  }

  const { type, titre, periodeDebut, periodeFin, filtres } = parsed.data;
  const entrepriseId = req.user!.entrepriseId;
  const entreprise = storage.getEntreprise(entrepriseId);
  if (!entreprise) return res.status(404).json({ success: false, error: "Entreprise introuvable" });

  const employes = storage.getEmployes(entrepriseId);
  const periodes = storage.getPeriodesPaie(entrepriseId);

  // Filter periodes by date range
  const startDate = new Date(periodeDebut);
  const endDate = new Date(periodeFin);
  const relevantPeriodes = periodes.filter(p => {
    const periodeDate = new Date(p.annee, p.mois - 1, 1);
    return periodeDate >= startDate && periodeDate <= endDate;
  });
  const allBulletins = relevantPeriodes.flatMap(p => storage.getBulletins(p.id));

  // Optional department filter
  let filteredEmployes = employes;
  if (filtres?.departement) {
    filteredEmployes = employes.filter(e => e.departement === filtres.departement);
  }
  const empIds = new Set(filteredEmployes.map(e => e.id));
  const filteredBulletins = allBulletins.filter(b => empIds.has(b.employeId));

  // Save report record
  const report = storage.createReport({
    entrepriseId,
    type,
    titre,
    periodeDebut,
    periodeFin,
    filtres: filtres || undefined,
    generePar: req.user!.id,
  });

  try {
    const format = req.query.format === "csv" ? "csv" : "pdf";

    if (format === "csv") {
      const csv = generateReportCSV(type, filteredEmployes, filteredBulletins, relevantPeriodes, titre);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${titre.replace(/\s/g, "_")}.csv"`);
      return res.send(csv);
    }

    const pdf = generateReportPDF(type, entreprise, filteredEmployes, filteredBulletins, relevantPeriodes, titre, periodeDebut, periodeFin);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${titre.replace(/\s/g, "_")}.pdf"`);
    pdf.pipe(res);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Erreur lors de la génération" });
  }
});

// ── GET /api/reports/:id — report metadata ───────────────────────────
reportsRouter.get("/:id", (req: Request, res: Response) => {
  const report = storage.getReport(req.params.id);
  if (!report) return res.status(404).json({ success: false, error: "Rapport introuvable" });
  return res.json({ success: true, data: report });
});

// ── DELETE /api/reports/:id — delete report ──────────────────────────
reportsRouter.delete("/:id", requireMinRole(UserRole.ADMIN_RH), (req: Request, res: Response) => {
  const deleted = storage.deleteReport(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: "Rapport introuvable" });
  return res.json({ success: true, message: "Rapport supprimé" });
});

// ═══════════════════════════════════════════════════════════════════════
// PDF report generator
// ═══════════════════════════════════════════════════════════════════════

function generateReportPDF(
  type: ReportType,
  entreprise: any,
  employes: Employe[],
  bulletins: BulletinPaie[],
  periodes: any[],
  titre: string,
  periodeDebut: string,
  periodeFin: string,
) {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });

  // Header
  doc.fontSize(16).font("Helvetica-Bold").text(entreprise.nom, 40, 40);
  doc.fontSize(10).font("Helvetica").text(`MF: ${entreprise.mf || "N/A"}`, 40, 60);
  doc.fontSize(14).font("Helvetica-Bold").text(titre, 40, 90, { align: "center" });
  doc.fontSize(9).font("Helvetica").text(
    `Période: ${periodeDebut} → ${periodeFin}  |  Généré le ${new Date().toLocaleDateString("fr-TN")}`,
    40, 112, { align: "center" }
  );
  doc.moveDown(2);

  switch (type) {
    case ReportType.MASSE_SALARIALE:
      generateMasseSalarialePDF(doc, employes, bulletins, periodes);
      break;
    case ReportType.EFFECTIFS:
      generateEffectifsPDF(doc, employes);
      break;
    case ReportType.CHARGES_SOCIALES:
      generateChargesSocialesPDF(doc, employes, bulletins, periodes);
      break;
    case ReportType.CONGES:
      generateCongesPDF(doc, employes, entreprise.id);
      break;
    case ReportType.COUT_DEPARTEMENT:
      generateCoutDeptPDF(doc, employes, bulletins);
      break;
    case ReportType.PERSONNALISE:
      generatePersonnalisePDF(doc, employes, bulletins);
      break;
  }

  doc.end();
  return doc;
}

// ── Masse Salariale ──────────────────────────────────────────────────
function generateMasseSalarialePDF(doc: PDFKit.PDFDocument, employes: Employe[], bulletins: BulletinPaie[], periodes: any[]) {
  const y = doc.y;
  const cols = [40, 140, 250, 350, 440, 530, 620, 700];
  const headers = ["Mois", "Nb Bulletins", "Brut Total", "CNSS Sal.", "CNSS Pat.", "IRPP", "Net Total", "Coût Total"];

  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 90 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();

  doc.font("Helvetica").fontSize(8);
  let currentY = y + 18;
  let grandBrut = 0, grandNet = 0, grandCout = 0;

  for (const p of periodes.sort((a: any, b: any) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois))) {
    const pBulletins = bulletins.filter(b => b.periodePaieId === p.id);
    if (pBulletins.length === 0) continue;

    const brut = pBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const cnssSal = pBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const cnssPat = pBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
    const irpp = pBulletins.reduce((s, b) => s + b.irpp, 0);
    const net = pBulletins.reduce((s, b) => s + b.netAPayer, 0);
    const cout = brut + cnssPat;

    grandBrut += brut; grandNet += net; grandCout += cout;

    const label = `${MOIS_NOMS[p.mois - 1]} ${p.annee}`;
    doc.text(label, cols[0], currentY, { width: 100 });
    doc.text(String(pBulletins.length), cols[1], currentY, { width: 90 });
    doc.text(fmt(brut), cols[2], currentY, { width: 90 });
    doc.text(fmt(cnssSal), cols[3], currentY, { width: 90 });
    doc.text(fmt(cnssPat), cols[4], currentY, { width: 90 });
    doc.text(fmt(irpp), cols[5], currentY, { width: 90 });
    doc.text(fmt(net), cols[6], currentY, { width: 90 });
    doc.text(fmt(cout), cols[7], currentY, { width: 90 });
    currentY += 14;
    if (currentY > 540) { doc.addPage(); currentY = 40; }
  }

  doc.moveTo(40, currentY).lineTo(780, currentY).stroke();
  currentY += 6;
  doc.font("Helvetica-Bold");
  doc.text("TOTAL", cols[0], currentY);
  doc.text(fmt(grandBrut), cols[2], currentY, { width: 90 });
  doc.text(fmt(grandNet), cols[6], currentY, { width: 90 });
  doc.text(fmt(grandCout), cols[7], currentY, { width: 90 });
}

// ── Effectifs ────────────────────────────────────────────────────────
function generateEffectifsPDF(doc: PDFKit.PDFDocument, employes: Employe[]) {
  // Group by departement
  const byDept = new Map<string, Employe[]>();
  for (const e of employes) {
    const arr = byDept.get(e.departement) || [];
    arr.push(e);
    byDept.set(e.departement, arr);
  }

  let currentY = doc.y;
  doc.fontSize(8).font("Helvetica-Bold");
  const cols = [40, 200, 340, 450, 560, 680];
  ["Département", "Nb Employés", "CDI", "CDD", "CIVP/KARAMA", "Ancienneté Moy."].forEach((h, i) =>
    doc.text(h, cols[i], currentY, { width: 130 })
  );
  doc.moveTo(40, currentY + 12).lineTo(780, currentY + 12).stroke();
  currentY += 18;

  doc.font("Helvetica");
  const now = new Date();
  for (const [dept, emps] of Array.from(byDept.entries()).sort()) {
    const cdi = emps.filter(e => e.typeContrat === ContractType.CDI).length;
    const cdd = emps.filter(e => e.typeContrat === ContractType.CDD).length;
    const civpKarama = emps.filter(e => e.typeContrat === ContractType.SIVP || e.typeContrat === ContractType.KARAMA).length;
    const anciennete = emps.reduce((s, e) => {
      const hire = new Date(e.dateEmbauche);
      return s + (now.getTime() - hire.getTime()) / (365.25 * 86400000);
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
  doc.text(`Total: ${employes.length} employés`, 40, currentY);
}

// ── Charges Sociales ─────────────────────────────────────────────────
function generateChargesSocialesPDF(doc: PDFKit.PDFDocument, employes: Employe[], bulletins: BulletinPaie[], periodes: any[]) {
  const y = doc.y;
  const cols = [40, 140, 250, 360, 470, 580, 680];
  const headers = ["Mois", "CNSS Salarial", "CNSS Patronal", "FOPROLOS", "TFP", "IRPP + CSS", "Total Charges"];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 100 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();

  let currentY = y + 18;
  doc.font("Helvetica");

  for (const p of periodes.sort((a: any, b: any) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois))) {
    const pBulletins = bulletins.filter(b => b.periodePaieId === p.id);
    if (pBulletins.length === 0) continue;

    const cnssSal = pBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const cnssPat = pBulletins.reduce((s, b) => s + b.cnssPatronal, 0);
    const brut = pBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const foprolos = brut * 0.01; // 1% employeur
    const tfp = brut * 0.02; // 2% employeur
    const irppCss = pBulletins.reduce((s, b) => s + b.irpp, 0);
    const total = cnssSal + cnssPat + foprolos + tfp + irppCss;

    const label = `${MOIS_NOMS[p.mois - 1]} ${p.annee}`;
    doc.text(label, cols[0], currentY, { width: 100 });
    doc.text(fmt(cnssSal), cols[1], currentY, { width: 100 });
    doc.text(fmt(cnssPat), cols[2], currentY, { width: 100 });
    doc.text(fmt(foprolos), cols[3], currentY, { width: 100 });
    doc.text(fmt(tfp), cols[4], currentY, { width: 100 });
    doc.text(fmt(irppCss), cols[5], currentY, { width: 100 });
    doc.text(fmt(total), cols[6], currentY, { width: 100 });
    currentY += 14;
    if (currentY > 540) { doc.addPage(); currentY = 40; }
  }
}

// ── Congés ───────────────────────────────────────────────────────────
function generateCongesPDF(doc: PDFKit.PDFDocument, employes: Employe[], entrepriseId: string) {
  const y = doc.y;
  const cols = [40, 200, 320, 440, 560, 680];
  const headers = ["Employé", "Département", "Total Demandes", "Approuvés", "En attente", "Solde"];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 110 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();

  let currentY = y + 18;
  doc.font("Helvetica");

  const allConges = storage.getConges(entrepriseId);

  for (const emp of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
    const empConges = allConges.filter(c => c.employeId === emp.id);
    const approuves = empConges.filter(c => c.statut === LeaveStatus.APPROUVE).length;
    const enAttente = empConges.filter(c => c.statut === LeaveStatus.EN_ATTENTE).length;
    const joursApprouves = empConges.filter(c => c.statut === LeaveStatus.APPROUVE).reduce((s, c) => s + c.nbJours, 0);

    doc.text(`${emp.nom} ${emp.prenom}`, cols[0], currentY, { width: 150 });
    doc.text(emp.departement, cols[1], currentY, { width: 110 });
    doc.text(String(empConges.length), cols[2], currentY, { width: 110 });
    doc.text(String(approuves), cols[3], currentY, { width: 110 });
    doc.text(String(enAttente), cols[4], currentY, { width: 110 });
    doc.text(`${joursApprouves} j`, cols[5], currentY, { width: 100 });
    currentY += 14;
    if (currentY > 540) { doc.addPage(); currentY = 40; }
  }
}

// ── Coût par Département ─────────────────────────────────────────────
function generateCoutDeptPDF(doc: PDFKit.PDFDocument, employes: Employe[], bulletins: BulletinPaie[]) {
  const y = doc.y;
  const cols = [40, 180, 300, 420, 540, 660];
  const headers = ["Département", "Nb Employés", "Brut Total", "Charges Pat.", "Coût Total", "Coût/Employé"];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 110 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();

  let currentY = y + 18;
  doc.font("Helvetica");

  const byDept = new Map<string, { emps: Set<string>; brut: number; charges: number }>();
  for (const b of bulletins) {
    const emp = employes.find(e => e.id === b.employeId);
    if (!emp) continue;
    const dept = emp.departement;
    const existing = byDept.get(dept) || { emps: new Set(), brut: 0, charges: 0 };
    existing.emps.add(b.employeId);
    existing.brut += b.salaireBrut;
    existing.charges += b.cnssPatronal + b.salaireBrut * 0.03; // FOPROLOS + TFP patronal
    byDept.set(dept, existing);
  }

  for (const [dept, data] of Array.from(byDept.entries()).sort()) {
    const nbEmps = data.emps.size;
    const cout = data.brut + data.charges;
    doc.text(dept, cols[0], currentY, { width: 130 });
    doc.text(String(nbEmps), cols[1], currentY, { width: 110 });
    doc.text(fmt(data.brut), cols[2], currentY, { width: 110 });
    doc.text(fmt(data.charges), cols[3], currentY, { width: 110 });
    doc.text(fmt(cout), cols[4], currentY, { width: 110 });
    doc.text(fmt(cout / nbEmps), cols[5], currentY, { width: 110 });
    currentY += 14;
  }
}

// ── Personnalisé ─────────────────────────────────────────────────────
function generatePersonnalisePDF(doc: PDFKit.PDFDocument, employes: Employe[], bulletins: BulletinPaie[]) {
  const y = doc.y;
  const cols = [40, 160, 270, 360, 440, 520, 600, 680];
  const headers = ["Employé", "Département", "Brut", "CNSS Sal.", "IRPP", "Net", "Nb Bulletins", "Moy. Net"];
  doc.fontSize(8).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 80 }));
  doc.moveTo(40, y + 12).lineTo(780, y + 12).stroke();

  let currentY = y + 18;
  doc.font("Helvetica");

  for (const emp of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
    const empBulletins = bulletins.filter(b => b.employeId === emp.id);
    if (empBulletins.length === 0) continue;

    const brut = empBulletins.reduce((s, b) => s + b.salaireBrut, 0);
    const cnss = empBulletins.reduce((s, b) => s + b.cnssSalarial, 0);
    const irpp = empBulletins.reduce((s, b) => s + b.irpp, 0);
    const net = empBulletins.reduce((s, b) => s + b.netAPayer, 0);

    doc.text(`${emp.nom} ${emp.prenom}`, cols[0], currentY, { width: 110 });
    doc.text(emp.departement, cols[1], currentY, { width: 100 });
    doc.text(fmt(brut), cols[2], currentY, { width: 80 });
    doc.text(fmt(cnss), cols[3], currentY, { width: 80 });
    doc.text(fmt(irpp), cols[4], currentY, { width: 80 });
    doc.text(fmt(net), cols[5], currentY, { width: 80 });
    doc.text(String(empBulletins.length), cols[6], currentY, { width: 80 });
    doc.text(fmt(net / empBulletins.length), cols[7], currentY, { width: 80 });
    currentY += 14;
    if (currentY > 540) { doc.addPage(); currentY = 40; }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CSV report generator
// ═══════════════════════════════════════════════════════════════════════

function generateReportCSV(
  type: ReportType,
  employes: Employe[],
  bulletins: BulletinPaie[],
  periodes: any[],
  _titre: string,
): string {
  const lines: string[] = [];

  switch (type) {
    case ReportType.MASSE_SALARIALE: {
      lines.push("Mois;Nb Bulletins;Brut Total;CNSS Sal.;CNSS Pat.;IRPP;Net Total;Coût Total");
      for (const p of periodes.sort((a: any, b: any) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois))) {
        const pBulletins = bulletins.filter(b => b.periodePaieId === p.id);
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
    case ReportType.EFFECTIFS: {
      lines.push("Employé;Département;Poste;Type Contrat;Date Embauche;Salaire Brut");
      for (const e of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
        lines.push([`${e.nom} ${e.prenom}`, e.departement, e.poste, e.typeContrat, e.dateEmbauche, e.salaireBase.toFixed(3)].join(";"));
      }
      break;
    }
    case ReportType.CHARGES_SOCIALES: {
      lines.push("Mois;CNSS Salarial;CNSS Patronal;FOPROLOS;TFP;IRPP+CSS;Total Charges");
      for (const p of periodes.sort((a: any, b: any) => a.annee * 100 + a.mois - (b.annee * 100 + b.mois))) {
        const pBulletins = bulletins.filter(b => b.periodePaieId === p.id);
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
    case ReportType.PERSONNALISE:
    default: {
      lines.push("Employé;Département;Brut Total;CNSS Salarial;IRPP;Net Total;Nb Bulletins;Moyenne Net");
      for (const emp of employes.sort((a, b) => a.nom.localeCompare(b.nom))) {
        const empBulletins = bulletins.filter(b => b.employeId === emp.id);
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
