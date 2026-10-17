import "server-only";
import { getAppUrl } from "@/lib/app-url";

/** Landing-aligned palette (see globals.css). */
const COLORS = {
  background: "#050810",
  card: "#0f172a",
  cardBorder: "rgba(51, 65, 85, 0.65)",
  foreground: "#f1f5f9",
  muted: "#94a3b8",
  primary: "#3b82f6",
  accent: "#22d3ee",
  grid: "rgba(59, 130, 246, 0.08)",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type PlatformUpdateEmailContent = {
  subject: string;
  headline: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type PlatformUpdateEmailPayload = {
  subject: string;
  html: string;
  text: string;
};

export function validatePlatformUpdateInput(input: {
  subject: string;
  headline: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
}): { ok: true; content: PlatformUpdateEmailContent } | { ok: false; error: string } {
  const subject = input.subject.trim();
  const headline = input.headline.trim();
  const bodyText = input.bodyText.trim();
  const ctaLabel = input.ctaLabel.trim() || "Open InstallBase";
  let ctaUrl = input.ctaUrl.trim() || `${getAppUrl()}/feed/watch`;

  if (subject.length < 3 || subject.length > 120) {
    return { ok: false, error: "Subject must be between 3 and 120 characters." };
  }
  if (headline.length < 3 || headline.length > 200) {
    return { ok: false, error: "Headline must be between 3 and 200 characters." };
  }
  if (bodyText.length < 20 || bodyText.length > 8000) {
    return { ok: false, error: "Update body must be between 20 and 8000 characters." };
  }
  if (ctaLabel.length > 60) {
    return { ok: false, error: "Button label is too long." };
  }

  if (ctaUrl.startsWith("/")) {
    ctaUrl = `${getAppUrl()}${ctaUrl}`;
  } else if (!/^https:\/\//i.test(ctaUrl)) {
    return { ok: false, error: "CTA link must be https:// or a site path starting with /." };
  }

  return {
    ok: true,
    content: { subject, headline, bodyText, ctaLabel, ctaUrl },
  };
}

function bodyParagraphsHtml(bodyText: string): string {
  return bodyText
    .split(/\n{2,}|\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${COLORS.muted};">${escapeHtml(block)}</p>`
    )
    .join("");
}

export function buildPlatformUpdateEmailPayload(
  content: PlatformUpdateEmailContent,
  recipientName: string | null
): PlatformUpdateEmailPayload {
  const appUrl = getAppUrl();
  const settingsUrl = `${appUrl}/settings`;
  const iconUrl = `${appUrl}/icons/icon-192.png`;
  const greetingPlain = recipientName?.trim() ? `Hi ${recipientName.trim()},` : "Hi there,";
  const greeting = escapeHtml(greetingPlain);
  const subject = content.subject;

  const text = `${greetingPlain}

${content.headline}

${content.bodyText}

${content.ctaLabel}: ${content.ctaUrl}

You're receiving this because you have an InstallBase account. Community digest settings do not apply to important platform updates.

Manage your account: ${settingsUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background};font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.headline)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COLORS.background};background-image:linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px);background-size:32px 32px;">
      <tr>
        <td align="center" style="padding:28px 14px 36px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">
            <tr>
              <td style="padding:0 0 20px;text-align:center;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                  <tr>
                    <td style="padding-right:10px;vertical-align:middle;">
                      <img src="${escapeHtml(iconUrl)}" width="44" height="44" alt="" style="display:block;border-radius:12px;border:1px solid ${COLORS.cardBorder};" />
                    </td>
                    <td style="vertical-align:middle;text-align:left;">
                      <span style="font-size:20px;font-weight:800;letter-spacing:-0.03em;color:${COLORS.foreground};">Install</span><span style="font-size:20px;font-weight:800;letter-spacing:-0.03em;color:${COLORS.accent};">Base</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border-radius:20px;border:1px solid ${COLORS.cardBorder};background:linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(5,8,16,0.98) 100%);box-shadow:0 8px 32px rgba(0,0,0,0.35);overflow:hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0;background:radial-gradient(ellipse 80% 70% at 50% -30%, rgba(59,130,246,0.35), transparent 70%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(34,211,238,0.18), transparent 65%);">
                      <div style="padding:28px 24px 20px;">
                        <p style="margin:0 0 10px;font-family:ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.accent};">Platform update</p>
                        <h1 style="margin:0;font-size:26px;line-height:1.15;font-weight:800;letter-spacing:-0.03em;color:${COLORS.foreground};">${escapeHtml(content.headline)}</h1>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px 24px 8px;">
                      <p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:${COLORS.foreground};">${greeting}</p>
                      ${bodyParagraphsHtml(content.bodyText)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 24px 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="border-radius:999px;background:${COLORS.primary};box-shadow:0 0 20px rgba(59,130,246,0.45);">
                            <a href="${escapeHtml(content.ctaUrl)}" style="display:block;padding:15px 24px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">${escapeHtml(content.ctaLabel)} →</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 8px 0;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:${COLORS.muted};">
                  Important update for your InstallBase account · Not a marketing newsletter
                </p>
                <p style="margin:0;font-size:12px;line-height:1.55;color:${COLORS.muted};">
                  <a href="${escapeHtml(settingsUrl)}" style="color:${COLORS.accent};text-decoration:none;">Account settings</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
