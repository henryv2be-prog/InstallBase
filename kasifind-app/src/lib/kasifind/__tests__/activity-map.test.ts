import assert from "node:assert/strict";
import test from "node:test";
import { gridStepForZoom, searchRadiusKmForGridStep } from "@/lib/kasifind/activity-map-utils";

test("gridStepForZoom returns coarser cells when zoomed out", () => {
  assert.ok(gridStepForZoom(5) > gridStepForZoom(10));
  assert.ok(gridStepForZoom(10) > gridStepForZoom(13));
});

test("searchRadiusKmForGridStep stays within discovery-friendly bounds", () => {
  const r = searchRadiusKmForGridStep(gridStepForZoom(8));
  assert.ok(r >= 8 && r <= 50);
});
