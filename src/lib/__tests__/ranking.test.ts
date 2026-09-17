import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bragHotScore, recencyMultiplier } from "../ranking";

describe("brag ranking", () => {
  it("favors higher brag scores at the same age", () => {
    const createdAt = new Date();
    assert.ok(bragHotScore(10, createdAt) > bragHotScore(2, createdAt));
  });

  it("favors newer posts with the same brag score", () => {
    const now = Date.now();
    const fresh = new Date(now - 86_400_000);
    const stale = new Date(now - 14 * 86_400_000);
    assert.ok(bragHotScore(5, fresh) > bragHotScore(5, stale));
  });

  it("still surfaces brand-new posts with zero brags", () => {
    const createdAt = new Date();
    assert.ok(bragHotScore(0, createdAt) > 0);
    assert.equal(recencyMultiplier(createdAt), 1);
  });
});
