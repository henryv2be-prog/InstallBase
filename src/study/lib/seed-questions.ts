import { StudyContentSourceKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PRACTICE_QUESTIONS } from "@/study/data/practice-questions";

export async function seedPracticeQuestions() {
  for (const q of PRACTICE_QUESTIONS) {
    const subject = await prisma.studySubject.findUnique({ where: { slug: q.subjectSlug } });
    if (!subject) continue;

    const curriculum = await prisma.studyCurriculum.findFirst({
      where: { subjectId: subject.id },
    });
    if (!curriculum) continue;

    const topic = await prisma.studyTopic.findUnique({
      where: { curriculumId_slug: { curriculumId: curriculum.id, slug: q.topicSlug } },
    });
    if (!topic) continue;

    const subtopic = await prisma.studySubtopic.findUnique({
      where: { topicId_slug: { topicId: topic.id, slug: q.subtopicSlug } },
    });
    if (!subtopic) continue;

    const existing = await prisma.studyQuestion.findFirst({
      where: { sourceLabel: q.seedKey },
    });

    const data = {
      subjectId: subject.id,
      subtopicId: subtopic.id,
      difficulty: q.difficulty,
      prompt: q.prompt,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      sourceKind: StudyContentSourceKind.PRACTICE,
      sourceLabel: q.seedKey,
      active: true,
    };

    if (existing) {
      await prisma.studyQuestion.update({ where: { id: existing.id }, data });
    } else {
      await prisma.studyQuestion.create({ data });
    }
  }
}

export async function ensurePracticeQuestions() {
  const count = await prisma.studyQuestion.count({ where: { active: true } });
  if (count >= PRACTICE_QUESTIONS.length) return;
  await seedPracticeQuestions();
}
