import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyLanguageSwitcher } from "@/study/components/study-language-switcher";
import { StudyShell } from "@/study/components/study-shell";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { localizeSubjectName } from "@/study/i18n/localize-content";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { StudyDailyMinutesForm } from "@/study/components/study-daily-minutes-form";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyProfilePage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const { locale, t } = await getStudyMessages();

  return (
    <StudyShell showNav>
      <header className="mb-6">
        <p className="study-section-label">{t.profile.title}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{learner.displayName}</h1>
        <p className="mt-1 text-sm text-[var(--study-muted)]">
          {t.profile.gradeLine(learner.schoolYear)}
        </p>
      </header>

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-1">{t.profile.language}</p>
        <p className="mb-3 text-sm text-[var(--study-muted)]">{t.profile.languageLead}</p>
        <StudyLanguageSwitcher />
      </section>

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-1">{t.profile.dailyStudyTime}</p>
        <p className="mb-3 text-sm text-[var(--study-muted)]">{t.profile.dailyStudyTimeLead}</p>
        <StudyDailyMinutesForm
          initialMinutes={learner.defaultAvailableMinutes}
          label={t.profile.dailyStudyTime}
          saveLabel={t.profile.saveDailyTime}
        />
      </section>

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-3">{t.profile.subjectsTargets}</p>
        <ul className="space-y-3">
          {learner.subjects.map((ls) => {
            const theme = getSubjectTheme(ls.subject.slug);
            const exam = ls.exams[0];
            const days = exam ? daysUntilExam(exam.examAt) : null;
            return (
              <li
                key={ls.id}
                className="rounded-xl p-3"
                style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}33` }}
              >
                <div className="flex justify-between gap-2">
                  <p className="font-bold">
                    {theme.glyph}{" "}
                    {localizeSubjectName(locale, ls.subject.slug, ls.subject.name)}
                  </p>
                  {days != null ? (
                    <p className="text-sm font-bold tabular-nums">{days}d</p>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--study-muted)]">
                  {t.profile.nowAiming(
                    ls.demonstratedMarkPct ?? ls.currentMarkPct,
                    ls.targetMarkPct,
                  )}
                </p>
                {ls.demonstratedMarkPct != null &&
                Math.abs(ls.demonstratedMarkPct - ls.currentMarkPct) >= 4 ? (
                  <p className="mt-1 text-xs text-[var(--study-muted)]">
                    {t.profile.demonstrated(Math.round(ls.demonstratedMarkPct))} ·{" "}
                    {t.profile.selfReported(Math.round(ls.currentMarkPct))}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-3">
        <Link
          href="/study/onboarding?edit=1"
          className="study-btn study-btn-primary study-touch-target block w-full text-center"
        >
          {t.profile.update}
        </Link>
        <Link
          href="/study"
          className="study-btn study-btn-ghost study-touch-target block w-full text-center text-sm"
        >
          {t.profile.about}
        </Link>
      </div>
    </StudyShell>
  );
}
