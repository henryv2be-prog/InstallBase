import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_VIDEO_COMPILATION_OPTIONS,
  parseVideoCompilationOptions,
} from "@/lib/video-compilation/options";

describe("parseVideoCompilationOptions", () => {
  it("returns defaults for invalid input", () => {
    assert.deepEqual(parseVideoCompilationOptions(null), DEFAULT_VIDEO_COMPILATION_OPTIONS);
    assert.deepEqual(parseVideoCompilationOptions({ style: "nope" }), {
      ...DEFAULT_VIDEO_COMPILATION_OPTIONS,
    });
  });

  it("accepts valid style and audio", () => {
    assert.deepEqual(parseVideoCompilationOptions({ style: "quick", audio: "none" }), {
      style: "quick",
      audio: "none",
    });
  });

  it("maps legacy synthetic audio ids to library tracks", () => {
    assert.equal(parseVideoCompilationOptions({ audio: "ambient" }).audio, "chill_vlog");
    assert.equal(parseVideoCompilationOptions({ audio: "pulse" }).audio, "install_hype");
  });
});
