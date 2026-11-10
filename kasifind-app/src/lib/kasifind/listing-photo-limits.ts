export const MAX_LISTING_WORK_PHOTOS = 12;

/** Files to upload now, respecting the listing work-photo cap and in-flight adds. */
export function planWorkPhotoUploads(
  files: readonly File[],
  existingCount: number,
  inFlightCount: number
): { accepted: File[]; skippedNonImage: number; skippedOverLimit: number } {
  const remaining = Math.max(0, MAX_LISTING_WORK_PHOTOS - existingCount - inFlightCount);
  const images = files.filter(
    (f) => f.type.startsWith("image/") || /\.(jpe?g|png|gif|webp)$/i.test(f.name ?? "")
  );
  const skippedNonImage = files.length - images.length;
  const accepted = images.slice(0, remaining);
  const skippedOverLimit = Math.max(0, images.length - accepted.length);
  return { accepted, skippedNonImage, skippedOverLimit };
}
