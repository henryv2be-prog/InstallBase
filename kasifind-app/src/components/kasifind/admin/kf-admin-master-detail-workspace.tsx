import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  queue: ReactNode;
  children: ReactNode;
  activeId: string | null;
};

export function KfAdminMasterDetailWorkspace({ title, description, queue, children, activeId }: Props) {
  return (
    <div
      className={`kf-admin-page kf-admin-master-detail-workspace${activeId ? " kf-admin-master-detail-workspace--detail" : ""}`}
    >
      <header className="kf-admin-master-detail-workspace__intro">
        <h2 className="kf-admin-section-title">{title}</h2>
        <p className="text-sm text-[var(--kf-muted)]">{description}</p>
      </header>
      <div className="kf-admin-master-detail-workspace__grid">
        {queue}
        <div className="kf-admin-master-detail-workspace__detail">{children}</div>
      </div>
    </div>
  );
}