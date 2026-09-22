import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyNextStep } from "@/study/components/study-next-step";
import { StudyWeeklyFocus } from "@/study/components/study-weekly-focus";
import { StudyShell } from "@/study/components/study-shell";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import { subjectOnTrack } from "@/study/lib/home-helpers";
import {
  examCountdownFromMessages,
  studyEncouragementFromMessages,
  studyGreetingFromMessages,
} from "@/study/i18n/format";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { localizeSubjectName } from "@/study/i18n/localize-content";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getLearnerProgressStats } from "@/study/lib/queries";
import {
  getNextStudyRecommendation,
  getTodayStudyPlanForLearner,
  getWeeklyFocusForLearner,
  logRecommendationShown,
} from "@/study/lib/recommendation/service";
import { StudyTodayPlan } from "@/study/components/study-today-plan";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyDashboardPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const { locale, t } = await getStudyMessages();
  const firstName = learner.displayName.split(" ")[0] ?? learner.displayName;
  const [recommendation, weeklyFocus, activity, todayPlan] = await Promise.all([
    getNextStudyRecommendation(learner.id),
    getWeeklyFocusForLearner(learner.id),
    getLearnerProgressStats(learner.id),
    getTodayStudyPlanForLearner(learner.id),
  ]);

  let recommendationLogId: string | null = null;
  if (recommendation) {
    recommendationLogId = await logRecommendationShown(learner.id, recommendation);
  }

  const exams = learner.subjects
    .flatMap((ls) =>
      ls.exams.map((exam) => ({
        subjectName: localizeSubjectName(locale, ls.subject.slug, ls.subject.name),
        subjectSlug: ls.subject.slug,
        examAt: exam.examAt,
        days: daysUntilExam(exam.examAt),
        target: ls.targetMarkPct,
        current: ls.demonstratedMarkPct ?? ls.currentMarkPct,
      })),
    )
    .sort((a, b) => a.days - b.days);

  const nextExam = exams[0];

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <p className="text-lg font-bold tracking-tight">
          {studyGreetingFromMessages(t, firstName)}
        </p>
        <p className="mt-1 text-base text-[var(--study-muted)]">
          {studyEncouragementFromMessages(t)}
        </p>
        {nextExam ? (
          <p className="mt-3 text-sm">
            <span className="font-bold study-text-emphasis tabular-nums">
              {nextExam.days}
            </span>{" "}
            <span className="text-[var(--study-muted)]">
              {t.common.daysUntil(nextExam.subjectName)}
            </span>
          </p>
        ) : null}
      </header>

      {todayPlan ? (
        <StudyTodayPlan
          plan={todayPlan}
          title={t.dashboard.todayPlan}
          minutesLabel={t.dashboard.planMinutes}
        />
      ) : null}

      {weeklyFocus ? (
        <StudyWeeklyFocus focus={weeklyFocus} sectionLabel={t.dashboard.weeklyFocus} />
      ) : null}

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-1">{t.dashboard.yourSubjects}</p>
        <p className="text-xs text-[var(--study-muted)] mb-3">{t.dashboard.subjectsLead}</p>
        <ul className="space-y-4">
          {learner.subjects.map((ls) => {
            const name = localizeSubjectName(locale, ls.subject.slug, ls.subject.name);
            const theme = getSubjectTheme(ls.subject.slug);
            return (
              <li key={ls.id}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold">
                    <span aria-hidden>{theme.glyph}</span> {name}
                  </p>
                  <p className="text-sm tabular-nums text-[var(--study-muted)] shrink-0">
                    {t.common.marksNowToGoal(
                      ls.demonstratedMarkPct ?? ls.currentMarkPct,
                      ls.targetMarkPct,
                    )}
                  </p>
                </div>
                <StudyMasteryBar
                  value={ls.demonstratedMarkPct ?? ls.currentMarkPct}
                  accent={theme.accent}
                  height="sm"
                  animate={false}
                />
                <Link
                  href={`/study/subjects/${ls.subject.slug}`}
                  className="mt-2 inline-block text-xs font-semibold study-text-link"
                >
                  {t.dashboard.seeTopics}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {recommendation ? (
        <StudyNextStep recommendation={recommendation} recommendationLogId={recommendationLogId} />
      ) : (
        <section className="study-panel--mission mb-6 relative z-[1]">
          <p className="study-section-label mb-2">{t.dashboard.nextStep}</p>
          <h2 className="text-xl font-bold">{t.dashboard.emptyTitle}</h2>
          <p className="mt-2 text-sm text-[var(--study-muted)]">{t.dashboard.emptyLead}</p>
          <Link
            href="/study/practice"
            className="study-btn study-btn-primary study-touch-target mt-5 block w-full text-center"
          >
            {t.dashboard.emptyCta}
          </Link>
        </section>
      )}

      {(activity.streakDays > 0 || activity.completedSessions > 0) && (
        <section className="mb-5 flex gap-3">
          {activity.streakDays > 0 ? (
            <div className="study-panel flex-1 p-3 text-center">
              <p className="text-2xl font-extrabold">🔥 {activity.streakDays}</p>
              <p className="text-xs text-[var(--study-muted)]">{t.dashboard.streak}</p>
            </div>
          ) : null}
          <div className="study-panel flex-1 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{activity.completedSessions}</p>
            <p className="text-xs text-[var(--study-muted)]">{t.dashboard.sessionsDone}</p>
          </div>
        </section>
      )}

      {exams.length > 0 ? (
        <section className="mb-4">
          <p className="study-section-label mb-2">{t.dashboard.comingUp}</p>
          <ul className="study-panel px-4">
            {exams.slice(0, 3).map((exam, i) => {
              const onTrack = subjectOnTrack(exam.current, exam.target, null);
              return (
                <li key={`${exam.subjectName}-${i}`} className="study-row">
                  <div>
                    <p className="font-semibold">{exam.subjectName}</p>
                    <p className="text-xs text-[var(--study-muted)]">
                      {examCountdownFromMessages(t, exam.days, onTrack)}
                    </p>
                  </div>
                  <p className="study-stat-xl">{exam.days}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="text-center text-xs text-[var(--study-muted)] px-2">
        {t.dashboard.override}{" "}
        <Link href="/study/practice" className="font-semibold study-text-link underline">
          {t.dashboard.chooseElse}
        </Link>{" "}
        — {t.dashboard.controlNote}
      </p>
    </StudyShell>
  );
}
