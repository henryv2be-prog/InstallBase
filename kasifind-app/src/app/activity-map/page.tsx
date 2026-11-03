import { KfActivityMapClient } from "@/components/kasifind/kf-activity-map-client";
import { getActivityMapPublishedTotal } from "@/lib/kasifind/activity-map";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export const metadata = {
  title: "Activity Map",
  description:
    "Explore where KasiFind has published business listings across South Africa.",
};

export const dynamic = "force-dynamic";

export default async function ActivityMapPage() {
  const dbConfigured = isKasiFindDbConfigured();
  const total = dbConfigured ? await getActivityMapPublishedTotal().catch(() => 0) : 0;

  if (!dbConfigured) {
    return (
      <div className="kf-card p-6">
        <h1 className="kf-section-title">Activity Map</h1>
        <p className="mt-2 text-sm text-[var(--kf-muted)]">
          Configure the KasiFind database to view listing coverage.
        </p>
      </div>
    );
  }

  return <KfActivityMapClient initialTotal={total} />;
}
