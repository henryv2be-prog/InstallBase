import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  claimVideoPreview,
  registerVideoPreview,
  releaseVideoPreview,
} from "../video-preview-manager";

describe("video-preview-manager", () => {
  it("pauses the previous preview when a new one is claimed", () => {
    let pausedA = false;
    let pausedB = false;

    const unregisterA = registerVideoPreview("a", () => {
      pausedA = true;
    });
    registerVideoPreview("b", () => {
      pausedB = true;
    });

    claimVideoPreview("a");
    claimVideoPreview("b");

    assert.equal(pausedA, true);
    assert.equal(pausedB, false);

    unregisterA();
    releaseVideoPreview("b");
  });
});
