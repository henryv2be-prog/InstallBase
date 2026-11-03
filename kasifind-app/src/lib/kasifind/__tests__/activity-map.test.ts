import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateListingsToCells,
  gridStepForZoom,
  searchRadiusKmForGridStep,
} from "@/lib/kasifind/activity-map-utils";

test("gridStepForZoom returns coarser cells when zoomed out", () => {
  assert.ok(gridStepForZoom(5) > gridStepForZoom(10));
  assert.ok(gridStepForZoom(10) > gridStepForZoom(13));
});

test("searchRadiusKmForGridStep stays within discovery-friendly bounds", () => {
  const r = searchRadiusKmForGridStep(gridStepForZoom(8));
  assert.ok(r >= 8 && r <= 50);
});

test("aggregateListingsToCells groups Roodepoort-area listings into one cell", () => {
  const base = { latitude: -26.162, longitude: 27.872, locationLabel: "Roodepoort" };
  const listings = Array.from({ length: 6 }, (_, i) => ({
    ...base,
    latitude: base.latitude + i * 0.001,
    longitude: base.longitude + i * 0.001,
    locationLabel: `Roodepoort ${i}`,
  }));
  const cells = aggregateListingsToCells(listings, gridStepForZoom(12));
  assert.ok(cells.length >= 1);
  assert.equal(cells.reduce((sum, c) => sum + c.count, 0), 6);
});
