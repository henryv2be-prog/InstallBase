import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boundingBox,
  formatDistanceKm,
  haversineDistanceKm,
  isValidSaCoordinate,
  parseRadiusKm,
} from "@/lib/kasifind/geo";

describe("kasifind geo", () => {
  it("computes haversine distance", () => {
    const jhb = { latitude: -26.2041, longitude: 28.0473 };
    const nearby = { latitude: -26.19, longitude: 28.05 };
    const km = haversineDistanceKm(jhb, nearby);
    assert.ok(km > 1 && km < 3);
  });

  it("formats distance for display", () => {
    assert.equal(formatDistanceKm(0.4), "400 m away");
    assert.equal(formatDistanceKm(1.2), "1.2 km away");
  });

  it("validates SA coordinates", () => {
    assert.equal(isValidSaCoordinate(-26.2, 28.0), true);
    assert.equal(isValidSaCoordinate(51.5, -0.1), false);
  });

  it("parses radius options", () => {
    assert.equal(parseRadiusKm("10"), 10);
    assert.equal(parseRadiusKm("999"), 100);
  });

  it("builds bounding box", () => {
    const box = boundingBox({ latitude: -26, longitude: 28 }, 5);
    assert.ok(box.minLat < -26 && box.maxLat > -26);
    assert.ok(box.minLng < 28 && box.maxLng > 28);
  });
});
