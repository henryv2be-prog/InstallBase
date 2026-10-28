import type { ReactNode } from "react";

export function KfEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="kf-empty-state">
      {icon ? <div className="kf-empty-state-icon">{icon}</div> : null}
      <h3 className="kf-empty-state-title">{title}</h3>
      <p className="kf-empty-state-desc">{description}</p>
      {action ? <div className="kf-empty-state-action">{action}</div> : null}
    </div>
  );
}
