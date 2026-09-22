type Props = {
  value: number;
  accent?: string;
  height?: "sm" | "md" | "lg";
  animate?: boolean;
  label?: string;
};

export function StudyMasteryBar({
  value,
  accent,
  height = "md",
  animate = true,
  label,
}: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="study-mastery-bar">
      {label ? (
        <div className="study-mastery-bar__header">
          <span className="study-mastery-bar__label">{label}</span>
          <span className="study-mastery-bar__value tabular-nums">{clamped}%</span>
        </div>
      ) : null}
      <div
        className={`study-mastery-bar__track study-mastery-bar__track--${height}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ? `${label} ${clamped}%` : `Progress ${clamped}%`}
      >
        <div
          className={`study-mastery-bar__fill ${animate ? "study-mastery-bar__fill--animate" : ""}`}
          style={{
            width: `${clamped}%`,
            ...(accent ? { background: accent } : {}),
          }}
        />
      </div>
    </div>
  );
}
