import { uploadPathToFilename } from "@/lib/kasifind/listing-upload-path";
import {
  LISTING_IMAGE_VARIANT_WIDTHS,
  listingImageVariantPublicPath,
  type ListingImageVariantWidth,
} from "@/lib/kasifind/listing-image-variants";
import { resolveListingImageSrc } from "@/lib/kasifind/resolve-listing-image-src";

export type ListingImageWidthIntent = "card" | "avatar" | "gallery" | "hero" | "full";

const VARIANT_PATH_RE = /\.w\d+\.webp$/i;

export function isListingImageVariantPath(path: string): boolean {
  return VARIANT_PATH_RE.test((path.split("?")[0] ?? "").toLowerCase());
}

/** True when `src` is a local listing upload eligible for phase-1 WebP variants. */
export function canUseListingImageVariants(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed.startsWith("/uploads/")) return false;
  if (isListingImageVariantPath(trimmed)) return false;
  return uploadPathToFilename(trimmed) != null;
}

const INTENT_DEFAULT_WIDTH: Record<ListingImageWidthIntent, ListingImageVariantWidth> = {
  avatar: 400,
  card: 400,
  gallery: 800,
  hero: 800,
  full: 1400,
};

const INTENT_SIZES: Record<ListingImageWidthIntent, string> = {
  avatar: "56px",
  card: "(max-width: 480px) 100vw, 420px",
  gallery: "(max-width: 640px) 45vw, 280px",
  hero: "(max-width: 768px) 100vw, 800px",
  full: "100vw",
};

export type ListingImageDelivery = {
  src: string;
  srcSet?: string;
  sizes?: string;
  /** Stored listing path (not a variant) for fallback to the original file. */
  canonicalOriginal: string;
};

export function buildListingImageDelivery(
  originalSrc: string,
  intent: ListingImageWidthIntent,
  origin?: string | null
): ListingImageDelivery {
  const trimmed = originalSrc.trim();
  const resolved = resolveListingImageSrc(trimmed, origin);
  if (!canUseListingImageVariants(trimmed)) {
    return { src: resolved, canonicalOriginal: trimmed };
  }

  const filename = uploadPathToFilename(trimmed)!;
  const srcSet = LISTING_IMAGE_VARIANT_WIDTHS.map((w) => {
    const variantPath = listingImageVariantPublicPath(filename, w);
    return `${resolveListingImageSrc(variantPath, origin)} ${w}w`;
  }).join(", ");

  const defaultW = INTENT_DEFAULT_WIDTH[intent];
  const defaultPath = listingImageVariantPublicPath(filename, defaultW);

  return {
    src: resolveListingImageSrc(defaultPath, origin),
    srcSet,
    sizes: INTENT_SIZES[intent],
    canonicalOriginal: trimmed,
  };
}

export function listingImageOriginalDelivery(
  canonicalOriginal: string,
  origin?: string | null
): Pick<ListingImageDelivery, "src" | "canonicalOriginal"> {
  const trimmed = canonicalOriginal.trim();
  return {
    src: resolveListingImageSrc(trimmed, origin),
    canonicalOriginal: trimmed,
  };
}