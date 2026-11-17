import { createRequire } from "node:module";
import { PassThrough, Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import {
  getAssistanceListingImagesBundle,
  readListingImageBytes,
} from "@/lib/kasifind/listing-assistance-images";
import { siteOriginFromHeaders } from "@/lib/kasifind/public-asset-url";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

const require = createRequire(import.meta.url);
// archiver is CJS; default import fails under Turbopack.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const createArchive = require("archiver") as (
  format: string,
  options?: { zlib?: { level?: number } }
) => import("archiver").Archiver;

type RouteContext = { params: Promise<{ id: string }> };

function safeDownloadFilename(name: string): string {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 120);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await context.params;
  const bundle = await getAssistanceListingImagesBundle(requestId);
  if (!bundle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (bundle.images.length === 0) {
    return NextResponse.json({ error: "This listing has no images to download." }, { status: 404 });
  }

  const imageKey = request.nextUrl.searchParams.get("imageKey")?.trim();
  const siteOrigin = siteOriginFromHeaders(request.headers);

  if (imageKey) {
    const image = bundle.images.find((img) => img.imageKey === imageKey);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    const file = await readListingImageBytes(image.url, siteOrigin);
    if (!file) {
      return NextResponse.json({ error: "Image file is missing on the server." }, { status: 404 });
    }
    const downloadName = safeDownloadFilename(image.zipName);
    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const passthrough = new PassThrough();
  const archive = createArchive("zip", { zlib: { level: 6 } });
  archive.on("error", (err) => {
    passthrough.destroy(err);
  });
  archive.pipe(passthrough);

  let appended = 0;
  for (const image of bundle.images) {
    const file = await readListingImageBytes(image.url, siteOrigin);
    if (!file) continue;
    archive.append(file.buffer, { name: image.zipName });
    appended += 1;
  }

  if (appended === 0) {
    return NextResponse.json({ error: "No image files could be read from disk." }, { status: 404 });
  }

  void archive.finalize();

  const zipName = safeDownloadFilename(`${bundle.listingSlug}-listing-images.zip`);
  return new Response(Readable.toWeb(passthrough) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "no-store",
    },
  });
}