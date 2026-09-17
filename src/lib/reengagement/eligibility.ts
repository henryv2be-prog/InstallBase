import type { ReengagementConfig } from "./config";
import { startOfCalendarDay } from "./config";

export function wasActiveToday(
  lastSeenAt: Date | null | undefined,
  now: Date,
  timeZone: string
): boolean {
  if (!lastSeenAt) return false;
  const dayStart = startOfCalendarDay(now, timeZone);
  return lastSeenAt >= dayStart;
}

export function alreadySentToday(
  lastDailyReengagementAt: Date | null | undefined,
  now: Date,
  timeZone: string
): boolean {
  if (!lastDailyReengagementAt) return false;
  const dayStart = startOfCalendarDay(now, timeZone);
  return lastDailyReengagementAt >= dayStart;
}

export type EligibleUser = {
  id: string;
  lastSeenAt: Date | null;
  lastDailyReengagementAt: Date | null;
};

export function isEligibleForReengagement(
  user: EligibleUser,
  now: Date,
  config: ReengagementConfig
): { eligible: boolean; reason?: string } {
  if (!user.id) return { eligible: false, reason: "missing_user" };

  if (alreadySentToday(user.lastDailyReengagementAt, now, config.timezone)) {
    return { eligible: false, reason: "already_sent_today" };
  }

  if (wasActiveToday(user.lastSeenAt, now, config.timezone)) {
    return { eligible: false, reason: "active_today" };
  }

  return { eligible: true };
}
