// ============================================================================
// PayrollHub — Email Service
// SMTP-based email delivery for account notifications
// ============================================================================

import nodemailer from "nodemailer";

// Configurable via environment variables
const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "1025", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "noreply@payrollhub.tn";
const SMTP_SECURE = process.env.SMTP_SECURE === "true";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  ...(SMTP_USER
    ? { auth: { user: SMTP_USER, pass: SMTP_PASS } }
    : {}),
});

/**
 * Send account credentials to a newly created employee
 */
export async function sendAccountCreatedEmail(
  to: string,
  prenom: string,
  nom: string,
  email: string,
  password: string,
  companyName: string,
  role: string,
): Promise<boolean> {
  const roleLabels: Record<string, string> = {
    employe: "Employé",
    manager: "Manager",
    comptable: "Comptable",
    admin_paie: "Administrateur Paie",
    admin_rh: "Administrateur RH",
    super_admin: "Super Administrateur",
  };

  const roleLabel = roleLabels[role] || role;
  const loginUrl = process.env.APP_URL
    ? `${process.env.APP_URL}/login`
    : "http://localhost:3000/login";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;">
    <tr>
      <td style="background:#1e40af;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">PayrollHub</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">${companyName}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
        <h2 style="color:#0f172a;margin:0 0 16px;font-size:18px;">
          Bienvenue ${prenom} ${nom} !
        </h2>
        <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Un compte a été créé pour vous sur la plateforme <strong>PayrollHub</strong>
          de <strong>${companyName}</strong>. Vous pouvez dès maintenant accéder
          à votre espace en utilisant les identifiants ci-dessous.
        </p>

        <table width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 24px;">
          <tr>
            <td style="padding:8px 16px;">
              <p style="margin:0;color:#64748b;font-size:12px;">Rôle</p>
              <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600;">${roleLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 16px;">
              <p style="margin:0;color:#64748b;font-size:12px;">Email de connexion</p>
              <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600;">${email}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 16px;">
              <p style="margin:0;color:#64748b;font-size:12px;">Mot de passe temporaire</p>
              <p style="margin:4px 0 0;color:#0f172a;font-size:16px;font-weight:700;font-family:monospace;letter-spacing:1px;">${password}</p>
            </td>
          </tr>
        </table>

        <p style="color:#dc2626;font-size:13px;margin:0 0 20px;">
          ⚠ Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.
        </p>

        <a href="${loginUrl}" style="display:inline-block;background:#1e40af;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Se connecter
        </a>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">
          Cet email a été envoyé automatiquement par PayrollHub. Ne répondez pas à ce message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Bienvenue ${prenom} ${nom} !

Un compte PayrollHub a été créé pour vous chez ${companyName}.

Rôle : ${roleLabel}
Email : ${email}
Mot de passe : ${password}

Connectez-vous ici : ${loginUrl}

Veuillez changer votre mot de passe dès votre première connexion.`;

  try {
    await transporter.sendMail({
      from: `"PayrollHub" <${SMTP_FROM}>`,
      to,
      subject: `PayrollHub — Votre compte a été créé (${companyName})`,
      text,
      html,
    });
    console.log(`[Email] Account credentials sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
    return false;
  }
}

/**
 * Verify SMTP connection on startup (non-blocking)
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("[Email] SMTP connection verified successfully");
    return true;
  } catch (err) {
    console.warn("[Email] SMTP connection failed — emails will not be sent:", (err as Error).message);
    return false;
  }
}
