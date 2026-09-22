import "server-only";
import { prisma } from "@/lib/prisma";
import { computeDemonstratedMarkPct } from "@/study/lib/demonstrated-mark";

export { computeDemonstratedMarkPct } from "@/study/lib/demonstrated-mark";

export async function rollupDemonstratedMarksForLearner(learnerId: string) {
  const learnerSubjects = await prisma.studyLearnerSubject.findMany({
    where: { learnerId },
    select: { id: true, subjectId: true },
  });

  for (const ls of learnerSubjects) {
    const masteries = await prisma.studyMastery.findMany({
      where: {
        learnerId,
        subtopic: { topic: { curriculum: { subjectId: ls.subjectId } } },
      },
      include: {
        subtopic: { include: { topic: { select: { importance: true } } } },
      },
    });

    const demonstrated = computeDemonstratedMarkPct(
      masteries.map((m) => ({
        masteryPct: m.masteryPct,
        importance: m.subtopic.topic.importance,
      })),
    );

    await prisma.studyLearnerSubject.update({
      where: { id: ls.id },
      data: { demonstratedMarkPct: demonstrated },
    });
  }
}
