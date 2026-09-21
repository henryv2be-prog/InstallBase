import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyShell } from "@/study/components/study-shell";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyProfilePage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  return (
    <StudyShell showNav>
      <header className="mb-6">
        <p className="study-section-label">Your matric profile</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{learner.displayName}</h1>
        <p className="mt-1 text-sm text-[var(--study-muted)]">Grade 12 · NSC · {learner.schoolYear}</p>
      </header>

      <section className="study-panel p-4 mb-5">
        <p className="study-section-label mb-3">Subjects &amp; targets</p>
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
                    {theme.glyph} {ls.subject.name}
                  </p>
                  {days != null ? (
                    <p className="text-sm font-bold tabular-nums">{days}d</p>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--study-muted)]">
                  Now ~{ls.currentMarkPct}% → aiming for {ls.targetMarkPct}%
                </p>
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
          Update subjects &amp; exam dates
        </Link>
        <Link
          href="/study"
          className="study-btn study-btn-ghost study-touch-target block w-full text-center text-sm"
        >
          About Study Coach
        </Link>
      </div>
    </StudyShell>
  );
}
