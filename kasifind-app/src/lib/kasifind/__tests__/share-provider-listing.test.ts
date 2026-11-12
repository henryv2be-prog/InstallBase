import test from "node:test";
import assert from "node:assert/strict";
import {
  buildListingShareText,
  listingPublicPath,
  listingPublicUrl,
} from "@/lib/kasifind/share-provider-listing";

test("listingPublicPath", () => {
  assert.equal(listingPublicPath("abc123"), "/providers/abc123");
});

test("listingPublicUrl strips trailing slash on origin", () => {
  assert.equal(
    listingPublicUrl("abc123", "https://kasifind.example/"),
    "https://kasifind.example/providers/abc123"
  );
});

test("buildListingShareText includes name and link", () => {
  const text = buildListingShareText("Sipho Steel", "https://kasifind.example/providers/x");
  assert.match(text, /Sipho Steel/);
  assert.match(text, /https:\/\/kasifind\.example\/providers\/x/);
});
