import type { StudyRecommendationAction, StudySelfConfidence } from "@/generated/prisma/client";

/** Static profile from onboarding + identity — not performance. */
export type LearnerProfile = {
  learnerId: string;
  displayName: string;
  schoolYear: number;
  subjects: LearnerSubjectGoal[];
};

export type LearnerSubjectGoal = {
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  /** Self-reported at onboarding — kept for comparison. */
  currentMarkPct: number;
  /** Evidence-based rollup from subtopic masteries; null until first quiz. */
  demonstratedMarkPct: number | null;
  /** Best estimate for recommendations (demonstrated when set). */
  effectiveMarkPct: number;
  targetMarkPct: number;
  examDays: number | null;
  examAt: Date | null;
};

/** Per-subtopic knowledge + behaviour signals used by the recommendation engine. */
export type TopicMasteryState = {
  subtopicId: string;
  subtopicSlug: string;
  subtopicName: string;
  topicId: string;
  topicSlug: string;
  topicName: string;
  topicImportance: number;
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  prerequisiteSubtopicId: string | null;
  masteryPct: number;
  questionsAttempted: number;
  questionsCorrect: number;
  confidencePct: number | null;
  selfConfidence: StudySelfConfidence | null;
  lastPracticedAt: Date | null;
  /** Last N attempt outcomes (newest first), 0–100 each. */
  recentAttemptScores: number[];
  /** Last completed session scores on this subtopic (percent correct). */
  recentSessionScores: number[];
  improvementTrend: number | null;
  avgDifficultyCorrect: number | null;
  avgDifficultyAttempted: number | null;
  questionCount: number;
  officialQuestionCount: number;
  sessionsCompleted: number;
  sessionsAbandoned: number;
};

export type LearnerBehaviourSummary = {
  totalSessionsCompleted: number;
  totalSessionsAbandoned: number;
  typicalSessionMinutes: number | null;
  currentStreakDays: number;
  subtopicsAvoided: string[];
  subtopicsRepeated: string[];
};

/** Full snapshot the recommendation engine consumes — built from DB activity. */
export type LearningState = {
  profile: LearnerProfile;
  topics: TopicMasteryState[];
  behaviour: LearnerBehaviourSummary;
  generatedAt: Date;
};

export type StudyRecommendation = {
  action: StudyRecommendationAction;
  subtopicId: string;
  subtopicSlug: string;
  subtopicName: string;
  topicSlug: string;
  topicName: string;
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  estimatedMinutes: number;
  priorityScore: number;
  reasonSummary: string;
  reasonDetail: string[];
  /** Calm closing line for “Why this one?” */
  reasonEncouragement: string;
  examDays: number | null;
  masteryPct: number;
  suggestedQuizMode: "all" | "official" | "practice";
  suggestedQuizPick: "default" | "harder" | "easier";
};
