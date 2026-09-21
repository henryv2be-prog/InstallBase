"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QuestionSourceBadge } from "@/study/components/question-source-badge";
import { completeSubtopicQuiz } from "@/study/lib/quiz-actions";
import type { QuizQuestionClient } from "@/study/lib/quiz-types";

type Props = {
  sessionId: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  questions: QuizQuestionClient[];
};

export function QuizRunner({ sessionId, subjectName, topicName, subtopicName, questions }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState<Awaited<
    ReturnType<typeof completeSubtopicQuiz>
  > | null>(null);

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;
  const selected = current ? answers[current.id] : undefined;

  const summary = useMemo(() => {
    if (!finished || finished.ok === false) return null;
    return finished;
  }, [finished]);

  function choose(optionId: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
  }

  function setShortAnswer(value: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function next() {
    if (!selected?.trim()) {
      setError("Enter or choose an answer to continue.");
      return;
    }
    setError(null);
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    startTransition(async () => {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] ?? "",
      }));
      const result = await completeSubtopicQuiz(sessionId, payload);
      if (result.ok === false) {
        setError(result.error);
        return;
      }
      setFinished(result);
      router.refresh();
    });
  }

  if (summary) {
    return (
      <div className="flex flex-1 flex-col">
        <section className="study-card mb-4 p-5 text-center">
          <p className="text-sm text-[var(--study-muted)]">Quiz complete</p>
          <p className="mt-2 text-4xl font-extrabold tabular-nums text-[var(--study-accent)]">
            {summary.correct}/{summary.total}
          </p>
          <p className="mt-1 text-lg font-semibold">{summary.percent}% this quiz</p>
          <p className="mt-3 text-sm text-[var(--study-muted)]">
            Updated topic mastery:{" "}
            <span className="font-semibold text-[var(--study-text)]">
              {Math.round(summary.masteryPct)}%
            </span>{" "}
            <span className="text-xs">({summary.questionsAttemptedTotal} questions total)</span>
          </p>
        </section>

        <ul className="mb-4 space-y-3">
          {summary.results.map((r) => (
            <li key={r.questionId} className="study-card space-y-2 p-4">
              <QuestionSourceBadge
                isOfficial={r.isOfficial}
                sourceYear={r.sourceYear}
                sourcePaperNumber={r.sourcePaperNumber}
                sourceQuestionRef={r.sourceQuestionRef}
              />
              <p className="text-sm font-medium whitespace-pre-line">{r.prompt}</p>
              <p className={`text-sm ${r.isCorrect ? "text-[var(--study-success)]" : "text-[#fecaca]"}`}>
                {r.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                {!r.isCorrect ? (
                  <span className="block text-[var(--study-muted)]">Expected: {r.correctOptionId}</span>
                ) : null}
              </p>
              {r.explanation ? (
                <p className="text-sm text-[var(--study-muted)]">{r.explanation}</p>
              ) : null}
            </li>
          ))}
        </ul>

        <a href="/study/dashboard" className="study-btn study-btn-primary study-touch-target w-full text-center">
          Back to dashboard
        </a>
      </div>
    );
  }

  if (!current) return null;

  const isShort = current.type === "SHORT_ANSWER";

  return (
    <div className="flex flex-1 flex-col">
      <p className="mb-2 text-xs text-[var(--study-muted)]">
        {subjectName} · {topicName}
      </p>
      <p className="mb-3 text-sm font-semibold text-[#c7d2fe]">{subtopicName}</p>
      <QuestionSourceBadge
        isOfficial={current.sourceKind === "OFFICIAL_PAST_PAPER"}
        sourceYear={current.sourceYear}
        sourcePaperNumber={current.sourcePaperNumber}
        sourceQuestionRef={current.sourceQuestionRef}
      />

      <div className="mb-4 mt-3">
        <div className="mb-2 flex justify-between text-xs font-medium text-[var(--study-muted)]">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{isShort ? "NSC short answer" : "Multiple choice"}</span>
        </div>
        <div className="study-progress-track">
          <div className="study-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="study-card mb-4 flex-1 p-5">
        <p className="text-base font-medium leading-relaxed whitespace-pre-line">{current.prompt}</p>
        {isShort ? (
          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-[var(--study-muted)]">Your answer</span>
            <input
              className="study-input study-touch-target"
              value={selected ?? ""}
              onChange={(e) => setShortAnswer(e.target.value)}
              placeholder="e.g. x = 5 or x = -1"
              autoComplete="off"
            />
          </label>
        ) : (
          <ul className="mt-5 space-y-3">
            {current.options.map((opt) => {
              const active = selected === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => choose(opt.id)}
                    className={`study-quiz-option study-touch-target w-full text-left ${active ? "study-quiz-option--active" : ""}`}
                  >
                    {opt.text}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error ? <p className="mb-3 text-sm text-[#fecaca]">{error}</p> : null}

      <button
        type="button"
        className="study-btn study-btn-primary study-touch-target w-full"
        disabled={pending}
        onClick={next}
      >
        {pending ? "Saving…" : index === questions.length - 1 ? "Finish quiz" : "Next question"}
      </button>
    </div>
  );
}
