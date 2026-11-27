import Link from "next/link";
import { KfAdminNotificationsView } from "@/components/kasifind/admin/kf-admin-notifications-view";
import { listAdminNotifications } from "@/lib/kasifind/admin-notifications";
import { requireAdminPage } from "@/lib/kasifind/admin-guard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ unread?: string; category?: string; priority?: string }>;
};

export default async function AdminNotificationsPage({ searchParams }: Props) {
  const user = await requireAdminPage();
  const q = await searchParams;
  const unreadOnly = q.unread === "1";
  const category = q.category?.trim() || "";
  const priority = q.priority?.trim() || "";

  const { items } = await listAdminNotifications({
    adminId: user.id,
    unreadOnly,
    category: category || undefined,
    priority: priority || undefined,
    limit: 40,
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-[var(--kf-ink)]">Notifications</h1>
          <p className="text-sm text-[var(--kf-muted)]">In-app history for platform events.</p>
        </div>
        <Link href="/admin/notifications/settings" className="kf-btn kf-btn-outline text-sm">
          Settings
        </Link>
      </header>
      <KfAdminNotificationsView
        items={items}
        filter={{ unreadOnly, category, priority }}
      />
    </div>
  );
}