import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { studyOnboardingSchema } from "@/study/lib/validation";

describe("studyOnboardingSchema", () => {
  it("accepts a valid onboarding payload", () => {
    const result = studyOnboardingSchema.safeParse({
      basics: { displayName: "Thabo", schoolYear: 2026 },
      subjects: [
        { subjectId: "sub1", currentMarkPct: 55, targetMarkPct: 70 },
        { subjectId: "sub2", currentMarkPct: 62, targetMarkPct: 75 },
      ],
      exams: [
        { subjectId: "sub1", examAt: "2026-11-04", paperNumber: 1, durationMinutes: 180 },
        { subjectId: "sub2", examAt: "2026-11-12", paperNumber: 1, durationMinutes: 180 },
      ],
    });
    assert.equal(result.success, true);
  });

  it("rejects when target is below current mark", () => {
    const result = studyOnboardingSchema.safeParse({
      basics: { displayName: "Thabo", schoolYear: 2026 },
      subjects: [{ subjectId: "sub1", currentMarkPct: 70, targetMarkPct: 60 }],
      exams: [{ subjectId: "sub1", examAt: "2026-11-04" }],
    });
    assert.equal(result.success, false);
  });

  it("requires an exam for each selected subject", () => {
    const result = studyOnboardingSchema.safeParse({
      basics: { displayName: "Thabo", schoolYear: 2026 },
      subjects: [
        { subjectId: "sub1", currentMarkPct: 55, targetMarkPct: 70 },
        { subjectId: "sub2", currentMarkPct: 62, targetMarkPct: 75 },
      ],
      exams: [{ subjectId: "sub1", examAt: "2026-11-04" }],
    });
    assert.equal(result.success, false);
  });
});
