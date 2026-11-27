import {
  normalizeListingImageStoredPath,
  uploadPathToFilename,
} from "@/lib/kasifind/listing-upload-path";
import {
  LISTING_IMAGE_VARIANT_WIDTHS,
  listingImageVariantPublicPath,
  type ListingImageVariantWidth,
} from "@/lib/kasifind/listing-image-variants";
import { resolveListingImageSrc } from "@/lib/kasifind/resolve-listing-image-src";

export type ListingImageWidthIntent = "card" | "avatar" | "thumb" | "gallery" | "hero" | "full";

const LIGHTBOX_VARIANT_WIDTHS: readonly ListingImageVariantWidth[] = [800, 1400];
const THUMB_VARIANT_WIDTHS: readonly ListingImageVariantWidth[] = [400, 800];

const VARIANT_PATH_RE = /\.w\d+\.webp$/i;

export function isListingImageVariantPath(path: string): boolean {
  return VARIANT_PATH_RE.test((path.split("?")[0] ?? "").toLowerCase());
}

/** True when `src` is a local listing upload eligible for phase-1 WebP variants. */
export function canUseListingImageVariants(src: string): boolean {
  const stored = normalizeListingImageStoredPath(src.trim());
  if (!stored.startsWith("/uploads/")) return false;
  if (isListingImageVariantPath(stored)) return false;
  return uploadPathToFilename(stored) != null;
}

const INTENT_DEFAULT_WIDTH: Record<ListingImageWidthIntent, ListingImageVariantWidth> = {
  avatar: 400,
  card: 400,
  thumb: 400,
  gallery: 800,
  hero: 800,
  full: 1400,
};

const INTENT_SIZES: Record<ListingImageWidthIntent, string> = {
  avatar: "56px",
  card: "(max-width: 480px) 100vw, 420px",
  thumb: "(max-width: 640px) 33vw, 160px",
  gallery: "(max-width: 640px) 45vw, 280px",
  hero: "(max-width: 768px) 100vw, 800px",
  full: "(max-width: 1024px) 100vw, 1400px",
};

function variantWidthsForIntent(intent: ListingImageWidthIntent): readonly ListingImageVariantWidth[] {
  if (intent === "full") return LIGHTBOX_VARIANT_WIDTHS;
  if (intent === "thumb") return THUMB_VARIANT_WIDTHS;
  return LISTING_IMAGE_VARIANT_WIDTHS;
}

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
  const storedPath = normalizeListingImageStoredPath(trimmed);
  const resolved = resolveListingImageSrc(trimmed, origin);
  if (!canUseListingImageVariants(trimmed)) {
    return { src: resolved, canonicalOriginal: storedPath };
  }

  const filename = uploadPathToFilename(storedPath)!;
  const widths = variantWidthsForIntent(intent);
  const srcSet = widths
    .map((w) => {
      const variantPath = listingImageVariantPublicPath(filename, w);
      return `${resolveListingImageSrc(variantPath, origin)} ${w}w`;
    })
    .join(", ");

  const defaultW = INTENT_DEFAULT_WIDTH[intent];
  const defaultPath = listingImageVariantPublicPath(filename, defaultW);

  return {
    src: resolveListingImageSrc(defaultPath, origin),
    srcSet,
    sizes: INTENT_SIZES[intent],
    canonicalOriginal: storedPath,
  };
}

export function listingImageOriginalDelivery(
  canonicalOriginal: string,
  origin?: string | null
): Pick<ListingImageDelivery, "src" | "canonicalOriginal"> {
  const storedPath = normalizeListingImageStoredPath(canonicalOriginal.trim());
  return {
    src: resolveListingImageSrc(storedPath, origin),
    canonicalOriginal: storedPath,
  };
}

/** Profile hero is the listing page LCP when present (stored `/uploads/...` path). */
export function pickListingPageLcpImagePath(profileImageUrl: string | null | undefined): string | null {
  const profile = profileImageUrl?.trim();
  if (!profile) return null;
  const stored = normalizeListingImageStoredPath(profile);
  return stored.startsWith("/uploads/") ? stored : null;
}