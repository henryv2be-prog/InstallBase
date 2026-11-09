"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  HandHelping,
  PlusCircle,
  Store,
} from "lucide-react";
import { KF_ADMIN_NAV_LINKS } from "@/lib/kasifind/admin-nav-links";
import { KfTrustNavLinks } from "@/components/kasifind/kf-trust-nav-links";

function NavButton({
  href,
  label,
  icon: Icon,
  active,
  primary,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  primary?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className={`kf-btn w-full${primary ? " kf-btn-primary" : " kf-btn-outline"}${active ? " kf-mobile-nav-link--active" : ""}`}
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
  const isListing = pathname.startsWith("/account/listing");
  const isInsights = pathname.startsWith("/account/insights");
  const onAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex flex-col gap-3">
      {signedIn ? (
        <section className="kf-mobile-nav-section" aria-label="Your business">
          <NavButton
            href="/account/listing"
            label="Edit my listing"
            icon={Store}
            active={isListing}
            primary
            onNavigate={onClose}
          />
          <NavButton
            href="/account/insights"
            label="Listing insights"
            icon={BarChart3}
            active={isInsights}
            onNavigate={onClose}
          />
          <NavButton
            href="/account/listing?help=1"
            label="Get listing help"
            icon={HandHelping}
            onNavigate={onClose}
          />
        </section>
      ) : (
        <section className="kf-mobile-nav-section">
          <NavButton
            href="/account/listing"
            label="List your business"
            icon={PlusCircle}
            primary
            onNavigate={onClose}
          />
          <Link href="/login" className="kf-btn kf-btn-outline w-full" onClick={onClose}>
            Provider sign in
          </Link>
        </section>
      )}

      <section className="kf-mobile-nav-section" aria-label="Explore">
        <details className="kf-mobile-nav-details">
          <summary className="kf-mobile-nav-summary">Explore KasiFind</summary>
          <div className="mt-2 flex flex-col gap-2">
            <NavButton href="/" label="Home" icon={Home} active={isHome} onNavigate={onClose} />
            <NavButton
              href="/activity-map"
              label="Activity map"
              icon={Map}
              active={isActivityMap}
              onNavigate={onClose}
            />
          </div>
        </details>
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
          className="kf-btn kf-btn-ghost w-full text-[var(--kf-charcoal)]"
          onClick={onSignOut}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {signingOut ? "Signing out…" : "Log out"}
        </button>
      ) : null}

      <KfTrustNavLinks collapsed onNavigate={onClose} />
    </div>
  );
}

function AdminMobileLinks({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {KF_ADMIN_NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`kf-btn kf-btn-outline w-full text-sm${active ? " kf-mobile-admin-link--active" : ""}`}
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
