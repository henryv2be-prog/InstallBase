import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldAutoCompileInstallVideo } from "@/lib/video-compilation/eligibility";

describe("shouldAutoCompileInstallVideo", () => {
  it("requires at least one ready item", () => {
    assert.equal(shouldAutoCompileInstallVideo([]), false);
  });

  it("allows a single photo", () => {
    assert.equal(
      shouldAutoCompileInstallVideo([{ kind: "image", status: "ready" }]),
      true
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

  it("does not compile a single uploaded video alone", () => {
    assert.equal(
      shouldAutoCompileInstallVideo([{ kind: "video", status: "ready" }]),
      false
    );
  });
});
