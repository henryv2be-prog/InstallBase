/** Grid step in degrees — coarser when zoomed out. */
export function gridStepForZoom(zoom: number): number {
  const z = Math.round(zoom);
  if (z <= 6) return 1.2;
  if (z <= 7) return 0.6;
  if (z <= 8) return 0.35;
  if (z <= 9) return 0.2;
  if (z <= 10) return 0.12;
  if (z <= 11) return 0.07;
  return 0.04;
}

export function searchRadiusKmForGridStep(gridStep: number): number {
  const km = gridStep * 111 * 0.85;
  return Math.min(50, Math.max(8, Math.round(km)));
}
