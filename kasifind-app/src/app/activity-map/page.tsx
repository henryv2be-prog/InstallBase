import type { Metadata } from "next";
import { headers } from "next/headers";
import { KfActivityMapClient } from "@/components/kasifind/kf-activity-map-client";
import { getActivityMapPublishedTotal } from "@/lib/kasifind/activity-map";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import {
  buildCanonicalAlternates,
  buildCanonicalUrl,
  buildPublicOpenGraph,
  buildPublicTwitter,
} from "@/lib/kasifind/seo-canonical";

export const dynamic = "force-dynamic";

const ACTIVITY_TITLE = "Activity Map";
const ACTIVITY_DESCRIPTION =
  "Explore where KasiFind has published business listings across South Africa.";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const canonical = buildCanonicalUrl("/activity-map", headerStore);
  const ogTitle = `${ACTIVITY_TITLE} | KasiFind`;
  return {
    title: ACTIVITY_TITLE,
    description: ACTIVITY_DESCRIPTION,
    alternates: buildCanonicalAlternates("/activity-map", headerStore),
    openGraph: buildPublicOpenGraph({ title: ogTitle, description: ACTIVITY_DESCRIPTION, canonical }),
    twitter: buildPublicTwitter(ogTitle, ACTIVITY_DESCRIPTION),
  };
}

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
