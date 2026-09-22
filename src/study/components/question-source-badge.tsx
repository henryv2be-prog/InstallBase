type Props = {
  isOfficial: boolean;
  sourceYear?: number | null;
  sourcePaperNumber?: number | null;
  sourceQuestionRef?: string | null;
};

export function QuestionSourceBadge({
  isOfficial,
  sourceYear,
  sourcePaperNumber,
  sourceQuestionRef,
}: Props) {
  if (isOfficial) {
    return (
      <span className="study-pill bg-emerald-500/15 text-emerald-200">
        Official NSC
        {sourceYear ? ` · ${sourceYear}` : ""}
        {sourcePaperNumber ? ` · P${sourcePaperNumber}` : ""}
        {sourceQuestionRef ? ` · Q${sourceQuestionRef}` : ""}
      </span>
    );
  }
  return <span className="study-pill bg-white/5 text-[var(--study-muted)]">Practice</span>;
}
