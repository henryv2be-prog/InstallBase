import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldAutoCompileInstallVideo } from "@/lib/video-compilation/eligibility";

describe("shouldAutoCompileInstallVideo", () => {
  it("requires at least two ready items", () => {
    assert.equal(
      shouldAutoCompileInstallVideo([{ kind: "image", status: "ready" }]),
      false
    );
  });

  it("allows two photos", () => {
    assert.equal(
      shouldAutoCompileInstallVideo([
        { kind: "image", status: "ready" },
        { kind: "image", status: "ready" },
      ]),
      true
    );
  });

  it("allows mixed photo and video", () => {
    assert.equal(
      shouldAutoCompileInstallVideo([
        { kind: "image", status: "ready" },
        { kind: "video", status: "ready" },
      ]),
      true
    );
  });
});
