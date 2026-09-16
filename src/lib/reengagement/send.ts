import "server-only";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { isPushConfigured } from "@/lib/vapid";
import { getCommunityActivity, hasMeaningfulActivity } from "./activity";
import { buildReengagementContent } from "./content";
import { getReengagementConfig, isWithinSendWindow, startOfCalendarDay } from "./config";
import { isEligibleForReengagement } from "./eligibility";

export type ReengagementRunResult = {
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

export type ReengagementRunOptions = {
  dryRun?: boolean;
  force?: boolean;
  userId?: string;
  now?: Date;
};

export async function runDailyReengagement(
  options: ReengagementRunOptions = {}
): Promise<ReengagementRunResult> {
  const config = getReengagementConfig();
  const now = options.now ?? new Date();
  const dryRun = options.dryRun ?? false;
  const skippedUsers: Record<string, number> = {};

  if (!options.force && !dryRun && !isWithinSendWindow(now, config)) {
    return {
      skipped: "outside_send_window",
      eligibleUsers: 0,
      sent: 0,
      skippedUsers,
      dryRun,
    };
  }

  if (!isPushConfigured()) {
    return {
      skipped: "push_not_configured",
      eligibleUsers: 0,
      sent: 0,
      skippedUsers,
      dryRun,
    };
  }

  const since = new Date(now.getTime() - config.activityWindowHours * 60 * 60 * 1000);
  const activity = await getCommunityActivity(since);

  if (!hasMeaningfulActivity(activity, config.minActivityCount)) {
    return {
      skipped: "no_meaningful_activity",
      activity: {
        posts: activity.posts,
        installations: activity.installations,
        questions: activity.questions,
        answers: activity.answers,
        bragPoints: activity.bragPoints,
      },
      eligibleUsers: 0,
      sent: 0,
      skippedUsers,
      dryRun,
    };
  }

  const content = buildReengagementContent(activity, now.getUTCDate());
  if (!content) {
    return {
      skipped: "no_content",
      activity: {
        posts: activity.posts,
        installations: activity.installations,
        questions: activity.questions,
        answers: activity.answers,
        bragPoints: activity.bragPoints,
      },
      eligibleUsers: 0,
      sent: 0,
      skippedUsers,
      dryRun,
    };
  }

  const dayStart = startOfCalendarDay(now, config.timezone);

  const users = await prisma.user.findMany({
    where: {
      suspended: false,
      dailyDigestEnabled: true,
      pushSubscriptions: { some: {} },
      ...(options.userId ? { id: options.userId } : {}),
    },
    select: {
      id: true,
      lastSeenAt: true,
      lastDailyReengagementAt: true,
    },
  });

  let sent = 0;

  for (const user of users) {
    const eligibility = isEligibleForReengagement(user, now, config);
    if (!eligibility.eligible) {
      const reason = eligibility.reason ?? "ineligible";
      skippedUsers[reason] = (skippedUsers[reason] ?? 0) + 1;
      continue;
    }

    if (dryRun) {
      sent += 1;
      continue;
    }

    const claimed = await prisma.user.updateMany({
      where: {
        id: user.id,
        dailyDigestEnabled: true,
        suspended: false,
        OR: [{ lastDailyReengagementAt: null }, { lastDailyReengagementAt: { lt: dayStart } }],
      },
      data: { lastDailyReengagementAt: now },
    });

    if (claimed.count === 0) {
      skippedUsers.already_sent_today = (skippedUsers.already_sent_today ?? 0) + 1;
      continue;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: "DAILY_REENGAGEMENT",
        message: content.message,
        link: content.url,
      },
    });

    const linkWithId = content.url.includes("?")
      ? `${content.url}&nid=${notification.id}`
      : `${content.url}?nid=${notification.id}`;

    const delivered = await sendPushToUser(user.id, {
      title: content.title,
      body: content.body,
      url: linkWithId,
      urgency: "normal",
    }).catch((error) => {
      console.error("Daily re-engagement push failed:", user.id, error);
      return 0;
    });

    if (delivered === 0) {
      skippedUsers.push_delivery_failed = (skippedUsers.push_delivery_failed ?? 0) + 1;
    } else {
      sent += 1;
    }
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
