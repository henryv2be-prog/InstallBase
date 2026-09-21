"use server";

import { revalidatePath } from "next/cache";
import {
  StudyContentSourceKind,
  StudyOfficialVerificationStatus,
  StudyQuestionType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { answersMatch, buildShortAnswerPatterns } from "@/study/lib/answer-check";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { updateMasteryAfterQuiz } from "@/study/lib/update-mastery-after-quiz";
import { getWeakestMasteries } from "@/study/lib/queries";
import { QUIZ_SIZE, type QuizAnswerInput, type QuizMode, type QuizQuestionClient } from "@/study/lib/quiz-types";

export async function evaluateQuizAnswer(questionId: string, selectedOptionId: string) {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    return { ok: false as const, error: "Complete onboarding first." };
  }

  const question = await prisma.studyQuestion.findFirst({
    where: { id: questionId, active: true },
  });
  if (!question) {
    return { ok: false as const, error: "Question not found." };
  }

  let isCorrect = false;
  let correctDisplay = question.correctOptionId;

  if (question.type === StudyQuestionType.SHORT_ANSWER) {
    const patterns = buildShortAnswerPatterns(
      question.correctAnswerText ?? "",
      question.acceptableAnswers as string[] | undefined,
    );
    isCorrect = answersMatch(selectedOptionId, patterns);
    correctDisplay = question.correctAnswerText ?? "";
  } else {
    isCorrect = question.correctOptionId === selectedOptionId;
  }

  return {
    ok: true as const,
    isCorrect,
    explanation: question.explanation,
    correctDisplay,
  };
}

function sourceFilter(mode: QuizMode) {
  if (mode === "official") {
    return {
      sourceKind: StudyContentSourceKind.OFFICIAL_PAST_PAPER,
      verificationStatus: StudyOfficialVerificationStatus.VERIFIED,
    };
  }
  if (mode === "practice") {
    return { sourceKind: StudyContentSourceKind.PRACTICE };
  }
  return {};
}

export async function startSubtopicQuiz(subtopicId: string, mode: QuizMode = "all") {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    return { ok: false as const, error: "Complete onboarding first." };
  }

  const subtopic = await prisma.studySubtopic.findUnique({
    where: { id: subtopicId },
    include: {
      topic: { include: { curriculum: { include: { subject: true } } } },
    },
  });
  if (!subtopic) return { ok: false as const, error: "Topic not found." };

  const enrolled = learner.subjects.some(
    (s) => s.subjectId === subtopic.topic.curriculum.subjectId,
  );
  if (!enrolled) {
    return { ok: false as const, error: "This subject is not on your profile." };
  }

  const pool = await prisma.studyQuestion.findMany({
    where: { subtopicId, active: true, ...sourceFilter(mode) },
    orderBy: { createdAt: "asc" },
  });

  if (pool.length === 0) {
    const label =
      mode === "official"
        ? "No official NSC questions for this topic yet."
        : mode === "practice"
          ? "No practice questions for this topic yet."
          : "No questions for this topic yet.";
    return { ok: false as const, error: label };
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(QUIZ_SIZE, shuffled.length));

  const session = await prisma.studyAssessmentSession.create({
    data: { learnerId: learner.id, subtopicId },
  });

  return {
    ok: true as const,
    mode,
    sessionId: session.id,
    subtopicName: subtopic.name,
    topicName: subtopic.topic.name,
    subjectName: subtopic.topic.curriculum.subject.name,
    questionCount: selected.length,
    questions: selected.map(
      (q): QuizQuestionClient => ({
        id: q.id,
        type: q.type,
        sourceKind: q.sourceKind,
        sourceYear: q.sourceYear,
        sourcePaperNumber: q.sourcePaperNumber,
        sourceQuestionRef: q.sourceQuestionRef,
        officialSourceUrl: q.officialSourceUrl,
        prompt: q.prompt,
        options: q.options as { id: string; text: string }[],
        difficulty: q.difficulty,
      }),
    ),
  };
}

