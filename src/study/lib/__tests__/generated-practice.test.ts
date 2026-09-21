import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { StudyContentSourceKind } from "@/generated/prisma/client";
import { buildAllValidatedGeneratedDrafts } from "@/study/lib/generated-practice/build-all-drafts";
import { mathQuadraticRootsGenerator } from "@/study/lib/generated-practice/generators/math-quadratic-roots";
import { validateGeneratedQuestion } from "@/study/lib/generated-practice/validate";
import { recommendFromLearningState } from "@/study/lib/recommendation/score-candidates";
import { StudyRecommendationAction } from "@/generated/prisma/client";
import type { LearningState, TopicMasteryState } from "@/study/lib/learner-model/types";
import { en } from "@/study/i18n/messages/en";

function topic(partial: Partial<TopicMasteryState> & Pick<TopicMasteryState, "subtopicId">): TopicMasteryState {
  return {
    subtopicId: partial.subtopicId,
    subtopicSlug: partial.subtopicSlug ?? "quadratic-equations",
    subtopicName: partial.subtopicName ?? "Quadratic equations",
    topicId: partial.topicId ?? "t1",
    topicSlug: partial.topicSlug ?? "algebra",
    topicName: partial.topicName ?? "Algebra",
    topicImportance: 1,
    subjectId: partial.subjectId ?? "s1",
    subjectSlug: partial.subjectSlug ?? "mathematics",
    subjectName: partial.subjectName ?? "Mathematics",
    prerequisiteSubtopicId: partial.prerequisiteSubtopicId ?? null,
    masteryPct: partial.masteryPct ?? 40,
    questionsAttempted: partial.questionsAttempted ?? 5,
    questionsCorrect: partial.questionsCorrect ?? 3,
    confidencePct: null,
    selfConfidence: null,
    lastPracticedAt: new Date(),
    recentAttemptScores: partial.recentAttemptScores ?? [80, 85, 90],
    recentSessionScores: partial.recentSessionScores ?? [80],
    improvementTrend: partial.improvementTrend ?? null,
    avgDifficultyCorrect: partial.avgDifficultyCorrect ?? 2,
    avgDifficultyAttempted: partial.avgDifficultyAttempted ?? 2,
    questionCount: partial.questionCount ?? 10,
    officialQuestionCount: partial.officialQuestionCount ?? 0,
    sessionsCompleted: 1,
    sessionsAbandoned: 0,
  };
}

describe("generated practice", () => {
  it("generators produce valid questions with correct quadratic roots", () => {
    for (const slot of mathQuadraticRootsGenerator.slots) {
      const draft = mathQuadraticRootsGenerator.build(slot.key, slot.band);
      assert.ok(draft, slot.key);
      const check = validateGeneratedQuestion(draft!);
      assert.equal(check.ok, true, slot.key);
      assert.match(draft!.prompt, /x²|x\^2/);
      assert.equal(draft!.correctOptionId, "a");
    }
  });

  it("rejects invalid drafts", () => {
    const drafts = buildAllValidatedGeneratedDrafts();
    const first = drafts[0]!;
    const bad = { ...first, correctOptionId: "z" };
    const check = validateGeneratedQuestion(bad);
    assert.equal(check.ok, false);
  });

  it("buildAllValidatedGeneratedDrafts has unique source labels", () => {
    const drafts = buildAllValidatedGeneratedDrafts();
    assert.ok(drafts.length >= 20);
    const labels = drafts.map((d) => d.sourceLabel);
    assert.equal(new Set(labels).size, labels.length);
    for (const d of drafts) {
      assert.match(d.sourceLabel, /^gen-/);
      assert.ok(d.generatorMeta.generatorId);
      assert.equal(d.curriculum.subjectSlug, "mathematics");
    }
  });

  it("generated drafts are never official NSC metadata", () => {
    const drafts = buildAllValidatedGeneratedDrafts();
    for (const d of drafts) {
      assert.ok(!d.sourceLabel.includes("nsc"));
      assert.ok(!d.prompt.toLowerCase().includes("official nsc"));
    }
    void StudyContentSourceKind.GENERATED_PRACTICE;
  });

  it("recommendation suggests harder work after easy generated questions mastered", () => {
    const quad = topic({
      subtopicId: "st-quad",
      masteryPct: 58,
      avgDifficultyCorrect: 2,
      recentAttemptScores: [90, 88, 92],
      questionCount: 12,
      improvementTrend: 12,
    });
    const state: LearningState = {
      profile: {
        learnerId: "l1",
        displayName: "Test",
        schoolYear: 12,
        subjects: [
          {
            subjectId: "s1",
            subjectSlug: "mathematics",
            subjectName: "Mathematics",
            currentMarkPct: 60,
            targetMarkPct: 75,
            examDays: 30,
            examAt: null,
          },
        ],
      },
      topics: [quad],
      behaviour: {
        totalSessionsCompleted: 3,
        totalSessionsAbandoned: 0,
        typicalSessionMinutes: 20,
        currentStreakDays: 1,
        subtopicsAvoided: [],
        subtopicsRepeated: [],
      },
      generatedAt: new Date(),
    };
    const rec = recommendFromLearningState(state, en.recommendation, "en");
    assert.ok(rec);
    assert.equal(rec.action, StudyRecommendationAction.TRY_HARDER_QUESTIONS);
  });
});
