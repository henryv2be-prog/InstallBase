import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyShell } from "@/study/components/study-shell";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getLearnerProgressStats, getWeakestMasteries } from "@/study/lib/queries";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyProgressPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const [stats, weakest, improving] = await Promise.all([
    getLearnerProgressStats(learner.id),
    getWeakestMasteries(learner.id, 3),
    getWeakestMasteries(learner.id, 20),
  ]);

  const withAttempts = improving.filter((m) => m.questionsAttempted > 0);
  const best = [...withAttempts].sort((a, b) => b.masteryPct - a.masteryPct).slice(0, 3);

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <h1 className="study-display text-3xl">Progress</h1>
        <p className="study-lead mt-2">Visible improvement beats motivational quotes.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 mb-5">
        <div className="study-panel p-4 text-center">
          <p className="study-stat-xl text-[var(--study-accent-2)]">{stats.completedSessions}</p>
          <p className="text-xs text-[var(--study-muted)] mt-1">Sessions completed</p>
        </div>
        <div className="study-panel p-4 text-center">
          <p className="study-stat-xl">{stats.streakDays > 0 ? `🔥 ${stats.streakDays}` : "—"}</p>
          <p className="text-xs text-[var(--study-muted)] mt-1">Day streak</p>
        </div>
      </section>

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-3">Matric goals</p>
        <ul className="space-y-4">
          {learner.subjects.map((ls) => {
            const theme = getSubjectTheme(ls.subject.slug);
            return (
              <li key={ls.id}>
                <StudyMasteryBar
                  label={ls.subject.name}
                  value={ls.currentMarkPct}
                  accent={theme.accent}
                />
                <p className="mt-1 text-xs text-[var(--study-muted)]">
                  Target {ls.targetMarkPct}%
                  {ls.currentMarkPct >= ls.targetMarkPct - 3
                    ? " · You're in range"
                    : ` · ${ls.targetMarkPct - ls.currentMarkPct}% to go`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {best.length > 0 ? (
        <section className="mb-5">
          <p className="study-section-label mb-2">Getting stronger</p>
          <ul className="study-panel px-4">
            {best.map((m) => (
              <li key={m.id} className="study-row">
                <div>
                  <p className="font-semibold">{m.subtopic.name}</p>
                  <p className="text-xs text-[var(--study-muted)]">
                    {m.subtopic.topic.curriculum.subject.name}
                  </p>
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[var(--study-success)]">
                  {Math.round(m.masteryPct)}%
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="study-panel p-5 mb-5 text-center">
          <p className="font-bold">Let&apos;s start</p>
          <p className="mt-2 text-sm text-[var(--study-muted)]">
            Your first study session will appear here.
          </p>
          <Link href="/study/dashboard" className="study-btn study-btn-primary study-touch-target mt-4 inline-flex w-full">
            Start your first session
          </Link>
        </section>
      )}

      {weakest.length > 0 ? (
        <section>
          <p className="study-section-label mb-2">Biggest gaps</p>
          <ul className="space-y-2">
            {weakest.map((m) => (
              <li key={m.id} className="study-panel p-4">
                <p className="text-xs font-bold text-[var(--study-accent-2)]">Needs attention</p>
                <p className="mt-1 font-bold">{m.subtopic.name}</p>
                <p className="text-sm text-[var(--study-muted)]">
                  {m.subtopic.topic.curriculum.subject.name} · {Math.round(m.masteryPct)}%
                </p>
                <Link
                  href={`/study/practice/${m.subtopicId}`}
                  className="study-btn study-btn-ghost study-touch-target mt-3 block w-full text-center text-sm"
                >
                  Practice this
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </StudyShell>
  );
}
