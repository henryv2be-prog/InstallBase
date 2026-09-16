import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  claimVideoPreview,
  registerVideoPreview,
  releaseVideoPreview,
} from "../video-preview-manager";

describe("video-preview-manager", () => {
  it("allows two concurrent previews before pausing the oldest", () => {
    let pausedA = false;
    let pausedB = false;
    let pausedC = false;

    registerVideoPreview("a", () => {
      pausedA = true;
    });
    registerVideoPreview("b", () => {
      pausedB = true;
    });
    registerVideoPreview("c", () => {
      pausedC = true;
    });

    claimVideoPreview("a");
    claimVideoPreview("b");
    claimVideoPreview("c");

    assert.equal(pausedA, true);
    assert.equal(pausedB, false);
    assert.equal(pausedC, false);

    releaseVideoPreview("b");
    releaseVideoPreview("c");
  });
});
