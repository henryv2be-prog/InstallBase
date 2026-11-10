import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_LISTING_WORK_PHOTOS,
  planWorkPhotoUploads,
} from "@/lib/kasifind/listing-photo-limits";

describe("planWorkPhotoUploads", () => {
  const image = new File(["x"], "a.jpg", { type: "image/jpeg" });
  const doc = new File(["x"], "b.pdf", { type: "application/pdf" });

  it("accepts images up to remaining slots", () => {
    const { accepted, skippedOverLimit } = planWorkPhotoUploads(
      [image, image, image],
      10,
      0
    );
    assert.equal(accepted.length, 2);
    assert.equal(skippedOverLimit, 1);
    assert.equal(MAX_LISTING_WORK_PHOTOS, 12);
  });

  it("skips non-image files", () => {
    const { accepted, skippedNonImage } = planWorkPhotoUploads([doc, image], 0, 0);
    assert.deepEqual(accepted, [image]);
    assert.equal(skippedNonImage, 1);
  });
});
