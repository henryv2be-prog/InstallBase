import Link from "next/link";
import { KfAdminNotificationSettingsForm } from "@/components/kasifind/admin/kf-admin-notification-settings-form";
import { getAdminNotificationSettingsPage } from "@/lib/kasifind/admin-notification-settings-data";
import { isAdminPushConfigured } from "@/lib/kasifind/admin-push";
import { requireAdminPage } from "@/lib/kasifind/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminNotificationSettingsPage() {
  const user = await requireAdminPage();
  const data = await getAdminNotificationSettingsPage(user.id);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-[var(--kf-ink)]">Notification settings</h1>
          <p className="text-sm text-[var(--kf-muted)]">
            Configure in-app and Android push for your admin account.
          </p>
        </div>
        <Link href="/admin/notifications" className="kf-btn kf-btn-outline text-sm">
          Back to centre
        </Link>
      </header>
      <KfAdminNotificationSettingsForm
        pushMasterEnabled={data.pushMasterEnabled}
        events={data.events}
        devices={data.devices}
        vapidConfigured={isAdminPushConfigured()}
      />
    </div>
  );
}