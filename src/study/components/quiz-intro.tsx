"use client";

import { useState, useTransition } from "react";
import { QuizRunner } from "@/study/components/quiz-runner";
import { useStudyT } from "@/study/components/study-locale-provider";
import { startSubtopicQuiz } from "@/study/lib/quiz-actions";
import type { QuizMode } from "@/study/lib/quiz-types";

type Props = {
  subtopicId: string;
  subjectName: string;
  subjectSlug: string;
  topicSlug: string;
  topicName: string;
  subtopicSlug: string;
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
  subjectSlug,
  topicSlug,
  topicName,
  subtopicSlug,
  subtopicName,
  questionCount,
  officialCount,
  practiceCount,
  masteryPct,
  questionsAttempted,
  initialMode = "all",
}: Props) {
  const t = useStudyT();
  const [mode, setMode] = useState<QuizMode>(initialMode);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState<Awaited<ReturnType<typeof startSubtopicQuiz>> | null>(
    null,
  );

  const availableForMode =
    mode === "official" ? officialCount : mode === "practice" ? practiceCount : questionCount;

  const modeOptions = [
    ["official", t.quiz.official, officialCount, t.quiz.officialHint],
    ["practice", t.quiz.practiceDrills, practiceCount, t.quiz.practiceHint],
    ["all", t.quiz.mixed, questionCount, t.quiz.mixedHint],
  ] as const;

  if (started?.ok) {
    return (
      <QuizRunner
        sessionId={started.sessionId}
        subjectName={started.subjectName}
        topicName={started.topicName}
        subtopicName={started.subtopicName}
        questions={started.questions}
        masteryBeforePct={masteryPct}
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
      <section className="study-panel--glow p-5 mb-5">
        <p className="text-xs font-semibold text-[var(--study-muted)]">
          {subjectName} · {topicName}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{subtopicName}</h2>
        <p className="mt-3 text-sm text-[var(--study-muted)]">
          {masteryPct != null ? (
            questionsAttempted > 0 ? (
              t.quiz.introMastery(Math.round(masteryPct), questionsAttempted)
            ) : (
              <>
                {t.common.mastery}{" "}
                <span className="font-extrabold study-text-emphasis tabular-nums">
                  {Math.round(masteryPct)}%
                </span>
              </>
            )
          ) : (
            t.quiz.introBaseline
          )}
        </p>
      </section>

      <section className="mb-5">
        <p className="study-section-label mb-3">{t.quiz.questionType}</p>
        <div className="space-y-2">
          {modeOptions.map(([value, label, count, hint]) => (
            <button
              key={value}
              type="button"
              disabled={count === 0}
              onClick={() => setMode(value)}
              className={`study-quiz-option study-touch-target ${mode === value ? "study-quiz-option--active" : ""} ${count === 0 ? "opacity-40" : ""}`}
            >
              <span className="font-bold">{label}</span>
              <span className="mt-1 block text-xs text-[var(--study-muted)]">
                {t.quiz.readyCount(count)} · {hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="study-panel p-4 mb-4 text-sm">
          <p className="font-bold">{t.common.hmm}</p>
          <p className="mt-1 text-[var(--study-muted)]">{error}</p>
        </div>
      ) : null}

      <button
        type="button"
        className="study-btn study-btn-primary study-touch-target mt-auto w-full"
        disabled={pending || availableForMode === 0}
        onClick={begin}
      >
        {pending ? t.quiz.loading : t.quiz.letsGo}
      </button>
    </div>
  );
}
