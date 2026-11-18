"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, X } from "lucide-react";
import {
  KF_ADMIN_MOBILE_PRIMARY,
  KF_ADMIN_NAV_GROUPS,
  isAdminNavLinkActive,
} from "@/lib/kasifind/admin-nav-links";

export function KfAdminMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const morePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const moreActive = KF_ADMIN_NAV_GROUPS.some((g) =>
    g.items.some((link) => {
      if (KF_ADMIN_MOBILE_PRIMARY.some((p) => p.href === link.href)) return false;
      return isAdminNavLinkActive(pathname, link);
    })
  );

  return (
    <>
      <nav className="kf-admin-mobile-bar" aria-label="Admin quick navigation">
        <ul className="kf-admin-mobile-bar__list">
          {KF_ADMIN_MOBILE_PRIMARY.map((link) => {
            const active = isAdminNavLinkActive(pathname, link);
            const Icon = link.icon;
            return (
              <li key={link.href} className="kf-admin-mobile-bar__item">
                <Link
                  href={link.href}
                  className={`kf-admin-mobile-bar__link${active ? " kf-admin-mobile-bar__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="kf-admin-mobile-bar__icon" aria-hidden />
                  <span className="kf-admin-mobile-bar__label">{link.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="kf-admin-mobile-bar__item">
            <button
              type="button"
              className={`kf-admin-mobile-bar__link kf-admin-mobile-bar__link--more${moreActive ? " kf-admin-mobile-bar__link--active" : ""}`}
              aria-expanded={moreOpen}
              aria-controls="kf-admin-more-panel"
              onClick={() => setMoreOpen((v) => !v)}
            >
              <LayoutGrid className="kf-admin-mobile-bar__icon" aria-hidden />
              <span className="kf-admin-mobile-bar__label">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <button
          type="button"
          className="kf-admin-more-backdrop"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      <div
        id="kf-admin-more-panel"
        ref={morePanelRef}
        className={`kf-admin-more-panel${moreOpen ? " kf-admin-more-panel--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="More admin sections"
        aria-hidden={!moreOpen}
      >
        <header className="kf-admin-more-panel__head">
          <p className="kf-admin-more-panel__title">Admin console</p>
          <button
            type="button"
            className="kf-admin-more-panel__close"
            onClick={() => setMoreOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="kf-admin-more-panel__body">
          {KF_ADMIN_NAV_GROUPS.map((group) => (
            <section key={group.id} className="kf-admin-more-section">
              {group.label ? (
                <p className="kf-admin-more-section__label">{group.label}</p>
              ) : null}
              <ul className="kf-admin-more-section__list">
                {group.items.map((link) => {
                  const skip = KF_ADMIN_MOBILE_PRIMARY.some((p) => p.href === link.href);
                  if (skip) return null;
                  const active = isAdminNavLinkActive(pathname, link);
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`kf-admin-more-link${active ? " kf-admin-more-link--active" : ""}`}
                        onClick={() => setMoreOpen(false)}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span>
                          <span className="kf-admin-more-link__title">{link.label}</span>
                          {link.description ? (
                            <span className="kf-admin-more-link__hint">{link.description}</span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}