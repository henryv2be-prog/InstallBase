import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyShell } from "@/study/components/study-shell";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { localizeFromSubtopicGraph, localizeSubjectName } from "@/study/i18n/localize-content";
import { StudyWeeklyFocus } from "@/study/components/study-weekly-focus";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getLearnerProgressStats, getWeakestMasteries } from "@/study/lib/queries";
import { getWeeklyFocusForLearner } from "@/study/lib/recommendation/service";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyProgressPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const { locale, t } = await getStudyMessages();
  const [stats, weeklyFocus, weakest, improving] = await Promise.all([
    getLearnerProgressStats(learner.id),
    getWeeklyFocusForLearner(learner.id),
    getWeakestMasteries(learner.id, 3),
    getWeakestMasteries(learner.id, 20),
  ]);

  const withAttempts = improving.filter((m) => m.questionsAttempted > 0);
  const best = [...withAttempts].sort((a, b) => b.masteryPct - a.masteryPct).slice(0, 3);

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <h1 className="study-display text-3xl">{t.progress.title}</h1>
        <p className="study-lead mt-2">{t.progress.lead}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 mb-5">
        <div className="study-panel p-4 text-center">
          <p className="study-stat-xl">{stats.completedSessions}</p>
          <p className="text-xs text-[var(--study-muted)] mt-1">{t.progress.sessions}</p>
        </div>
        <div className="study-panel p-4 text-center">
          <p className="study-stat-xl">{stats.streakDays > 0 ? `🔥 ${stats.streakDays}` : "—"}</p>
          <p className="text-xs text-[var(--study-muted)] mt-1">{t.progress.streak}</p>
        </div>
      </section>

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-3">{t.progress.matricGoals}</p>
        <ul className="space-y-4">
          {learner.subjects.map((ls) => {
            const theme = getSubjectTheme(ls.subject.slug);
            return (
              <li key={ls.id}>
                <StudyMasteryBar
                  label={localizeSubjectName(locale, ls.subject.slug, ls.subject.name)}
                  value={ls.demonstratedMarkPct ?? ls.currentMarkPct}
                  accent={theme.accent}
                />
                <p className="mt-1 text-xs text-[var(--study-muted)]">
                  {t.subjects.target(ls.targetMarkPct)}
                  {ls.currentMarkPct >= ls.targetMarkPct - 3
                    ? ` · ${t.progress.inRange}`
                    : ` · ${t.progress.toGo(ls.targetMarkPct - ls.currentMarkPct)}`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {weeklyFocus ? (
        <StudyWeeklyFocus focus={weeklyFocus} sectionLabel={t.progress.weeklyFocus} />
      ) : null}

      {best.length > 0 ? (
        <section className="mb-5">
          <p className="study-section-label mb-2">{t.progress.gettingStronger}</p>
          <ul className="study-panel px-4">
            {best.map((m) => {
              const labels = localizeFromSubtopicGraph(locale, m.subtopic);
              return (
              <li key={m.id} className="study-row">
                <div>
                  <p className="font-semibold">{labels.subtopicName}</p>
                  <p className="text-xs text-[var(--study-muted)]">
                    {labels.subjectName}
                  </p>
                </div>
                <p className="text-xl font-extrabold tabular-nums text-[var(--study-success)]">
                  {Math.round(m.masteryPct)}%
                </p>
              </li>
            );
            })}
          </ul>
        </section>
      ) : (
        <section className="study-panel p-5 mb-5 text-center">
          <p className="font-bold">{t.progress.emptyTitle}</p>
          <p className="mt-2 text-sm text-[var(--study-muted)]">{t.progress.emptyLead}</p>
          <Link href="/study/dashboard" className="study-btn study-btn-primary study-touch-target mt-4 inline-flex w-full">
            {t.progress.emptyCta}
          </Link>
        </section>
      )}

      {weakest.length > 0 ? (
        <section>
          <p className="study-section-label mb-2">{t.progress.biggestGaps}</p>
          <ul className="space-y-2">
            {weakest.map((m) => {
              const labels = localizeFromSubtopicGraph(locale, m.subtopic);
              return (
              <li key={m.id} className="study-panel p-4">
                <p className="text-xs font-bold study-text-link">{t.progress.needsAttention}</p>
                <p className="mt-1 font-bold">{labels.subtopicName}</p>
                <p className="text-sm text-[var(--study-muted)]">
                  {labels.subjectName} · {Math.round(m.masteryPct)}%
                </p>
                <Link
                  href={`/study/practice/${m.subtopicId}`}
                  className="study-btn study-btn-ghost study-touch-target mt-3 block w-full text-center text-sm"
                >
                  {t.progress.practiceThis}
                </Link>
              </li>
            );
            })}
          </ul>
        </section>
      ) : null}
    </StudyShell>
  );
}
