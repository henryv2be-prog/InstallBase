"use client";

import { useState, useTransition } from "react";
import { QuizRunner } from "@/study/components/quiz-runner";
import { startSubtopicQuiz } from "@/study/lib/quiz-actions";

type Props = {
  subtopicId: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  questionCount: number;
  masteryPct: number | null;
  questionsAttempted: number;
};

export function QuizIntro({
  subtopicId,
  subjectName,
  topicName,
  subtopicName,
  questionCount,
  masteryPct,
  questionsAttempted,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState<Awaited<ReturnType<typeof startSubtopicQuiz>> | null>(
    null,
  );

  if (started?.ok) {
    return (
      <QuizRunner
        sessionId={started.sessionId}
        subjectName={started.subjectName}
        topicName={started.topicName}
        subtopicName={started.subtopicName}
        questions={started.questions}
      />
    );
  }

  function begin() {
    setError(null);
    startTransition(async () => {
      const result = await startSubtopicQuiz(subtopicId);
      if (result.ok === false) {
        setError(result.error);
        return;
      }
      setStarted(result);
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="study-card mb-4 space-y-3 p-5">
        <p className="text-xs text-[var(--study-muted)]">
          {subjectName} · {topicName}
        </p>
        <h2 className="text-xl font-bold">{subtopicName}</h2>
        <p className="text-sm text-[var(--study-muted)]">
          {questionCount} practice questions available · quiz uses up to 5 random questions.
        </p>
        <p className="text-sm">
          Current mastery:{" "}
          <span className="font-semibold text-[var(--study-accent)]">
            {masteryPct != null ? `${Math.round(masteryPct)}%` : "Not measured yet"}
          </span>
          {questionsAttempted > 0 ? ` (${questionsAttempted} answered overall)` : ""}
        </p>
        <p className="text-xs text-[var(--study-muted)]">
          Prototype practice — not an official NSC examination paper.
        </p>
      </section>

      {error ? <p className="mb-3 text-sm text-[#fecaca]">{error}</p> : null}

      <button
        type="button"
        className="study-btn study-btn-primary study-touch-target mt-auto w-full"
        disabled={pending || questionCount === 0}
        onClick={begin}
      >
        {pending ? "Loading…" : "Start quiz"}
      </button>
    </div>
  );
}
