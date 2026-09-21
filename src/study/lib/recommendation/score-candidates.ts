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
  reasonEncouragement: string;
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

/** Shared urgency curve for recommendations and weekly focus (0.35–1). */
export function examUrgencyMultiplier(days: number | null): number {
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

const HIGH_IMPORTANCE = 1.15;

function buildWhyExplanation(params: {
  focus: TopicMasteryState;
  requested: TopicMasteryState;
  prereq: TopicMasteryState | null;
  action: StudyRecommendationAction;
  subjectMarkGap: number;
  target: number;
  current: number;
  examDays: number | null;
  copy: RecommendationCopy;
  locale: StudyLocale;
}): { reasonDetail: string[]; reasonEncouragement: string } {
  const {
    focus,
    requested,
    prereq,
    action,
    subjectMarkGap,
    target,
    current,
    examDays,
    copy,
    locale,
  } = params;

  const focusLabels = topicLabels(focus, locale);
  const requestedLabels = topicLabels(requested, locale);
  const reasonDetail: string[] = [];

  reasonDetail.push(
    copy.subjectMarkGap(
      focusLabels.subjectName,
      current,
      target,
      subjectMarkGap,
    ),
  );

  reasonDetail.push(
    copy.topicLevel(
      focusLabels.subtopicName,
      Math.round(focus.masteryPct),
      target,
    ),
  );

  if (focus.topicImportance >= HIGH_IMPORTANCE) {
    reasonDetail.push(copy.highExamWeight(focusLabels.topicName));
  } else if (focus.topicImportance >= 1.08) {
    reasonDetail.push(copy.solidExamWeight(focusLabels.topicName));
  }

  if (examDays != null) {
    reasonDetail.push(copy.examCountdown(focusLabels.subjectName, examDays));
  } else {
    reasonDetail.push(copy.examDateUnknown(focusLabels.subjectName));
  }

  if (focus.questionsAttempted === 0) {
    reasonDetail.push(copy.noBaseline());
  } else if (focus.questionsAttempted < 6) {
    reasonDetail.push(copy.lightPractice(focus.questionsAttempted));
  } else if (focus.masteryPct < WEAK_MASTERY) {
    reasonDetail.push(copy.bigGap(Math.round(focus.masteryPct)));
  } else if (focus.improvementTrend != null && focus.improvementTrend > 8) {
    reasonDetail.push(copy.improving());
  }

  if (action === StudyRecommendationAction.REVISIT_PREREQUISITE && prereq) {
    const prereqLabels = topicLabels(prereq, locale);
    reasonDetail.push(
      copy.strengthenPrereq(
        prereqLabels.subtopicName,
        Math.round(prereq.masteryPct),
        requestedLabels.subtopicName,
      ),
    );
  } else if (
    requested.recentAttemptScores.length >= 3 &&
    focus.subtopicId === requested.subtopicId
  ) {
    const lastThree = requested.recentAttemptScores.slice(0, 3);
    const avg = Math.round(lastThree.reduce((a, b) => a + b, 0) / lastThree.length);
    if (avg < 55) {
      reasonDetail.push(copy.recentAttemptsLow(lastThree.length, avg));
    }
  }

  const reasonEncouragement = copy.encouragement(
    focusLabels.subtopicName,
    subjectMarkGap,
    examDays,
    focus.questionsAttempted === 0,
  );

  return { reasonDetail, reasonEncouragement };
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

    const subjectMarkGap = Math.max(0, target - current);
    const focusGap = Math.max(0, target - focus.masteryPct);
    const importance = focus.topicImportance;
    const urgency = examUrgencyMultiplier(examDays);
    const recentPenalty = recentPerformancePenalty(focus.recentAttemptScores);
    const stale = Math.min(1, daysSince(focus.lastPracticedAt, now) / 14);
    const neverPractised = focus.questionsAttempted === 0;
    const lowPractice = focus.questionsAttempted > 0 && focus.questionsAttempted < 6;

    const practiceBoost = neverPractised ? 14 : lowPractice ? 6 : 0;
    const prereqBoost =
      action === StudyRecommendationAction.REVISIT_PREREQUISITE ? focusGap * 0.3 : 0;

    const returnScore =
      subjectMarkGap * 0.42 +
      focusGap * 0.48 +
      (importance - 1) * 18 +
      practiceBoost +
      recentPenalty * 12 +
      stale * 6 +
      confidenceBoost * 14 +
      trendBoost * 10 +
      prereqBoost;

    const priorityScore =
      returnScore * (0.45 + urgency * 0.55) - (focus.masteryPct > STRONG_MASTERY ? 12 : 0);

    const { reasonDetail, reasonEncouragement } = buildWhyExplanation({
      focus,
      requested: topic,
      prereq,
      action,
      subjectMarkGap,
      target,
      current,
      examDays,
      copy,
      locale,
    });

    candidates.push({
      topic: focus,
      action,
      priorityScore: Math.round(priorityScore * 100) / 100,
      reasonDetail,
      reasonEncouragement,
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
    reasonEncouragement: candidate.reasonEncouragement,
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
