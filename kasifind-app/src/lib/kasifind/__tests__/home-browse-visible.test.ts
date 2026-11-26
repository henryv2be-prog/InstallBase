import assert from "node:assert/strict";
import test from "node:test";
import {
  homeBrowseRemainingCount,
  initialHomeBrowseVisibleCount,
  nextHomeBrowseVisibleCount,
  visibleCountForListingIndex,
} from "@/lib/kasifind/home-browse-visible";

test("initialHomeBrowseVisibleCount caps by total", () => {
  assert.equal(initialHomeBrowseVisibleCount(42, 12), 12);
  assert.equal(initialHomeBrowseVisibleCount(8, 12), 8);
  assert.equal(initialHomeBrowseVisibleCount(0, 12), 0);
});

test("nextHomeBrowseVisibleCount steps in batches", () => {
  assert.equal(nextHomeBrowseVisibleCount(12, 42, 12), 24);
  assert.equal(nextHomeBrowseVisibleCount(36, 42, 12), 42);
  assert.equal(nextHomeBrowseVisibleCount(42, 42, 12), 42);
});

test("visibleCountForListingIndex includes target listing", () => {
  assert.equal(visibleCountForListingIndex(0, 42, 12, 12), 12);
  assert.equal(visibleCountForListingIndex(11, 42, 12, 12), 12);
  assert.equal(visibleCountForListingIndex(12, 42, 12, 12), 24);
  assert.equal(visibleCountForListingIndex(23, 42, 12, 12), 24);
  assert.equal(visibleCountForListingIndex(24, 42, 12, 12), 36);
});

test("homeBrowseRemainingCount", () => {
  assert.equal(homeBrowseRemainingCount(12, 42), 30);
  assert.equal(homeBrowseRemainingCount(42, 42), 0);
});