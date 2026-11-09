import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Flag,
  FolderTree,
  LayoutDashboard,
  HandHelping,
  ListChecks,
  Users,
} from "lucide-react";

export type KfAdminNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const KF_ADMIN_NAV_LINKS: KfAdminNavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/listing-assistance", label: "Listing assistance", icon: HandHelping },
  { href: "/admin/provider-performance", label: "Provider reports", icon: BarChart3 },
  { href: "/admin/events", label: "Events", icon: Activity },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];
