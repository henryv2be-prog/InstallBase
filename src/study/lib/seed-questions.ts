import {
  StudyContentSourceKind,
  StudyOfficialVerificationStatus,
  StudyQuestionType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { importOfficialNscFromManifest } from "@/study/lib/nsc-import/import-from-manifest";
import { loadNscImportManifest } from "@/study/lib/nsc-import/load-manifest";
import { PRACTICE_QUESTIONS } from "@/study/data/practice-questions";
import { loadCapsPracticeBankQuestions } from "@/study/lib/load-caps-practice-bank";
import { seedGeneratedPracticeQuestions } from "@/study/lib/generated-practice/seed-generated-practice";
import { buildAllValidatedGeneratedDrafts } from "@/study/lib/generated-practice/build-all-drafts";

type QuestionSeed = {
  seedKey: string;
  subjectSlug: string;
  topicSlug: string;
  subtopicSlug: string;
  type?: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  difficulty: number;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  correctAnswerText?: string;
  acceptableAnswers?: string[];
};

function allPracticeSeeds(): QuestionSeed[] {
  return [...PRACTICE_QUESTIONS, ...loadCapsPracticeBankQuestions()];
}

async function upsertPracticeQuestion(q: QuestionSeed) {
  const subject = await prisma.studySubject.findUnique({ where: { slug: q.subjectSlug } });
  if (!subject) return;

  const curriculum = await prisma.studyCurriculum.findFirst({
    where: { subjectId: subject.id },
  });
  if (!curriculum) return;

  const topic = await prisma.studyTopic.findUnique({
    where: { curriculumId_slug: { curriculumId: curriculum.id, slug: q.topicSlug } },
  });
  if (!topic) return;

  const subtopic = await prisma.studySubtopic.findUnique({
    where: { topicId_slug: { topicId: topic.id, slug: q.subtopicSlug } },
  });
  if (!subtopic) return;

  const type =
    q.type === "SHORT_ANSWER" ? StudyQuestionType.SHORT_ANSWER : StudyQuestionType.MULTIPLE_CHOICE;

  await prisma.studyQuestion.upsert({
    where: { sourceLabel: q.seedKey },
    create: {
      subjectId: subject.id,
      subtopicId: subtopic.id,
      type,
      difficulty: q.difficulty,
      prompt: q.prompt,
      options: q.options,
      correctOptionId: q.correctOptionId || "n/a",
      explanation: q.explanation,
      correctAnswerText: q.correctAnswerText ?? null,
      acceptableAnswers: q.acceptableAnswers ?? undefined,
      sourceKind: StudyContentSourceKind.PRACTICE,
      sourceLabel: q.seedKey,
      active: true,
    },
    update: {
      difficulty: q.difficulty,
      prompt: q.prompt,
      options: q.options,
      correctOptionId: q.correctOptionId || "n/a",
      explanation: q.explanation,
      correctAnswerText: q.correctAnswerText ?? null,
      acceptableAnswers: q.acceptableAnswers ?? undefined,
      active: true,
    },
  });
}

export async function seedPracticeQuestions() {
  for (const q of allPracticeSeeds()) {
    await upsertPracticeQuestion(q);
  }
}

export async function seedOfficialNscQuestionBank() {
  return importOfficialNscFromManifest(prisma);
}

export async function seedAllStudyQuestions() {
  await seedPracticeQuestions();
  await seedGeneratedPracticeQuestions(prisma);
  await seedOfficialNscQuestionBank();
}

export async function ensurePracticeQuestions() {
  const practiceCount = await prisma.studyQuestion.count({
    where: { active: true, sourceKind: StudyContentSourceKind.PRACTICE },
  });
  const verifiedOfficial = await prisma.studyQuestion.count({
    where: {
      active: true,
      sourceKind: StudyContentSourceKind.OFFICIAL_PAST_PAPER,
      verificationStatus: StudyOfficialVerificationStatus.VERIFIED,
    },
  });

  const manifest = loadNscImportManifest();

  const practiceTarget = allPracticeSeeds().length;
  if (practiceCount < practiceTarget) {
    await seedPracticeQuestions();
  }
  const generatedTarget = buildAllValidatedGeneratedDrafts().length;
  const generatedCount = await prisma.studyQuestion.count({
    where: { active: true, sourceKind: StudyContentSourceKind.GENERATED_PRACTICE },
  });
  if (generatedCount < generatedTarget) {
    await seedGeneratedPracticeQuestions(prisma);
  }
  const batchRecords = await prisma.studyQuestionImportBatch.count();
  if (batchRecords < manifest.batches.length || verifiedOfficial < 5) {
    await seedOfficialNscQuestionBank();
  }
}
