import Link from "next/link";
import type { TodayStudyPlan } from "@/study/lib/study-plan/build-today-plan";

type Props = {
  plan: TodayStudyPlan;
  title: string;
  minutesLabel: (used: number, total: number) => string;
};

export function StudyTodayPlan({ plan, title, minutesLabel }: Props) {
  return (
    <section className="study-panel p-4 mb-5">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <p className="study-section-label">{title}</p>
        <p className="text-xs font-semibold tabular-nums text-[var(--study-muted)]">
          {minutesLabel(plan.usedMinutes, plan.availableMinutes)}
        </p>
      </div>
      <ol className="space-y-3">
        {plan.items.map((item, index) => (
          <li key={item.subtopicId}>
            <Link
              href={`/study/practice/${item.subtopicId}`}
              className="block rounded-xl border border-[var(--study-border)] bg-black/20 px-3 py-3"
            >
              <p className="text-xs font-semibold text-[var(--study-muted)]">
                {index + 1}. {item.subjectName} · ~{item.allocatedMinutes} min
              </p>
              <p className="mt-1 font-bold">{item.subtopicName}</p>
              {item.reasonSummary ? (
                <p className="mt-1 text-xs text-[var(--study-muted)] line-clamp-2">
                  {item.reasonSummary}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
