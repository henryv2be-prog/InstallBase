import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildInitialExamMap,
  examEntryForSubject,
} from "@/study/lib/onboarding-defaults";

describe("onboarding exam defaults", () => {
  it("merges learner overrides without dropping newly selected subjects", () => {
    const map = buildInitialExamMap(["s1", "s2", "s3"], {
      s1: { examAt: "2026-10-01", paperNumber: "2", durationMinutes: "150" },
    });
    assert.equal(map.s1.examAt, "2026-10-01");
    assert.equal(map.s2.examAt, "2026-11-04");
    assert.equal(map.s3.paperNumber, "1");
  });

  it("examEntryForSubject returns defaults for missing ids", () => {
    const row = examEntryForSubject({}, "new-subject");
    assert.equal(row.examAt, "2026-11-04");
  });
});
