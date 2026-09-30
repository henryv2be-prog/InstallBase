import { getReengagementConfig } from "./config";

export type WeeklyReengagementEmailConfig = {
  enabled: boolean;
  /** 1 = Monday … 7 = Sunday (ISO weekday in configured timezone). */
  sendWeekday: number;
  sendHour: number;
  sendMinute: number;
  timezone: string;
  activityWindowHours: number;
  /** Minimum days since last weekly email to the same user. */
  intervalDays: number;
  delayBetweenEmailsMs: number;
};

const DEFAULT_WEEKDAY = 1;
const DEFAULT_SEND_HOUR = 10;
const DEFAULT_SEND_MINUTE = 0;
const DEFAULT_ACTIVITY_HOURS = 168;
const DEFAULT_INTERVAL_DAYS = 7;
const DEFAULT_DELAY_MS = 200;

function parseHour(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 23) return fallback;
  return parsed;
}

function parseMinute(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 59) return fallback;
  return parsed;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

function parseWeekday(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const lower = value.trim().toLowerCase();
  const names: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };
  if (lower in names) return names[lower]!;
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 7) return parsed;
  return fallback;
}

function isEnabledFlag(): boolean {
  const value = process.env.WEEKLY_REENGAGEMENT_EMAIL_ENABLED?.trim().toLowerCase();
  if (value === "false" || value === "0" || value === "no") return false;
  if (value === "true" || value === "1" || value === "yes") return true;
  return process.env.NODE_ENV === "production";
}

export function getWeeklyReengagementEmailConfig(): WeeklyReengagementEmailConfig {
  const daily = getReengagementConfig();
  return {
    enabled: isEnabledFlag(),
    sendWeekday: parseWeekday(process.env.WEEKLY_REENGAGEMENT_DAY, DEFAULT_WEEKDAY),
    sendHour: parseHour(process.env.WEEKLY_REENGAGEMENT_HOUR, DEFAULT_SEND_HOUR),
    sendMinute: parseMinute(process.env.WEEKLY_REENGAGEMENT_MINUTE, DEFAULT_SEND_MINUTE),
    timezone:
      process.env.WEEKLY_REENGAGEMENT_TIMEZONE?.trim() ||
      process.env.DAILY_REENGAGEMENT_TIMEZONE?.trim() ||
      daily.timezone,
    activityWindowHours: parsePositiveInt(
      process.env.WEEKLY_REENGAGEMENT_ACTIVITY_WINDOW_HOURS,
      DEFAULT_ACTIVITY_HOURS
    ),
    intervalDays: parsePositiveInt(process.env.WEEKLY_REENGAGEMENT_INTERVAL_DAYS, DEFAULT_INTERVAL_DAYS),
    delayBetweenEmailsMs: parsePositiveInt(
      process.env.WEEKLY_REENGAGEMENT_EMAIL_DELAY_MS,
      DEFAULT_DELAY_MS
    ),
  };
}

export function isoWeekdayInTimezone(now: Date, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[weekday] ?? 1;
}

export function isWithinWeeklySendWindow(now: Date, config: WeeklyReengagementEmailConfig): boolean {
  if (isoWeekdayInTimezone(now, config.timezone) !== config.sendWeekday) return false;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: config.timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const hour = Number.parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = Number.parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);

  return hour === config.sendHour && minute >= config.sendMinute && minute < config.sendMinute + 20;
}
