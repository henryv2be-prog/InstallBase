import { StudyRecommendationAction } from "@/generated/prisma/client";
import {
  localizeSubjectName,
  localizeSubtopicName,
  localizeTopicName,
} from "@/study/i18n/localize-content";
import type { RecommendationCopy, StudyLocale } from "@/study/i18n/types";
import { en } from "@/study/i18n/messages/en";
import type { LearningState, StudyRecommendation, TopicMasteryState } from "@/study/lib/learner-model/types";
import { estimateSessionMinutes } from "@/study/lib/home-helpers";
import { QUIZ_SIZE } from "@/study/lib/quiz-types";

export type ScoredCandidate = {
  topic: TopicMasteryState;
  action: StudyRecommendationAction;
  priorityScore: number;
  reasonDetail: string[];
  suggestedQuizMode: "all" | "official" | "practice";
};

const PREREQ_MASTERY_THRESHOLD = 55;
const WEAK_MASTERY = 50;
const STRONG_MASTERY = 75;

function topicLabels(topic: TopicMasteryState, locale: StudyLocale) {
  return {
    subjectName: localizeSubjectName(locale, topic.subjectSlug, topic.subjectName),
    topicName: localizeTopicName(locale, topic.subjectSlug, topic.topicSlug, topic.topicName),
    subtopicName: localizeSubtopicName(
      locale,
      topic.subjectSlug,
      topic.topicSlug,
      topic.subtopicSlug,
      topic.subtopicName,
    ),
  };
}

function examUrgency(days: number | null): number {
  if (days == null) return 0.35;
  if (days <= 0) return 1;
  if (days <= 7) return 0.95;
  if (days <= 14) return 0.85;
  if (days <= 21) return 0.75;
  if (days <= 42) return 0.55;
  return 0.35;
}

function recentPerformancePenalty(scores: number[]): number {
  if (scores.length === 0) return 0;
  const last = scores.slice(0, 3);
  const avg = last.reduce((a, b) => a + b, 0) / last.length;
  if (avg < 40) return 1;
  if (avg < 50) return 0.85;
  if (avg < 60) return 0.5;
  return 0.15;
}

function daysSince(date: Date | null, now: Date): number {
  if (!date) return 999;
  return Math.floor((now.getTime() - date.getTime()) / (86400000));
}

function resolvePrerequisite(
  topic: TopicMasteryState,
  byId: Map<string, TopicMasteryState>,
): TopicMasteryState | null {
  if (!topic.prerequisiteSubtopicId) return null;
  return byId.get(topic.prerequisiteSubtopicId) ?? null;
}

function pickAction(
  topic: TopicMasteryState,
  prereq: TopicMasteryState | null,
  recentAvg: number | null,
): StudyRecommendationAction {
  if (
    prereq &&
    prereq.masteryPct < PREREQ_MASTERY_THRESHOLD &&
    topic.masteryPct < STRONG_MASTERY
  ) {
    const severelyOnTopic = topic.masteryPct < 45;
    const prereqVeryWeak = prereq.masteryPct < 40;
    if (prereqVeryWeak || !severelyOnTopic) {
      return StudyRecommendationAction.REVISIT_PREREQUISITE;
    }
  }

  if (topic.officialQuestionCount > 0 && topic.masteryPct >= 65 && recentAvg != null && recentAvg >= 70) {
    return StudyRecommendationAction.DO_PAST_PAPER;
  }

  if (
    topic.masteryPct >= 50 &&
    topic.masteryPct < STRONG_MASTERY &&
    topic.improvementTrend != null &&
    topic.improvementTrend > 5
  ) {
    return StudyRecommendationAction.TRY_HARDER_QUESTIONS;
  }

  if (topic.masteryPct >= STRONG_MASTERY && topic.recentSessionScores.length >= 2) {
    return StudyRecommendationAction.REVIEW_TOPIC;
  }

  if (topic.questionsAttempted === 0) {
    return StudyRecommendationAction.LEARN_CONCEPT;
  }

  return StudyRecommendationAction.PRACTICE_TOPIC;
}

function suggestedMode(
  action: StudyRecommendationAction,
  topic: TopicMasteryState,
): "all" | "official" | "practice" {
  if (action === StudyRecommendationAction.DO_PAST_PAPER && topic.officialQuestionCount > 0) {
    return "official";
  }
  if (action === StudyRecommendationAction.TRY_HARDER_QUESTIONS) {
    return "all";
  }
  return "all";
}

