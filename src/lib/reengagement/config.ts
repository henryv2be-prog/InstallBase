export type ReengagementConfig = {
  /** Hour (0–23) when the daily job should send, in `timezone`. */
  sendHour: number;
  /** Minute (0–59) for the send window. */
  sendMinute: number;
  /** IANA timezone for calendar-day boundaries and send window. */
  timezone: string;
  /** Rolling window for counting community activity (hours). */
  activityWindowHours: number;
  /** Minimum total activity count before any notification is sent. */
  minActivityCount: number;
};

const DEFAULT_SEND_HOUR = 9;
const DEFAULT_SEND_MINUTE = 0;
const DEFAULT_TIMEZONE = "UTC";
const DEFAULT_ACTIVITY_WINDOW_HOURS = 24;
const DEFAULT_MIN_ACTIVITY_COUNT = 1;

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

export function getReengagementConfig(): ReengagementConfig {
  return {
    sendHour: parseHour(process.env.DAILY_REENGAGEMENT_HOUR, DEFAULT_SEND_HOUR),
    sendMinute: parseMinute(process.env.DAILY_REENGAGEMENT_MINUTE, DEFAULT_SEND_MINUTE),
    timezone: process.env.DAILY_REENGAGEMENT_TIMEZONE?.trim() || DEFAULT_TIMEZONE,
    activityWindowHours: parsePositiveInt(
      process.env.DAILY_REENGAGEMENT_ACTIVITY_WINDOW_HOURS,
      DEFAULT_ACTIVITY_WINDOW_HOURS
    ),
    minActivityCount: parsePositiveInt(
      process.env.DAILY_REENGAGEMENT_MIN_ACTIVITY,
      DEFAULT_MIN_ACTIVITY_COUNT
    ),
  };
}

export function getCronSecret(): string | null {
  const secret = process.env.CRON_SECRET?.trim();
  return secret || null;
}

/** Calendar date string (YYYY-MM-DD) for `date` in the given IANA timezone. */
export function calendarDateInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** UTC instant for the start of the calendar day containing `date` in `timeZone`. */
export function startOfCalendarDay(date: Date, timeZone: string): Date {
  const ymd = calendarDateInTimezone(date, timeZone);
  const [year, month, day] = ymd.split("-").map(Number);

  for (let utcHour = 0; utcHour < 48; utcHour++) {
    const candidate = new Date(Date.UTC(year, month - 1, day, utcHour % 24, 0, 0, 0));
    if (utcHour >= 24) candidate.setUTCDate(candidate.getUTCDate() + 1);

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(candidate);

    const part = (type: string) => parts.find((p) => p.type === type)?.value;
    if (part("year") === String(year) && part("month") === String(month).padStart(2, "0") && part("day") === String(day).padStart(2, "0") && part("hour") === "00") {
      return candidate;
    }
  }

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export function isWithinSendWindow(now: Date, config: ReengagementConfig): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: config.timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const hour = Number.parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = Number.parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);

  return hour === config.sendHour && minute >= config.sendMinute && minute < config.sendMinute + 15;
}
