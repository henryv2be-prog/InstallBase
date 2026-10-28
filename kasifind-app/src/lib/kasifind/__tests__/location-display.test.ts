import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPublicMapLocation } from "@/lib/kasifind/location-display";
import { buildWazeDirectionsUrl, pickDirectionsUrl } from "@/lib/kasifind/navigation-urls";
import { publicAssetUrl } from "@/lib/kasifind/public-asset-url";

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

describe("publicAssetUrl", () => {
  it("prefixes site origin for upload paths", () => {
    assert.equal(
      publicAssetUrl("/uploads/a.jpg", "https://kasifind.example"),
      "https://kasifind.example/uploads/a.jpg"
    );
  });

  it("leaves external urls unchanged", () => {
    assert.equal(publicAssetUrl("https://cdn.example/x.jpg", "https://kasifind.example"), "https://cdn.example/x.jpg");
  });
});

describe("pickDirectionsUrl", () => {
  it("uses Apple Maps on iOS", () => {
    const url = pickDirectionsUrl(-26.2, 28.05, "Soweto", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
    assert.ok(url.startsWith("https://maps.apple.com/"));
    assert.ok(url.includes("daddr=-26.2%2C28.05"));
  });

  it("uses geo intent on Android with coordinates on the geo scheme", () => {
    const url = pickDirectionsUrl(-26.2041, 28.0473, undefined, "Mozilla/5.0 (Linux; Android 14)");
    assert.equal(url, "geo:-26.2041,28.0473?q=-26.2041,28.0473");
  });

  it("builds Waze deep link with ll and navigate", () => {
    const url = buildWazeDirectionsUrl(-26.2041, 28.0473);
    assert.ok(url.includes("waze.com/ul"));
    assert.ok(url.includes("ll=-26.2041%2C28.0473"));
    assert.ok(url.includes("navigate=yes"));
  });

  it("uses Google Maps on desktop", () => {
    const url = pickDirectionsUrl(-26.2, 28.05, undefined, "Mozilla/5.0 (Windows NT 10.0)");
    assert.ok(url.includes("google.com/maps/dir"));
  });
});
