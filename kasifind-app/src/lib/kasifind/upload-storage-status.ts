import fs from "fs/promises";
import { getUploadDir } from "@/lib/shared/uploads";

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
  return { dir, configured, writable };
}
