"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Menu, PlusCircle, X } from "lucide-react";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";

function BrandMark() {
  return (
    <span className="kf-brand-mark" aria-hidden>
      <KfBrandLogo />
    </span>
  );
}

export type KfHeaderUser = {
  role: "PROVIDER" | "ADMIN";
  email: string;
};

function formatListingCount(count: number): string {
  const n = new Intl.NumberFormat("en-ZA").format(count);
  return count === 1 ? `${n} local listing` : `${n} local listings`;
}

export function KfHeader({
  user,
  publishedListingCount = null,
}: {
  user: KfHeaderUser | null;
  publishedListingCount?: number | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const isAdmin = user?.role === "ADMIN";
  const hideListingCount =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account/listing") ||
    publishedListingCount === null;

  return (
    <header className="kf-header">
      <div className="mx-auto max-w-5xl kf-header-inner">
        <Link href="/" className="kf-brand" onClick={() => setOpen(false)}>
          <BrandMark />
          <div className="min-w-0">
            <div className="kf-wordmark">KasiFind</div>
            {!isHome && <p className="kf-tagline truncate">Find local. Support local.</p>}
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {isAdmin ? (
            <Link href="/admin" className="kf-btn kf-btn-outline text-sm">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Admin portal
            </Link>
          ) : null}
          <Link href="/account/listing" className="kf-btn kf-btn-primary text-sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            List your business
          </Link>
        </nav>

        <button
          type="button"
          className="kf-btn kf-btn-ghost sm:hidden"
          aria-expanded={open}
          aria-controls="kf-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {!hideListingCount ? (
        <p className="kf-header-listing-count mx-auto max-w-5xl" aria-live="polite">
          {formatListingCount(publishedListingCount)}
        </p>
      ) : null}

      {open && (
        <nav
          id="kf-mobile-nav"
          className="border-t border-[var(--kf-border)] bg-white px-4 py-3 sm:hidden kf-animate-in"
          aria-label="Mobile"
        >
          {isAdmin ? (
            <Link
              href="/admin"
              className="kf-btn kf-btn-outline w-full"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Admin portal
            </Link>
          ) : null}
          <Link
            href="/account/listing"
            className={`kf-btn kf-btn-primary w-full${isAdmin ? " mt-2" : ""}`}
            onClick={() => setOpen(false)}
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            List your business
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="kf-btn kf-btn-outline mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              Provider sign in
            </Link>
          ) : null}
        </nav>
      )}
    </header>
  );
}
