import fs from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/shared/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".pjpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeName = path.basename(filename);

  if (!safeName || safeName !== filename) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(getUploadDir(), safeName);

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();

    const isSizedWebpVariant = /\.w\d+\.webp$/i.test(safeName);
    const cacheControl = isSizedWebpVariant
      ? "public, max-age=31536000, immutable"
      : "public, max-age=86400, stale-while-revalidate=604800";

    return new Response(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
