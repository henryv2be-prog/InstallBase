"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { completeSubtopicQuiz, evaluateQuizAnswer } from "@/study/lib/quiz-actions";
import type { QuizQuestionClient } from "@/study/lib/quiz-types";

type Props = {
  sessionId: string;
  subjectName: string;
  topicName: string;
  subtopicName: string;
  questions: QuizQuestionClient[];
  masteryBeforePct: number | null;
};

type Feedback = {
  isCorrect: boolean;
  explanation: string | null;
  correctDisplay: string;
};

export function QuizRunner({
  sessionId,
  subjectName,
  topicName,
  subtopicName,
  questions,
  masteryBeforePct,
}: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [finished, setFinished] = useState<Awaited<
    ReturnType<typeof completeSubtopicQuiz>
  > | null>(null);

  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;

  const summary = useMemo(() => {
    if (!finished || finished.ok === false) return null;
    return finished;
  }, [finished]);

  function choose(optionId: string) {
    if (!current || feedback) return;
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
    setError(null);
  }

  function setShortAnswer(value: string) {
    if (!current || feedback) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setError(null);
  }

  async function checkAnswer() {
    if (!current || !selected?.trim()) {
      setError("Pick or type an answer first.");
      return;
    }
    setError(null);
    setChecking(true);
    const result = await evaluateQuizAnswer(current.id, selected.trim());
    setChecking(false);
    if (result.ok === false) {
      setError(result.error);
      return;
    }
    setFeedback({
      isCorrect: result.isCorrect,
      explanation: result.explanation,
      correctDisplay: result.correctDisplay,
    });
  }

  function continueAfterFeedback() {
    setFeedback(null);
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
    const before = summary.masteryBeforePct ?? masteryBeforePct;
    const after = summary.masteryPct;
    const delta =
      before != null ? Math.round(after - before) : null;

    return (
      <div className="study-quiz-stage">
        <section className="study-panel--glow p-6 text-center mb-5">
          <p className="study-section-label">Session complete</p>
          <p className="mt-3 text-5xl font-extrabold tabular-nums tracking-tight">
            {summary.correct}/{summary.total}
          </p>
          <p className="mt-2 text-lg font-bold">Nice work.</p>
          <p className="mt-4 text-sm text-[var(--study-muted)]">
            {summary.subtopicName} mastery
          </p>
          {before != null ? (
            <p className="mt-1 text-2xl font-extrabold tabular-nums">
              {Math.round(before)}% → {Math.round(after)}%
            </p>
          ) : (
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{Math.round(after)}%</p>
          )}
          {delta != null && delta > 0 ? (
            <p className="mt-2 text-sm font-semibold text-[var(--study-success)]">
              +{delta}% — one step closer to your target
            </p>
          ) : null}
        </section>

        {summary.nextFocus ? (
          <section className="study-panel p-4 mb-4">
            <p className="text-xs font-bold text-[var(--study-muted)]">Next up</p>
            <p className="mt-2 font-bold">
              Your next gap: {summary.nextFocus.subtopicName}
            </p>
            <p className="text-sm text-[var(--study-muted)]">
              {summary.nextFocus.subjectName} · {Math.round(summary.nextFocus.masteryPct)}%
            </p>
            <Link
              href={`/study/practice/${summary.nextFocus.subtopicId}`}
              className="study-btn study-btn-primary study-touch-target mt-4 block w-full text-center"
            >
              Practice {summary.nextFocus.subtopicName}
            </Link>
          </section>
        ) : null}

        <Link
          href="/study/dashboard"
          className="study-btn study-btn-ghost study-touch-target w-full text-center"
        >
          Done for today
        </Link>
      </div>
    );
  }

  if (!current) return null;

  const isShort = current.type === "SHORT_ANSWER";

  return (
    <div className="study-quiz-stage">
      <p className="text-xs font-semibold text-[var(--study-muted)] mb-1">
        {subjectName} · {topicName}
      </p>
      <p className="text-sm font-bold text-[var(--study-accent-2)] mb-4">{subtopicName}</p>

      <div className="mb-4">
        <p className="text-center text-xs font-bold text-[var(--study-muted)] mb-3">
          Question {index + 1} of {questions.length}
        </p>
        <div className="study-dots mb-3" aria-hidden>
          {questions.map((_, i) => (
            <span
              key={i}
              className={`study-dot ${i < index ? "study-dot--done" : ""} ${i === index ? "study-dot--current" : ""}`}
            />
          ))}
        </div>
        <StudyMasteryBar
          value={((index + (feedback ? 1 : 0)) / questions.length) * 100}
          height="sm"
          animate
        />
      </div>

      {feedback ? (
        <section
          className={`study-feedback mb-4 flex-1 ${feedback.isCorrect ? "study-feedback--win" : "study-feedback--learn"}`}
        >
          <p className="study-feedback__title">{feedback.isCorrect ? "Nice." : "Almost."}</p>
          <p className="mt-2 text-base font-semibold">
            {feedback.isCorrect ? "You got it." : "Here's why it matters."}
          </p>
          {!feedback.isCorrect && feedback.correctDisplay ? (
            <p className="mt-3 text-sm text-[var(--study-muted)]">
              Memo-style answer:{" "}
              <span className="font-semibold text-[var(--study-text)]">{feedback.correctDisplay}</span>
            </p>
          ) : null}
          {feedback.explanation ? (
            <p className="mt-3 text-sm leading-relaxed text-[var(--study-muted)]">{feedback.explanation}</p>
          ) : null}
          <button
            type="button"
            className="study-btn study-btn-primary study-touch-target mt-6 w-full"
            disabled={pending}
            onClick={continueAfterFeedback}
          >
            {pending
              ? "Saving…"
              : index === questions.length - 1
                ? "Finish session"
                : "Ready for the next one?"}
          </button>
        </section>
      ) : (
        <>
          <section className="study-panel p-5 flex-1 mb-4">
            {current.sourceQuestionRef ? (
              <p className="text-xs text-[var(--study-muted)] mb-3">
                NSC ref · Paper {current.sourcePaperNumber ?? "?"} · Q{current.sourceQuestionRef}
              </p>
            ) : null}
            <p className="study-quiz-prompt">{current.prompt}</p>
            {isShort ? (
              <label className="mt-6 block space-y-2">
                <span className="text-sm font-semibold text-[var(--study-muted)]">Your answer</span>
                <input
                  className="study-input study-touch-target"
                  value={selected ?? ""}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  placeholder="Type your final answer"
                  autoComplete="off"
                />
              </label>
            ) : (
              <ul className="mt-6 space-y-3">
                {current.options.map((opt) => {
                  const active = selected === opt.id;
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => choose(opt.id)}
                        className={`study-quiz-option study-touch-target ${active ? "study-quiz-option--active" : ""}`}
                      >
                        {opt.text}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {error ? <p className="mb-3 text-sm text-[var(--study-danger)]">{error}</p> : null}

          <button
            type="button"
            className="study-btn study-btn-primary study-touch-target w-full"
            disabled={checking || pending}
            onClick={checkAnswer}
          >
            {checking ? "Checking…" : "Check answer"}
          </button>
        </>
      )}
    </div>
  );
}
