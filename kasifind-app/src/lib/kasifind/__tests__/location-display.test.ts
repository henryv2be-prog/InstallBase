import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicMapLocation } from "@/lib/kasifind/location-display";

describe("getPublicMapLocation", () => {
  it("returns exact coordinates when exact pin is enabled", () => {
    const result = getPublicMapLocation(-26.2041, 28.0473, false);
    assert.equal(result.approximate, false);
    assert.equal(result.latitude, -26.2041);
    assert.equal(result.longitude, 28.0473);
    assert.equal(result.radiusMeters, null);
  });

  it("rounds coordinates and adds radius when approximate", () => {
    const result = getPublicMapLocation(-26.20456, 28.04789, true);
    assert.equal(result.approximate, true);
    assert.equal(result.latitude, -26.2);
    assert.equal(result.longitude, 28.05);
    assert.equal(result.radiusMeters, 1000);
  });
});
