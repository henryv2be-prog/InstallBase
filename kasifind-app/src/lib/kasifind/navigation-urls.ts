/** Google Maps directions — desktop fallback and when OS is unknown. */
export function buildGoogleDirectionsUrl(latitude: number, longitude: number): string {
  const destination = `${latitude},${longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** Apple Maps turn-by-turn on iOS. */
export function buildAppleDirectionsUrl(
  latitude: number,
  longitude: number,
  label?: string
): string {
  const params = new URLSearchParams({ daddr: `${latitude},${longitude}` });
  if (label?.trim()) params.set("q", label.trim());
  return `https://maps.apple.com/?${params.toString()}`;
}

/** Android geo intent — opens the user’s installed maps / navigation apps. */
export function buildAndroidGeoDirectionsUrl(
  latitude: number,
  longitude: number,
  label?: string
): string {
  const q = label?.trim()
    ? `${latitude},${longitude}(${label.trim()})`
    : `${latitude},${longitude}`;
  return `geo:0,0?q=${encodeURIComponent(q)}`;
}

/** Pick a directions link that hands off to native navigation where possible. */
export function pickDirectionsUrl(
  latitude: number,
  longitude: number,
  label?: string,
  userAgent?: string | null
): string {
  const ua = userAgent ?? "";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return buildAppleDirectionsUrl(latitude, longitude, label);
  }
  if (/Android/i.test(ua)) {
    return buildAndroidGeoDirectionsUrl(latitude, longitude, label);
  }
  return buildGoogleDirectionsUrl(latitude, longitude);
}
