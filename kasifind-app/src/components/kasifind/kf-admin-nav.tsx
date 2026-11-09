"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KF_ADMIN_NAV_LINKS } from "@/lib/kasifind/admin-nav-links";

export function KfAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="kf-admin-nav" aria-label="Admin">
      <p className="kf-admin-nav-kicker">Admin portal</p>
      <ul className="mt-2 space-y-1">
        {KF_ADMIN_NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`kf-admin-nav-link${active ? " kf-admin-nav-link--active" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
