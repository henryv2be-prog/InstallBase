import Link from "next/link";
import type { StudyRecommendation } from "@/study/lib/learner-model/types";
import { getSubjectTheme } from "@/study/lib/subject-theme";

type Props = {
  recommendation: StudyRecommendation;
};

export function StudyNextStep({ recommendation }: Props) {
  const theme = getSubjectTheme(recommendation.subjectSlug);
  const href = `/study/practice/${recommendation.subtopicId}?mode=${recommendation.suggestedQuizMode}`;

  return (
    <section className="study-panel--mission mb-6 relative z-[1]">
      <p className="study-section-label mb-2">Your next step</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="study-subject-chip" style={{ borderColor: theme.accent }}>
          <span aria-hidden>{theme.glyph}</span>
          {recommendation.subjectName}
        </span>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
        {recommendation.subtopicName}
      </h2>
      <p className="mt-1 text-sm text-[var(--study-muted)]">{recommendation.topicName}</p>
      <p className="mt-3 text-sm leading-relaxed">{recommendation.reasonSummary}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
        <span className="study-pill study-pill--soft">~{recommendation.estimatedMinutes} min</span>
        <span className="study-pill study-pill--soft tabular-nums">
          {Math.round(recommendation.masteryPct)}% mastery
        </span>
      </div>
      <Link
        href={href}
        className="study-btn study-btn-primary study-touch-target mt-5 block w-full text-center"
      >
        Start
      </Link>

      <details className="mt-5 rounded-xl border border-[var(--study-border)] bg-black/20 px-4 py-3">
        <summary className="cursor-pointer text-sm font-bold text-[var(--study-accent-2)]">
          Why this?
        </summary>
        <ul className="mt-3 space-y-2 text-sm text-[var(--study-muted)]">
          {recommendation.reasonDetail.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
