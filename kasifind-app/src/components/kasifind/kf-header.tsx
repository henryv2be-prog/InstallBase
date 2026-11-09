"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Map, Menu, PlusCircle, X } from "lucide-react";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";
import { kfSignOutProvider } from "@/lib/kasifind/actions";
import { KfMobileNavMenu } from "@/components/kasifind/kf-mobile-nav-menu";

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
  const isListingFlow =
    pathname.startsWith("/account/listing") || pathname.startsWith("/account/insights");
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
    isListingFlow ||
    pathname.startsWith("/activity-map") ||
    publishedListingCount === null;

  const listingCtaHref = signedIn ? "/account/listing" : "/account/listing";
  const listingCtaLabel = signedIn ? "My listing" : "List your business";

  return (
    <header className="kf-header">
      <div className="mx-auto max-w-5xl kf-header-inner">
        <Link href="/" className="kf-brand" onClick={() => setOpen(false)}>
          <BrandMark />
          <div className="min-w-0">
            <div className="kf-wordmark">
              Kasi<span className="kf-text-gradient">Find</span>
            </div>
            {!isHome && !isListingFlow ? (
              <p className="kf-tagline truncate">Find local. Support local.</p>
            ) : null}
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
          {signedIn ? (
            <Link href="/account/insights" className="kf-btn kf-btn-outline text-sm">
              Insights
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className="kf-btn kf-btn-outline text-sm">
              Admin
            </Link>
          ) : null}
          <Link href={listingCtaHref} className="kf-btn kf-btn-primary text-sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            {listingCtaLabel}
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
          <KfMobileNavMenu
            signedIn={signedIn}
            isAdmin={isAdmin}
            onSignOut={handleSignOut}
            signingOut={signingOut}
            onClose={() => setOpen(false)}
          />
        </nav>
      ) : null}
    </header>
  );
}
