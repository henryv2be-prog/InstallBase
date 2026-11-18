"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KF_ADMIN_NAV_GROUPS,
  isAdminNavLinkActive,
} from "@/lib/kasifind/admin-nav-links";

export function KfAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="kf-admin-nav" aria-label="Admin">
      <p className="kf-admin-nav-kicker">Console</p>
      <ul className="kf-admin-nav-groups">
        {KF_ADMIN_NAV_GROUPS.map((group) => (
          <li key={group.id} className="kf-admin-nav-group">
            {group.label ? (
              <p className="kf-admin-nav-group-label">{group.label}</p>
            ) : null}
            <ul className="kf-admin-nav-group-list">
              {group.items.map((link) => {
                const active = isAdminNavLinkActive(pathname, link);
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`kf-admin-nav-link${active ? " kf-admin-nav-link--active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      title={link.description}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}