// ============================================================================
// PayrollHub — Payroll Calculation Engine
// Tunisian payroll: CNSS, IRPP (8 brackets + CSS), FOPROLOS, TFP
// ============================================================================

import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import type {
  Employe,
  Entreprise,
  ElementPaie,
  BulletinPaie,
  ParametreReglementaire,
} from "../shared/types";
import {
  PayElementType,
  MaritalStatus,
  SectorType,
} from "../shared/types";

// --- Regulatory Parameter Helper ---

interface PayrollParams {
  cnssEmployeTotal: number;      // 9.68%
  cnssPatronalTotal: number;     // 17.07%
  irppBrackets: { min: number; max: number; rate: number }[];
  fraisProTaux: number;          // 10%
  fraisProPlafond: number;       // 2000 TND/year
  deductionChefFamille: number;  // 150 TND/year
  deductionEnfant: number;       // 90 TND/year
  foprolosTaux: number;          // 1%
  tfpIndustrie: number;          // 2%
  tfpServices: number;           // 1%
}

async function loadParams(): Promise<PayrollParams> {
  const params = await storage.getParametres();
  const get = (nom: string): number => {
    const p = params.find((x: any) => x.nom === nom);
    return p ? parseFloat(p.valeur) : 0;
  };

  return {
    cnssEmployeTotal: get("CNSS_SAL_TOTAL"),
    cnssPatronalTotal: get("CNSS_PAT_TOTAL"),
    irppBrackets: [
      { min: 0, max: 5000, rate: get("IRPP_TRANCHE_1") },
      { min: 5000, max: 10000, rate: get("IRPP_TRANCHE_2") },
      { min: 10000, max: 20000, rate: get("IRPP_TRANCHE_3") },
      { min: 20000, max: 30000, rate: get("IRPP_TRANCHE_4") },
      { min: 30000, max: 40000, rate: get("IRPP_TRANCHE_5") },
      { min: 40000, max: 50000, rate: get("IRPP_TRANCHE_6") },
      { min: 50000, max: 70000, rate: get("IRPP_TRANCHE_7") },
      { min: 70000, max: Infinity, rate: get("IRPP_TRANCHE_8") },
    ],
    fraisProTaux: get("IRPP_FRAIS_PRO_TAUX"),
    fraisProPlafond: get("IRPP_FRAIS_PRO_PLAFOND"),
    deductionChefFamille: get("IRPP_DEDUCTION_CHEF_FAMILLE"),
    deductionEnfant: get("IRPP_DEDUCTION_ENFANT"),
    foprolosTaux: get("FOPROLOS_TAUX"),
    tfpIndustrie: get("TFP_INDUSTRIE"),
    tfpServices: get("TFP_SERVICES"),
  };
}

// --- IRPP Progressive Tax Calculation ---

function calculateIRPPAnnual(
  revenuAnnuelImposable: number,
  brackets: PayrollParams["irppBrackets"]
): number {
  if (revenuAnnuelImposable <= 0) return 0;

  let totalTax = 0;
  let remaining = revenuAnnuelImposable;

  for (const bracket of brackets) {
    const bracketSize =
      bracket.max === Infinity ? remaining : bracket.max - bracket.min;

    const taxable = Math.min(remaining, bracketSize);
    if (taxable <= 0) break;

    totalTax += taxable * (bracket.rate / 100);
    remaining -= taxable;
  }

  return totalTax;
}

// --- Main Payroll Calculation ---

export interface PayrollCalculationResult {
  bulletin: BulletinPaie;
  details: {
    salaireBrut: number;
    cnssSalarial: number;
    cnssPatronal: number;
    revenuAnnuelNet: number;
    fraisPro: number;
    deductionsFamiliales: number;
    revenuAnnuelImposable: number;
    irppAnnuel: number;
    irppMensuel: number;
    foprolos: number;
    tfp: number;
    netAPayer: number;
    coutTotalEmployeur: number;
  };
}

