import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { nscManifestCoverageGaps } from "@/study/lib/nsc-import/curriculum-nsc-coverage";
import { loadNscImportManifest } from "@/study/lib/nsc-import/load-manifest";
import { nscImportBatchSchema } from "@/study/lib/nsc-import/types";

describe("NSC import batch schema", () => {
  it("validates every batch listed in manifest.json", () => {
    const manifest = loadNscImportManifest();
    assert.ok(manifest.batches.length >= 1);

    for (const relativePath of manifest.batches) {
      const path = join(process.cwd(), "src/study/data/official-nsc", relativePath);
      const raw = JSON.parse(readFileSync(path, "utf8"));
      const parsed = nscImportBatchSchema.safeParse(raw);
      assert.equal(
        parsed.success,
        true,
        `batch ${relativePath}: ${parsed.success ? "" : JSON.stringify(parsed.error.flatten())}`,
      );
    }
  });

  it("covers every Grade 12 curriculum subtopic with at least one NSC batch question", () => {
    const gaps = nscManifestCoverageGaps();
    assert.deepEqual(
      gaps,
      [],
      `Add NSC batch JSON for: ${gaps.slice(0, 8).join(", ")}${gaps.length > 8 ? ` (+${gaps.length - 8} more)` : ""}`,
    );
  });
});
