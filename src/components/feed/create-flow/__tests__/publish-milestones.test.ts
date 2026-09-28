import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publishMilestoneState } from "@/components/feed/create-flow/create-flow-publish-milestones";

describe("publishMilestoneState", () => {
  it("hides for non auto_video flows", () => {
    const state = publishMilestoneState("content", "photo_video", "idle");
    assert.equal(state.show, false);
  });

  it("starts at media on early auto_video steps", () => {
    const state = publishMilestoneState("media-ready", "auto_video", "idle");
    assert.equal(state.show, true);
    assert.equal(state.activeIndex, 0);
    assert.equal(state.completedThrough, -1);
  });

  it("shows video step working while compiling", () => {
    const state = publishMilestoneState("music", "auto_video", "PROCESSING");
    assert.equal(state.activeIndex, 1);
    assert.equal(state.videoWorking, true);
    assert.equal(state.completedThrough, 0);
  });

  it("moves to live step on caption", () => {
    const state = publishMilestoneState("caption", "auto_video", "READY");
    assert.equal(state.activeIndex, 2);
    assert.equal(state.completedThrough, 1);
    assert.equal(state.videoWorking, false);
  });
});
