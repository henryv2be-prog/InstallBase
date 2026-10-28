import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alternateListingImageSrc,
  resolveListingImageSrc,
} from "@/lib/kasifind/resolve-listing-image-src";

describe("resolveListingImageSrc", () => {
  it("prefixes relative upload paths", () => {
    assert.equal(
      resolveListingImageSrc("/uploads/a.jpg", "https://app.example"),
      "https://app.example/uploads/a.jpg"
    );
  });

  it("leaves absolute urls unchanged", () => {
    assert.equal(
      resolveListingImageSrc("https://cdn.example/x.jpg", "https://app.example"),
      "https://cdn.example/x.jpg"
    );
  });
});

describe("alternateListingImageSrc", () => {
  it("falls back to relative path after absolute failure", () => {
    assert.equal(
      alternateListingImageSrc(
        "https://app.example/uploads/a.jpg",
        "/uploads/a.jpg"
      ),
      "/uploads/a.jpg"
    );
  });
});
