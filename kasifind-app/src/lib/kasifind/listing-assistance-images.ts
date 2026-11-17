import "server-only";
import fs from "fs/promises";
import path from "path";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { publicAssetUrl } from "@/lib/kasifind/public-asset-url";
import { uploadPathToFilename } from "@/lib/kasifind/upload-asset";
import { getUploadDir } from "@/lib/shared/uploads";

export type AssistanceDownloadImage = {
  /** Stable id for single-file download query (`profile` or photo row id). */
  imageKey: string;
  label: string;
  /** Public path or absolute URL stored on the listing. */
  url: string;
  /** Filename inside a zip bundle. */
  zipName: string;
};

export type AssistanceListingImagesBundle = {
  requestId: string;
  listingId: string;
  listingSlug: string;
  displayName: string;
  images: AssistanceDownloadImage[];
};

function slugifyFilenamePart(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "listing";
}

function extensionFromUrl(url: string): string {
  const match = url.match(/\.(jpe?g|png|gif|webp|avif)(?:\?|$)/i);
  return match ? `.${match[1]!.toLowerCase().replace("jpeg", "jpg")}` : ".jpg";
}

export async function getAssistanceListingImagesBundle(
  requestId: string
): Promise<AssistanceListingImagesBundle | null> {
  const kf = getKasiFindPrisma();
  const request = await kf.kfListingAssistanceRequest.findUnique({
    where: { id: requestId },
    include: {
      listing: {
        select: {
          id: true,
          displayName: true,
          profileImageUrl: true,
          photos: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, sortOrder: true } },
        },
      },
    },
  });
  if (!request) return null;

  const base = slugifyFilenamePart(request.listing.displayName);
  const images: AssistanceDownloadImage[] = [];

  if (request.listing.profileImageUrl) {
    const ext = extensionFromUrl(request.listing.profileImageUrl);
    images.push({
      imageKey: "profile",
      label: "Profile photo",
      url: request.listing.profileImageUrl,
      zipName: `${base}-profile${ext}`,
    });
  }

  request.listing.photos.forEach((photo, index) => {
    const ext = extensionFromUrl(photo.url);
    const order = String(photo.sortOrder ?? index + 1).padStart(2, "0");
    images.push({
      imageKey: photo.id,
      label: `Work photo ${index + 1}`,
      url: photo.url,
      zipName: `${base}-work-${order}${ext}`,
    });
  });

  return {
    requestId: request.id,
    listingId: request.listing.id,
    listingSlug: base,
    displayName: request.listing.displayName,
    images,
  };
}

export async function readListingImageBytes(
  url: string,
  siteOrigin?: string | null
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const filename = uploadPathToFilename(url);
  if (filename) {
    try {
      const filePath = path.join(getUploadDir(), filename);
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType =
        ext === ".png"
          ? "image/png"
          : ext === ".gif"
            ? "image/gif"
            : ext === ".webp"
              ? "image/webp"
              : ext === ".avif"
                ? "image/avif"
                : "image/jpeg";
      return { buffer, contentType };
    } catch {
      return null;
    }
  }

  const absolute = url.startsWith("http") ? url : publicAssetUrl(url, siteOrigin);
  if (!absolute.startsWith("http")) return null;

  try {
    const res = await fetch(absolute);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, contentType };
  } catch {
    return null;
  }
}