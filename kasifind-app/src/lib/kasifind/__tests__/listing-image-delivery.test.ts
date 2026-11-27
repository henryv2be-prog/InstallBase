import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildListingImageDelivery,
  canUseListingImageVariants,
  isListingImageVariantPath,
} from "@/lib/kasifind/listing-image-delivery";

describe("listing image delivery helpers", () => {
  it("detects variant paths", () => {
    assert.equal(isListingImageVariantPath("/uploads/foo.w400.webp"), true);
    assert.equal(isListingImageVariantPath("/uploads/foo.jpg"), false);
  });

  it("allows variants only for safe local originals", () => {
    assert.equal(canUseListingImageVariants("/uploads/a.jpg"), true);
    assert.equal(canUseListingImageVariants("/uploads/a.w400.webp"), false);
    assert.equal(canUseListingImageVariants("https://cdn/x.jpg"), false);
    assert.equal(canUseListingImageVariants("/uploads/../x"), false);
  });

  it("builds srcset for card intent", () => {
    const delivery = buildListingImageDelivery("/uploads/photo.jpeg", "card", "https://kasifind.com");
    assert.equal(delivery.canonicalOriginal, "/uploads/photo.jpeg");
    assert.match(delivery.src, /photo\.w400\.webp$/);
    assert.match(delivery.srcSet ?? "", /photo\.w400\.webp 400w/);
    assert.match(delivery.srcSet ?? "", /photo\.w1400\.webp 1400w/);
    assert.equal(delivery.sizes, "(max-width: 480px) 100vw, 420px");
  });

  it("uses 1400 default for full intent", () => {
    const delivery = buildListingImageDelivery("/uploads/x.png", "full", null);
    assert.match(delivery.src, /\/uploads\/x\.w1400\.webp$/);
    assert.equal(delivery.sizes, "100vw");
  });
});