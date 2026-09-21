import { StudyContentSourceKind, StudyQuestionType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { OFFICIAL_NSC_QUESTIONS } from "@/study/data/official-nsc-questions";
import { PRACTICE_QUESTIONS } from "@/study/data/practice-questions";

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
  sourceKind: StudyContentSourceKind;
  sourceYear?: number;
  sourcePaperNumber?: number;
  sourceQuestionRef?: string;
  officialSourceUrl?: string;
  correctAnswerText?: string;
  acceptableAnswers?: string[];
};

async function upsertQuestion(q: QuestionSeed) {
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

  const existing = await prisma.studyQuestion.findFirst({
    where: { sourceLabel: q.seedKey },
  });

  const type =
    q.type === "SHORT_ANSWER" ? StudyQuestionType.SHORT_ANSWER : StudyQuestionType.MULTIPLE_CHOICE;

  const data = {
    subjectId: subject.id,
    subtopicId: subtopic.id,
    type,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options,
    correctOptionId: q.correctOptionId || "n/a",
    explanation: q.explanation,
    sourceKind: q.sourceKind,
    sourceLabel: q.seedKey,
    sourceYear: q.sourceYear ?? null,
    sourcePaperNumber: q.sourcePaperNumber ?? null,
    sourceQuestionRef: q.sourceQuestionRef ?? null,
    officialSourceUrl: q.officialSourceUrl ?? null,
    correctAnswerText: q.correctAnswerText ?? null,
    acceptableAnswers: q.acceptableAnswers ?? undefined,
    active: true,
  };

  if (existing) {
    await prisma.studyQuestion.update({ where: { id: existing.id }, data });
  } else {
    await prisma.studyQuestion.create({ data });
  }
}

export async function seedPracticeQuestions() {
  for (const q of PRACTICE_QUESTIONS) {
    await upsertQuestion({
      ...q,
      sourceKind: StudyContentSourceKind.PRACTICE,
    });
  }
}

export async function seedOfficialNscQuestions() {
  for (const q of OFFICIAL_NSC_QUESTIONS) {
    await upsertQuestion({
      ...q,
      sourceKind: StudyContentSourceKind.OFFICIAL_PAST_PAPER,
    });
  }
}

export async function seedAllStudyQuestions() {
  await seedPracticeQuestions();
  await seedOfficialNscQuestions();
}

export async function ensurePracticeQuestions() {
  const officialCount = await prisma.studyQuestion.count({
    where: { active: true, sourceKind: StudyContentSourceKind.OFFICIAL_PAST_PAPER },
  });
  const practiceCount = await prisma.studyQuestion.count({
    where: { active: true, sourceKind: StudyContentSourceKind.PRACTICE },
  });

  if (practiceCount < PRACTICE_QUESTIONS.length) {
    await seedPracticeQuestions();
  }
  if (officialCount < OFFICIAL_NSC_QUESTIONS.length) {
    await seedOfficialNscQuestions();
  }
}
