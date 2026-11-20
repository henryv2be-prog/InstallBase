import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  KASIFIND_OG_FALLBACK_IMAGE,
  pickListingOpenGraphImagePath,
} from "@/lib/kasifind/listing-og";

describe("pickListingOpenGraphImagePath", () => {
  it("prefers first work photo over profile", () => {
    assert.equal(
      pickListingOpenGraphImagePath({
        photoUrls: ["/work-a.jpg", "/work-b.jpg"],
        profileImageUrl: "/profile.jpg",
      }),
      "/work-a.jpg"
    );
  });

  it("falls back to profile when gallery is empty", () => {
    assert.equal(
      pickListingOpenGraphImagePath({
        photoUrls: [],
        profileImageUrl: "/profile.jpg",
      }),
      "/profile.jpg"
    );
  });

  it("falls back to app icon when no photos", () => {
    assert.equal(
      pickListingOpenGraphImagePath({
        photoUrls: [],
        profileImageUrl: null,
      }),
      KASIFIND_OG_FALLBACK_IMAGE
    );
  });
});