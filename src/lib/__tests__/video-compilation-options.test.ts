import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_VIDEO_COMPILATION_OPTIONS,
  parseVideoCompilationOptions,
} from "@/lib/video-compilation/options";

describe("parseVideoCompilationOptions", () => {
  it("returns defaults for invalid input when library empty", () => {
    assert.deepEqual(parseVideoCompilationOptions(null), DEFAULT_VIDEO_COMPILATION_OPTIONS);
  });

  it("defaults audio to first library track when available", () => {
    assert.deepEqual(parseVideoCompilationOptions(null, ["alpha", "beta"]), {
      style: "cinematic",
      audio: "alpha",
    });
  });

  it("accepts valid style and audio slug", () => {
    assert.deepEqual(parseVideoCompilationOptions({ style: "slide_left", audio: "none" }, ["alpha"]), {
      style: "slide_left",
      audio: "none",
    });
    assert.deepEqual(parseVideoCompilationOptions({ style: "quick", audio: "my-beat" }, ["my-beat"]), {
      style: "quick",
      audio: "my-beat",
    });
  });

  it("maps legacy enum ids to slug filenames", () => {
    assert.equal(
      parseVideoCompilationOptions({ audio: "down_to_business" }, ["down-to-business"]).audio,
      "down-to-business"
    );
  });
});
