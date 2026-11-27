import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import sharp from "sharp";
import {
  listingImageVariantFilename,
  listingImageVariantPublicPath,
  listingImageVariantsEnabled,
} from "@/lib/kasifind/listing-image-variants";
import { generateListingImageVariants } from "@/lib/shared/generate-listing-image-variants";

describe("listingImageVariantFilename", () => {
  it("builds width-suffixed webp names", () => {
    assert.equal(
      listingImageVariantFilename("1700000000000-abc123-shop.jpeg", 400),
      "1700000000000-abc123-shop.w400.webp"
    );
    assert.equal(listingImageVariantPublicPath("photo.png", 800), "/uploads/photo.w800.webp");
  });
});

describe("listingImageVariantsEnabled", () => {
  const prev = process.env.KASIFIND_IMAGE_VARIANTS;

  after(() => {
    if (prev === undefined) delete process.env.KASIFIND_IMAGE_VARIANTS;
    else process.env.KASIFIND_IMAGE_VARIANTS = prev;
  });

  it("defaults to enabled", () => {
    delete process.env.KASIFIND_IMAGE_VARIANTS;
    assert.equal(listingImageVariantsEnabled(), true);
  });

  it("respects disable flags", () => {
    process.env.KASIFIND_IMAGE_VARIANTS = "0";
    assert.equal(listingImageVariantsEnabled(), false);
    process.env.KASIFIND_IMAGE_VARIANTS = "false";
    assert.equal(listingImageVariantsEnabled(), false);
  });
});

describe("generateListingImageVariants", () => {
  let tmpDir: string;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "kf-img-var-"));
  });

  after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("writes webp variants beside a fixture jpeg", async () => {
    const original = "fixture-wide.jpg";
    const sourcePath = path.join(tmpDir, original);
    await sharp({
      create: {
        width: 1600,
        height: 900,
        channels: 3,
        background: { r: 32, g: 120, b: 64 },
      },
    })
      .jpeg({ quality: 90 })
      .toFile(sourcePath);

    const result = await generateListingImageVariants(tmpDir, original);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.generated.sort(), [
      "fixture-wide.w1400.webp",
      "fixture-wide.w400.webp",
      "fixture-wide.w800.webp",
    ]);

    for (const name of result.generated) {
      const meta = await sharp(path.join(tmpDir, name)).metadata();
      assert.ok(meta.format === "webp");
      assert.ok((meta.width ?? 0) <= 1600);
    }

    const w400 = await sharp(path.join(tmpDir, "fixture-wide.w400.webp")).metadata();
    assert.equal(w400.width, 400);
  });

  it("always creates w400 and w800; skips w1400 for narrow sources", async () => {
    const original = "fixture-narrow.jpg";
    const sourcePath = path.join(tmpDir, original);
    await sharp({
      create: {
        width: 320,
        height: 240,
        channels: 3,
        background: { r: 200, g: 80, b: 40 },
      },
    })
      .jpeg()
      .toFile(sourcePath);

    const result = await generateListingImageVariants(tmpDir, original);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.generated.sort(), ["fixture-narrow.w400.webp", "fixture-narrow.w800.webp"]);
    assert.ok(result.skipped.includes("fixture-narrow.w1400.webp"));

    const w400 = await sharp(path.join(tmpDir, "fixture-narrow.w400.webp")).metadata();
    const w800 = await sharp(path.join(tmpDir, "fixture-narrow.w800.webp")).metadata();
    assert.equal(w400.width, 320);
    assert.equal(w800.width, 320);
  });
});