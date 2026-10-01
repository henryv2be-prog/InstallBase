import "server-only";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/app-url";
import { sendEmail } from "@/lib/email";
import { getCommunityActivity } from "./activity";
import { buildWeeklyReengagementContent } from "./content";
import { buildReengagementEmailPayload, resolveWeeklyEmailFeatured } from "./email-template";
import { calendarDateInTimezone } from "./config";
import { getWeeklyReengagementEmailConfig, isWithinWeeklySendWindow } from "./weekly-config";

export type WeeklyReengagementEmailResult = {
  skipped?: string;
  activity?: {
    posts: number;
    installations: number;
    questions: number;
    answers: number;
    bragPoints: number;
  };
  eligibleUsers: number;
  sent: number;
  skippedUsers: Record<string, number>;
  dryRun: boolean;
};

export type WeeklyReengagementEmailOptions = {
  dryRun?: boolean;
  force?: boolean;
  userId?: string;
  now?: Date;
};

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function intervalCutoff(now: Date, intervalDays: number): Date {
  return new Date(now.getTime() - intervalDays * 24 * 60 * 60 * 1000);
}

export async function sendWeeklyReengagementEmailPreviewToUser(
  userId: string
): Promise<
  | { success: true; preview: true; subject: string; to: string }
  | { error: string }
> {
  if (!isResendConfigured()) {
    return { error: "Email is not configured. Add RESEND_API_KEY and EMAIL_FROM on the server." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, suspended: true },
  });
  if (!user || user.suspended) return { error: "Could not find your account." };

  const config = getWeeklyReengagementEmailConfig();
  const now = new Date();
  const since = new Date(now.getTime() - config.activityWindowHours * 60 * 60 * 1000);
  const activity = await getCommunityActivity(since);
  const content = buildWeeklyReengagementContent(activity, now.getUTCDate());
  const appUrl = getAppUrl();
  const absoluteActionUrl = `${appUrl}${content.url.startsWith("/") ? content.url : `/${content.url}`}`;
  const featured = resolveWeeklyEmailFeatured(activity, appUrl);
  const payload = buildReengagementEmailPayload({
    content,
    activity,
    recipientName: user.name,
    absoluteActionUrl,
    featured,
  });

  const sent = await sendEmail({
    to: user.email,
    subject: `[Preview] ${payload.subject}`,
    html: payload.html,
    text: payload.text,
    listUnsubscribeUrl: `${getAppUrl()}/settings`,
  });

  if (!sent.ok) {
    return { error: sent.error ?? "Could not send preview email." };
  }

  return { success: true, preview: true, subject: payload.subject, to: user.email };
}

export async function runWeeklyReengagementEmail(
  options: WeeklyReengagementEmailOptions = {}
): Promise<WeeklyReengagementEmailResult> {
  const config = getWeeklyReengagementEmailConfig();
  const now = options.now ?? new Date();
  const dryRun = options.dryRun ?? false;
  const skippedUsers: Record<string, number> = {};

  if (!config.enabled && !options.force) {
    return { skipped: "disabled", eligibleUsers: 0, sent: 0, skippedUsers, dryRun };
  }

  if (!options.force && !dryRun && !isWithinWeeklySendWindow(now, config)) {
    return { skipped: "outside_send_window", eligibleUsers: 0, sent: 0, skippedUsers, dryRun };
  }

  if (!isResendConfigured()) {
    return { skipped: "email_not_configured", eligibleUsers: 0, sent: 0, skippedUsers, dryRun };
  }

  const since = new Date(now.getTime() - config.activityWindowHours * 60 * 60 * 1000);
  const activity = await getCommunityActivity(since);
  const content = buildWeeklyReengagementContent(activity, now.getUTCDate());
  const cutoff = intervalCutoff(now, config.intervalDays);
  const settingsUrl = `${getAppUrl()}/settings`;

  const users = await prisma.user.findMany({
    where: {
      suspended: false,
      dailyDigestEnabled: true,
      ...(options.userId ? { id: options.userId } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      lastWeeklyReengagementEmailAt: true,
    },
  });

  let sent = 0;
  const appUrl = getAppUrl();
  const absoluteActionUrl = `${appUrl}${content.url.startsWith("/") ? content.url : `/${content.url}`}`;
  const featured = resolveWeeklyEmailFeatured(activity, appUrl);
  const payloadBase = buildReengagementEmailPayload({
    content,
    activity,
    recipientName: null,
    absoluteActionUrl,
    featured,
  });

  for (const user of users) {
    if (user.lastWeeklyReengagementEmailAt && user.lastWeeklyReengagementEmailAt >= cutoff) {
      skippedUsers.already_sent_this_week = (skippedUsers.already_sent_this_week ?? 0) + 1;
      continue;
    }

    if (dryRun) {
      sent += 1;
      continue;
    }

    const claimed = await prisma.user.updateMany({
      where: {
        id: user.id,
        suspended: false,
        dailyDigestEnabled: true,
        OR: [{ lastWeeklyReengagementEmailAt: null }, { lastWeeklyReengagementEmailAt: { lt: cutoff } }],
      },
      data: { lastWeeklyReengagementEmailAt: now },
    });

    if (claimed.count === 0) {
      skippedUsers.claim_failed = (skippedUsers.claim_failed ?? 0) + 1;
      continue;
    }

    const payload = buildReengagementEmailPayload({
      content,
      activity,
      recipientName: user.name,
      absoluteActionUrl,
      featured,
    });

    const delivered = await sendEmail({
      to: user.email,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      listUnsubscribeUrl: settingsUrl,
    }).catch((error) => {
      console.error("[weekly-reengagement] email failed:", user.id, error);
      return { ok: false as const };
    });

    if (!delivered.ok) {
      skippedUsers.email_delivery_failed = (skippedUsers.email_delivery_failed ?? 0) + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { lastWeeklyReengagementEmailAt: user.lastWeeklyReengagementEmailAt },
      });
    } else {
      sent += 1;
    }

    if (config.delayBetweenEmailsMs > 0) {
      await sleep(config.delayBetweenEmailsMs);
    }
  }

  if (!dryRun && sent > 0) {
    console.info(
      `[weekly-reengagement] Sent ${sent} email(s) on ${calendarDateInTimezone(now, config.timezone)}; subject: ${payloadBase.subject}`
    );
  }

  return {
    activity: {
      posts: activity.posts,
      installations: activity.installations,
      questions: activity.questions,
      answers: activity.answers,
      bragPoints: activity.bragPoints,
    },
    eligibleUsers: users.length,
    sent,
    skippedUsers,
    dryRun,
  };
}
