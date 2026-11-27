import { KfAdminInboxView } from "@/components/kasifind/admin/kf-admin-inbox-view";
import { getAdminAuditFeed, getAdminInboxRecentlyCompleted } from "@/lib/kasifind/admin-audit-feed";
import {
  getAdminInboxGrowthKpis,
  getAdminInboxQueueCounts,
} from "@/lib/kasifind/admin-inbox";
import { getAdminDashboardStats } from "@/lib/kasifind/admin-stats";
import { getUploadStorageStatus } from "@/lib/kasifind/upload-storage-status";
import { getListingImageVariantHealth } from "@/lib/kasifind/listing-image-backfill";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  const [stats, queues, growth, adminFeed, completed, uploadHealth, imageVariantHealth] =
    await Promise.all([
      getAdminDashboardStats(),
      getAdminInboxQueueCounts(),
      getAdminInboxGrowthKpis(),
      getAdminAuditFeed(15),
      getAdminInboxRecentlyCompleted(8),
      getUploadStorageStatus().catch(() => null),
      getListingImageVariantHealth().catch(() => null),
    ]);

  return (
    <KfAdminInboxView
      generatedAt={stats.generatedAt}
      queues={queues}
      growth={growth}
      stats={stats}
      adminFeed={adminFeed}
      completed={completed}
      platformFeed={stats.recentActivity}
      uploadHealth={uploadHealth}
      imageVariantHealth={imageVariantHealth}
    />
  );
}