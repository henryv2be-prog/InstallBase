/** Six decimal places (~0.1 m) — enough for navigation apps. */
export function formatNavCoordinate(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toFixed(6).replace(/\.?0+$/, "") || "0";
}

function coordPair(latitude: number, longitude: number): string {
  return `${formatNavCoordinate(latitude)},${formatNavCoordinate(longitude)}`;
}

/** Google Maps directions — desktop fallback and when OS is unknown. */
export function buildGoogleDirectionsUrl(latitude: number, longitude: number): string {
  const destination = coordPair(latitude, longitude);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** Waze turn-by-turn (works on iOS and Android when the app is installed). */
export function buildWazeDirectionsUrl(latitude: number, longitude: number): string {
  const ll = coordPair(latitude, longitude);
  return `https://waze.com/ul?ll=${encodeURIComponent(ll)}&navigate=yes`;
}

/** Apple Maps turn-by-turn on iOS. */
export function buildAppleDirectionsUrl(
  latitude: number,
  longitude: number,
  label?: string
): string {
  const params = new URLSearchParams({ daddr: coordPair(latitude, longitude) });
  if (label?.trim()) params.set("q", label.trim());
  return `https://maps.apple.com/?${params.toString()}`;
}

/**
 * Android geo intent — opens Maps, Waze, etc.
 * Coordinates must be on the geo: scheme (not geo:0,0) with an unencoded lat,lng query.
 */
export function buildAndroidGeoDirectionsUrl(latitude: number, longitude: number): string {
  const pair = coordPair(latitude, longitude);
  return `geo:${pair}?q=${pair}`;
}

/** Pick a directions link that hands off to native navigation where possible. */
export function pickDirectionsUrl(
  latitude: number,
  longitude: number,
  label?: string,
  userAgent?: string | null
): string {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const ua = userAgent ?? "";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return buildAppleDirectionsUrl(lat, lng, label);
  }
  if (/Android/i.test(ua)) {
    return buildAndroidGeoDirectionsUrl(lat, lng);
  }
  return buildGoogleDirectionsUrl(lat, lng);
}
