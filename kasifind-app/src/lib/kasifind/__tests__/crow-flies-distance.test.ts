import assert from "node:assert/strict";
import test from "node:test";
import { hasValidDistanceKm } from "@/components/kasifind/format-distance";

test("hasValidDistanceKm matches crow indicator visibility rules", () => {
  assert.equal(hasValidDistanceKm(Number.NaN), false);
  assert.equal(hasValidDistanceKm(-1), false);
  assert.equal(hasValidDistanceKm(0), true);
  assert.equal(hasValidDistanceKm(2.4), true);
});