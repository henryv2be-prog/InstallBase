import "server-only";
import fs from "fs/promises";
import path from "path";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  listingImageVariantFilenames,
  requiredVariantFilenames,
  uniqueListingUploadPaths,
} from "@/lib/kasifind/listing-image-variant-inventory";
import { uploadPathToFilename } from "@/lib/kasifind/listing-upload-path";
import { generateListingImageVariants } from "@/lib/shared/generate-listing-image-variants";
import { getUploadDir } from "@/lib/shared/uploads";
import { listingImageVariantsEnabled } from "@/lib/kasifind/listing-image-variants";

export type ListingImageVariantHealth = {
  variantsEnabled: boolean;
  uploadDir: string;
  referencedOriginals: number;
  originalsOnDisk: number;
  originalsMissing: number;
  withRequiredVariants: number;
  withoutVariants: number;
};

export type ListingImageBackfillBatchResult = {
  processed: number;
  generatedVariantFiles: number;
  skippedVariantFiles: number;
  errors: number;
  lastPath: string | null;
  hasMore: boolean;
  errorSamples: string[];
};

export async function listListingImageUploadPaths(): Promise<string[]> {
  const kf = getKasiFindPrisma();
  const [photos, listings] = await Promise.all([
    kf.kfProviderPhoto.findMany({ select: { url: true } }),
    kf.kfProviderListing.findMany({ select: { profileImageUrl: true } }),
  ]);
  const raw: string[] = [];
  for (const row of photos) raw.push(row.url);
  for (const row of listings) {
    if (row.profileImageUrl) raw.push(row.profileImageUrl);
  }
  return uniqueListingUploadPaths(raw);
}

async function originalFileExists(uploadDir: string, storedPath: string): Promise<boolean> {
  const filename = uploadPathToFilename(storedPath);
  if (!filename) return false;
  try {
    await fs.access(path.join(uploadDir, filename));
    return true;
  } catch {
    return false;
  }
}

async function hasRequiredVariants(uploadDir: string, storedPath: string): Promise<boolean> {
  const filename = uploadPathToFilename(storedPath);
  if (!filename) return false;
  for (const variant of requiredVariantFilenames(filename)) {
    try {
      await fs.access(path.join(uploadDir, variant));
    } catch {
      return false;
    }
  }
  return true;
}

async function listPathsNeedingVariants(uploadDir: string, paths: string[]): Promise<string[]> {
  const needing: string[] = [];
  for (const storedPath of paths) {
    if (!(await originalFileExists(uploadDir, storedPath))) continue;
    if (await hasRequiredVariants(uploadDir, storedPath)) continue;
    needing.push(storedPath);
  }
  return needing;
}

export async function getListingImageVariantHealth(): Promise<ListingImageVariantHealth> {
  const uploadDir = getUploadDir();
  const paths = await listListingImageUploadPaths();
  let originalsOnDisk = 0;
  let originalsMissing = 0;
  let withRequiredVariants = 0;

  for (const storedPath of paths) {
    const onDisk = await originalFileExists(uploadDir, storedPath);
    if (onDisk) originalsOnDisk += 1;
    else originalsMissing += 1;
    if (onDisk && (await hasRequiredVariants(uploadDir, storedPath))) withRequiredVariants += 1;
  }

  const withoutVariants = Math.max(0, originalsOnDisk - withRequiredVariants);

  return {
    variantsEnabled: listingImageVariantsEnabled(),
    uploadDir,
    referencedOriginals: paths.length,
    originalsOnDisk,
    originalsMissing,
    withRequiredVariants,
    withoutVariants,
  };
}

export async function runListingImageVariantBackfillBatch(input: {
  limit: number;
  afterPath?: string | null;
}): Promise<ListingImageBackfillBatchResult> {
  if (!listingImageVariantsEnabled()) {
    return {
      processed: 0,
      generatedVariantFiles: 0,
      skippedVariantFiles: 0,
      errors: 0,
      lastPath: null,
      hasMore: false,
      errorSamples: ["KASIFIND_IMAGE_VARIANTS is disabled."],
    };
  }

  const limit = Math.min(100, Math.max(1, Math.floor(input.limit)));
  const uploadDir = getUploadDir();
  const all = await listListingImageUploadPaths();
  const queue = await listPathsNeedingVariants(uploadDir, all);
  const start = input.afterPath
    ? Math.max(0, queue.findIndex((p) => p === input.afterPath) + 1)
    : 0;
  const batch = queue.slice(start, start + limit);

  let generatedVariantFiles = 0;
  let skippedVariantFiles = 0;
  let errors = 0;
  const errorSamples: string[] = [];
  let lastPath: string | null = null;

  for (const storedPath of batch) {
    lastPath = storedPath;
    const filename = uploadPathToFilename(storedPath);
    if (!filename) continue;

    const exists = await originalFileExists(uploadDir, storedPath);
    if (!exists) {
      errors += 1;
      if (errorSamples.length < 5) errorSamples.push(`Missing original: ${storedPath}`);
      continue;
    }

    const result = await generateListingImageVariants(uploadDir, filename, { skipExisting: true });
    generatedVariantFiles += result.generated.length;
    skippedVariantFiles += result.skipped.length;
    if (result.errors.length > 0) {
      errors += result.errors.length;
      for (const err of result.errors) {
        if (errorSamples.length < 5) {
          errorSamples.push(`${err.variant}: ${err.message}`);
        }
      }
    }
  }

  const nextIndex = start + batch.length;
  return {
    processed: batch.length,
    generatedVariantFiles,
    skippedVariantFiles,
    errors,
    lastPath,
    hasMore: nextIndex < queue.length,
    errorSamples,
  };
}

/** Best-effort count of variant files on disk for one original (admin diagnostics). */
export async function countVariantFilesOnDisk(storedPath: string): Promise<number> {
  const uploadDir = getUploadDir();
  const filename = uploadPathToFilename(storedPath);
  if (!filename) return 0;
  let count = 0;
  for (const variant of listingImageVariantFilenames(filename)) {
    try {
      await fs.access(path.join(uploadDir, variant));
      count += 1;
    } catch {
      /* missing */
    }
  }
  return count;
}