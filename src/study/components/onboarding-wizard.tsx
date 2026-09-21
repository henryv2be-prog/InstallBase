"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeStudyOnboarding } from "@/study/lib/actions";
import { STUDY_STARTER_SUBJECT_SLUGS } from "@/study/lib/constants";
import {
  GRADE_12_SUBJECT_CATEGORY_LABELS,
  type Grade12SubjectCategory,
} from "@/study/data/grade-12-subject-catalog";

export type OnboardingSubjectOption = {
  id: string;
  slug: string;
  name: string;
  hasCurriculum: boolean;
  category: Grade12SubjectCategory;
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

const STEPS = ["Hey", "Subjects", "Goals", "Exams", "Ready"] as const;

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

  const categoryOrder: Grade12SubjectCategory[] = [
    "core",
    "commerce",
    "humanities",
    "languages",
    "technology",
    "agriculture",
    "creative",
    "services",
  ];

  const subjectsByCategory = useMemo(() => {
    const groups = new Map<Grade12SubjectCategory, OnboardingSubjectOption[]>();
    for (const subject of subjects) {
      const list = groups.get(subject.category) ?? [];
      list.push(subject);
      groups.set(subject.category, list);
    }
    return categoryOrder
      .filter((category) => groups.has(category))
      .map((category) => ({ category, items: groups.get(category)! }));
  }, [subjects]);

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
        setError("What should we call you?");
        return;
      }
    }
    if (step === 1 && selectedSubjects.length === 0) {
      setError("Pick at least one Grade 12 subject.");
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
        <div className="study-progress-track">
          <div className="study-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 ? (
        <section className="space-y-4">
          <div className="study-onboard-bubble study-onboard-bubble--accent">
            Hey 👋 Let&apos;s build your matric study plan.
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-bold">What&apos;s your name?</span>
            <input
              className="study-input study-touch-target"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Thabo"
              autoComplete="name"
            />
          </label>
          <p className="text-sm text-[var(--study-muted)]">Grade 12 · NSC · 2026</p>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3">
          <div className="study-onboard-bubble">What are you studying this year?</div>
          <p className="text-sm text-[var(--study-muted)]">Tap your Grade 12 subjects.</p>
          <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
            {subjectsByCategory.map(({ category, items }) => (
              <div key={category}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--study-muted)]">
                  {GRADE_12_SUBJECT_CATEGORY_LABELS[category]}
                </h3>
                <ul className="space-y-2">
                  {items.map((subject) => {
                    const row = marks[subject.id];
                    if (!row) return null;
                    return (
                      <li key={subject.id}>
                        <button
                          type="button"
                          className={`study-card w-full p-4 text-left ${row.selected ? "study-card--selected" : ""}`}
                          onClick={() => toggleSubject(subject.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`study-check ${row.selected ? "study-check--on" : ""}`}
                              aria-hidden
                            />
                            <span className="font-bold">{subject.name}</span>
                            {subject.hasCurriculum ? (
                              <span className="ml-auto text-xs text-[var(--study-accent-2)]">Quizzes</span>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <div className="study-onboard-bubble">What are you aiming for?</div>
          <p className="text-sm text-[var(--study-muted)]">Honest current mark + your target.</p>
          <ul className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {selectedSubjects.map((subject) => {
              const row = marks[subject.id];
              return (
                <li key={subject.id} className="study-panel p-4">
                  <p className="font-bold mb-3">{subject.name}</p>
                  <MarkSlider
                    label="Where you are now"
                    value={row.currentMarkPct}
                    onChange={(v) => updateMark(subject.id, "currentMarkPct", v)}
                  />
                  <div className="mt-4">
                    <MarkSlider
                      label="Where you want to be"
                      value={row.targetMarkPct}
                      onChange={(v) => updateMark(subject.id, "targetMarkPct", v)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-3">
          <div className="study-onboard-bubble">When are your NSC exams?</div>
          <p className="text-sm text-[var(--study-muted)]">
            We&apos;ll use this to prioritise your time — Paper 1 dates are fine to start.
          </p>
          <ul className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {selectedSubjects.map((subject) => {
              const exam = exams[subject.id];
              return (
                <li key={subject.id} className="study-panel space-y-3 p-4">
                  <p className="font-bold">{subject.name}</p>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[var(--study-muted)]">Exam date</span>
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
                      <span className="text-xs font-semibold text-[var(--study-muted)]">Paper</span>
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
                      <span className="text-xs font-semibold text-[var(--study-muted)]">Minutes</span>
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

      {step === 4 ? (
        <section className="space-y-4 text-center py-4">
          <div className="study-onboard-bubble study-onboard-bubble--accent mx-auto max-w-sm">
            You&apos;re ready, {displayName.trim() || "friend"}. We&apos;ve got your starting point.
          </div>
          <p className="text-sm text-[var(--study-muted)]">
            {selectedSubjects.length} subjects · personalised daily mission on your home screen.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-[var(--study-danger)]/40 bg-[var(--study-danger)]/10 px-3 py-2 text-sm">
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
            {pending ? "Saving…" : "Show my plan"}
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
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums font-extrabold text-[var(--study-accent-2)]">{value}%</span>
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
