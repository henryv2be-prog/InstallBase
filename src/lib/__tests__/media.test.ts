import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatVideoDuration, isVideoMedia, videoPreviewSrc } from "../media";

describe("media helpers", () => {
  it("detects video urls", () => {
    assert.equal(isVideoMedia("video"), true);
    assert.equal(isVideoMedia(undefined, "/uploads/clip.mp4"), true);
    assert.equal(isVideoMedia(undefined, "/uploads/photo.jpg"), false);
  });

  it("builds preview src fragments", () => {
    assert.equal(videoPreviewSrc("/uploads/clip.mp4"), "/uploads/clip.mp4#t=0.1");
    assert.equal(videoPreviewSrc("/uploads/clip.mp4#t=2"), "/uploads/clip.mp4#t=2");
  });

  it("formats durations", () => {
    assert.equal(formatVideoDuration(65), "1:05");
    assert.equal(formatVideoDuration(0), null);
  });
});
