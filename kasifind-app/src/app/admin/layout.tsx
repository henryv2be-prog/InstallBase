import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/kasifind/admin-guard";
import { getAdminUnreadNotificationCount } from "@/lib/kasifind/admin-notifications";
import { KfAdminShell } from "@/components/kasifind/admin/kf-admin-shell";
import { KF_PRIVATE_ROUTE_ROBOTS } from "@/lib/kasifind/seo-private-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: KF_PRIVATE_ROUTE_ROBOTS,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  const unreadNotificationCount = await getAdminUnreadNotificationCount(user.id).catch(() => 0);

  return <KfAdminShell unreadNotificationCount={unreadNotificationCount}>{children}</KfAdminShell>;
}