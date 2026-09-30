import { calendarDateInTimezone } from "./config";
import { getWeeklyReengagementEmailConfig, isWithinWeeklySendWindow } from "./weekly-config";

export function shouldRunWeeklyScheduledJob(
  now: Date,
  lastRunDate: string | null
): { run: boolean; today: string } {
  const config = getWeeklyReengagementEmailConfig();
  const today = calendarDateInTimezone(now, config.timezone);
  if (!config.enabled) return { run: false, today };
  if (lastRunDate === today) return { run: false, today };
  if (!isWithinWeeklySendWindow(now, config)) return { run: false, today };
  return { run: true, today };
}

export function markWeeklySchedulerRunComplete(
  result: { skipped?: string; sent: number },
  today: string
): string | null {
  if (result.skipped === "outside_send_window" || result.skipped === "disabled") return null;
  if (result.sent === 0 && result.skipped === "email_not_configured") return null;
  return today;
}
