import "server-only";
import { prisma } from "@/lib/prisma";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { buildLearningState } from "@/study/lib/learner-model/build-learning-state";
import { estimateSessionMinutes } from "@/study/lib/home-helpers";
import { loadRecommendationFeedback } from "@/study/lib/recommendation/feedback";
import {
  candidateToRecommendation,
  scoreRecommendationCandidates,
} from "@/study/lib/recommendation/score-candidates";
import { QUIZ_SIZE } from "@/study/lib/quiz-types";

export type TodayPlanItem = {
  subtopicId: string;
  subtopicName: string;
  subjectName: string;
  subjectSlug: string;
  allocatedMinutes: number;
  reasonSummary: string;
};

export type TodayStudyPlan = {
  planDate: string;
  availableMinutes: number;
  usedMinutes: number;
  items: TodayPlanItem[];
};

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getOrBuildTodayStudyPlan(learnerId: string): Promise<TodayStudyPlan | null> {
  const planDate = startOfTodayUtc();

  const existing = await prisma.studyPlanDay.findUnique({
    where: { learnerId_planDate: { learnerId, planDate } },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          subtopic: {
            include: {
              topic: { include: { curriculum: { include: { subject: true } } } },
            },
          },
          learnerSubject: { include: { subject: true } },
        },
      },
    },
  });

  if (existing && existing.items.length > 0) {
    const usedMinutes = existing.items.reduce((s, i) => s + i.allocatedMinutes, 0);
    return {
      planDate: planDate.toISOString().slice(0, 10),
      availableMinutes: existing.availableMinutes,
      usedMinutes,
      items: existing.items.map((item) => ({
        subtopicId: item.subtopicId,
        subtopicName: item.subtopic.name,
        subjectName: item.learnerSubject.subject.name,
        subjectSlug: item.learnerSubject.subject.slug,
        allocatedMinutes: item.allocatedMinutes,
        reasonSummary: item.notes ?? "",
      })),
    };
  }

  const learner = await prisma.studyLearner.findUnique({
    where: { id: learnerId },
    select: { defaultAvailableMinutes: true },
  });
  if (!learner) return null;

  const budget = Math.max(15, Math.min(240, learner.defaultAvailableMinutes));
  const [{ locale, t }, state, feedback] = await Promise.all([
    getStudyMessages(),
    buildLearningState(learnerId),
    loadRecommendationFeedback(learnerId),
  ]);
  if (!state) return null;

  const scored = scoreRecommendationCandidates(state, t.recommendation, locale, feedback);
  const items: TodayPlanItem[] = [];
  let remaining = budget;
  let sortOrder = 0;

  const learnerSubjects = await prisma.studyLearnerSubject.findMany({
    where: { learnerId },
    select: { id: true, subjectId: true, subject: { select: { name: true, slug: true } } },
  });
  const learnerSubjectBySubjectId = new Map(learnerSubjects.map((ls) => [ls.subjectId, ls]));

  for (const candidate of scored) {
    if (remaining < 15) break;
    const est = estimateSessionMinutes(
      Math.min(QUIZ_SIZE, candidate.topic.questionCount),
    );
    const alloc = Math.min(remaining, Math.max(15, est));
    const rec = candidateToRecommendation(candidate, state, t.recommendation, locale);
    const ls = learnerSubjectBySubjectId.get(candidate.topic.subjectId);
    if (!ls) continue;

    items.push({
      subtopicId: rec.subtopicId,
      subtopicName: rec.subtopicName,
      subjectName: rec.subjectName,
      subjectSlug: rec.subjectSlug,
      allocatedMinutes: alloc,
      reasonSummary: rec.reasonSummary,
    });

    remaining -= alloc;
    sortOrder += 1;
    if (items.length >= 4) break;
  }

  if (items.length === 0) return null;

  const planDay = await prisma.studyPlanDay.upsert({
    where: { learnerId_planDate: { learnerId, planDate } },
    create: { learnerId, planDate, availableMinutes: budget },
    update: { availableMinutes: budget },
  });

  await prisma.studyPlanItem.deleteMany({ where: { planDayId: planDay.id } });

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    const topicState = state.topics.find((t) => t.subtopicId === item.subtopicId);
    const ls = topicState ? learnerSubjectBySubjectId.get(topicState.subjectId) : null;
    if (!ls) continue;
    await prisma.studyPlanItem.create({
      data: {
        planDayId: planDay.id,
        learnerSubjectId: ls.id,
        subtopicId: item.subtopicId,
        allocatedMinutes: item.allocatedMinutes,
        sortOrder: i,
        notes: item.reasonSummary,
      },
    });
  }

  const usedMinutes = items.reduce((s, i) => s + i.allocatedMinutes, 0);
  return {
    planDate: planDate.toISOString().slice(0, 10),
    availableMinutes: budget,
    usedMinutes,
    items,
  };
}
