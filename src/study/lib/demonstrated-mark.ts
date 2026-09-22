/** Importance-weighted average of subtopic mastery percentages for one subject. */
export function computeDemonstratedMarkPct(
  rows: { masteryPct: number; importance: number }[],
): number | null {
  if (rows.length === 0) return null;
  let weighted = 0;
  let weightSum = 0;
  for (const row of rows) {
    const w = row.importance > 0 ? row.importance : 1;
    weighted += row.masteryPct * w;
    weightSum += w;
  }
  if (weightSum <= 0) return null;
  return Math.round((weighted / weightSum) * 10) / 10;
}
