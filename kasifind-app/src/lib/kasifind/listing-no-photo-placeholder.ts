/** Branded placeholder when a listing has no work or profile photos yet. */
export const LISTING_NO_PHOTO_PLACEHOLDER_PATH = "/images/listing-no-photo-yet.jpg";

export function listingNoPhotoAlt(displayName: string): string {
  const name = displayName.trim() || "This provider";
  return `${name} — no photos yet. KasiFind placeholder artwork.`;
}