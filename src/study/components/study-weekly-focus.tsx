import type { WeeklyStudyFocus } from "@/study/lib/recommendation/weekly-study-focus";
import { getSubjectTheme } from "@/study/lib/subject-theme";

type Props = {
  focus: WeeklyStudyFocus;
  sectionLabel: string;
};

export function StudyWeeklyFocus({ focus, sectionLabel }: Props) {
  const theme = getSubjectTheme(focus.subjectSlug);

  return (
    <section className="study-panel p-4 mb-5 border-l-2" style={{ borderLeftColor: theme.accent }}>
      <p className="study-section-label mb-2">{sectionLabel}</p>
      <p className="text-sm font-semibold leading-snug">{focus.headline}</p>
      <p className="mt-2 text-sm text-[var(--study-muted)] leading-relaxed">{focus.detail}</p>
    </section>
  );
}
