"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useStudyContentLabels, useStudyT } from "@/study/components/study-locale-provider";
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
  const t = useStudyT();
  const content = useStudyContentLabels();
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
        setError(t.onboarding.errors.name);
        return;
      }
    }
    if (step === 1 && selectedSubjects.length === 0) {
      setError(t.onboarding.errors.subjects);
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

  const readyName = displayName.trim() || (t.locale === "af" ? "vriend" : "friend");

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
            {t.onboarding.hey}
            {t.onboarding.planIntro ? ` ${t.onboarding.planIntro}` : ""}
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-bold">{t.onboarding.nameLabel}</span>
            <input
              className="study-input study-touch-target"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.onboarding.namePlaceholder}
              autoComplete="name"
            />
          </label>
          <p className="text-sm text-[var(--study-muted)]">{t.onboarding.gradeLine}</p>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3">
          <div className="study-onboard-bubble">{t.onboarding.subjectsTitle}</div>
          <p className="text-sm text-[var(--study-muted)]">{t.onboarding.subjectsLead}</p>
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
                            <span className="font-bold">
                              {content.subject(subject.slug, subject.name)}
                            </span>
                            {subject.hasCurriculum ? (
                              <span className="ml-auto text-xs study-text-emphasis">
                                {t.common.quizzes}
                              </span>
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
          <div className="study-onboard-bubble">{t.onboarding.goalsTitle}</div>
          <p className="text-sm text-[var(--study-muted)]">{t.onboarding.goalsLead}</p>
          <ul className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {selectedSubjects.map((subject) => {
              const row = marks[subject.id];
              return (
                <li key={subject.id} className="study-panel p-4">
                  <p className="font-bold mb-3">
                    {content.subject(subject.slug, subject.name)}
                  </p>
                  <MarkSlider
                    label={t.onboarding.currentMark}
                    value={row.currentMarkPct}
                    onChange={(v) => updateMark(subject.id, "currentMarkPct", v)}
                  />
                  <div className="mt-4">
                    <MarkSlider
                      label={t.onboarding.targetMark}
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
          <div className="study-onboard-bubble">{t.onboarding.examsTitle}</div>
          <p className="text-sm text-[var(--study-muted)]">{t.onboarding.examsLead}</p>
          <ul className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {selectedSubjects.map((subject) => {
              const exam = exams[subject.id];
              return (
                <li key={subject.id} className="study-panel space-y-3 p-4">
                  <p className="font-bold">{content.subject(subject.slug, subject.name)}</p>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-[var(--study-muted)]">
                      {t.onboarding.examDate}
                    </span>
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
                      <span className="text-xs font-semibold text-[var(--study-muted)]">
                        {t.onboarding.paper}
                      </span>
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
                      <span className="text-xs font-semibold text-[var(--study-muted)]">
                        {t.onboarding.minutes}
                      </span>
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
            {t.onboarding.readyTitle(readyName)}
          </div>
          <p className="text-sm text-[var(--study-muted)]">
            {t.onboarding.readyLead(selectedSubjects.length)}
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
            {t.common.continue}
          </button>
        ) : (
          <button
            type="button"
            className="study-btn study-btn-primary study-touch-target w-full"
            disabled={pending}
            onClick={submit}
          >
            {pending ? t.common.saving : t.onboarding.showPlan}
          </button>
        )}
        {step > 0 ? (
          <button
            type="button"
            className="study-btn study-btn-ghost study-touch-target w-full"
            disabled={pending}
            onClick={() => setStep((s) => s - 1)}
          >
            {t.common.back}
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
        <span className="tabular-nums font-extrabold study-text-emphasis">{value}%</span>
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
