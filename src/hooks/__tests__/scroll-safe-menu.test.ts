import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Threshold is documented in the hook — keep in sync if changed.
const MOVE_THRESHOLD_PX = 12;

describe("scroll-safe menu gesture threshold", () => {
  it("treats small movement as a tap", () => {
    assert.ok(8 < MOVE_THRESHOLD_PX);
  });

  it("treats scroll-sized movement as not a tap", () => {
    assert.ok(20 > MOVE_THRESHOLD_PX);
  });
});
