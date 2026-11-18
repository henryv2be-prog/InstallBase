import { KfActivityMapClient } from "@/components/kasifind/kf-activity-map-client";
import { KfAdminAnalyticsSubnav } from "@/components/kasifind/admin/kf-admin-analytics-subnav";
import { getActivityMapPublishedTotal } from "@/lib/kasifind/activity-map";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export const metadata = {
  title: "Activity map",
  description: "Admin view of KasiFind published listing coverage.",
};

export const dynamic = "force-dynamic";

export default async function AdminActivityMapPage() {
  const dbConfigured = isKasiFindDbConfigured();
  const total = dbConfigured ? await getActivityMapPublishedTotal().catch(() => 0) : 0;

  return (
    <div className="kf-admin-page space-y-4">
      <header className="space-y-3">
        <div>
          <h2 className="kf-admin-section-title">Activity map</h2>
          <p className="text-sm text-[var(--kf-muted)]">
            Published listing coverage for operational planning.
          </p>
        </div>
        <KfAdminAnalyticsSubnav />
      </header>

      {!dbConfigured ? (
        <div className="kf-card p-6 text-sm text-[var(--kf-muted)]">
          Configure the KasiFind database to view listing coverage.
        </div>
      ) : (
        <KfActivityMapClient initialTotal={total} />
      )}
    </div>
  );
}