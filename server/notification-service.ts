// ============================================================================
// PayrollHub — Notification Service
// Centralized notification dispatcher for app events
// ============================================================================

import { storage } from "./storage";
import {
  UserRole,
  NotificationType,
  NotificationPriority,
} from "../shared/types";

export const notificationService = {
  // Leave requested — notify managers & RH
  async onLeaveRequested(
    entrepriseId: string,
    employeNom: string,
    typeConge: string,
    dateDebut: string,
    dateFin: string
  ) {
    await storage.broadcastNotification(entrepriseId, UserRole.MANAGER, {
      type: NotificationType.CONGE_DEMANDE,
      priorite: NotificationPriority.MEDIUM,
      titre: "Nouvelle demande de congé",
      message: `${employeNom} a demandé un congé (${typeConge}) du ${dateDebut} au ${dateFin}.`,
      lien: "/app/conges",
    });
  },

  // Leave approved/rejected — notify the employee
  async onLeaveDecision(
    entrepriseId: string,
    employeUserId: string | undefined,
    statut: "approuve" | "rejete",
    typeConge: string
  ) {
    if (!employeUserId) return;
    const type =
      statut === "approuve"
        ? NotificationType.CONGE_APPROUVE
        : NotificationType.CONGE_REJETE;
    const statusLabel = statut === "approuve" ? "approuvé" : "rejeté";

    await storage.createNotification({
      entrepriseId,
      destinataireId: employeUserId,
      type,
      priorite: NotificationPriority.HIGH,
      titre: `Congé ${statusLabel}`,
      message: `Votre demande de congé (${typeConge}) a été ${statusLabel}.`,
      lien: "/app/mon-espace",
    });
  },

  // Payroll calculated — notify RH & admin paie
  async onPayrollCalculated(entrepriseId: string, periodeLabel: string) {
    await storage.broadcastNotification(entrepriseId, UserRole.ADMIN_PAIE, {
      type: NotificationType.PAIE_CALCULEE,
      priorite: NotificationPriority.MEDIUM,
      titre: "Paie calculée",
      message: `Les bulletins de paie pour ${periodeLabel} ont été calculés.`,
      lien: "/app/paie",
    });
  },

  // Payroll validated — notify comptable+
  async onPayrollValidated(entrepriseId: string, periodeLabel: string) {
    await storage.broadcastNotification(entrepriseId, UserRole.COMPTABLE, {
      type: NotificationType.PAIE_VALIDEE,
      priorite: NotificationPriority.HIGH,
      titre: "Paie validée",
      message: `La paie ${periodeLabel} a été validée et est prête pour finalisation.`,
      lien: "/app/paie",
    });
  },

  // Payroll finalized — notify all employees
  async onPayrollFinalized(entrepriseId: string, periodeLabel: string) {
    await storage.broadcastNotification(entrepriseId, UserRole.EMPLOYE, {
      type: NotificationType.PAIE_FINALISEE,
      priorite: NotificationPriority.HIGH,
      titre: "Bulletins de paie disponibles",
      message: `Les bulletins de paie de ${periodeLabel} sont disponibles dans votre espace.`,
      lien: "/app/mon-espace",
    });
  },

  // Document generated — notify the employee
  async onDocumentGenerated(
    entrepriseId: string,
    employeUserId: string | undefined,
    docType: string
  ) {
    if (!employeUserId) return;
    await storage.createNotification({
      entrepriseId,
      destinataireId: employeUserId,
      type: NotificationType.DOCUMENT_GENERE,
      priorite: NotificationPriority.LOW,
      titre: "Document généré",
      message: `Un document (${docType}) a été généré pour vous.`,
      lien: "/app/mon-espace",
    });
  },

  // Declaration generated — notify admin_paie+
  async onDeclarationGenerated(entrepriseId: string, declType: string) {
    await storage.broadcastNotification(entrepriseId, UserRole.ADMIN_PAIE, {
      type: NotificationType.DECLARATION_GENEREE,
      priorite: NotificationPriority.MEDIUM,
      titre: "Déclaration générée",
      message: `Une déclaration ${declType} a été générée et est prête pour soumission.`,
      lien: "/app/declarations",
    });
  },

  // Employee created — notify RH
  async onEmployeeCreated(entrepriseId: string, employeNom: string) {
    await storage.broadcastNotification(entrepriseId, UserRole.ADMIN_RH, {
      type: NotificationType.EMPLOYE_CREE,
      priorite: NotificationPriority.LOW,
      titre: "Nouvel employé",
      message: `${employeNom} a été ajouté à l'effectif.`,
      lien: "/app/employes",
    });
  },

  // Contract expiry alert (scheduled)
  async onContractExpiring(
    entrepriseId: string,
    employeNom: string,
    dateFin: string
  ) {
    await storage.broadcastNotification(entrepriseId, UserRole.ADMIN_RH, {
      type: NotificationType.CONTRAT_EXPIRATION,
      priorite: NotificationPriority.URGENT,
      titre: "Contrat en expiration",
      message: `Le contrat de ${employeNom} expire le ${dateFin}. Action requise.`,
      lien: "/app/employes",
    });
  },

  // System alert
  async systemAlert(entrepriseId: string, message: string) {
    await storage.broadcastNotification(entrepriseId, UserRole.ADMIN_RH, {
      type: NotificationType.ALERTE_SYSTEME,
      priorite: NotificationPriority.HIGH,
      titre: "Alerte système",
      message,
    });
  },
};
