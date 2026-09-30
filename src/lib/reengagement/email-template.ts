import { getAppUrl } from "@/lib/app-url";
import type { CommunityActivity } from "./activity-shared";
import type { ReengagementContent } from "./content";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statCell(label: string, value: number, accent: string): string {
  return `
    <td style="padding:8px 6px;text-align:center;vertical-align:top;width:25%;">
      <div style="font-size:22px;font-weight:700;color:${accent};line-height:1.2;">${value}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;line-height:1.3;">${escapeHtml(label)}</div>
    </td>`;
}

export type ReengagementEmailPayload = {
  subject: string;
  html: string;
  text: string;
};

export function buildReengagementEmailPayload(input: {
  content: ReengagementContent;
  activity: CommunityActivity;
  recipientName: string | null;
  absoluteActionUrl: string;
}): ReengagementEmailPayload {
  const { content, activity, recipientName, absoluteActionUrl } = input;
  const appUrl = getAppUrl();
  const settingsUrl = `${appUrl}/settings`;
  const greeting = recipientName?.trim()
    ? `Hi ${escapeHtml(recipientName.trim())},`
    : "Hi there,";

  const otherPosts = Math.max(0, activity.posts - activity.installations);
  const subject = content.title.replace(/\s+/g, " ").trim();

  const text = `${greeting.replace(/<[^>]+>/g, "")}

${content.body}

Open InstallBase: ${absoluteActionUrl}

This week on InstallBase:
- ${activity.installations} new installs
- ${otherPosts} other posts
- ${activity.questions} questions
- ${activity.answers} answers
- ${activity.bragPoints} Brag points

Manage email preferences: ${settingsUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1220;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1220;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1e293b;">
            <tr>
              <td style="padding:28px 24px 20px;background:linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 100%);">
                <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.85);">InstallBase</div>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:800;">${escapeHtml(content.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#e2e8f0;">${greeting}</p>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.55;color:#cbd5e1;">${escapeHtml(content.body)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#0f172a;border-radius:12px;border:1px solid #1e293b;">
                  <tr>
                    ${statCell("Installs", activity.installations, "#38bdf8")}
                    ${statCell("Posts", otherPosts, "#a78bfa")}
                    ${statCell("Questions", activity.questions, "#fbbf24")}
                    ${statCell("Brag pts", activity.bragPoints, "#34d399")}
                  </tr>
                </table>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 8px;">
                  <tr>
                    <td style="border-radius:999px;background:#2563eb;">
                      <a href="${escapeHtml(absoluteActionUrl)}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">See what&apos;s new →</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#64748b;text-align:center;">
                  Or copy this link: <a href="${escapeHtml(absoluteActionUrl)}" style="color:#38bdf8;">${escapeHtml(absoluteActionUrl)}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px;border-top:1px solid #1e293b;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                  Weekly community digest ·
                  <a href="${escapeHtml(settingsUrl)}" style="color:#94a3b8;">Turn off in Settings</a>
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
