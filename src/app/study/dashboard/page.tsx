import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyNextStep } from "@/study/components/study-next-step";
import { StudyShell } from "@/study/components/study-shell";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import {
  examCountdownMessage,
  studyEncouragementLine,
  studyGreeting,
  subjectOnTrack,
} from "@/study/lib/home-helpers";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getLearnerProgressStats } from "@/study/lib/queries";
import {
  getNextStudyRecommendation,
  logRecommendationShown,
} from "@/study/lib/recommendation/service";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyDashboardPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const firstName = learner.displayName.split(" ")[0] ?? learner.displayName;
  const [recommendation, activity] = await Promise.all([
    getNextStudyRecommendation(learner.id),
    getLearnerProgressStats(learner.id),
  ]);

  if (recommendation) {
    await logRecommendationShown(learner.id, recommendation);
  }

  const exams = learner.subjects
    .flatMap((ls) =>
      ls.exams.map((exam) => ({
        subjectName: ls.subject.name,
        subjectSlug: ls.subject.slug,
        examAt: exam.examAt,
        days: daysUntilExam(exam.examAt),
        target: ls.targetMarkPct,
        current: ls.currentMarkPct,
      })),
    )
    .sort((a, b) => a.days - b.days);

  const nextExam = exams[0];
  const progressSubject = learner.subjects.find(
    (s) => s.subject.name === nextExam?.subjectName,
  );
  const progressPct = progressSubject?.currentMarkPct ?? 0;
  const targetPct = progressSubject?.targetMarkPct ?? 75;

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <p className="text-lg font-bold tracking-tight">{studyGreeting(firstName)}</p>
        <p className="mt-1 text-base text-[var(--study-muted)]">{studyEncouragementLine()}</p>
        {nextExam ? (
          <p className="mt-3 text-sm">
            <span className="font-bold text-[var(--study-accent-2)] tabular-nums">
              {nextExam.days}
            </span>{" "}
            <span className="text-[var(--study-muted)]">days until {nextExam.subjectName}</span>
          </p>
        ) : null}
      </header>

      {recommendation ? (
        <StudyNextStep recommendation={recommendation} />
      ) : (
        <section className="study-panel--mission mb-6 relative z-[1]">
          <p className="study-section-label mb-2">Your next step</p>
          <h2 className="text-xl font-bold">Let&apos;s start</h2>
          <p className="mt-2 text-sm text-[var(--study-muted)]">
            Answer a few questions so we can learn where you&apos;re strong and where to focus.
          </p>
          <Link
            href="/study/practice"
            className="study-btn study-btn-primary study-touch-target mt-5 block w-full text-center"
          >
            Start your first session
          </Link>
        </section>
      )}

      {progressSubject ? (
        <section className="study-panel p-4 mb-5">
          <p className="study-section-label mb-3">Your progress</p>
          <StudyMasteryBar
            label={nextExam?.subjectName ?? "Matric"}
            value={progressPct}
            accent={getSubjectTheme(nextExam?.subjectSlug ?? "default").accent}
          />
          <p className="mt-2 text-sm text-[var(--study-muted)]">
            Target:{" "}
            <span className="font-bold text-[var(--study-text)] tabular-nums">{targetPct}%</span>
            {recommendation ? (
              <>
                {" "}
                · Coach picked {recommendation.subtopicName} from your recent results
              </>
            ) : null}
          </p>
        </section>
      ) : null}

      {(activity.streakDays > 0 || activity.completedSessions > 0) && (
        <section className="mb-5 flex gap-3">
          {activity.streakDays > 0 ? (
            <div className="study-panel flex-1 p-3 text-center">
              <p className="text-2xl font-extrabold">🔥 {activity.streakDays}</p>
              <p className="text-xs text-[var(--study-muted)]">day streak</p>
            </div>
          ) : null}
          <div className="study-panel flex-1 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{activity.completedSessions}</p>
            <p className="text-xs text-[var(--study-muted)]">sessions done</p>
          </div>
        </section>
      )}

      {exams.length > 0 ? (
        <section className="mb-4">
          <p className="study-section-label mb-2">Coming up</p>
          <ul className="study-panel px-4">
            {exams.slice(0, 3).map((exam, i) => {
              const onTrack = subjectOnTrack(exam.current, exam.target, null);
              return (
                <li key={`${exam.subjectName}-${i}`} className="study-row">
                  <div>
                    <p className="font-semibold">{exam.subjectName}</p>
                    <p className="text-xs text-[var(--study-muted)]">
                      {examCountdownMessage(exam.days, onTrack)}
                    </p>
                  </div>
                  <p className="study-stat-xl text-[var(--study-accent-2)]">{exam.days}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="text-center text-xs text-[var(--study-muted)] px-2">
        Not feeling this topic?{" "}
        <Link href="/study/practice" className="font-semibold text-[var(--study-accent-2)] underline">
          Choose something else
        </Link>{" "}
        — you&apos;re always in control.
      </p>
    </StudyShell>
  );
}
