"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { KfAdminMobileNav } from "@/components/kasifind/admin/kf-admin-mobile-nav";
import { KfAdminNav } from "@/components/kasifind/admin/kf-admin-nav";

type Props = {
  children: ReactNode;
};

export function KfAdminShell({ children }: Props) {
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
        <Link href="/" className="kf-btn kf-btn-outline text-sm shrink-0">
          Public site
        </Link>
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