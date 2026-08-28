/** Brags never expire on a profile. Recency only affects spotlight ranking. */

export const BRAG_HALF_LIFE_DAYS = 7;

export function startOfWeek(date = new Date()) {
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/** 1.0 when posted, ~0.5 after a week, ~0.12 after a month. */
export function recencyMultiplier(createdAt: Date, halfLifeDays = BRAG_HALF_LIFE_DAYS) {
  const ageDays = Math.max(0, (Date.now() - createdAt.getTime()) / 86_400_000);
  return Math.pow(0.5, ageDays / halfLifeDays);
}

export function bragHotScore(bragScore: number, createdAt: Date) {
  return (bragScore + 1) * recencyMultiplier(createdAt);
}
