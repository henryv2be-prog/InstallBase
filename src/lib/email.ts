import "server-only";
import { getAppUrl } from "@/lib/app-url";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getFromAddress() {
  return process.env.EMAIL_FROM ?? "InstallBase <noreply@installbase.io>";
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] To: ${to}\nSubject: ${subject}\n${text}`);
      return { ok: true, dev: true };
    }
    console.error("[email] RESEND_API_KEY is not set — cannot send email");
    return { ok: false, error: "Email is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[email] Resend error:", response.status, body);
    return { ok: false, error: "Failed to send email" };
  }

  return { ok: true };
}

export function passwordResetEmailContent(resetUrl: string) {
  const subject = "Reset your InstallBase password";
  const text = `You requested a password reset for InstallBase.

Reset your password using this link (valid for 1 hour):
${resetUrl}

If you did not request this, you can ignore this email.`;

  const html = `
    <p>You requested a password reset for InstallBase.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `.trim();

  return { subject, text, html };
}

export function buildPasswordResetUrl(token: string) {
  return `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}
