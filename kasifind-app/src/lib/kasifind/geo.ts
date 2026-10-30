/** Earth radius in kilometres (WGS84 mean). */
export const EARTH_RADIUS_KM = 6371;

export type GeoPoint = { latitude: number; longitude: number };

export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rough bounding box for SQL prefilter (degrees). */
export function boundingBox(center: GeoPoint, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((center.latitude * Math.PI) / 180) || 1);
  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

export const DEFAULT_RADIUS_KM = 5;
export const RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const;

export function parseRadiusKm(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) return DEFAULT_RADIUS_KM;
  return RADIUS_OPTIONS_KM.includes(parsed as (typeof RADIUS_OPTIONS_KM)[number])
    ? parsed
    : Math.min(100, Math.max(1, parsed));
}

export function parseCoordinate(value: string | number | null | undefined): number | null {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function isValidSaCoordinate(lat: number, lng: number): boolean {
  return lat >= -35.5 && lat <= -22 && lng >= 16 && lng <= 33.5;
}

/** Map viewport only — not stored as a listing position until the provider sets a pin. */
export const SA_MAP_DEFAULT_VIEW = {
  latitude: -26.2041,
  longitude: 28.0473,
  zoom: 6,
} as const;
