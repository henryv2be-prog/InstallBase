import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyShell } from "@/study/components/study-shell";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getWeakestMasteries } from "@/study/lib/queries";

export const dynamic = "force-dynamic";

function priorityLabel(masteryPct: number) {
  if (masteryPct < 50) return { emoji: "🔴", text: "Needs attention" };
  if (masteryPct < 70) return { emoji: "🟡", text: "Keep practising" };
  return { emoji: "🟢", text: "On track" };
}

export default async function StudyDashboardPage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const weakest = await getWeakestMasteries(learner.id, 5);
  const exams = learner.subjects
    .flatMap((ls) =>
      ls.exams.map((exam) => ({
        subjectName: ls.subject.name,
        examAt: exam.examAt,
        paperNumber: exam.paperNumber,
        days: daysUntilExam(exam.examAt),
        target: ls.targetMarkPct,
        current: ls.currentMarkPct,
      })),
    )
    .sort((a, b) => a.days - b.days);

  const topFocus = weakest[0];
  const focusSubject = topFocus?.subtopic.topic.curriculum.subject.name;
  const focusTopic = topFocus?.subtopic.topic.name;
  const focusSubtopic = topFocus?.subtopic.name;
  const focusMastery = topFocus?.masteryPct ?? 0;
  const focusPriority = priorityLabel(focusMastery);

  return (
    <StudyShell title={`Hi, ${learner.displayName.split(" ")[0]}`} subtitle="Today's study plan">
      <section className="mb-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--study-muted)]">Your exams</h2>
        <ul className="space-y-2">
          {exams.map((exam, i) => (
            <li key={`${exam.subjectName}-${i}`} className="study-card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{exam.subjectName}</p>
                <p className="text-xs text-[var(--study-muted)]">
                  Target {exam.target}% · Current est. {exam.current}%
                  {exam.paperNumber ? ` · Paper ${exam.paperNumber}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-[var(--study-accent)]">{exam.days}</p>
                <p className="text-xs text-[var(--study-muted)]">days</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="study-card mb-4 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--study-muted)]">Today&apos;s focus</h2>
        {topFocus ? (
          <div className="mt-3">
            <p className="text-lg font-bold">
              {focusPriority.emoji} {focusSubject} — {focusTopic}
            </p>
            <p className="mt-1 text-sm text-[var(--study-muted)]">{focusSubtopic}</p>
            <p className="mt-3 text-sm">
              Suggested: <span className="font-semibold text-[var(--study-text)]">45 minutes</span>{" "}
              <span className="text-[var(--study-muted)]">({focusPriority.text})</span>
            </p>
            <p className="mt-2 text-xs text-[var(--study-muted)]">
              Initial estimate {Math.round(focusMastery)}% — practice assessments coming next.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--study-muted)]">Complete a topic check to refine your focus.</p>
        )}
      </section>

      <section className="mb-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--study-muted)]">
          Your weakest areas
        </h2>
        <ul className="space-y-2">
          {weakest.map((m) => {
            const subject = m.subtopic.topic.curriculum.subject.name;
            return (
              <li key={m.id} className="study-card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{subject}</p>
                  <p className="truncate text-sm text-[var(--study-muted)]">
                    {m.subtopic.name} — {Math.round(m.masteryPct)}%
                  </p>
                </div>
                <span className="text-lg">{priorityLabel(m.masteryPct).emoji}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <Link
        href="/study/onboarding?edit=1"
        className="study-btn study-btn-ghost study-touch-target block w-full text-center"
      >
        Edit subjects &amp; exam dates
      </Link>
    </StudyShell>
  );
}
