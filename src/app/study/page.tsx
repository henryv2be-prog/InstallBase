import Link from "next/link";
import { GRADE_12_CURRICULUM_STARTER } from "@/study/data/curriculum-starter";
import { SubjectCurriculumPreview } from "@/study/components/subject-curriculum-preview";
import { getStudyFoundationStats, getStudySubjectsWithTopics } from "@/study/lib/queries";

export const dynamic = "force-dynamic";

export default async function StudyCoachHomePage() {
  let dbReady = true;
  let subjects: Awaited<ReturnType<typeof getStudySubjectsWithTopics>> = [];
  let stats = { subjects: 0, topics: 0, subtopics: 0 };

  try {
    [subjects, stats] = await Promise.all([getStudySubjectsWithTopics(), getStudyFoundationStats()]);
  } catch {
    dbReady = false;
  }

  const starterSubjectNames = GRADE_12_CURRICULUM_STARTER.map((s) => s.name).join(", ");

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="study-pill study-pill--prototype">Prototype · Grade 12 NSC</span>
          <span className="study-pill bg-white/5 text-[var(--study-muted)]">South Africa</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Study Coach</h1>
        <p className="text-base leading-relaxed text-[var(--study-muted)]">
          Don&apos;t just schedule study time — know{" "}
          <span className="font-medium text-[var(--study-text)]">what to work on next</span> based on
          your exams, targets, and topic mastery.
        </p>
      </header>

      <section className="study-card mb-4 space-y-3 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--study-muted)]">
          Foundation status
        </h2>
        {dbReady ? (
          <>
            <p className="text-sm text-[var(--study-muted)]">
              Database connected. Curriculum records:{" "}
              <span className="font-medium text-[var(--study-text)]">
                {stats.subjects} subjects · {stats.topics} topics · {stats.subtopics} subtopics
              </span>
            </p>
            {stats.subtopics === 0 ? (
              <p className="text-sm text-[var(--study-warn)]">
                Run the study curriculum seed on this environment to load CAPS starter topics.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-[var(--study-warn)]">
            Database unavailable in this session. The app shell still loads; connect{" "}
            <code className="rounded bg-black/30 px-1">DATABASE_URL</code> and run migrations to
            enable live curriculum data.
          </p>
        )}
      </section>

      <section className="mb-6 space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-lg font-semibold">Starter subjects</h2>
          <span className="text-xs text-[var(--study-muted)]">Phase 1 dataset</span>
        </div>
        {dbReady && stats.subtopics > 0 ? (
          <SubjectCurriculumPreview subjects={subjects} />
        ) : (
          <ul className="space-y-2">
            {GRADE_12_CURRICULUM_STARTER.map((subject) => (
              <li key={subject.slug} className="study-card p-4">
                <p className="font-medium">{subject.name}</p>
                <p className="mt-1 text-xs text-[var(--study-muted)]">
                  {subject.topics.length} topics in starter file · {subject.versionLabel}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs leading-relaxed text-[var(--study-muted)]">
          Starter CAPS-aligned topics for testing: {starterSubjectNames}. Additional Grade 12
          subjects are modeled in the database for onboarding later.
        </p>
      </section>

      <section className="study-card mb-6 space-y-3 p-4">
        <h2 className="text-lg font-semibold">What&apos;s next (not built yet)</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--study-muted)]">
          <li>Mobile onboarding (subjects, target marks, exam dates)</li>
          <li>Initial assessment &amp; practice questions per subtopic</li>
          <li>Priority engine and today&apos;s study plan</li>
        </ul>
      </section>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          disabled
          className="study-touch-target w-full rounded-xl bg-[var(--study-accent)] px-4 py-3 text-center text-base font-semibold text-white opacity-60"
        >
          Start onboarding (coming next)
        </button>
        <Link
          href="/"
          className="study-touch-target block w-full rounded-xl border border-[var(--study-border)] px-4 py-3 text-center text-sm font-medium text-[var(--study-muted)]"
        >
          Back to InstallBase
        </Link>
      </div>
    </main>
  );
}
