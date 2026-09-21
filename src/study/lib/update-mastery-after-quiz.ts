import "server-only";
import { prisma } from "@/lib/prisma";
import {
  computeMasteryPct,
  priorityBandForMastery,
  priorityScoreForTopic,
} from "@/study/lib/mastery";

export async function updateMasteryAfterQuiz(params: {
  learnerId: string;
  subtopicId: string;
  sessionCorrect: number;
  sessionTotal: number;
}) {
  const { learnerId, subtopicId, sessionCorrect, sessionTotal } = params;

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

  return { masteryPct, questionsAttempted, questionsCorrect, priorityBand };
}
