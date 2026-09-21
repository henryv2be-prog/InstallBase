import Link from "next/link";
import { redirect } from "next/navigation";
import { QuizIntro } from "@/study/components/quiz-intro";
import { StudyShell } from "@/study/components/study-shell";
import { ensurePracticeQuestions } from "@/study/lib/seed-questions";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ subtopicId: string }> };

export default async function StudyQuizPage({ params }: Props) {
  const { subtopicId } = await params;
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  await ensurePracticeQuestions();

  const subtopic = await prisma.studySubtopic.findUnique({
    where: { id: subtopicId },
    include: {
      topic: { include: { curriculum: { include: { subject: true } } } },
      _count: { select: { questions: { where: { active: true } } } },
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
      {subtopic._count.questions === 0 ? (
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
          questionCount={subtopic._count.questions}
          masteryPct={mastery?.masteryPct ?? null}
          questionsAttempted={mastery?.questionsAttempted ?? 0}
        />
      )}
    </StudyShell>
  );
}
