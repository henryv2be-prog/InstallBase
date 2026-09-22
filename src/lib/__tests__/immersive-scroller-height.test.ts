import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { capImmersiveSlideHeightPx } from "@/lib/immersive-scroller-height";

describe("capImmersiveSlideHeightPx", () => {
  it("caps slide height to the gap above the mobile glass nav", () => {
    assert.equal(capImmersiveSlideHeightPx(600, 120, 700), 580);
  });

  it("leaves height unchanged when the nav is below the scrollport", () => {
    assert.equal(capImmersiveSlideHeightPx(400, 120, 900), 400);
  });
});
