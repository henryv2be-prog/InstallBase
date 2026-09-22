import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyShell } from "@/study/components/study-shell";
import { examCountdownFromMessages } from "@/study/i18n/format";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import { subjectOnTrack } from "@/study/lib/home-helpers";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getSubjectMasteryForLearner } from "@/study/lib/queries";
import { getSubjectTheme, masteryBandEmoji } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudySubjectsPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const { locale, t } = await getStudyMessages();
  const subjects = await getSubjectMasteryForLearner(learner.id, locale);

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <h1 className="study-display text-3xl">{t.subjects.title}</h1>
        <p className="study-lead mt-2">{t.subjects.lead}</p>
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
                        {days} {t.common.days} · {examCountdownFromMessages(t, days, onTrack)}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--study-muted)]">
                        {t.profile.gradeLine(learner.schoolYear)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold tabular-nums" style={{ color: theme.accent }}>
                      {displayMastery}%
                    </p>
                    <p className="text-xs text-[var(--study-muted)]">{t.subjects.target(subject.targetMarkPct)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <StudyMasteryBar value={displayMastery} accent={theme.accent} height="sm" animate={false} />
                </div>
                {subject.topics.length > 0 ? (
                  <p className="mt-3 text-xs text-[var(--study-muted)]">
                    {subject.topics.slice(0, 3).map((topic) => (
                      <span key={topic.id} className="mr-2 inline-flex items-center gap-1">
                        {masteryBandEmoji(topic.avgMasteryPct ?? subject.currentMarkPct)} {topic.name}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-[var(--study-muted)]">{t.subjects.mapSoon}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </StudyShell>
  );
}
