import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getUploadStorageStatus } from "@/lib/kasifind/upload-storage-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const uploads = await getUploadStorageStatus();
  const dbConfigured = isKasiFindDbConfigured();

  return Response.json({
    ok: dbConfigured && uploads.writable,
    app: "kasifind",
    status: "healthy",
    dbConfigured,
    uploads: {
      dir: uploads.dir,
      writable: uploads.writable,
      /** True when UPLOAD_DIR is set (typically a Railway volume mount). */
      persistentVolumeConfigured: uploads.configured,
      warnings: uploads.warnings,
    },
  });
}
