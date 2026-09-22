import {
  StudyContentSourceKind,
  StudyOfficialVerificationStatus,
  StudyQuestionType,
  type PrismaClient,
} from "@/generated/prisma/client";
import { mapExamSession, mapVerificationStatus } from "@/study/lib/nsc-import/map-enums";
import { nscImportBatchSchema, type NscImportBatchFile } from "@/study/lib/nsc-import/types";

export type ImportBatchResult = {
  batchSlug: string;
  paperId: string;
  questionsUpserted: number;
  verificationStatus: string;
};

export function parseNscImportBatch(raw: unknown): NscImportBatchFile {
  return nscImportBatchSchema.parse(raw);
}

export async function importOfficialNscBatch(
  prisma: PrismaClient,
  raw: unknown,
): Promise<ImportBatchResult> {
  const batch = parseNscImportBatch(raw);
  const batchId = batch.batchSlug;
  const verificationStatus = mapVerificationStatus(batch.verification.status);
  const verifiedAt =
    batch.verification.status === "verified"
      ? batch.verification.verifiedAt
        ? new Date(batch.verification.verifiedAt)
        : new Date()
      : null;

  await prisma.studyQuestionImportBatch.upsert({
    where: { id: batchId },
    create: {
      id: batchId,
      slug: batch.batchSlug,
      label: batch.label,
      sourceDocumentTitle: batch.sourceDocumentTitle,
      verificationStatus,
      verifiedAt,
      verificationNotes: batch.verification.notes ?? null,
    },
    update: {
      label: batch.label,
      sourceDocumentTitle: batch.sourceDocumentTitle,
      verificationStatus,
      verifiedAt,
      verificationNotes: batch.verification.notes ?? null,
    },
  });

  const subject = await prisma.studySubject.findUnique({
    where: { slug: batch.paper.subjectSlug },
  });
  if (!subject) {
    throw new Error(`Unknown subject slug: ${batch.paper.subjectSlug}`);
  }

  const paper = await prisma.studyNscPaper.upsert({
    where: { importBatchId: batchId },
    create: {
      subjectId: subject.id,
      examYear: batch.paper.examYear,
      examSession: mapExamSession(batch.paper.examSession),
      paperNumber: batch.paper.paperNumber,
      title: batch.paper.title,
      questionPaperUrl: batch.paper.questionPaperUrl ?? null,
      memorandumUrl: batch.paper.memorandumUrl ?? null,
      dbePortalUrl: batch.paper.dbePortalUrl,
      importBatchId: batchId,
    },
    update: {
      title: batch.paper.title,
      questionPaperUrl: batch.paper.questionPaperUrl ?? null,
      memorandumUrl: batch.paper.memorandumUrl ?? null,
      dbePortalUrl: batch.paper.dbePortalUrl,
    },
  });

  const curriculum = await prisma.studyCurriculum.findFirst({ where: { subjectId: subject.id } });
  if (!curriculum) {
    throw new Error(`No curriculum for subject ${batch.paper.subjectSlug}`);
  }

  let questionsUpserted = 0;

  for (const q of batch.questions) {
    const topic = await prisma.studyTopic.findUnique({
      where: { curriculumId_slug: { curriculumId: curriculum.id, slug: q.topicSlug } },
    });
    if (!topic) {
      throw new Error(
        `Unknown topic ${q.topicSlug} for ${batch.paper.subjectSlug} (batch ${batch.batchSlug})`,
      );
    }

    const subtopic = await prisma.studySubtopic.findUnique({
      where: { topicId_slug: { topicId: topic.id, slug: q.subtopicSlug } },
    });
    if (!subtopic) {
      throw new Error(
        `Unknown subtopic ${q.subtopicSlug} under ${q.topicSlug} (batch ${batch.batchSlug})`,
      );
    }

    const sourceLabel = `${batch.batchSlug}:${q.sourceQuestionRef}`;
    const type =
      q.type === "SHORT_ANSWER" ? StudyQuestionType.SHORT_ANSWER : StudyQuestionType.MULTIPLE_CHOICE;

    const active = verificationStatus !== StudyOfficialVerificationStatus.REJECTED;

    await prisma.studyQuestion.upsert({
      where: { sourceLabel },
      create: {
        subjectId: subject.id,
        subtopicId: subtopic.id,
        nscPaperId: paper.id,
        importBatchId: batchId,
        type,
        difficulty: q.difficulty,
        prompt: q.prompt,
        options: q.options,
        correctOptionId: q.correctOptionId || "n/a",
        explanation: q.explanation ?? null,
        sourceKind: StudyContentSourceKind.OFFICIAL_PAST_PAPER,
        sourceLabel,
        sourceYear: batch.paper.examYear,
        sourcePaperNumber: batch.paper.paperNumber,
        sourceQuestionRef: q.sourceQuestionRef,
        officialSourceUrl: batch.paper.dbePortalUrl,
        correctAnswerText: q.correctAnswerText ?? null,
        acceptableAnswers: q.acceptableAnswers ?? undefined,
        verificationStatus,
        active,
      },
      update: {
        subtopicId: subtopic.id,
        nscPaperId: paper.id,
        importBatchId: batchId,
        type,
        difficulty: q.difficulty,
        prompt: q.prompt,
        options: q.options,
        correctOptionId: q.correctOptionId || "n/a",
        explanation: q.explanation ?? null,
        sourceYear: batch.paper.examYear,
        sourcePaperNumber: batch.paper.paperNumber,
        sourceQuestionRef: q.sourceQuestionRef,
        officialSourceUrl: batch.paper.dbePortalUrl,
        correctAnswerText: q.correctAnswerText ?? null,
        acceptableAnswers: q.acceptableAnswers ?? undefined,
        verificationStatus,
        active,
      },
    });
    questionsUpserted += 1;
  }

  return {
    batchSlug: batch.batchSlug,
    paperId: paper.id,
    questionsUpserted,
    verificationStatus,
  };
}
