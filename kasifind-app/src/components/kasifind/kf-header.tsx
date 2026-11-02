"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Home, LayoutDashboard, LogOut, Menu, PlusCircle, Store, X } from "lucide-react";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";
import { kfSignOutProvider } from "@/lib/kasifind/actions";

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const isHome = pathname === "/";
  const isAdmin = user?.role === "ADMIN";
  const signedIn = Boolean(user);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    setOpen(false);
    startSignOut(async () => {
      await kfSignOutProvider();
      router.push("/");
      router.refresh();
    });
  };
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
            <div className="kf-wordmark">
              Kasi<span className="kf-text-gradient">Find</span>
            </div>
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

      {open ? (
        <nav
          id="kf-mobile-nav"
          className="kf-mobile-nav border-t border-[var(--kf-border)] bg-white px-4 py-3 sm:hidden kf-animate-in"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="kf-btn kf-btn-outline w-full"
              onClick={() => setOpen(false)}
              aria-current={isHome ? "page" : undefined}
            >
              <Home className="h-4 w-4" aria-hidden />
              Home
            </Link>

            {signedIn ? (
              <>
                <Link
                  href="/account/listing"
                  className="kf-btn kf-btn-primary w-full"
                  onClick={() => setOpen(false)}
                  aria-current={pathname.startsWith("/account/listing") ? "page" : undefined}
                >
                  <Store className="h-4 w-4" aria-hidden />
                  My listing
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="kf-btn kf-btn-outline w-full"
                    onClick={() => setOpen(false)}
                    aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                  >
                    <LayoutDashboard className="h-4 w-4" aria-hidden />
                    Admin portal
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="kf-btn kf-btn-ghost w-full text-[var(--kf-charcoal)]"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  {signingOut ? "Signing out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/account/listing"
                  className="kf-btn kf-btn-primary w-full"
                  onClick={() => setOpen(false)}
                >
                  <PlusCircle className="h-4 w-4" aria-hidden />
                  List your business
                </Link>
                <Link
                  href="/login"
                  className="kf-btn kf-btn-outline w-full"
                  onClick={() => setOpen(false)}
                >
                  Provider sign in
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
