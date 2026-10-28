import fs from "fs/promises";
import { getUploadDir } from "@/lib/shared/uploads";

export function uploadStorageWarnings(dir: string, configured: boolean): string[] {
  const warnings: string[] = [];
  if (!configured) {
    warnings.push(
      "UPLOAD_DIR is not set — listing photos are stored on the container disk and are lost on each deploy."
    );
  }
  const normalized = dir.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("postgresql") || normalized.includes("/var/lib/postgresql")) {
    warnings.push(
      "Upload directory looks like Postgres data (/var/lib/postgresql/...). Mount a separate volume at /data and set UPLOAD_DIR=/data/uploads on the web service."
    );
  }
  return warnings;
}

export async function getUploadStorageStatus() {
  const dir = getUploadDir();
  const configured = Boolean(process.env.UPLOAD_DIR?.trim());
  let writable = false;
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.access(dir, fs.constants.W_OK);
    writable = true;
  } catch {
    writable = false;
  }
  return {
    dir,
    configured,
    writable,
    warnings: uploadStorageWarnings(dir, configured),
  };
}
