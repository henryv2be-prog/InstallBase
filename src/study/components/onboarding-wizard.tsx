"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeStudyOnboarding } from "@/study/lib/actions";
import { STUDY_STARTER_SUBJECT_SLUGS } from "@/study/lib/constants";

export type OnboardingSubjectOption = {
  id: string;
  slug: string;
  name: string;
  hasCurriculum: boolean;
};

type SubjectMarks = {
  selected: boolean;
  currentMarkPct: number;
  targetMarkPct: number;
};

type ExamEntry = {
  examAt: string;
  paperNumber: string;
  durationMinutes: string;
};

type Props = {
  subjects: OnboardingSubjectOption[];
  initialName?: string;
  initialMarks?: Record<
    string,
    { selected: boolean; currentMarkPct: number; targetMarkPct: number }
  >;
  initialExams?: Record<
    string,
    { examAt: string; paperNumber: string; durationMinutes: string }
  >;
};

const STEPS = ["About you", "Subjects & marks", "Exam dates"] as const;

function suggestedTarget(current: number) {
  return Math.min(100, Math.round(current + 15));
}

export function OnboardingWizard({
  subjects,
  initialName = "",
  initialMarks,
  initialExams,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(initialName);
  const [marks, setMarks] = useState<Record<string, SubjectMarks>>(() =>
    initialMarks ??
    Object.fromEntries(
      subjects.map((s) => [
        s.id,
        {
          selected: STUDY_STARTER_SUBJECT_SLUGS.includes(
            s.slug as (typeof STUDY_STARTER_SUBJECT_SLUGS)[number],
          ),
          currentMarkPct: 55,
          targetMarkPct: 70,
        },
      ]),
    ),
  );
  const [exams, setExams] = useState<Record<string, ExamEntry>>(() =>
    initialExams ??
    Object.fromEntries(
      subjects.map((s) => [
        s.id,
        { examAt: "2026-11-04", paperNumber: "1", durationMinutes: "180" },
      ]),
    ),
  );

  const selectedSubjects = useMemo(
    () => subjects.filter((s) => marks[s.id]?.selected),
    [subjects, marks],
  );

  const progress = ((step + 1) / STEPS.length) * 100;

  function toggleSubject(id: string) {
    setMarks((prev) => {
      const row = prev[id];
      if (!row) return prev;
      const selected = !row.selected;
      return {
        ...prev,
        [id]: {
          ...row,
          selected,
          targetMarkPct: selected ? suggestedTarget(row.currentMarkPct) : row.targetMarkPct,
        },
      };
    });
  }

  function updateMark(id: string, field: "currentMarkPct" | "targetMarkPct", value: number) {
    setMarks((prev) => {
      const row = prev[id];
      if (!row) return prev;
      const next = { ...row, [field]: value };
      if (field === "currentMarkPct" && next.targetMarkPct < value) {
        next.targetMarkPct = suggestedTarget(value);
      }
      return { ...prev, [id]: next };
    });
  }

  function goNext() {
    setError(null);
    if (step === 0) {
      if (displayName.trim().length < 2) {
        setError("Please enter your name.");
        return;
      }
    }
    if (step === 1 && selectedSubjects.length === 0) {
      setError("Choose at least one subject.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const payload = {
        basics: { displayName: displayName.trim(), schoolYear: 2026 },
        subjects: selectedSubjects.map((s) => ({
          subjectId: s.id,
          currentMarkPct: marks[s.id].currentMarkPct,
          targetMarkPct: marks[s.id].targetMarkPct,
        })),
        exams: selectedSubjects.map((s) => ({
          subjectId: s.id,
          examAt: exams[s.id].examAt,
          paperNumber: exams[s.id].paperNumber ? Number(exams[s.id].paperNumber) : null,
          durationMinutes: exams[s.id].durationMinutes
            ? Number(exams[s.id].durationMinutes)
            : null,
        })),
      };

      const result = await completeStudyOnboarding(payload);
      if (result.ok === false) {
        setError(result.error);
        return;
      }
      router.push("/study/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-medium text-[var(--study-muted)]">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="study-progress-track">
          <div className="study-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 ? (
        <section className="study-card space-y-4 p-5">
          <h2 className="text-xl font-bold">Let&apos;s set up your study profile</h2>
          <p className="text-sm text-[var(--study-muted)]">
            Grade 12 NSC · School year 2026. We&apos;ll use this to prioritise what you study next.
          </p>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Your name</span>
            <input
              className="study-input study-touch-target"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Thabo"
              autoComplete="name"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="study-card-muted p-3">
              <p className="text-xs text-[var(--study-muted)]">Grade</p>
              <p className="text-lg font-semibold">Grade 12</p>
            </div>
            <div className="study-card-muted p-3">
              <p className="text-xs text-[var(--study-muted)]">School year</p>
              <p className="text-lg font-semibold">2026</p>
            </div>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3">
          <p className="text-sm text-[var(--study-muted)]">
            Tap subjects you&apos;re writing. Set a honest current estimate and your target mark.
          </p>
          <ul className="space-y-3">
            {subjects.map((subject) => {
              const row = marks[subject.id];
              if (!row) return null;
              return (
                <li key={subject.id} className={`study-card p-4 ${row.selected ? "study-card--selected" : ""}`}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 text-left"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <span
                      className={`study-check ${row.selected ? "study-check--on" : ""}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold">{subject.name}</span>
                      {subject.hasCurriculum ? (
                        <span className="ml-2 text-xs text-[var(--study-accent)]">Practice ready</span>
                      ) : (
                        <span className="ml-2 text-xs text-[var(--study-muted)]">Coming soon</span>
                      )}
                    </span>
                  </button>
                  {row.selected ? (
                    <div className="mt-4 space-y-4 border-t border-[var(--study-border)] pt-4">
                      <MarkSlider
                        label="Current estimate"
                        value={row.currentMarkPct}
                        onChange={(v) => updateMark(subject.id, "currentMarkPct", v)}
                      />
                      <MarkSlider
                        label="Target mark"
                        value={row.targetMarkPct}
                        onChange={(v) => updateMark(subject.id, "targetMarkPct", v)}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <p className="text-sm text-[var(--study-muted)]">
            Exam dates drive urgency in your study plan. You can change these later.
          </p>
          <ul className="space-y-3">
            {selectedSubjects.map((subject) => {
              const exam = exams[subject.id];
              return (
                <li key={subject.id} className="study-card space-y-3 p-4">
                  <p className="font-semibold">{subject.name}</p>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[var(--study-muted)]">Exam date</span>
                    <input
                      type="date"
                      className="study-input study-touch-target"
                      value={exam.examAt}
                      onChange={(e) =>
                        setExams((prev) => ({
                          ...prev,
                          [subject.id]: { ...prev[subject.id], examAt: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[var(--study-muted)]">Paper #</span>
                      <input
                        type="number"
                        min={1}
                        max={3}
                        className="study-input study-touch-target"
                        value={exam.paperNumber}
                        onChange={(e) =>
                          setExams((prev) => ({
                            ...prev,
                            [subject.id]: { ...prev[subject.id], paperNumber: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[var(--study-muted)]">Minutes</span>
                      <input
                        type="number"
                        min={30}
                        max={240}
                        className="study-input study-touch-target"
                        value={exam.durationMinutes}
                        onChange={(e) =>
                          setExams((prev) => ({
                            ...prev,
                            [subject.id]: { ...prev[subject.id], durationMinutes: e.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-[var(--study-danger)]/40 bg-[var(--study-danger)]/10 px-3 py-2 text-sm text-[#fecaca]">
          {error}
        </p>
      ) : null}

      <div className="mt-auto space-y-3 pt-6">
        {step < STEPS.length - 1 ? (
          <button type="button" className="study-btn study-btn-primary study-touch-target w-full" onClick={goNext}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="study-btn study-btn-primary study-touch-target w-full"
            disabled={pending}
            onClick={submit}
          >
            {pending ? "Saving…" : "Finish setup"}
          </button>
        )}
        {step > 0 ? (
          <button
            type="button"
            className="study-btn study-btn-ghost study-touch-target w-full"
            disabled={pending}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MarkSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-[var(--study-accent)]">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="study-range w-full"
      />
    </label>
  );
}
