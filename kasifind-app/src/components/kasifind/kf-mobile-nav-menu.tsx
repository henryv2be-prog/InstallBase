"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { KF_ADMIN_NAV_LINKS } from "@/lib/kasifind/admin-nav-links";
import { resolveProviderNavLink } from "@/lib/kasifind/provider-nav";

function mobileNavClass(active?: boolean) {
  return `kf-mobile-nav-link${active ? " kf-mobile-nav-link--active" : ""}`;
}

function NavButton({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className={mobileNavClass(active)}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}

export function KfMobileNavMenu({
  signedIn,
  hasListing,
  isAdmin,
  onSignOut,
  signingOut,
  onClose,
}: {
  signedIn: boolean;
  hasListing: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
  signingOut: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isHub = pathname === "/account" || pathname.startsWith("/account/");
  const isRecruitment = pathname.startsWith("/list-your-business");
  const onAdmin = pathname.startsWith("/admin");
  const providerNav = resolveProviderNavLink({ signedIn, hasListing });
  const providerNavActive =
    providerNav.href === "/account" ? isHub : isRecruitment;

  return (
    <div className="flex flex-col gap-3">
      <NavButton href="/" label="Home" icon={Home} active={isHome} onNavigate={onClose} />

      <section className="kf-mobile-nav-section" aria-label="Your business">
        <NavButton
          href={providerNav.href}
          label={providerNav.label}
          icon={signedIn && hasListing ? BarChart3 : PlusCircle}
          active={providerNavActive}
          onNavigate={onClose}
        />
        {!signedIn ? (
          <NavButton href="/login" label="Provider sign in" icon={LogIn} onNavigate={onClose} />
        ) : null}
      </section>

      {isAdmin ? (
        <section className="kf-mobile-nav-section" aria-label="Admin">
          <details className="kf-mobile-nav-details" open={onAdmin}>
            <summary className="kf-mobile-nav-summary">
              <LayoutDashboard className="inline h-4 w-4" aria-hidden /> Admin portal
            </summary>
            <AdminMobileLinks pathname={pathname} onClose={onClose} />
          </details>
        </section>
      ) : null}

      {signedIn ? (
        <button
          type="button"
          className={mobileNavClass()}
          onClick={onSignOut}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          {signingOut ? "Signing out…" : "Log out"}
        </button>
      ) : null}
    </div>
  );
}

function AdminMobileLinks({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <div className="kf-mobile-admin-links">
      {KF_ADMIN_NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={mobileNavClass(active)}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
