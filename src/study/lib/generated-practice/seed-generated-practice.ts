import {
  StudyContentSourceKind,
  StudyQuestionType,
  type PrismaClient,
} from "@/generated/prisma/client";
import { buildAllValidatedGeneratedDrafts } from "@/study/lib/generated-practice/build-all-drafts";
import type { GeneratedQuestionDraft } from "@/study/lib/generated-practice/types";
import { GENERATED_PRACTICE_MIN_PER_SUBTOPIC } from "@/study/lib/generated-practice/types";

async function resolveSubtopicId(
  prisma: PrismaClient,
  draft: GeneratedQuestionDraft,
): Promise<{ subjectId: string; subtopicId: string } | null> {
  const subject = await prisma.studySubject.findUnique({
    where: { slug: draft.curriculum.subjectSlug },
  });
  if (!subject) return null;

  const curriculum = await prisma.studyCurriculum.findFirst({
    where: { subjectId: subject.id },
  });
  if (!curriculum) return null;

  const topic = await prisma.studyTopic.findUnique({
    where: {
      curriculumId_slug: {
        curriculumId: curriculum.id,
        slug: draft.curriculum.topicSlug,
      },
    },
  });
  if (!topic) return null;

  const subtopic = await prisma.studySubtopic.findUnique({
    where: { topicId_slug: { topicId: topic.id, slug: draft.curriculum.subtopicSlug } },
  });
  if (!subtopic) return null;

  return { subjectId: subject.id, subtopicId: subtopic.id };
}

export type SeedGeneratedPracticeResult = {
  upserted: number;
  skippedValidation: number;
  skippedMissingCurriculum: number;
};

/**
 * Idempotent: upserts by unique sourceLabel. Does not touch official NSC rows.
 */
export async function seedGeneratedPracticeQuestions(
  prisma: PrismaClient,
): Promise<SeedGeneratedPracticeResult> {
  const drafts = buildAllValidatedGeneratedDrafts();
  let upserted = 0;
  let skippedValidation = 0;
  let skippedMissingCurriculum = 0;

  for (const draft of drafts) {
    const ids = await resolveSubtopicId(prisma, draft);
    if (!ids) {
      skippedMissingCurriculum += 1;
      continue;
    }

    await prisma.studyQuestion.upsert({
      where: { sourceLabel: draft.sourceLabel },
      create: {
        subjectId: ids.subjectId,
        subtopicId: ids.subtopicId,
        type: draft.type ?? StudyQuestionType.MULTIPLE_CHOICE,
        difficulty: draft.difficulty,
        prompt: draft.prompt,
        options: draft.options,
        correctOptionId: draft.correctOptionId,
        explanation: draft.explanation,
        sourceKind: StudyContentSourceKind.GENERATED_PRACTICE,
        sourceLabel: draft.sourceLabel,
        generatorMeta: draft.generatorMeta,
        verificationStatus: null,
        active: true,
      },
      update: {
        difficulty: draft.difficulty,
        prompt: draft.prompt,
        options: draft.options,
        correctOptionId: draft.correctOptionId,
        explanation: draft.explanation,
        generatorMeta: draft.generatorMeta,
        sourceKind: StudyContentSourceKind.GENERATED_PRACTICE,
        active: true,
      },
    });
    upserted += 1;
  }

  void skippedValidation;
  void GENERATED_PRACTICE_MIN_PER_SUBTOPIC;

  return { upserted, skippedValidation, skippedMissingCurriculum };
}
