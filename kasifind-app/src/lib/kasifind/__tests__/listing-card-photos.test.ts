import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectListingCardPhotoUrls } from "@/lib/kasifind/listing-card-photos";

describe("collectListingCardPhotoUrls", () => {
  it("returns ordered gallery urls and skips blanks", () => {
    assert.deepEqual(
      collectListingCardPhotoUrls({
        photoUrls: ["/a.jpg", "  ", "/b.jpg"],
        profileImageUrl: "/profile.jpg",
      }),
      ["/a.jpg", "/b.jpg"]
    );
  });

  it("dedupes identical urls", () => {
    assert.deepEqual(
      collectListingCardPhotoUrls({
        photoUrls: ["/a.jpg", "/a.jpg"],
        profileImageUrl: null,
      }),
      ["/a.jpg"]
    );
  });

  it("falls back to profile when gallery is empty", () => {
    assert.deepEqual(
      collectListingCardPhotoUrls({
        photoUrls: [],
        profileImageUrl: "/profile.jpg",
      }),
      ["/profile.jpg"]
    );
  });

  it("returns empty when no photos", () => {
    assert.deepEqual(
      collectListingCardPhotoUrls({
        photoUrls: [],
        profileImageUrl: null,
      }),
      []
    );
  });
});
