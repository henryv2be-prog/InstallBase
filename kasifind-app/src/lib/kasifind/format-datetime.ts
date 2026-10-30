/** Display and bucket timestamps in South African local time (SAST / Africa/Johannesburg). */

export const KF_DISPLAY_TIME_ZONE = "Africa/Johannesburg";
export const KF_DISPLAY_LOCALE = "en-ZA";

export function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Calendar date key (YYYY-MM-DD) in SAST — use for analytics day buckets. */
export function kfDateKeyInSast(value: Date | string | number): string {
  return toDate(value).toLocaleDateString("en-CA", { timeZone: KF_DISPLAY_TIME_ZONE });
}

export function formatKfDateTime(value: Date | string | number): string {
  return toDate(value).toLocaleString(KF_DISPLAY_LOCALE, {
    timeZone: KF_DISPLAY_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatKfDate(value: Date | string | number): string {
  return toDate(value).toLocaleDateString(KF_DISPLAY_LOCALE, {
    timeZone: KF_DISPLAY_TIME_ZONE,
    dateStyle: "medium",
  });
}

/** Short label for charts from a YYYY-MM-DD bucket key (SAST calendar day). */
export function formatKfChartDay(dateKey: string): string {
  const d = toDate(`${dateKey}T12:00:00.000Z`);
  return d.toLocaleDateString(KF_DISPLAY_LOCALE, {
    timeZone: KF_DISPLAY_TIME_ZONE,
    month: "short",
    day: "numeric",
  });
}
