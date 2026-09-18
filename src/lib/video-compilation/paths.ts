import path from "path";
import { getUploadDir, isLocalUpload } from "@/lib/uploads";

export function uploadUrlToAbsolutePath(url: string): string | null {
  if (!isLocalUpload(url)) return null;
  const filename = url.replace(/^\/uploads\//, "").split("?")[0]?.split("#")[0];
  if (!filename || filename.includes("..")) return null;
  return path.join(getUploadDir(), filename);
}
