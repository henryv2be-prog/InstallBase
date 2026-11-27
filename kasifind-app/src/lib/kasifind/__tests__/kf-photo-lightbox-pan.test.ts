import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampLightboxPan } from "@/lib/kasifind/kf-photo-lightbox-pan";

describe("clampLightboxPan", () => {
  it("zeros pan at scale 1", () => {
    assert.deepEqual(clampLightboxPan(50, 50, 1, 300, 300, 400, 300), { x: 0, y: 0 });
  });

  it("clamps to scaled overflow", () => {
    const { x } = clampLightboxPan(500, 0, 2, 300, 300, 300, 200);
    assert.equal(x, 150);
    assert.equal(clampLightboxPan(-500, 0, 2, 300, 300, 300, 200).x, -150);
  });
});