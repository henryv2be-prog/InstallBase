import path from "path";
import { uploadPublicPath } from "@/lib/shared/uploads";

/** Max display widths used when generating listing image variants at upload time. */
export const LISTING_IMAGE_VARIANT_WIDTHS = [400, 800, 1400] as const;

export type ListingImageVariantWidth = (typeof LISTING_IMAGE_VARIANT_WIDTHS)[number];

/** Disk filename for a WebP variant derived from an uploaded original filename. */
export function listingImageVariantFilename(
  originalFilename: string,
  width: ListingImageVariantWidth
): string {
  const base = path.parse(originalFilename).name;
  return `${base}.w${width}.webp`;
}

/** Public path (`/uploads/...`) for a variant of an uploaded original. */
export function listingImageVariantPublicPath(
  originalFilename: string,
  width: ListingImageVariantWidth
): string {
  return uploadPublicPath(listingImageVariantFilename(originalFilename, width));
}

export function listingImageVariantsEnabled(): boolean {
  const raw = process.env.KASIFIND_IMAGE_VARIANTS?.trim().toLowerCase();
  return raw !== "0" && raw !== "false" && raw !== "off";
}