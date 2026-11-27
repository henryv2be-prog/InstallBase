"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { KfAdminMobileNav } from "@/components/kasifind/admin/kf-admin-mobile-nav";
import { KfAdminNav } from "@/components/kasifind/admin/kf-admin-nav";

type Props = {
  children: ReactNode;
  unreadNotificationCount?: number;
};

export function KfAdminShell({ children, unreadNotificationCount = 0 }: Props) {
  return (
    <div className="kf-admin-shell">
      <header className="kf-admin-shell__header kf-admin-hero kf-admin-hero--compact-mobile">
        <div className="kf-admin-shell__header-main">
          <p className="kf-admin-hero-kicker">KasiFind admin</p>
          <h1 className="kf-admin-hero-title">Operations console</h1>
          <p className="kf-admin-hero-sub kf-admin-shell__header-sub">
            Manage providers, listings, and community activity.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/admin/notifications" className="kf-btn kf-btn-outline relative text-sm">
            Alerts
            {unreadNotificationCount > 0 ? (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--kf-accent)] px-1.5 py-0 text-xs font-semibold text-white">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            ) : null}
          </Link>
          <Link href="/" className="kf-btn kf-btn-outline text-sm">
            Public site
          </Link>
        </div>
      </header>

      <div className="kf-admin-shell__frame">
        <aside className="kf-admin-shell__sidebar" aria-label="Admin sidebar">
          <KfAdminNav />
        </aside>
        <div className="kf-admin-shell__content">{children}</div>
      </div>

      <KfAdminMobileNav />
    </div>
  );
}