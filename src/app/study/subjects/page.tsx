import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyShell } from "@/study/components/study-shell";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import { examCountdownMessage, subjectOnTrack } from "@/study/lib/home-helpers";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getSubjectMasteryForLearner } from "@/study/lib/queries";
import { getSubjectTheme, masteryBandEmoji } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudySubjectsPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const subjects = await getSubjectMasteryForLearner(learner.id);

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <h1 className="study-display text-3xl">Your subjects</h1>
        <p className="study-lead mt-2">Tap a subject to see where you&apos;re strong — and where to focus.</p>
      </header>

      <ul className="space-y-3">
        {subjects.map((subject) => {
          const theme = getSubjectTheme(subject.subjectSlug);
          const displayMastery = Math.round(
            subject.avgMasteryPct ?? subject.currentMarkPct,
          );
          const days = subject.nextExamAt ? daysUntilExam(subject.nextExamAt) : null;
          const onTrack = subjectOnTrack(
            subject.currentMarkPct,
            subject.targetMarkPct,
            subject.avgMasteryPct,
          );

          return (
            <li key={subject.subjectId}>
              <Link
                href={`/study/subjects/${subject.subjectSlug}`}
                className="study-panel block p-4 transition active:scale-[0.99]"
                style={{
                  borderColor: `${theme.accent}33`,
                  background: `linear-gradient(135deg, ${theme.accentSoft}, rgba(255,255,255,0.02))`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xl" aria-hidden>
                      {theme.glyph}
                    </span>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight">{subject.subjectName}</h2>
                    {days != null ? (
                      <p className="mt-1 text-xs text-[var(--study-muted)]">
                        {days} days · {examCountdownMessage(days, onTrack)}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--study-muted)]">NSC · Grade 12</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold tabular-nums" style={{ color: theme.accent }}>
                      {displayMastery}%
                    </p>
                    <p className="text-xs text-[var(--study-muted)]">Target {subject.targetMarkPct}%</p>
                  </div>
                </div>
                <div className="mt-3">
                  <StudyMasteryBar value={displayMastery} accent={theme.accent} height="sm" animate={false} />
                </div>
                {subject.topics.length > 0 ? (
                  <p className="mt-3 text-xs text-[var(--study-muted)]">
                    {subject.topics.slice(0, 3).map((t) => (
                      <span key={t.id} className="mr-2 inline-flex items-center gap-1">
                        {masteryBandEmoji(t.avgMasteryPct ?? subject.currentMarkPct)} {t.name}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-[var(--study-muted)]">Topic map coming soon for this subject.</p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </StudyShell>
  );
}
