import assert from "node:assert/strict";
import test from "node:test";
import { mergeCardGalleryLoadedIndices } from "@/components/kasifind/kf-provider-card-gallery";

test("mergeCardGalleryLoadedIndices starts with active slide only", () => {
  const next = mergeCardGalleryLoadedIndices(new Set(), 0, false, true, 4);
  assert.deepEqual([...next].sort(), [0]);
});

test("mergeCardGalleryLoadedIndices preloads one slide ahead during slideshow", () => {
  const next = mergeCardGalleryLoadedIndices(new Set([0]), 0, true, true, 4);
  assert.deepEqual([...next].sort(), [0, 1]);
});

test("mergeCardGalleryLoadedIndices does not preload when out of view", () => {
  const next = mergeCardGalleryLoadedIndices(new Set([0]), 0, true, false, 4);
  assert.deepEqual([...next].sort(), [0]);
});