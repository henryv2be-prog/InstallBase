import "server-only";
import fs from "fs/promises";
import path from "path";
import { getUploadDir, uploadPublicPath } from "@/lib/uploads";
import { formatUploadLimit, maxBytesForUpload } from "@/lib/upload-limits";

const ALLOWED_TYPES = /^(image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|quicktime))$/i;

export async function saveUploadedFile(
  file: File
): Promise<{ url: string; type: "video" | "image" } | { error: string }> {
  if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name || "")) {
    return { error: "This iPhone photo needs to be converted. Add it again from the composer." };
  }
  if (!ALLOWED_TYPES.test(file.type)) {
    return { error: "Please upload a photo (JPG, PNG, WebP) or video (MP4, WebM)" };
  }

  const limit = maxBytesForUpload(file);
  if (file.size > limit) {
    const kind = file.type.startsWith("video/") ? "Video" : "Photo";
    return { error: `${kind} must be ${formatUploadLimit(limit)} or smaller` };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "") || "upload";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  const dest = path.join(uploadDir, filename);

  try {
    await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  } catch {
    await fs.unlink(dest).catch(() => undefined);
    return { error: "Failed to save upload" };
  }

  const isVideo = file.type.startsWith("video/");
  return { url: uploadPublicPath(filename), type: isVideo ? "video" : "image" };
}
