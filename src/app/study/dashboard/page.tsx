import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyMasteryBar } from "@/study/components/study-mastery-bar";
import { StudyShell } from "@/study/components/study-shell";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import {
  estimateSessionMinutes,
  examCountdownMessage,
  studyEncouragementLine,
  studyGreeting,
  subjectOnTrack,
} from "@/study/lib/home-helpers";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getLearnerProgressStats, getWeakestMasteries } from "@/study/lib/queries";
import { getSubjectTheme, masteryBandLabel } from "@/study/lib/subject-theme";
import { QUIZ_SIZE } from "@/study/lib/quiz-types";

export const dynamic = "force-dynamic";

export default async function StudyDashboardPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const firstName = learner.displayName.split(" ")[0] ?? learner.displayName;
  const [weakest, activity] = await Promise.all([
    getWeakestMasteries(learner.id, 5),
    getLearnerProgressStats(learner.id),
  ]);

  const mission = weakest[0];
  const missionSubjectSlug =
    mission?.subtopic.topic.curriculum.subject.slug ?? "default";
  const missionTheme = getSubjectTheme(missionSubjectSlug);
  const questionCount = Math.min(QUIZ_SIZE, 8);
  const sessionMins = estimateSessionMinutes(questionCount);

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

      <section className="study-panel--mission mb-6 relative z-[1]">
        <p className="study-section-label mb-2">Today&apos;s mission</p>
        {mission ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="study-subject-chip" style={{ borderColor: missionTheme.accent }}>
                <span aria-hidden>{missionTheme.glyph}</span>
                {mission.subtopic.topic.curriculum.subject.name}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
              {mission.subtopic.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--study-muted)]">{mission.subtopic.topic.name}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="study-pill study-pill--soft">~{sessionMins} min</span>
              <span className="study-pill study-pill--soft">Up to {questionCount} questions</span>
            </div>
            <Link
              href={`/study/practice/${mission.subtopicId}`}
              className="study-btn study-btn-primary study-touch-target mt-5 block w-full text-center"
            >
              Start
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Let&apos;s start</h2>
            <p className="mt-2 text-sm text-[var(--study-muted)]">
              Your first session will shape what we recommend next.
            </p>
            <Link
              href="/study/practice"
              className="study-btn study-btn-primary study-touch-target mt-5 block w-full text-center"
            >
              Start your first session
            </Link>
          </>
        )}
      </section>

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
            {mission ? (
              <>
                {" "}
                · {masteryBandLabel(mission.masteryPct)}
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
            {exams.slice(0, 4).map((exam, i) => {
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

      {mission && mission.masteryPct < 55 ? (
        <section className="study-panel p-4 mb-4 border-[var(--study-warn)]/30">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--study-warn)]">
            This needs some work
          </p>
          <p className="mt-2 text-lg font-bold">{mission.subtopic.name}</p>
          <p className="text-3xl font-extrabold tabular-nums">{Math.round(mission.masteryPct)}%</p>
          <p className="mt-2 text-sm text-[var(--study-muted)]">
            That&apos;s okay — you&apos;ve got time. A short session here can move the needle.
          </p>
          <Link
            href={`/study/practice/${mission.subtopicId}`}
            className="study-btn study-btn-ghost study-touch-target mt-4 block w-full text-center"
          >
            Practice {mission.subtopic.name}
          </Link>
        </section>
      ) : null}
    </StudyShell>
  );
}
