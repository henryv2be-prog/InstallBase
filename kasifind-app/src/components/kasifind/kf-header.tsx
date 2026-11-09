"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Home, LayoutDashboard, LogOut, Map, Menu, PlusCircle, Store, X } from "lucide-react";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";
import { KfTrustNavLinks } from "@/components/kasifind/kf-trust-nav-links";
import { kfSignOutProvider } from "@/lib/kasifind/actions";
import { KF_ADMIN_NAV_LINKS } from "@/lib/kasifind/admin-nav-links";

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
  const isActivityMap = pathname.startsWith("/activity-map");
  const isAdmin = user?.role === "ADMIN";
  const signedIn = Boolean(user);
  const adminMobileMenu = isAdmin && pathname.startsWith("/admin");
  const desktopNavClass = adminMobileMenu ? "hidden lg:flex" : "hidden sm:flex";
  const mobileMenuBtnClass = adminMobileMenu ? "lg:hidden" : "sm:hidden";

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
    pathname.startsWith("/activity-map") ||
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

        <nav className={`items-center gap-1 ${desktopNavClass}`} aria-label="Main">
          <Link
            href="/activity-map"
            className="kf-btn kf-btn-outline text-sm"
            aria-current={isActivityMap ? "page" : undefined}
          >
            <Map className="h-4 w-4" aria-hidden />
            Activity Map
          </Link>
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
          className={`kf-btn kf-btn-ghost ${mobileMenuBtnClass}`}
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
          className={`kf-mobile-nav border-t border-[var(--kf-border)] bg-white px-4 py-3 kf-animate-in ${mobileMenuBtnClass}`}
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
            <Link
              href="/activity-map"
              className="kf-btn kf-btn-outline w-full"
              onClick={() => setOpen(false)}
              aria-current={isActivityMap ? "page" : undefined}
            >
              <Map className="h-4 w-4" aria-hidden />
              Activity Map
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
                  <div className="kf-mobile-admin-links" aria-label="Admin sections">
                    <p className="kf-mobile-admin-kicker">Admin portal</p>
                    {KF_ADMIN_NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
                      const active = exact ? pathname === href : pathname.startsWith(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`kf-btn kf-btn-outline w-full${active ? " kf-mobile-admin-link--active" : ""}`}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
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
            <KfTrustNavLinks onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
