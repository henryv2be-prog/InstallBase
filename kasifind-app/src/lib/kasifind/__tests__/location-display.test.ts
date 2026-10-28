import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicMapLocation } from "@/lib/kasifind/location-display";
import { pickDirectionsUrl } from "@/lib/kasifind/navigation-urls";

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

describe("pickDirectionsUrl", () => {
  it("uses Apple Maps on iOS", () => {
    const url = pickDirectionsUrl(-26.2, 28.05, "Soweto", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
    assert.ok(url.startsWith("https://maps.apple.com/"));
    assert.ok(url.includes("daddr=-26.2%2C28.05"));
  });

  it("uses geo intent on Android", () => {
    const url = pickDirectionsUrl(-26.2, 28.05, undefined, "Mozilla/5.0 (Linux; Android 14)");
    assert.ok(url.startsWith("geo:"));
  });

  it("uses Google Maps on desktop", () => {
    const url = pickDirectionsUrl(-26.2, 28.05, undefined, "Mozilla/5.0 (Windows NT 10.0)");
    assert.ok(url.includes("google.com/maps/dir"));
  });
});
