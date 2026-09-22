import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { nscImportManifestSchema } from "@/study/lib/nsc-import/types";

export const OFFICIAL_NSC_DATA_DIR = resolve(process.cwd(), "src/study/data/official-nsc");

export function loadNscImportManifest() {
  const manifestPath = join(OFFICIAL_NSC_DATA_DIR, "manifest.json");
  const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  return nscImportManifestSchema.parse(raw);
}

export function loadNscBatchFile(relativePath: string): unknown {
  const fullPath = join(OFFICIAL_NSC_DATA_DIR, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`NSC batch file not found: ${fullPath}`);
  }
  return JSON.parse(readFileSync(fullPath, "utf8"));
}
