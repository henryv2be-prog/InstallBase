import "server-only";
import { prisma } from "@/lib/prisma";

/** Seed mastery rows from onboarding current-mark estimates (updated later by assessments). */
export async function initializeLearnerMasteries(
  learnerId: string,
  subjectMarks: { subjectId: string; currentMarkPct: number }[],
) {
  for (const { subjectId, currentMarkPct } of subjectMarks) {
    const curriculum = await prisma.studyCurriculum.findFirst({
      where: { subjectId },
      include: {
        topics: { include: { subtopics: true } },
      },
    });
    if (!curriculum) continue;

    for (const topic of curriculum.topics) {
      for (const subtopic of topic.subtopics) {
        await prisma.studyMastery.upsert({
          where: {
            learnerId_subtopicId: { learnerId, subtopicId: subtopic.id },
          },
          create: {
            learnerId,
            subtopicId: subtopic.id,
            masteryPct: currentMarkPct,
            confidencePct: currentMarkPct,
            questionsAttempted: 0,
            questionsCorrect: 0,
          },
          update: {
            confidencePct: currentMarkPct,
          },
        });
      }
    }
  }
}
