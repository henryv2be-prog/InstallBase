import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  queue: ReactNode;
  children: ReactNode;
  /** When set, mobile shows detail pane and hides queue list. */
  activeRequestId: string | null;
  mobileBackHref?: string;
};

export function KfAdminAssistanceWorkspace({ queue, children, activeRequestId, mobileBackHref }: Props) {
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
        <div className="kf-admin-assistance-workspace__detail">
          {activeRequestId && mobileBackHref ? (
            <Link href={mobileBackHref} className="kf-admin-master-detail-mobile-back lg:hidden">
              ← Back to queue
            </Link>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}