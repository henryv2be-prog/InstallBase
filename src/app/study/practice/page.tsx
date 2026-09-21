import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyShell } from "@/study/components/study-shell";
import { masteryBandLabelFromMessages } from "@/study/i18n/format";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { localizeFromSubtopicGraph } from "@/study/i18n/localize-content";
import { ensurePracticeQuestions } from "@/study/lib/seed-questions";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getPracticeLibraryForLearner, getWeakestMasteries } from "@/study/lib/queries";
import { getSubjectTheme } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

export default async function StudyPracticePage() {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const { locale, t } = await getStudyMessages();
  await ensurePracticeQuestions();
  const [library, weakest] = await Promise.all([
    getPracticeLibraryForLearner(learner.id, locale),
    getWeakestMasteries(learner.id, 4),
  ]);

  return (
    <StudyShell showNav>
      <header className="mb-5">
        <h1 className="study-display text-3xl">{t.practice.title}</h1>
        <p className="study-lead mt-2">{t.practice.lead}</p>
      </header>

      {weakest.length > 0 ? (
        <section className="mb-6">
          <p className="study-section-label mb-2">{t.progress.needsAttention}</p>
          <ul className="space-y-2">
            {weakest.map((m) => {
              const labels = localizeFromSubtopicGraph(locale, m.subtopic);
              return (
              <li key={m.id}>
                <Link
                  href={`/study/practice/${m.subtopicId}`}
                  className="study-panel block p-4 active:scale-[0.99] transition"
                >
                  <p className="text-xs font-bold study-text-link">{t.practice.needsWork}</p>
                  <p className="mt-1 text-lg font-extrabold">{labels.subtopicName}</p>
                  <p className="text-sm text-[var(--study-muted)]">
                    {labels.subjectName} · {Math.round(m.masteryPct)}% ·{" "}
                    {masteryBandLabelFromMessages(t, m.masteryPct)}
                  </p>
                  <span className="study-btn study-btn-primary study-touch-target mt-3 inline-flex w-full justify-center text-sm">
                    {t.practice.practiceNow}
                  </span>
                </Link>
              </li>
            );
            })}
          </ul>
        </section>
      ) : null}

      <p className="study-section-label mb-3">{t.practice.allTopics}</p>
      <div className="space-y-5">
        {library.map((subject) => {
          const theme = getSubjectTheme(subject.slug);
          return (
            <section key={subject.id}>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold">
                <span aria-hidden>{theme.glyph}</span> {subject.name}
              </h2>
              <ul className="space-y-2">
                {subject.topics.flatMap((topic) =>
                  topic.subtopics.map((sub) => (
                    <li key={sub.id}>
                      {sub.questionCount > 0 ? (
                        <Link
                          href={`/study/practice/${sub.id}`}
                          className="study-topic-row px-1 -mx-1 rounded-lg hover:bg-white/[0.03]"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-[var(--study-muted)]">{topic.name}</p>
                            <p className="font-semibold truncate">{sub.name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold tabular-nums">
                              {sub.masteryPct != null ? `${Math.round(sub.masteryPct)}%` : "—"}
                            </p>
                            {sub.officialCount > 0 ? (
                              <p className="text-[0.65rem] text-emerald-300/90">{t.common.nsc}</p>
                            ) : null}
                          </div>
                        </Link>
                      ) : (
                        <div className="study-row opacity-60">
                          <div>
                            <p className="text-xs text-[var(--study-muted)]">{topic.name}</p>
                            <p className="font-medium">{sub.name}</p>
                          </div>
                          <span className="study-pill study-pill--soft">{t.common.soon}</span>
                        </div>
                      )}
                    </li>
                  )),
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </StudyShell>
  );
}
