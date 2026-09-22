import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LearningState, TopicMasteryState } from "@/study/lib/learner-model/types";
import { recommendFromLearningState } from "@/study/lib/recommendation/score-candidates";

function sub(
  id: string,
  masteryPct: number,
  extra: Partial<TopicMasteryState> = {},
): TopicMasteryState {
  return {
    subtopicId: id,
    subtopicSlug: id,
    subtopicName: id,
    topicId: "t",
    topicSlug: "topic",
    topicName: "Topic",
    topicImportance: 1,
    subjectId: "s",
    subjectSlug: "mathematics",
    subjectName: "Mathematics",
    prerequisiteSubtopicId: null,
    masteryPct,
    questionsAttempted: 10,
    questionsCorrect: Math.round(masteryPct),
    confidencePct: masteryPct,
    selfConfidence: null,
    lastPracticedAt: new Date(),
    recentAttemptScores: [],
    recentIncorrectStreak: 0,
    recentSessionScores: [],
    improvementTrend: null,
    avgDifficultyCorrect: null,
    avgDifficultyAttempted: null,
    questionCount: 8,
    officialQuestionCount: 1,
    sessionsCompleted: 1,
    sessionsAbandoned: 0,
    ...extra,
  };
}

function state(topics: TopicMasteryState[]): LearningState {
  return {
    profile: {
      learnerId: "l",
      displayName: "T",
      schoolYear: 2026,
      defaultAvailableMinutes: 45,
      subjects: [
        {
          subjectId: "s",
          subjectSlug: "mathematics",
          subjectName: "Mathematics",
          currentMarkPct: 55,
          demonstratedMarkPct: 55,
          effectiveMarkPct: 55,
          targetMarkPct: 70,
          examDays: 21,
          examAt: null,
        },
      ],
    },
    topics,
    behaviour: {
      totalSessionsCompleted: 1,
      totalSessionsAbandoned: 0,
      typicalSessionMinutes: 25,
      currentStreakDays: 0,
      subtopicsAvoided: [],
      subtopicsRepeated: [],
    },
    generatedAt: new Date(),
  };
}

describe("recommendation feedback penalties", () => {
  it("prefers a non-dismissed subtopic when another is dismissed", () => {
    const weak = sub("weak", 40);
    const mid = sub("mid", 52);
    const s = state([weak, mid]);
    const without = recommendFromLearningState(s);
    const withDismiss = recommendFromLearningState(s, undefined, "en", {
      dismissedSubtopicIds: new Set(["weak"]),
      staleSuggestionSubtopicIds: new Set(),
    });
    assert.ok(without);
    assert.ok(withDismiss);
    assert.equal(without.subtopicId, "weak");
    assert.equal(withDismiss.subtopicId, "mid");
  });
});
