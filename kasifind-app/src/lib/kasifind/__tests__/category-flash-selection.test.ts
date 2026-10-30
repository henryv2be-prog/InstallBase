import assert from "node:assert/strict";
import test from "node:test";
import {
  categoryFlashListingWeight,
  weightedRandomPick,
} from "@/lib/kasifind/category-flash-selection";

test("featured listings have higher selection weight", () => {
  const featured = categoryFlashListingWeight({ featured: true, workPhotoCount: 2 });
  const regular = categoryFlashListingWeight({ featured: false, workPhotoCount: 2 });
  assert.ok(featured > regular);
});

test("weightedRandomPick respects weight bias over many rolls", () => {
  const featured = { id: "f", featured: true, workPhotoCount: 1 };
  const regular = { id: "r", featured: false, workPhotoCount: 1 };
  const pool = [featured, regular];
  let featuredHits = 0;
  for (let i = 0; i < 500; i += 1) {
    const pick = weightedRandomPick<{ id: string; featured: boolean; workPhotoCount: number }>(
      pool,
      categoryFlashListingWeight
    );
    if (pick?.id === "f") featuredHits += 1;
  }
  assert.ok(featuredHits > 250);
});
