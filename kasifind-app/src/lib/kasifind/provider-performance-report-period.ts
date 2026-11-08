import { formatKfDate, kfDateKeyInSast, KF_DISPLAY_TIME_ZONE } from "@/lib/kasifind/format-datetime";

export type ProviderReportPeriodPreset = "7d" | "30d" | "all" | "custom";

export type ProviderReportPeriodRange = {
  preset: ProviderReportPeriodPreset;
  /** Inclusive lower bound in UTC; omitted for all-time. */
  startAt: Date | null;
  /** Upper bound (now at query time). */
  endAt: Date;
  label: string;
};

function parseSastDateKey(dateKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const parsed = new Date(`${dateKey}T00:00:00+02:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function endOfSastDateKey(dateKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const parsed = new Date(`${dateKey}T23:59:59.999+02:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function shiftSastDateKey(dateKey: string, dayDelta: number): string {
  const anchor = new Date(`${dateKey}T12:00:00+02:00`);
  anchor.setUTCDate(anchor.getUTCDate() + dayDelta);
  return kfDateKeyInSast(anchor);
}

export function resolveProviderReportPeriod(input: {
  preset: ProviderReportPeriodPreset;
  customStart?: string | null;
  customEnd?: string | null;
  now?: Date;
}): ProviderReportPeriodRange | { error: string } {
  const now = input.now ?? new Date();
  const todayKey = kfDateKeyInSast(now);

  if (input.preset === "7d" || input.preset === "30d") {
    const days = input.preset === "7d" ? 7 : 30;
    const startKey = shiftSastDateKey(todayKey, -(days - 1));
    const startAt = parseSastDateKey(startKey);
    if (!startAt) return { error: "invalid_period" };
    return {
      preset: input.preset,
      startAt,
      endAt: now,
      label: `Last ${days} days (${formatKfDate(startAt)} – ${formatKfDate(now)})`,
    };
  }

  if (input.preset === "all") {
    return {
      preset: "all",
      startAt: null,
      endAt: now,
      label: `All time (through ${formatKfDate(now)})`,
    };
  }

  const startKey = input.customStart?.trim() ?? "";
  const endKey = (input.customEnd?.trim() || todayKey).trim();
  const startAt = parseSastDateKey(startKey);
  const endAt = endOfSastDateKey(endKey);
  if (!startAt || !endAt) return { error: "invalid_custom_range" };
  if (startAt.getTime() > endAt.getTime()) return { error: "range_start_after_end" };

  return {
    preset: "custom",
    startAt,
    endAt: endAt.getTime() > now.getTime() ? now : endAt,
    label: `${formatKfDate(startAt)} – ${formatKfDate(endAt.getTime() > now.getTime() ? now : endAt)}`,
  };
}

/** Prisma filter for analytics `createdAt` within a resolved period. */
export function analyticsCreatedAtFilter(range: ProviderReportPeriodRange): { gte?: Date; lte: Date } {
  if (range.startAt) {
    return { gte: range.startAt, lte: range.endAt };
  }
  return { lte: range.endAt };
}

export const PROVIDER_REPORT_TIME_ZONE_LABEL = "South Africa (SAST)";

export function providerReportGeneratedStamp(now = new Date()): string {
  return now.toLocaleString("en-ZA", {
    timeZone: KF_DISPLAY_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}
