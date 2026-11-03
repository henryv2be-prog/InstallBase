import { isValidSaCoordinate } from "@/lib/kasifind/geo";

export type GeocodeHit = {
  label: string;
  latitude: number;
  longitude: number;
  placeId: string;
};

export function normalizeGeocodeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function mapNominatimRow(row: {
  display_name?: string;
  lat?: string;
  lon?: string;
  place_id?: number | string;
}): GeocodeHit | null {
  const label = row.display_name?.trim();
  const latitude = Number.parseFloat(String(row.lat ?? ""));
  const longitude = Number.parseFloat(String(row.lon ?? ""));
  if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!isValidSaCoordinate(latitude, longitude)) return null;
  const placeId = row.place_id != null ? String(row.place_id) : `${latitude},${longitude}`;
  return { label, latitude, longitude, placeId };
}