export async function completeSubtopicQuiz(sessionId: string, answers: QuizAnswerInput[]) {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    return { ok: false as const, error: "Complete onboarding first." };
  }

  const session = await prisma.studyAssessmentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.learnerId !== learner.id) {
    return { ok: false as const, error: "Quiz session not found." };
  }
  if (session.completedAt) {
    return { ok: false as const, error: "This quiz was already submitted." };
  }

  const masteryBefore = await prisma.studyMastery.findUnique({
    where: { learnerId_subtopicId: { learnerId: learner.id, subtopicId: session.subtopicId } },
  });
  const masteryBeforePct = masteryBefore?.masteryPct ?? null;

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.studyQuestion.findMany({
    where: {
      id: { in: questionIds },
      subtopicId: session.subtopicId,
      active: true,
    },
  });

  if (questions.length !== answers.length) {
    return { ok: false as const, error: "Invalid quiz submission." };
  }

  let correct = 0;
  const results: {
    questionId: string;
    prompt: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string | null;
    sourceKind: StudyContentSourceKind;
    isOfficial: boolean;
    sourceYear: number | null;
    sourcePaperNumber: number | null;
    sourceQuestionRef: string | null;
  }[] = [];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)!;
    let isCorrect = false;

    if (question.type === StudyQuestionType.SHORT_ANSWER) {
      const patterns = buildShortAnswerPatterns(
        question.correctAnswerText ?? "",
        question.acceptableAnswers as string[] | undefined,
      );
      isCorrect = answersMatch(answer.selectedOptionId, patterns);
    } else {
      isCorrect = question.correctOptionId === answer.selectedOptionId;
    }

    if (isCorrect) correct += 1;

    await prisma.studyQuestionAttempt.create({
      data: {
        learnerId: learner.id,
        questionId: question.id,
        sessionId: session.id,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
      },
    });

    results.push({
      questionId: question.id,
      prompt: question.prompt,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId:
        question.type === StudyQuestionType.SHORT_ANSWER
          ? (question.correctAnswerText ?? "")
          : question.correctOptionId,
      isCorrect,
      explanation: question.explanation,
      sourceKind: question.sourceKind,
      isOfficial: question.sourceKind === StudyContentSourceKind.OFFICIAL_PAST_PAPER,
      sourceYear: question.sourceYear,
      sourcePaperNumber: question.sourcePaperNumber,
      sourceQuestionRef: question.sourceQuestionRef,
    });
  }

  await prisma.studyAssessmentSession.update({
    where: { id: session.id },
    data: { completedAt: new Date() },
  });

  const mastery = await updateMasteryAfterQuiz({
    learnerId: learner.id,
    subtopicId: session.subtopicId,
    sessionCorrect: correct,
    sessionTotal: answers.length,
  });

  revalidatePath("/study/dashboard");
  revalidatePath("/study/practice");
  revalidatePath("/study/subjects");
  revalidatePath("/study/progress");
  revalidatePath("/study/profile");

  const weakest = await getWeakestMasteries(learner.id, 5);
  const nextFocus = weakest.find((w) => w.subtopicId !== session.subtopicId) ?? null;
  const subtopicMeta = await prisma.studySubtopic.findUnique({
    where: { id: session.subtopicId },
    select: { name: true, topic: { select: { name: true, curriculum: { select: { subject: { select: { name: true } } } } } } },
  });

  const total = answers.length;
  return {
    ok: true as const,
    correct,
    total,
    percent: Math.round((correct / total) * 100),
    masteryBeforePct,
    masteryPct: mastery.masteryPct,
    questionsAttemptedTotal: mastery.questionsAttempted,
    subtopicName: subtopicMeta?.name ?? "",
    topicName: subtopicMeta?.topic.name ?? "",
    subjectName: subtopicMeta?.topic.curriculum.subject.name ?? "",
    nextFocus: nextFocus
      ? {
          subtopicId: nextFocus.subtopicId,
          subtopicName: nextFocus.subtopic.name,
          topicName: nextFocus.subtopic.topic.name,
          subjectName: nextFocus.subtopic.topic.curriculum.subject.name,
          masteryPct: nextFocus.masteryPct,
        }
      : null,
    results,
  };
}
