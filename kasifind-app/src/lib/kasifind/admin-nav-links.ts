import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  FolderTree,
  Flag,
  HandHelping,
  Inbox,
  LayoutGrid,
  LineChart,
  ListChecks,
  Map,
  Users,
} from "lucide-react";

export type KfAdminNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Active when pathname equals href */
  exact?: boolean;
  /** Active when pathname starts with this prefix (defaults to href) */
  matchPrefix?: string;
  description?: string;
};

export type KfAdminNavGroup = {
  id: string;
  label?: string;
  items: KfAdminNavLink[];
};

/** Desktop sidebar and “More” menu — approved admin IA (Phase 1 shell). */
export const KF_ADMIN_NAV_GROUPS: KfAdminNavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin", label: "Inbox", icon: Inbox, exact: true, description: "Operational overview" },
      {
        href: "/admin/users",
        label: "Providers",
        icon: Users,
        matchPrefix: "/admin/users",
        description: "Accounts and ownership",
      },
      {
        href: "/admin/listings",
        label: "Listings",
        icon: ListChecks,
        matchPrefix: "/admin/listings",
        description: "Search and manage listings",
      },
      {
        href: "/admin/listing-assistance",
        label: "Listing assistance",
        icon: HandHelping,
        matchPrefix: "/admin/listing-assistance",
        description: "Provider support queue",
      },
      {
        href: "/admin/reports",
        label: "Moderation",
        icon: Flag,
        matchPrefix: "/admin/reports",
        description: "Reviews, flags and approvals",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    items: [
      {
        href: "/admin/analytics",
        label: "Overview",
        icon: LineChart,
        exact: true,
        description: "Charts and exploration",
      },
      {
        href: "/admin/events",
        label: "Events",
        icon: Activity,
        matchPrefix: "/admin/events",
        description: "Search and contact analytics log",
      },
      {
        href: "/admin/analytics/activity-map",
        label: "Activity map",
        icon: Map,
        matchPrefix: "/admin/analytics/activity-map",
        description: "Listing coverage map",
      },
    ],
  },
  {
    id: "reporting",
    label: "Reporting",
    items: [
      {
        href: "/admin/provider-performance",
        label: "Provider performance",
        icon: BarChart3,
        matchPrefix: "/admin/provider-performance",
        description: "Shareable provider reports",
      },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    items: [
      {
        href: "/admin/categories",
        label: "Categories",
        icon: FolderTree,
        matchPrefix: "/admin/categories",
        description: "Browse and taxonomy",
      },
    ],
  },
];

/** Bottom bar on mobile — highest-frequency admin destinations. */
export const KF_ADMIN_MOBILE_PRIMARY: KfAdminNavLink[] = [
  { href: "/admin", label: "Inbox", icon: Inbox, exact: true },
  {
    href: "/admin/listing-assistance",
    label: "Assistance",
    icon: HandHelping,
    matchPrefix: "/admin/listing-assistance",
  },
  { href: "/admin/listings", label: "Listings", icon: ListChecks, matchPrefix: "/admin/listings" },
  { href: "/admin/reports", label: "Moderation", icon: Flag, matchPrefix: "/admin/reports" },
];

export function flattenAdminNavLinks(): KfAdminNavLink[] {
  return KF_ADMIN_NAV_GROUPS.flatMap((g) => g.items);
}

/** @deprecated Prefer KF_ADMIN_NAV_GROUPS — kept for flat consumers */
export const KF_ADMIN_NAV_LINKS: KfAdminNavLink[] = flattenAdminNavLinks();

export function isAdminNavLinkActive(
  pathname: string,
  link: Pick<KfAdminNavLink, "href" | "exact" | "matchPrefix">
): boolean {
  if (link.exact) return pathname === link.href;
  const prefix = link.matchPrefix ?? link.href;
  if (prefix === "/admin") return pathname === "/admin";
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** True when pathname is under the Analytics section (hub, events, map). */
export function isAdminAnalyticsPath(pathname: string): boolean {
  return (
    pathname === "/admin/analytics" ||
    pathname.startsWith("/admin/analytics/") ||
    pathname.startsWith("/admin/events")
  );
}

export const KF_ADMIN_ANALYTICS_SUBNAV: KfAdminNavLink[] = [
  { href: "/admin/analytics", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/events", label: "Events", icon: Activity, matchPrefix: "/admin/events" },
  {
    href: "/admin/analytics/activity-map",
    label: "Activity map",
    icon: Map,
    matchPrefix: "/admin/analytics/activity-map",
  },
];