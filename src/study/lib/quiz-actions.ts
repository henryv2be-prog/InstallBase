"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { updateMasteryAfterQuiz } from "@/study/lib/update-mastery-after-quiz";
import { QUIZ_SIZE, type QuizAnswerInput, type QuizQuestionClient } from "@/study/lib/quiz-types";

export async function startSubtopicQuiz(subtopicId: string) {
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
    where: { subtopicId, active: true },
    orderBy: { createdAt: "asc" },
  });

  if (pool.length === 0) {
    return {
      ok: false as const,
      error: "No practice questions for this topic yet. Try another subtopic.",
    };
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(QUIZ_SIZE, shuffled.length));

  const session = await prisma.studyAssessmentSession.create({
    data: { learnerId: learner.id, subtopicId },
  });

  return {
    ok: true as const,
    sessionId: session.id,
    subtopicName: subtopic.name,
    topicName: subtopic.topic.name,
    subjectName: subtopic.topic.curriculum.subject.name,
    questionCount: selected.length,
    questions: selected.map(
      (q): QuizQuestionClient => ({
        id: q.id,
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
  }[] = [];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)!;
    const isCorrect = question.correctOptionId === answer.selectedOptionId;
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
      correctOptionId: question.correctOptionId,
      isCorrect,
      explanation: question.explanation,
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

  const total = answers.length;
  return {
    ok: true as const,
    correct,
    total,
    percent: Math.round((correct / total) * 100),
    masteryPct: mastery.masteryPct,
    questionsAttemptedTotal: mastery.questionsAttempted,
    results,
  };
}
