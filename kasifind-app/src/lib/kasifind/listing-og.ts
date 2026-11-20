import { collectListingCardPhotoUrls } from "@/lib/kasifind/listing-card-photos";

export const KASIFIND_OG_FALLBACK_IMAGE = "/icons/icon-512.png";

/** Same priority as search cards: gallery first, profile fallback, then app icon. */
export function pickListingOpenGraphImagePath(input: {
  photoUrls: readonly string[];
  profileImageUrl: string | null;
}): string {
  return collectListingCardPhotoUrls(input)[0] ?? KASIFIND_OG_FALLBACK_IMAGE;
}

export function truncateForMeta(text: string, max = 160): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

export function buildListingOgDescription(description: string, locationLabel: string): string {
  const body = truncateForMeta(description, 140);
  const place = locationLabel.trim();
  if (!place) return body;
  return `${body} · ${place}`;
}
