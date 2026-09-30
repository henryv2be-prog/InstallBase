import { getAppUrl } from "@/lib/app-url";
import type { CommunityActivity } from "./activity-shared";
import { describePostForHighlight } from "./activity-shared";
import type { ReengagementContent } from "./content";

/** Landing-aligned palette (see globals.css). */
const COLORS = {
  background: "#050810",
  card: "#0f172a",
  cardBorder: "rgba(51, 65, 85, 0.65)",
  foreground: "#f1f5f9",
  muted: "#94a3b8",
  primary: "#3b82f6",
  accent: "#22d3ee",
  brag: "#f97316",
  success: "#10b981",
  grid: "rgba(59, 130, 246, 0.08)",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type WeeklyEmailFeatured = {
  headline: string;
  absoluteUrl: string;
  badge: string;
};

export function resolveWeeklyEmailFeatured(
  activity: CommunityActivity,
  appUrl: string
): WeeklyEmailFeatured | null {
  if (!activity.highlight) return null;
  const description = describePostForHighlight(activity.highlight);
  const headline =
    description.length > 0
      ? description.charAt(0).toUpperCase() + description.slice(1)
      : "New post from the community";
  const badge =
    activity.highlight.type === "QUESTION" ? "Question" : activity.highlight.type === "PROJECT" ? "Install" : "Post";
  return {
    headline,
    absoluteUrl: `${appUrl}/post/${activity.highlight.id}?ref=weekly-reengagement`,
    badge,
  };
}

function trustStat(value: number, label: string, accent: string): string {
  return `
    <td style="padding:12px 8px;text-align:center;vertical-align:top;width:25%;">
      <div style="font-size:26px;font-weight:800;letter-spacing:-0.02em;color:${accent};line-height:1.1;">${value}</div>
      <div style="font-size:11px;line-height:1.35;color:${COLORS.muted};margin-top:6px;">${escapeHtml(label)}</div>
    </td>`;
}

function bulletRow(text: string): string {
  return `
    <tr>
      <td style="padding:0 0 10px 0;vertical-align:top;width:18px;">
        <div style="margin-top:7px;height:6px;width:6px;border-radius:999px;background:${COLORS.accent};"></div>
      </td>
      <td style="padding:0 0 10px 0;font-size:14px;line-height:1.5;color:${COLORS.foreground};opacity:0.92;">
        ${escapeHtml(text)}
      </td>
    </tr>`;
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
  featured?: WeeklyEmailFeatured | null;
}): ReengagementEmailPayload {
  const { content, activity, recipientName, absoluteActionUrl, featured } = input;
  const appUrl = getAppUrl();
  const settingsUrl = `${appUrl}/settings`;
  const feedUrl = `${appUrl}/feed?ref=weekly-reengagement`;
  const iconUrl = `${appUrl}/icons/icon-192.png`;

  const greetingPlain = recipientName?.trim() ? `Hi ${recipientName.trim()},` : "Hi there,";
  const greeting = escapeHtml(greetingPlain);

  const otherPosts = Math.max(0, activity.posts - activity.installations);
  const subject = content.title.replace(/\s+/g, " ").trim();

  const featuredBlock = featured
    ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;border-radius:16px;border:1px solid ${COLORS.cardBorder};background:${COLORS.card};overflow:hidden;">
      <tr>
        <td style="padding:14px 16px 10px;border-bottom:1px solid ${COLORS.cardBorder};background:rgba(15,23,42,0.95);">
          <span style="font-family:ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.accent};">Spotlight</span>
          <p style="margin:6px 0 0;font-size:11px;color:${COLORS.muted};">From the live community feed</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;">
          <span style="display:inline-block;margin-bottom:10px;border-radius:999px;border:1px solid ${COLORS.cardBorder};padding:4px 10px;font-size:11px;font-weight:600;color:${COLORS.foreground};">${escapeHtml(featured.badge)}</span>
          <p style="margin:0 0 12px;font-size:16px;font-weight:700;line-height:1.45;color:${COLORS.foreground};">${escapeHtml(featured.headline)}</p>
          <a href="${escapeHtml(featured.absoluteUrl)}" style="font-size:14px;font-weight:600;color:${COLORS.accent};text-decoration:none;">View post →</a>
        </td>
      </tr>
    </table>`
    : "";

  const textFeatured = featured
    ? `\nSpotlight: ${featured.headline}\n${featured.absoluteUrl}\n`
    : "";

  const text = `${greetingPlain}

${content.body}
${textFeatured}
Open InstallBase: ${absoluteActionUrl}
Browse the feed: ${feedUrl}

This week on InstallBase:
- ${activity.installations} installs posted
- ${otherPosts} other posts
- ${activity.questions} questions
- ${activity.answers} answers
- ${activity.bragPoints} Brag points

Your work is your reputation.

Manage email preferences: ${settingsUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background};font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.body)}</div>
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
                      <div style="padding:28px 24px 22px;">
                        <p style="margin:0 0 10px;font-family:ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.accent};">Your weekly roundup</p>
                        <h1 style="margin:0 0 8px;font-size:28px;line-height:1.12;font-weight:800;letter-spacing:-0.03em;color:${COLORS.foreground};">
                          Your work is <span style="color:${COLORS.primary};">your reputation.</span>
                        </h1>
                        <p style="margin:0;font-size:17px;font-weight:700;line-height:1.35;color:${COLORS.foreground};">${escapeHtml(content.title)}</p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:8px 24px 0;">
                      <p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:${COLORS.foreground};">${greeting}</p>
                      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${escapeHtml(content.body)}</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 24px 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:14px;border:1px solid ${COLORS.cardBorder};background:rgba(15,23,42,0.85);">
                        <tr>
                          ${trustStat(activity.installations, "installs this week", COLORS.accent)}
                          ${trustStat(otherPosts, "other posts", COLORS.primary)}
                          ${trustStat(activity.questions, "questions", "#fbbf24")}
                          ${trustStat(activity.bragPoints, "Brag points", COLORS.brag)}
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:16px 24px 0;">
                      ${featuredBlock}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:4px 24px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        ${bulletRow("Document quality installs from site — tied to your profile")}
                        ${bulletRow("Ask technical questions to installers who do the same work")}
                        ${bulletRow("Earn Brag points when your installs stand out")}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 24px 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="border-radius:999px;background:${COLORS.primary};box-shadow:0 0 20px rgba(59,130,246,0.45);">
                            <a href="${escapeHtml(absoluteActionUrl)}" style="display:block;padding:15px 24px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">See what&apos;s new →</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 24px 24px;text-align:center;">
                      <a href="${escapeHtml(feedUrl)}" style="display:inline-block;margin-top:14px;padding:12px 18px;font-size:14px;font-weight:600;color:${COLORS.foreground};text-decoration:none;border:1px solid ${COLORS.cardBorder};border-radius:999px;">Browse the feed</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 8px 0;text-align:center;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${COLORS.muted};">Your work is your reputation.</p>
                <p style="margin:0;font-size:12px;line-height:1.55;color:${COLORS.muted};">
                  Weekly community digest ·
                  <a href="${escapeHtml(settingsUrl)}" style="color:${COLORS.accent};text-decoration:none;">Email preferences</a>
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
