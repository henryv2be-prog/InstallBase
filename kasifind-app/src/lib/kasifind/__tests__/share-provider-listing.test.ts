import test from "node:test";
import assert from "node:assert/strict";
import {
  buildListingShareMessage,
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

test("buildListingShareMessage customer voice includes business name only", () => {
  const message = buildListingShareMessage("Sipho Steel", "customer");
  assert.match(message, /Check out Sipho Steel/);
  assert.doesNotMatch(message, /https?:\/\//);
});

test("buildListingShareMessage provider voice", () => {
  const message = buildListingShareMessage("Sipho Steel", "provider");
  assert.match(message, /Hi — find Sipho Steel/);
});

test("buildListingShareText includes name and single link line", () => {
  const text = buildListingShareText("Sipho Steel", "https://kasifind.example/providers/x", "customer");
  assert.match(text, /Sipho Steel/);
  assert.match(text, /https:\/\/kasifind\.example\/providers\/x$/);
  assert.equal((text.match(/https:\/\/kasifind\.example\/providers\/x/g) ?? []).length, 1);
});
