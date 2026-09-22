import "server-only";
import { StudyRecommendationAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildLearningState } from "@/study/lib/learner-model/build-learning-state";
import type { LearningState, StudyRecommendation } from "@/study/lib/learner-model/types";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { en } from "@/study/i18n/messages/en";
import {
  candidateToRecommendation,
  recommendFromLearningState,
  scoreRecommendationCandidates,
} from "@/study/lib/recommendation/score-candidates";
import { loadRecommendationFeedback } from "@/study/lib/recommendation/feedback";
import { getWeeklyStudyFocus } from "@/study/lib/recommendation/weekly-study-focus";
import type { WeeklyStudyFocus } from "@/study/lib/recommendation/weekly-study-focus";
import { getOrBuildTodayStudyPlan } from "@/study/lib/study-plan/build-today-plan";
import type { TodayStudyPlan } from "@/study/lib/study-plan/build-today-plan";

export async function getLearningStateForLearner(learnerId: string) {
  return buildLearningState(learnerId);
}

export async function getNextStudyRecommendation(learnerId: string): Promise<StudyRecommendation | null> {
  const [{ locale, t }, state, feedback] = await Promise.all([
    getStudyMessages(),
    buildLearningState(learnerId),
    loadRecommendationFeedback(learnerId),
  ]);
  if (!state) return null;
  return recommendFromLearningState(state, t.recommendation, locale, feedback);
}

export async function getTodayStudyPlanForLearner(learnerId: string): Promise<TodayStudyPlan | null> {
  return getOrBuildTodayStudyPlan(learnerId);
}

export async function getWeeklyFocusForLearner(learnerId: string): Promise<WeeklyStudyFocus | null> {
  const [{ locale, t }, state] = await Promise.all([
    getStudyMessages(),
    buildLearningState(learnerId),
  ]);
  if (!state) return null;
  return getWeeklyStudyFocus(state, t.recommendation, locale);
}

/** For tests and diagnostics — rank all candidates. */
export function rankRecommendations(state: LearningState) {
  return scoreRecommendationCandidates(state, en.recommendation).map((c) =>
    candidateToRecommendation(c, state, en.recommendation),
  );
}

const SHOWN_COOLDOWN_MS = 60 * 60 * 1000;

export async function logRecommendationShown(
  learnerId: string,
  recommendation: StudyRecommendation,
): Promise<string | null> {
  const recent = await prisma.studyRecommendationLog.findFirst({
    where: {
      learnerId,
      subtopicId: recommendation.subtopicId,
      shownAt: { gte: new Date(Date.now() - SHOWN_COOLDOWN_MS) },
    },
    orderBy: { shownAt: "desc" },
  });
  if (recent) return recent.id;

  const row = await prisma.studyRecommendationLog.create({
    data: {
      learnerId,
      subtopicId: recommendation.subtopicId,
      action: recommendation.action,
      reasonSummary: recommendation.reasonSummary,
      reasonDetail: recommendation.reasonDetail,
      priorityScore: recommendation.priorityScore,
    },
  });
  return row.id;
}

export async function markRecommendationFollowed(params: {
  learnerId: string;
  subtopicId: string;
  sessionId: string;
}) {
  const open = await prisma.studyRecommendationLog.findFirst({
    where: {
      learnerId: params.learnerId,
      subtopicId: params.subtopicId,
      followedAt: null,
    },
    orderBy: { shownAt: "desc" },
  });

  if (open) {
    await prisma.studyRecommendationLog.update({
      where: { id: open.id },
      data: { followedAt: new Date(), sessionId: params.sessionId },
    });
    return;
  }

  await prisma.studyRecommendationLog.create({
    data: {
      learnerId: params.learnerId,
      subtopicId: params.subtopicId,
      action: StudyRecommendationAction.PRACTICE_TOPIC,
      reasonSummary: "Learner started practice without a logged suggestion.",
      reasonDetail: [],
      priorityScore: 0,
      followedAt: new Date(),
      sessionId: params.sessionId,
    },
  });
}

export async function dismissStudyRecommendation(params: {
  learnerId: string;
  subtopicId: string;
  recommendationLogId?: string | null;
}) {
  const now = new Date();
  if (params.recommendationLogId) {
    await prisma.studyRecommendationLog.updateMany({
      where: {
        id: params.recommendationLogId,
        learnerId: params.learnerId,
        dismissedAt: null,
      },
      data: { dismissedAt: now },
    });
    return;
  }

  const open = await prisma.studyRecommendationLog.findFirst({
    where: {
      learnerId: params.learnerId,
      subtopicId: params.subtopicId,
      dismissedAt: null,
    },
    orderBy: { shownAt: "desc" },
  });

  if (open) {
    await prisma.studyRecommendationLog.update({
      where: { id: open.id },
      data: { dismissedAt: now },
    });
    return;
  }

  await prisma.studyRecommendationLog.create({
    data: {
      learnerId: params.learnerId,
      subtopicId: params.subtopicId,
      action: StudyRecommendationAction.PRACTICE_TOPIC,
      reasonSummary: "Learner dismissed this suggestion.",
      reasonDetail: [],
      priorityScore: 0,
      dismissedAt: now,
    },
  });

  await prisma.studyPlanItem.deleteMany({
    where: {
      subtopicId: params.subtopicId,
      planDay: { learnerId: params.learnerId, planDate: startOfToday() },
    },
  });
}

function startOfToday(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
