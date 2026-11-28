import type { ReactNode } from "react";

export function KfEmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** Shorter padding and type — wizard hints and narrow panels */
  compact?: boolean;
}) {
  const rootClass = [
    "kf-empty-state",
    compact ? "kf-empty-state--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {icon ? <div className="kf-empty-state-icon">{icon}</div> : null}
      <h3 className="kf-empty-state-title">{title}</h3>
      <p className="kf-empty-state-desc">{description}</p>
      {action ? <div className="kf-empty-state-action">{action}</div> : null}
    </div>
  );
}
