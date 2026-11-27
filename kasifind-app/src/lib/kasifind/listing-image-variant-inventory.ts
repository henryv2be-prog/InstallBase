import { isListingImageVariantPath } from "@/lib/kasifind/listing-image-delivery";
import {
  LISTING_IMAGE_VARIANT_WIDTHS,
  listingImageVariantFilename,
  type ListingImageVariantWidth,
} from "@/lib/kasifind/listing-image-variants";
import { normalizeListingImageStoredPath, uploadPathToFilename } from "@/lib/kasifind/listing-upload-path";

/** Canonical `/uploads/...` paths referenced by listing photos (originals only). */
export function uniqueListingUploadPaths(paths: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of paths) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const stored = normalizeListingImageStoredPath(trimmed);
    if (!stored.startsWith("/uploads/")) continue;
    if (isListingImageVariantPath(stored)) continue;
    if (!uploadPathToFilename(stored)) continue;
    if (seen.has(stored)) continue;
    seen.add(stored);
    out.push(stored);
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

export function listingImageVariantFilenames(originalFilename: string): string[] {
  return LISTING_IMAGE_VARIANT_WIDTHS.map((w) => listingImageVariantFilename(originalFilename, w));
}

export function minimumVariantFilename(originalFilename: string): string {
  return listingImageVariantFilename(originalFilename, LISTING_IMAGE_VARIANT_WIDTHS[0] as ListingImageVariantWidth);
}

/** Variants that must exist on disk (advertised in card/gallery srcset). */
export const REQUIRED_LISTING_VARIANT_WIDTHS: readonly ListingImageVariantWidth[] = [400, 800];

export function requiredVariantFilenames(originalFilename: string): string[] {
  return REQUIRED_LISTING_VARIANT_WIDTHS.map((w) => listingImageVariantFilename(originalFilename, w));
}