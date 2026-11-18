"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KF_ADMIN_ANALYTICS_SUBNAV,
  isAdminNavLinkActive,
} from "@/lib/kasifind/admin-nav-links";

export function KfAdminAnalyticsSubnav() {
  const pathname = usePathname();

  return (
    <nav className="kf-admin-subnav" aria-label="Analytics sections">
      <ul className="kf-admin-subnav__list">
        {KF_ADMIN_ANALYTICS_SUBNAV.map((link) => {
          const active = isAdminNavLinkActive(pathname, link);
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`kf-admin-subnav__link${active ? " kf-admin-subnav__link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}