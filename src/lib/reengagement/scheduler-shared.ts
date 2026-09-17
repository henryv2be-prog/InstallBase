import { calendarDateInTimezone, getReengagementConfig, isWithinSendWindow } from "./config";

type SchedulerRunResult = {
  skipped?: string;
  eligibleUsers: number;
  sent: number;
  skippedUsers: Record<string, number>;
  dryRun: boolean;
};

export function isAutoRunEnabled(): boolean {
  const value = process.env.DAILY_REENGAGEMENT_AUTO_RUN?.trim().toLowerCase();
  if (value === "false" || value === "0" || value === "no") return false;
  if (value === "true" || value === "1" || value === "yes") return true;
  return process.env.NODE_ENV === "production";
}

export function shouldRunScheduledJob(
  now: Date,
  lastRunDate: string | null
): { run: boolean; today: string } {
  const config = getReengagementConfig();
  const today = calendarDateInTimezone(now, config.timezone);
  if (lastRunDate === today) return { run: false, today };
  if (!isWithinSendWindow(now, config)) return { run: false, today };
  return { run: true, today };
}

export function markSchedulerRunComplete(
  result: SchedulerRunResult,
  today: string
): string | null {
  if (result.skipped === "outside_send_window") return null;
  return today;
}
