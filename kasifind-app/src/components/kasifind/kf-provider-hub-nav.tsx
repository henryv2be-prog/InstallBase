"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, HandHelping, Store } from "lucide-react";

const HUB_LINKS = [
  { href: "/account/insights", label: "Overview", icon: BarChart3, match: (p: string) => p === "/account" || p.startsWith("/account/insights") },
  { href: "/account/listing", label: "Edit listing", icon: Store, match: (p: string) => p === "/account/listing" },
  {
    href: "/account/listing-support",
    label: "Support",
    icon: HandHelping,
    match: (p: string) => p.startsWith("/account/listing-support"),
  },
] as const;

export function KfProviderHubNav() {
  const pathname = usePathname();

  return (
    <nav className="kf-provider-hub-nav" aria-label="Provider hub">
      {HUB_LINKS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`kf-provider-hub-nav-link${active ? " kf-provider-hub-nav-link--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}