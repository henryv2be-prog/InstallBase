import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildListingImageDelivery,
  canUseListingImageVariants,
  isListingImageVariantPath,
  pickListingPageLcpImagePath,
} from "@/lib/kasifind/listing-image-delivery";
import { normalizeListingImageStoredPath } from "@/lib/kasifind/listing-upload-path";

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
    const srcSet = delivery.srcSet ?? "";
    assert.match(srcSet, /photo\.w400\.webp 400w/);
    assert.match(srcSet, /photo\.w800\.webp 800w/);
    assert.ok(!srcSet.includes("1400w"));
    assert.equal(delivery.sizes, "(max-width: 480px) 100vw, 420px");
  });

  it("uses 1400 default for full intent", () => {
    const delivery = buildListingImageDelivery("/uploads/x.png", "full", null);
    assert.match(delivery.src, /\/uploads\/x\.w1400\.webp$/);
    assert.match(delivery.sizes ?? "", /1400px/);
  });

  it("resolves variants from absolute upload URLs", () => {
    assert.equal(
      normalizeListingImageStoredPath("https://kasifind.com/uploads/a.jpeg"),
      "/uploads/a.jpeg"
    );
    const delivery = buildListingImageDelivery(
      "https://kasifind.com/uploads/a.jpeg",
      "hero",
      "https://kasifind.com"
    );
    assert.match(delivery.src, /a\.w800\.webp/);
    assert.equal(delivery.canonicalOriginal, "/uploads/a.jpeg");
  });

  it("picks profile path for LCP preload", () => {
    assert.equal(pickListingPageLcpImagePath(null), null);
    assert.equal(pickListingPageLcpImagePath("/uploads/logo.jpg"), "/uploads/logo.jpg");
  });

  it("limits thumb srcset to 400 and 800", () => {
    const delivery = buildListingImageDelivery("/uploads/work.jpg", "thumb", null);
    assert.match(delivery.src, /w400\.webp/);
    const srcSet = delivery.srcSet ?? "";
    assert.ok(/\b400w\b/.test(srcSet));
    assert.ok(srcSet.includes("800w"));
  });

  it("limits lightbox srcset to 800 and 1400", () => {
    const delivery = buildListingImageDelivery("/uploads/work.jpg", "full", null);
    assert.match(delivery.src, /w1400\.webp/);
    const srcSet = delivery.srcSet ?? "";
    assert.ok(!/\b400w\b/.test(srcSet));
    assert.ok(srcSet.includes("800w"));
    assert.ok(/\b1400w\b/.test(srcSet));
  });
});