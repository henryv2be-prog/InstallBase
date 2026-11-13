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
  Map,
  HandHelping,
  PlusCircle,
  Store,
} from "lucide-react";
import { KF_ADMIN_NAV_LINKS } from "@/lib/kasifind/admin-nav-links";

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
  isAdmin,
  onSignOut,
  signingOut,
  onClose,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
  signingOut: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isActivityMap = pathname.startsWith("/activity-map");
  const isListingEditor = pathname === "/account/listing";
  const isInsights = pathname.startsWith("/account/insights");
  const isListingSupport = pathname.startsWith("/account/listing-support");
  const onAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex flex-col gap-3">
      <NavButton href="/" label="Home" icon={Home} active={isHome} onNavigate={onClose} />

      {signedIn ? (
        <section className="kf-mobile-nav-section" aria-label="Your business">
          <NavButton
            href="/account/listing"
            label="Edit my listing"
            icon={Store}
            active={isListingEditor}
            onNavigate={onClose}
          />
          <NavButton
            href="/account/listing-support"
            label="Listing support"
            icon={HandHelping}
            active={isListingSupport}
            onNavigate={onClose}
          />
          <NavButton
            href="/account/insights"
            label="Listing insights"
            icon={BarChart3}
            active={isInsights}
            onNavigate={onClose}
          />
        </section>
      ) : (
        <section className="kf-mobile-nav-section">
          <NavButton
            href="/register"
            label="List your business"
            icon={PlusCircle}
            onNavigate={onClose}
          />
          <NavButton href="/login" label="Provider sign in" icon={LogIn} onNavigate={onClose} />
        </section>
      )}

      {isAdmin ? (
        <section className="kf-mobile-nav-section" aria-label="Admin">
          <NavButton
            href="/activity-map"
            label="Activity map"
            icon={Map}
            active={isActivityMap}
            onNavigate={onClose}
          />
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
