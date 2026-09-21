import { StudyContentSourceKind } from "@/generated/prisma/client";

type Props = {
  sourceKind: StudyContentSourceKind;
  isOfficial?: boolean;
  sourceYear?: number | null;
  sourcePaperNumber?: number | null;
  sourceQuestionRef?: string | null;
};

export function QuestionSourceBadge({
  sourceKind,
  isOfficial,
  sourceYear,
  sourcePaperNumber,
  sourceQuestionRef,
}: Props) {
  const official =
    isOfficial ??
    (sourceKind === StudyContentSourceKind.OFFICIAL_PAST_PAPER);

  if (official) {
    return (
      <span className="study-pill bg-emerald-500/15 text-emerald-200">
        Exam-style
        {sourceYear ? ` · ${sourceYear}` : ""}
        {sourcePaperNumber ? ` · P${sourcePaperNumber}` : ""}
        {sourceQuestionRef ? ` · Q${sourceQuestionRef}` : ""}
      </span>
    );
  }
  if (sourceKind === StudyContentSourceKind.GENERATED_PRACTICE) {
    return (
      <span className="study-pill bg-sky-500/10 text-sky-200/90">Generated practice</span>
    );
  }
  return <span className="study-pill bg-white/5 text-[var(--study-muted)]">Practice</span>;
}
