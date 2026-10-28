/** Radius shown on the public map when the provider hides their exact pin. */
export const APPROXIMATE_MAP_RADIUS_M = 1000;

export type PublicMapLocation = {
  latitude: number;
  longitude: number;
  approximate: boolean;
  radiusMeters: number | null;
};

/** Map coordinates safe to expose on the public provider page. */
export function getPublicMapLocation(
  latitude: number,
  longitude: number,
  hideExactLocation: boolean
): PublicMapLocation {
  if (!hideExactLocation) {
    return {
      latitude,
      longitude,
      approximate: false,
      radiusMeters: null,
    };
  }

  return {
    latitude: Math.round(latitude * 100) / 100,
    longitude: Math.round(longitude * 100) / 100,
    approximate: true,
    radiusMeters: APPROXIMATE_MAP_RADIUS_M,
  };
}
