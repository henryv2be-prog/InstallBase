import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LearningState, TopicMasteryState } from "@/study/lib/learner-model/types";
import { recommendFromLearningState } from "@/study/lib/recommendation/score-candidates";

const SUBJECT = {
  subjectId: "math",
  subjectSlug: "mathematics",
  subjectName: "Mathematics",
};

function subtopic(
  id: string,
  slug: string,
  name: string,
  topicSlug: string,
  topicName: string,
  masteryPct: number,
  extra: Partial<TopicMasteryState> = {},
): TopicMasteryState {
  return {
    subtopicId: id,
    subtopicSlug: slug,
    subtopicName: name,
    topicId: `topic-${topicSlug}`,
    topicSlug,
    topicName,
    topicImportance: topicSlug === "calculus" ? 1.3 : 1.1,
    ...SUBJECT,
    prerequisiteSubtopicId: extra.prerequisiteSubtopicId ?? null,
    masteryPct,
    questionsAttempted: extra.questionsAttempted ?? 20,
    questionsCorrect: extra.questionsCorrect ?? Math.round((masteryPct / 100) * 20),
    confidencePct: masteryPct,
    selfConfidence: null,
    lastPracticedAt: extra.lastPracticedAt ?? new Date(),
    recentAttemptScores: extra.recentAttemptScores ?? [],
    recentSessionScores: extra.recentSessionScores ?? [],
    improvementTrend: extra.improvementTrend ?? null,
    avgDifficultyCorrect: null,
    avgDifficultyAttempted: null,
    questionCount: 10,
    officialQuestionCount: 3,
    sessionsCompleted: 2,
    sessionsAbandoned: 0,
    ...extra,
  };
}

function baseState(topics: TopicMasteryState[]): LearningState {
  return {
    profile: {
      learnerId: "learner-test",
      displayName: "Test",
      schoolYear: 2026,
      subjects: [
        {
          ...SUBJECT,
          currentMarkPct: 60,
          targetMarkPct: 75,
          examDays: 21,
          examAt: new Date("2026-11-04"),
        },
      ],
    },
    topics,
    behaviour: {
      totalSessionsCompleted: 5,
      totalSessionsAbandoned: 0,
      typicalSessionMinutes: 25,
      currentStreakDays: 2,
      subtopicsAvoided: [],
      subtopicsRepeated: [],
    },
    generatedAt: new Date("2026-09-21T12:00:00Z"),
  };
}

describe("recommendation engine", () => {
  it("recommends different next steps for different performance histories", () => {
    const algebra = subtopic("st-alg", "quadratic-equations", "Quadratic equations", "algebra", "Algebra", 72);
    const functions = subtopic(
      "st-func",
      "transformations",
      "Transformations of functions",
      "functions",
      "Functions",
      49,
      { recentAttemptScores: [40, 45, 50] },
    );
    const differentiation = subtopic(
      "st-diff",
      "differentiation",
      "Differentiation",
      "calculus",
      "Calculus",
      73,
      { prerequisiteSubtopicId: "st-alg" },
    );

    const studentA = baseState([algebra, functions, differentiation]);
    const recA = recommendFromLearningState(studentA);
    assert.ok(recA);
    assert.equal(recA.subtopicId, "st-func");

    const algebraB = subtopic("st-alg", "quadratic-equations", "Quadratic equations", "algebra", "Algebra", 51);
    const functionsB = subtopic(
      "st-func",
      "transformations",
      "Transformations",
      "functions",
      "Functions",
      78,
    );
    const differentiationB = subtopic(
      "st-diff",
      "differentiation",
      "Differentiation",
      "calculus",
      "Calculus",
      38,
      {
        prerequisiteSubtopicId: "st-alg",
        recentAttemptScores: [45, 42, 39],
        recentSessionScores: [40, 45],
      },
    );

    const studentB = baseState([algebraB, functionsB, differentiationB]);
    const recB = recommendFromLearningState(studentB);
    assert.ok(recB);
    assert.equal(recB.subtopicId, "st-diff");
    assert.notEqual(recA.subtopicId, recB.subtopicId);
  });

  it("can suggest revisiting a prerequisite when it is weak", () => {
    const algebra = subtopic("st-alg", "quadratic-equations", "Quadratic equations", "algebra", "Algebra", 35);
    const differentiation = subtopic(
      "st-diff",
      "differentiation",
      "Differentiation",
      "calculus",
      "Calculus",
      35,
      { prerequisiteSubtopicId: "st-alg", recentAttemptScores: [30, 35, 28] },
    );

    const rec = recommendFromLearningState(baseState([algebra, differentiation]));
    assert.ok(rec);
    assert.equal(rec.subtopicId, "st-alg");
    assert.match(rec.reasonSummary, /Start with|strengthen|Begin met/i);
  });
});
