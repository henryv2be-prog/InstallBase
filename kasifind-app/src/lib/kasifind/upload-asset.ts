import fs from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/shared/uploads";

/** Safe filename for a KasiFind `/uploads/<file>` path. */
export function uploadPathToFilename(url: string): string | null {
  if (!url.startsWith("/uploads/")) return null;
  const rest = url.slice("/uploads/".length);
  if (!rest || rest.includes("/") || rest.includes("..")) return null;
  return path.basename(rest);
}

/** True when the file is missing on disk (local uploads only). External URLs are assumed OK. */
export async function localUploadExists(url: string): Promise<boolean> {
  const filename = uploadPathToFilename(url);
  if (!filename) return true;
  try {
    await fs.access(path.join(/* turbopackIgnore: true */ getUploadDir(), filename));
    return true;
  } catch {
    return false;
  }
}

export async function filterReachableUploadUrls(urls: string[]): Promise<string[]> {
  const kept: string[] = [];
  for (const url of urls) {
    if (await localUploadExists(url)) kept.push(url);
  }
  return kept;
}

export async function resolvePublicUploadUrl(url: string | null | undefined): Promise<string | null> {
  if (!url?.trim()) return null;
  if (await localUploadExists(url)) return url;
  return null;
}

export async function countMissingLocalUploads(urls: string[]): Promise<number> {
  let missing = 0;
  for (const url of urls) {
    if (!(await localUploadExists(url))) missing += 1;
  }
  return missing;
}
