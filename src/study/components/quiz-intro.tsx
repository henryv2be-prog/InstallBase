"use client";

import { useState, useTransition } from "react";
import { QuizRunner } from "@/study/components/quiz-runner";
import { startSubtopicQuiz } from "@/study/lib/quiz-actions";
import type { QuizMode } from "@/study/lib/quiz-types";

type Props = {
  subtopicId: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  questionCount: number;
  officialCount: number;
  practiceCount: number;
  masteryPct: number | null;
  questionsAttempted: number;
  initialMode?: QuizMode;
};

export function QuizIntro({
  subtopicId,
  subjectName,
  topicName,
  subtopicName,
  questionCount,
  officialCount,
  practiceCount,
  masteryPct,
  questionsAttempted,
  initialMode = "all",
}: Props) {
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState<Awaited<ReturnType<typeof startSubtopicQuiz>> | null>(
    null,
  );

  const availableForMode =
    mode === "official" ? officialCount : mode === "practice" ? practiceCount : questionCount;

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
      const result = await startSubtopicQuiz(subtopicId, mode);
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
          {officialCount} official NSC · {practiceCount} practice · up to 5 questions per quiz
        </p>
        <p className="text-sm">
          Current mastery:{" "}
          <span className="font-semibold text-[var(--study-accent)]">
            {masteryPct != null ? `${Math.round(masteryPct)}%` : "Not measured yet"}
          </span>
          {questionsAttempted > 0 ? ` (${questionsAttempted} answered overall)` : ""}
        </p>
      </section>

      <section className="mb-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--study-muted)]">
          Question source
        </p>
        <div className="grid grid-cols-1 gap-2">
          {(
            [
              ["official", "Official NSC past paper", officialCount],
              ["practice", "Practice only", practiceCount],
              ["all", "Mixed (official + practice)", questionCount],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              disabled={count === 0}
              onClick={() => setMode(value)}
              className={`study-quiz-option text-left ${mode === value ? "study-quiz-option--active" : ""} ${count === 0 ? "opacity-40" : ""}`}
            >
              <span className="font-medium">{label}</span>
              <span className="mt-1 block text-xs text-[var(--study-muted)]">{count} available</span>
            </button>
          ))}
        </div>
        {mode === "official" ? (
          <p className="text-xs leading-relaxed text-emerald-200/90">
            Sourced from DBE published NSC examination papers and memoranda. Short-answer items
            follow official paper wording; enter your final answer as you would in an exam.
          </p>
        ) : null}
      </section>

      {error ? <p className="mb-3 text-sm text-[#fecaca]">{error}</p> : null}

      <button
        type="button"
        className="study-btn study-btn-primary study-touch-target mt-auto w-full"
        disabled={pending || availableForMode === 0}
        onClick={begin}
      >
        {pending ? "Loading…" : mode === "official" ? "Start official NSC quiz" : "Start quiz"}
      </button>
    </div>
  );
}
