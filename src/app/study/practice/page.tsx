import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyShell } from "@/study/components/study-shell";
import { ensurePracticeQuestions } from "@/study/lib/seed-questions";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getPracticeLibraryForLearner } from "@/study/lib/queries";

export const dynamic = "force-dynamic";

export default async function StudyPracticePage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  await ensurePracticeQuestions();
  const library = await getPracticeLibraryForLearner(learner.id);

  return (
    <StudyShell title="Practice quizzes" subtitle="Check what you know" backHref="/study/dashboard" backLabel="Dashboard">
      <p className="mb-4 text-sm text-[var(--study-muted)]">
        Each quiz updates your mastery for that subtopic. Questions are{" "}
        <strong className="font-medium text-[var(--study-text)]">practice only</strong>, not official NSC
        papers.
      </p>

      <div className="space-y-4">
        {library.map((subject) => (
          <section key={subject.id}>
            <h2 className="mb-2 text-lg font-semibold">{subject.name}</h2>
            <ul className="space-y-3">
              {subject.topics.flatMap((topic) =>
                topic.subtopics.map((sub) => (
                  <li key={sub.id} className="study-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--study-muted)]">{topic.name}</p>
                        <p className="font-medium">{sub.name}</p>
                        <p className="mt-1 text-xs text-[var(--study-muted)]">
                          Mastery{" "}
                          <span className="font-semibold text-[var(--study-text)]">
                            {sub.masteryPct != null ? `${Math.round(sub.masteryPct)}%` : "—"}
                          </span>
                          {sub.questionsAttempted > 0
                            ? ` · ${sub.questionsAttempted} questions answered`
                            : " · estimate only"}
                        </p>
                      </div>
                      {sub.questionCount > 0 ? (
                        <Link
                          href={`/study/practice/${sub.id}`}
                          className="study-btn study-btn-primary shrink-0 px-4 py-2 text-sm"
                        >
                          Quiz
                        </Link>
                      ) : (
                        <span className="study-pill bg-white/5 text-[var(--study-muted)]">Soon</span>
                      )}
                    </div>
                  </li>
                )),
              )}
            </ul>
          </section>
        ))}
      </div>
    </StudyShell>
  );
}
