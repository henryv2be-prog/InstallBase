"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { StudyRecommendation } from "@/study/lib/learner-model/types";
import { useStudyContentLabels, useStudyT } from "@/study/components/study-locale-provider";
import { dismissNextStepRecommendation } from "@/study/lib/study-coach-actions";
import { getSubjectTheme } from "@/study/lib/subject-theme";

type Props = {
  recommendation: StudyRecommendation;
  recommendationLogId?: string | null;
};

export function StudyNextStep({ recommendation, recommendationLogId }: Props) {
  const t = useStudyT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const content = useStudyContentLabels();
  const theme = getSubjectTheme(recommendation.subjectSlug);
  const subjectName = content.subject(recommendation.subjectSlug, recommendation.subjectName);
  const subtopicName = content.subtopic(
    recommendation.subjectSlug,
    recommendation.topicSlug,
    recommendation.subtopicSlug,
    recommendation.subtopicName,
  );
  const href = `/study/practice/${recommendation.subtopicId}?mode=${recommendation.suggestedQuizMode}&pick=${recommendation.suggestedQuizPick}`;

  return (
    <section className="study-panel--mission mb-6 relative z-[1]">
      <p className="study-section-label mb-1">{t.dashboard.nextStep}</p>
      <p className="text-xs text-[var(--study-muted)] mb-3">{t.dashboard.nextStepLead}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="study-subject-chip" style={{ borderColor: theme.accent }}>
          <span aria-hidden>{theme.glyph}</span>
          {subjectName}
        </span>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight leading-tight">{subtopicName}</h2>
      <p className="mt-3 text-sm leading-relaxed">{recommendation.reasonSummary}</p>
      <p className="mt-2 text-sm text-[var(--study-muted)]">
        {t.nextStep.atScore(Math.round(recommendation.masteryPct))}
      </p>
      <Link
        href={href}
        className="study-btn study-btn-primary study-touch-target mt-5 block w-full text-center"
      >
        {t.nextStep.start}
      </Link>

      <button
        type="button"
        disabled={pending}
        className="study-btn study-btn-ghost study-touch-target mt-2 w-full text-center text-sm"
        onClick={() => {
          startTransition(async () => {
            await dismissNextStepRecommendation(recommendation.subtopicId, recommendationLogId ?? undefined);
            router.refresh();
          });
        }}
      >
        {t.nextStep.notNow}
      </button>

      <details className="mt-4 rounded-xl border border-[var(--study-border)] bg-black/20 px-4 py-3">
        <summary className="cursor-pointer text-sm font-bold study-text-link">
          {t.nextStep.why}
        </summary>
        <ul className="mt-3 space-y-2.5 text-sm text-[var(--study-muted)] leading-relaxed">
          {recommendation.reasonDetail.map((line) => (
            <li key={line} className="pl-0.5">
              {line}
            </li>
          ))}
        </ul>
        {recommendation.reasonEncouragement ? (
          <p className="mt-4 text-sm leading-relaxed text-[var(--study-text)] border-t border-[var(--study-border)] pt-3">
            {recommendation.reasonEncouragement}
          </p>
        ) : null}
      </details>
    </section>
  );
}
