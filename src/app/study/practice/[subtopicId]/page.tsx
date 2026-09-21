import Link from "next/link";
import { redirect } from "next/navigation";
import { QuizIntro } from "@/study/components/quiz-intro";
import { StudyShell } from "@/study/components/study-shell";
import { ensurePracticeQuestions } from "@/study/lib/seed-questions";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { prisma } from "@/lib/prisma";
import type { QuizMode } from "@/study/lib/quiz-types";
import { StudyContentSourceKind } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ subtopicId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

function parseMode(raw: string | undefined): QuizMode {
  if (raw === "official" || raw === "practice") return raw;
  return "all";
}

export default async function StudyQuizPage({ params, searchParams }: Props) {
  const { subtopicId } = await params;
  const { mode: modeParam } = await searchParams;
  const initialMode = parseMode(modeParam);
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  await ensurePracticeQuestions();

  const subtopic = await prisma.studySubtopic.findUnique({
    where: { id: subtopicId },
    include: {
      topic: { include: { curriculum: { include: { subject: true } } } },
      questions: { where: { active: true }, select: { sourceKind: true } },
    },
  });

  if (!subtopic) {
    return (
      <StudyShell title="Quiz" backHref="/study/practice" backLabel="Practice">
        <div className="study-card p-5 text-sm text-[#fecaca]">Topic not found.</div>
      </StudyShell>
    );
  }

  const enrolled = learner.subjects.some(
    (s) => s.subjectId === subtopic.topic.curriculum.subjectId,
  );
  if (!enrolled) {
    return (
      <StudyShell title="Quiz" backHref="/study/practice" backLabel="Practice">
        <div className="study-card p-5 text-sm text-[#fecaca]">This subject is not on your profile.</div>
      </StudyShell>
    );
  }

  const mastery = await prisma.studyMastery.findUnique({
    where: { learnerId_subtopicId: { learnerId: learner.id, subtopicId } },
  });

  return (
    <StudyShell title="Quick quiz" backHref="/study/practice" backLabel="Practice">
      {subtopic.questions.length === 0 ? (
        <>
          <div className="study-card p-5 text-sm text-[var(--study-muted)]">
            Practice questions for this subtopic are not available yet.
          </div>
          <Link href="/study/practice" className="study-btn study-btn-ghost study-touch-target mt-4 block text-center">
            Back to practice
          </Link>
        </>
      ) : (
        <QuizIntro
          subtopicId={subtopic.id}
          subjectName={subtopic.topic.curriculum.subject.name}
          topicName={subtopic.topic.name}
          subtopicName={subtopic.name}
          questionCount={subtopic.questions.length}
          officialCount={
            subtopic.questions.filter((q) => q.sourceKind === StudyContentSourceKind.OFFICIAL_PAST_PAPER)
              .length
          }
          practiceCount={
            subtopic.questions.filter((q) => q.sourceKind === StudyContentSourceKind.PRACTICE).length
          }
          masteryPct={mastery?.masteryPct ?? null}
          questionsAttempted={mastery?.questionsAttempted ?? 0}
          initialMode={initialMode}
        />
      )}
    </StudyShell>
  );
}