/** Deterministic ranking — same inputs always yield same order. */
export function scoreRecommendationCandidates(
  state: LearningState,
  copy: RecommendationCopy = en.recommendation,
  locale: StudyLocale = "en",
): ScoredCandidate[] {
  const now = state.generatedAt;
  const byId = new Map(state.topics.map((t) => [t.subtopicId, t]));
  const subjectById = new Map(state.profile.subjects.map((s) => [s.subjectId, s]));

  const candidates: ScoredCandidate[] = [];

  for (const topic of state.topics) {
    if (topic.questionCount === 0) continue;

    const subject = subjectById.get(topic.subjectId);
    const target = subject?.targetMarkPct ?? 70;
    const current = subject?.currentMarkPct ?? 55;
    const examDays = subject?.examDays ?? null;

    const prereq = resolvePrerequisite(topic, byId);
    const shouldRevisitPrereq =
      prereq &&
      prereq.masteryPct < PREREQ_MASTERY_THRESHOLD &&
      topic.masteryPct < STRONG_MASTERY &&
      (prereq.masteryPct < 40 || topic.masteryPct >= 45);

    const targetTopic = shouldRevisitPrereq ? prereq : topic;

    const masteryGap = Math.max(0, target - topic.masteryPct);
    const markGap = Math.max(0, target - current) * 0.15;
    const importance = topic.topicImportance;
    const urgency = examUrgency(examDays);
    const recentPenalty = recentPerformancePenalty(topic.recentAttemptScores);
    const stale = Math.min(1, daysSince(topic.lastPracticedAt, now) / 14) * 0.4;

    let confidenceBoost = 0;
    if (topic.selfConfidence === "DONT_UNDERSTAND") confidenceBoost = 0.25;
    if (topic.selfConfidence === "UNSURE") confidenceBoost = 0.12;
    if (topic.selfConfidence === "UNDERSTANDS" && topic.masteryPct > 70) confidenceBoost = -0.1;

    const trendBoost =
      topic.improvementTrend != null && topic.improvementTrend < -5 ? 0.2 : 0;

    const recentAvg =
      topic.recentAttemptScores.length > 0
        ? topic.recentAttemptScores.slice(0, 3).reduce((a, b) => a + b, 0) /
          Math.min(3, topic.recentAttemptScores.length)
        : null;

    const action = pickAction(topic, prereq, recentAvg);
    const focus = action === StudyRecommendationAction.REVISIT_PREREQUISITE ? prereq! : topic;

    const focusGap = Math.max(0, target - focus.masteryPct);
    const prereqBoost =
      action === StudyRecommendationAction.REVISIT_PREREQUISITE ? focusGap * 0.25 : 0;

    const priorityScore =
      (focusGap * 0.35 + markGap + importance * 12) * urgency +
      recentPenalty * 25 +
      stale * 10 +
      confidenceBoost * 20 +
      trendBoost * 15 +
      prereqBoost -
      (focus.masteryPct > STRONG_MASTERY ? 15 : 0);

    const reasonDetail: string[] = [];

    const topicDisplay = topicLabels(topic, locale);

    if (examDays != null && examDays <= 21) {
      reasonDetail.push(copy.examSoon(topicDisplay.subjectName, examDays));
    }

    if (action === StudyRecommendationAction.REVISIT_PREREQUISITE && prereq) {
      const prereqLabels = topicLabels(prereq, locale);
      reasonDetail.push(
        copy.strengthenPrereq(
          prereqLabels.subtopicName,
          Math.round(prereq.masteryPct),
          topicDisplay.subtopicName,
        ),
      );
    } else if (topic.recentAttemptScores.length >= 3) {
      const lastThree = topic.recentAttemptScores.slice(0, 3);
      const avg = Math.round(lastThree.reduce((a, b) => a + b, 0) / lastThree.length);
      if (avg < 50) {
        reasonDetail.push(copy.recentAttemptsLow(lastThree.length, avg));
      }
    }

    if (topic.masteryPct < WEAK_MASTERY && topic.questionsAttempted > 0) {
      reasonDetail.push(copy.bigGap(Math.round(topic.masteryPct)));
    } else if (topic.questionsAttempted === 0) {
      reasonDetail.push(copy.noBaseline());
    }

    if (topic.improvementTrend != null && topic.improvementTrend > 8) {
      reasonDetail.push(copy.improving());
    }

    if (reasonDetail.length === 0) {
      reasonDetail.push(copy.defaultReason());
    }

    candidates.push({
      topic: focus,
      action,
      priorityScore: Math.round(priorityScore * 100) / 100,
      reasonDetail,
      suggestedQuizMode: suggestedMode(action, topic),
    });
  }

  candidates.sort((a, b) => b.priorityScore - a.priorityScore);
  return candidates;
}

export function candidateToRecommendation(
  candidate: ScoredCandidate,
  state: LearningState,
  copy: RecommendationCopy = en.recommendation,
  locale: StudyLocale = "en",
): StudyRecommendation {
  const subject = state.profile.subjects.find((s) => s.subjectId === candidate.topic.subjectId);
  const labels = topicLabels(candidate.topic, locale);
  const summary =
    candidate.action === StudyRecommendationAction.REVISIT_PREREQUISITE
      ? copy.summaryStrengthen(labels.subtopicName)
      : candidate.reasonDetail[0] ?? copy.summaryFocus(labels.subtopicName);

  return {
    action: candidate.action,
    subtopicId: candidate.topic.subtopicId,
    subtopicSlug: candidate.topic.subtopicSlug,
    subtopicName: labels.subtopicName,
    topicSlug: candidate.topic.topicSlug,
    topicName: labels.topicName,
    subjectId: candidate.topic.subjectId,
    subjectSlug: candidate.topic.subjectSlug,
    subjectName: labels.subjectName,
    estimatedMinutes: estimateSessionMinutes(Math.min(QUIZ_SIZE, candidate.topic.questionCount)),
    priorityScore: candidate.priorityScore,
    reasonSummary: summary,
    reasonDetail: candidate.reasonDetail,
    examDays: subject?.examDays ?? null,
    masteryPct: candidate.topic.masteryPct,
    suggestedQuizMode: candidate.suggestedQuizMode,
  };
}

export function recommendFromLearningState(
  state: LearningState,
  copy: RecommendationCopy = en.recommendation,
  locale: StudyLocale = "en",
): StudyRecommendation | null {
  const scored = scoreRecommendationCandidates(state, copy, locale);
  const top = scored[0];
  if (!top) return null;
  return candidateToRecommendation(top, state, copy, locale);
}
