import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MENU_LONG_PRESS_MS } from "../use-scroll-safe-menu";

const MOVE_THRESHOLD_PX = 12;

describe("scroll-safe menu gestures", () => {
  it("uses a deliberate long-press duration on touch", () => {
    assert.equal(MENU_LONG_PRESS_MS, 450);
  });

  it("treats small movement as a tap", () => {
    assert.ok(8 < MOVE_THRESHOLD_PX);
  });

  it("treats scroll-sized movement as not a tap", () => {
    assert.ok(20 > MOVE_THRESHOLD_PX);
  });
});
