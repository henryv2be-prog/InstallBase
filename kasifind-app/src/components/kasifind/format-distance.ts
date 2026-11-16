export function hasValidDistanceKm(km: number): boolean {
  return Number.isFinite(km) && km >= 0;
}

export function formatDistanceKmClient(km: number): string {
  if (!hasValidDistanceKm(km)) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}
