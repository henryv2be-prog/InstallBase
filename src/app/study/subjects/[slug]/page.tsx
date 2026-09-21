import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { StudyShell } from "@/study/components/study-shell";
import { masteryBandLabelFromMessages } from "@/study/i18n/format";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { getSubjectMasteryForLearner } from "@/study/lib/queries";
import { getSubjectTheme, masteryBandEmoji } from "@/study/lib/subject-theme";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function StudySubjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    redirect("/study/onboarding");
  }

  const { t } = await getStudyMessages();
  const subjects = await getSubjectMasteryForLearner(learner.id);
  const subject = subjects.find((s) => s.subjectSlug === slug);
  if (!subject) notFound();

  const theme = getSubjectTheme(subject.subjectSlug);
  const overall = Math.round(subject.avgMasteryPct ?? subject.currentMarkPct);

  return (
    <StudyShell
      backHref="/study/subjects"
      backLabel={t.nav.subjects}
      title={subject.subjectName}
      subtitle={t.subjects.masteryMap}
      headerExtra={
        <p className="mt-2 text-4xl font-extrabold tabular-nums" style={{ color: theme.accent }}>
          {overall}%
        </p>
      }
    >
      {subject.topics.length === 0 ? (
        <div className="study-panel p-5 text-center">
          <p className="font-bold">{t.subjects.topicsOnWay}</p>
          <p className="mt-2 text-sm text-[var(--study-muted)]">{t.subjects.topicsOnWayLead}</p>
          <Link href="/study/practice" className="study-btn study-btn-primary study-touch-target mt-5 inline-flex w-full">
            {t.subjects.browsePractice}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subject.topics.map((topic) => {
            const topicPct = Math.round(topic.avgMasteryPct ?? subject.currentMarkPct);
            return (
              <section key={topic.id} className="study-panel p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">{topic.name}</h2>
                  <span className="text-lg font-bold tabular-nums">
                    {masteryBandEmoji(topicPct)} {topicPct}%
                  </span>
                </div>
                <ul className="space-y-1">
                  {topic.subtopics.map((sub) => {
                    const pct = Math.round(sub.masteryPct);
                    const weak = pct < 55;
                    return (
                      <li key={sub.id}>
                        <Link
                          href={`/study/practice/${sub.id}`}
                          className={`study-topic-row ${weak ? "rounded-lg bg-white/[0.03] px-2 -mx-2" : ""}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{sub.name}</p>
                            <p className="text-xs text-[var(--study-muted)]">
                              {masteryBandLabelFromMessages(t, pct)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-extrabold tabular-nums">{pct}%</p>
                            {weak ? (
                              <p className="text-xs font-bold study-text-link">{t.subjects.practice}</p>
                            ) : null}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </StudyShell>
  );
}
