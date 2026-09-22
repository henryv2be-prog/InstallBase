"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/ads", label: "Advertising", icon: Megaphone, exact: false },
  { href: "/admin/policies", label: "Policies", icon: Scale, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-3 mb-6 overflow-x-auto px-3 sm:mx-0 sm:px-0"
      aria-label="Admin sections"
    >
      <div className="flex min-w-max gap-2 rounded-xl border border-border bg-card/60 p-1 sm:inline-flex">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:bg-card/80 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
