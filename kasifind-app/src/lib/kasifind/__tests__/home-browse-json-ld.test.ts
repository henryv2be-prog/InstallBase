import assert from "node:assert/strict";
import test from "node:test";
import { buildHomeBrowseItemListJsonLd } from "@/lib/kasifind/home-browse-json-ld";

test("buildHomeBrowseItemListJsonLd lists provider profile URLs", () => {
  const data = buildHomeBrowseItemListJsonLd("https://kasifind.com", [
    { id: "abc", displayName: "Joe Plumbing" },
    { id: "xyz", displayName: "Steel Gates" },
  ]);
  assert.equal(data["@type"], "ItemList");
  assert.equal(data.numberOfItems, 2);
  const items = data.itemListElement as { position: number; url: string; name: string }[];
  assert.equal(items[0]?.position, 1);
  assert.equal(items[0]?.url, "https://kasifind.com/providers/abc");
  assert.equal(items[1]?.name, "Steel Gates");
});