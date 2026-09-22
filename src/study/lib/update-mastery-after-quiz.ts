import "server-only";
import { prisma } from "@/lib/prisma";
import {
  computeMasteryPct,
  priorityBandForMastery,
  priorityScoreForTopic,
} from "@/study/lib/mastery";
import { rollupDemonstratedMarksForLearner } from "@/study/lib/rollup-subject-demonstrated-mark";

function sessionScorePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export async function updateMasteryAfterQuiz(params: {
  learnerId: string;
  subtopicId: string;
  sessionCorrect: number;
  sessionTotal: number;
}) {
  const { learnerId, subtopicId, sessionCorrect, sessionTotal } = params;

  const recentSessions = await prisma.studyAssessmentSession.findMany({
    where: { learnerId, subtopicId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 5,
    include: { attempts: { select: { isCorrect: true } } },
  });

  const recentSessionScores = recentSessions.map((s) => {
    const total = s.attempts.length;
    const correct = s.attempts.filter((a) => a.isCorrect).length;
    return sessionScorePercent(correct, total);
  });

  const existing = await prisma.studyMastery.findUnique({
    where: { learnerId_subtopicId: { learnerId, subtopicId } },
    include: {
      subtopic: { include: { topic: true } },
    },
  });

  const questionsAttempted = (existing?.questionsAttempted ?? 0) + sessionTotal;
  const questionsCorrect = (existing?.questionsCorrect ?? 0) + sessionCorrect;
  const masteryPct = computeMasteryPct({
    questionsAttempted,
    questionsCorrect,
    confidencePct: existing?.confidencePct ?? null,
    recentSessionScores,
  });
  const priorityBand = priorityBandForMastery(masteryPct);
  const priorityScore = priorityScoreForTopic(
    masteryPct,
    existing?.subtopic.topic.importance ?? 1,
  );

  await prisma.studyMastery.upsert({
    where: { learnerId_subtopicId: { learnerId, subtopicId } },
    create: {
      learnerId,
      subtopicId,
      masteryPct,
      questionsAttempted,
      questionsCorrect,
      lastPracticedAt: new Date(),
      priorityBand,
      priorityScore,
    },
    update: {
      masteryPct,
      questionsAttempted,
      questionsCorrect,
      lastPracticedAt: new Date(),
      priorityBand,
      priorityScore,
    },
  });

  await rollupDemonstratedMarksForLearner(learnerId);

  return { masteryPct, questionsAttempted, questionsCorrect, priorityBand };
}
