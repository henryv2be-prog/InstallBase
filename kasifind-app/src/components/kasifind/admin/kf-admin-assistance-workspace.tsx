import type { ReactNode } from "react";

type Props = {
  queue: ReactNode;
  children: ReactNode;
  /** When set, mobile shows detail pane and hides queue list. */
  activeRequestId: string | null;
};

export function KfAdminAssistanceWorkspace({ queue, children, activeRequestId }: Props) {
  return (
    <div
      className={`kf-admin-page kf-admin-assistance-workspace${activeRequestId ? " kf-admin-assistance-workspace--detail" : ""}`}
    >
      <header className="kf-admin-assistance-workspace__intro">
        <h2 className="kf-admin-section-title">Listing assistance</h2>
        <p className="text-sm text-[var(--kf-muted)]">
          Review requests, download photos, and edit listings without leaving the queue.
        </p>
      </header>
      <div className="kf-admin-assistance-workspace__grid">
        {queue}
        <div className="kf-admin-assistance-workspace__detail">{children}</div>
      </div>
    </div>
  );
}