export async function calculatePayroll(
  employe: Employe,
  entreprise: Entreprise,
  periodePaieId: string,
  variableElements: Omit<ElementPaie, "id" | "periodePaieId">[]
): Promise<PayrollCalculationResult> {
  const p = await loadParams();
  const now = new Date().toISOString();

  // -----------------------------------------------------------------------
  // 1. Collect all pay elements
  // -----------------------------------------------------------------------
  const elements: ElementPaie[] = [];

  // Base salary (always included)
  elements.push({
    id: uuidv4(),
    periodePaieId,
    employeId: employe.id,
    type: PayElementType.SALAIRE_BASE,
    libelle: "Salaire de Base",
    montant: employe.salaireBase,
    estVariable: false,
  });

  // Variable elements (primes, heures sup, etc.)
  for (const el of variableElements) {
    elements.push({
      id: uuidv4(),
      periodePaieId,
      ...el,
    });
  }

  // -----------------------------------------------------------------------
  // 2. Salaire Brut
  // -----------------------------------------------------------------------
  const gains = elements.filter(
    e =>
      ![
        PayElementType.ACOMPTE,
        PayElementType.SAISIE_SALAIRE,
        PayElementType.CNSS_SALARIAL,
        PayElementType.CNSS_PATRONAL,
        PayElementType.IRPP,
        PayElementType.FOPROLOS,
        PayElementType.TFP,
      ].includes(e.type)
  );

  const deductionsFromBrut = elements.filter(e =>
    [PayElementType.ACOMPTE, PayElementType.SAISIE_SALAIRE].includes(e.type)
  );

  const salaireBrut =
    gains.reduce((s, e) => s + e.montant, 0) -
    deductionsFromBrut.reduce((s, e) => s + e.montant, 0);

  // -----------------------------------------------------------------------
  // 3. CNSS
  // -----------------------------------------------------------------------
  const cnssSalarial = round(salaireBrut * (p.cnssEmployeTotal / 100));
  const cnssPatronal = round(salaireBrut * (p.cnssPatronalTotal / 100));

  // Add CNSS elements to the bulletin
  elements.push({
    id: uuidv4(),
    periodePaieId,
    employeId: employe.id,
    type: PayElementType.CNSS_SALARIAL,
    libelle: `CNSS Salariale (${p.cnssEmployeTotal}%)`,
    montant: cnssSalarial,
    estVariable: false,
    taux: p.cnssEmployeTotal,
  });

  elements.push({
    id: uuidv4(),
    periodePaieId,
    employeId: employe.id,
    type: PayElementType.CNSS_PATRONAL,
    libelle: `CNSS Patronale (${p.cnssPatronalTotal}%)`,
    montant: cnssPatronal,
    estVariable: false,
    taux: p.cnssPatronalTotal,
  });

  // -----------------------------------------------------------------------
  // 4. IRPP — Annualized progressive tax
  // -----------------------------------------------------------------------
  const revenuMensuelNet = salaireBrut - cnssSalarial;
  const revenuAnnuelNet = revenuMensuelNet * 12;

  // Frais professionnels: 10% of annual net, capped at 2000 TND
  const fraisPro = Math.min(
    revenuAnnuelNet * (p.fraisProTaux / 100),
    p.fraisProPlafond
  );

  // Family deductions
  let deductionsFamiliales = 0;
  if (employe.situationFamiliale === MaritalStatus.MARIE) {
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
    id: uuidv4(),
    periodePaieId,
    employeId: employe.id,
    type: PayElementType.IRPP,
    libelle: "IRPP (Retenue à la source)",
    montant: irppMensuel,
    estVariable: false,
  });

  // -----------------------------------------------------------------------
  // 5. Employer charges: FOPROLOS + TFP
  // -----------------------------------------------------------------------
  const foprolos = round(salaireBrut * (p.foprolosTaux / 100));
  const tfpRate =
    entreprise.secteurActivite === SectorType.INDUSTRIE
      ? p.tfpIndustrie
      : p.tfpServices;
  const tfp = round(salaireBrut * (tfpRate / 100));

  elements.push({
    id: uuidv4(),
    periodePaieId,
    employeId: employe.id,
    type: PayElementType.FOPROLOS,
    libelle: `FOPROLOS (${p.foprolosTaux}%)`,
    montant: foprolos,
    estVariable: false,
    taux: p.foprolosTaux,
  });

  elements.push({
    id: uuidv4(),
    periodePaieId,
    employeId: employe.id,
    type: PayElementType.TFP,
    libelle: `TFP (${tfpRate}%)`,
    montant: tfp,
    estVariable: false,
    taux: tfpRate,
  });

  // -----------------------------------------------------------------------
  // 6. Net à Payer & Coût Total Employeur
  // -----------------------------------------------------------------------
  const netAPayer = round(salaireBrut - cnssSalarial - irppMensuel);
  const coutTotalEmployeur = round(salaireBrut + cnssPatronal + foprolos + tfp);
  const salaireNetImposable = round(revenuAnnuelImposable / 12);

  // -----------------------------------------------------------------------
  // 7. Build BulletinPaie
  // -----------------------------------------------------------------------
  const bulletin: BulletinPaie = {
    id: uuidv4(),
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
    dateGeneration: now,
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
      coutTotalEmployeur,
    },
  };
}

// --- Run payroll for all active employees in a period ---

export async function runPayrollForPeriod(
  periodePaieId: string,
  entrepriseId: string
): Promise<BulletinPaie[]> {
  const entreprise = await storage.getEntreprise(entrepriseId);
  if (!entreprise) throw new Error("Entreprise introuvable");

  const allEmployes = await storage.getEmployes(entrepriseId);
  const employes = allEmployes.filter((e: any) => e.actif);
  const bulletins: BulletinPaie[] = [];

  for (const emp of employes) {
    // Get variable elements entered for this period + employee
    const rawElements = await storage.getElementsPaie(periodePaieId, emp.id);
    const variableElements = rawElements.map((el: any) => ({
      employeId: el.employeId,
      type: el.type,
      libelle: el.libelle,
      montant: el.montant,
      estVariable: el.estVariable,
      heures: el.heures,
      taux: el.taux,
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

// --- Utility ---

function round(n: number): number {
  return Math.round(n * 1000) / 1000; // 3 decimal places (millimes)
}
