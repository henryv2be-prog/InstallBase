import "server-only";
import { StudyRecommendationAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildLearningState } from "@/study/lib/learner-model/build-learning-state";
import type { LearningState, StudyRecommendation } from "@/study/lib/learner-model/types";
import {
  candidateToRecommendation,
  recommendFromLearningState,
  scoreRecommendationCandidates,
} from "@/study/lib/recommendation/score-candidates";

export async function getLearningStateForLearner(learnerId: string) {
  return buildLearningState(learnerId);
}

export async function getNextStudyRecommendation(learnerId: string): Promise<StudyRecommendation | null> {
  const state = await buildLearningState(learnerId);
  if (!state) return null;
  return recommendFromLearningState(state);
}

/** For tests and diagnostics — rank all candidates. */
export function rankRecommendations(state: LearningState) {
  return scoreRecommendationCandidates(state).map((c) => candidateToRecommendation(c, state));
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
