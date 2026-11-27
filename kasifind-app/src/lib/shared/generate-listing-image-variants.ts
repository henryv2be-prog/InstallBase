import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import {
  LISTING_IMAGE_VARIANT_WIDTHS,
  listingImageVariantFilename,
} from "@/lib/kasifind/listing-image-variants";

const WEBP_QUALITY = 82;

export type GenerateListingImageVariantsResult = {
  generated: string[];
  skipped: string[];
  errors: { variant: string; message: string }[];
};

/**
 * Create WebP derivatives beside the original file in the upload directory.
 * Safe to call on failure paths: does not remove the original.
 */
export async function generateListingImageVariants(
  uploadDir: string,
  originalFilename: string
): Promise<GenerateListingImageVariantsResult> {
  const sourcePath = path.join(uploadDir, originalFilename);
  const generated: string[] = [];
  const skipped: string[] = [];
  const errors: { variant: string; message: string }[] = [];

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(sourcePath).metadata();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read image";
    errors.push({ variant: originalFilename, message });
    return { generated, skipped, errors };
  }

  const naturalWidth = metadata.width ?? 0;

  for (const width of LISTING_IMAGE_VARIANT_WIDTHS) {
    const variantName = listingImageVariantFilename(originalFilename, width);
    const destPath = path.join(uploadDir, variantName);

    const smallest = LISTING_IMAGE_VARIANT_WIDTHS[0];
    if (naturalWidth > 0 && naturalWidth < width && width > smallest) {
      skipped.push(variantName);
      continue;
    }

    try {
      await sharp(sourcePath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toFile(destPath);
      generated.push(variantName);
    } catch (err) {
      await fs.unlink(destPath).catch(() => undefined);
      const message = err instanceof Error ? err.message : "Variant encode failed";
      errors.push({ variant: variantName, message });
    }
  }

  return { generated, skipped, errors };
}