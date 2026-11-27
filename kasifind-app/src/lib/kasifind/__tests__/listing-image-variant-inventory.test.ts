import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import sharp from "sharp";
import { uniqueListingUploadPaths } from "@/lib/kasifind/listing-image-variant-inventory";
import { generateListingImageVariants } from "@/lib/shared/generate-listing-image-variants";

describe("uniqueListingUploadPaths", () => {
  it("dedupes and ignores variant paths", () => {
    const out = uniqueListingUploadPaths([
      "/uploads/a.jpg",
      "/uploads/a.jpg",
      "/uploads/a.w400.webp",
      "https://kasifind.com/uploads/b.png",
      "/uploads/../evil",
    ]);
    assert.deepEqual(out, ["/uploads/a.jpg", "/uploads/b.png"]);
  });
});

describe("generateListingImageVariants skipExisting", () => {
  let tmpDir: string;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "kf-backfill-"));
  });

  after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("does not rewrite existing variant files", async () => {
    const original = "legacy.jpg";
    await sharp({
      create: { width: 900, height: 600, channels: 3, background: { r: 10, g: 10, b: 10 } },
    })
      .jpeg()
      .toFile(path.join(tmpDir, original));

    const first = await generateListingImageVariants(tmpDir, original);
    assert.ok(first.generated.includes("legacy.w400.webp"));

    await fs.writeFile(path.join(tmpDir, "legacy.w400.webp"), "marker");
    const second = await generateListingImageVariants(tmpDir, original, { skipExisting: true });
    assert.ok(second.skipped.includes("legacy.w400.webp"));

    const marker = await fs.readFile(path.join(tmpDir, "legacy.w400.webp"), "utf8");
    assert.equal(marker, "marker");
  });
});