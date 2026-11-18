import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  queue: ReactNode;
  children: ReactNode;
  activeId: string | null;
  /** Shown above detail on mobile when a row is open (queue aside is hidden). */
  mobileBackHref?: string;
};

export function KfAdminMasterDetailWorkspace({
  title,
  description,
  queue,
  children,
  activeId,
  mobileBackHref,
}: Props) {
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
        <div className="kf-admin-master-detail-workspace__detail">
          {activeId && mobileBackHref ? (
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