"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flag,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/reports", label: "Reports", icon: Flag },
] as const;

export function KfAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="kf-admin-nav" aria-label="Admin">
      <p className="kf-admin-nav-kicker">Admin portal</p>
      <ul className="mt-2 space-y-1">
        {LINKS.map(({ href, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
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
