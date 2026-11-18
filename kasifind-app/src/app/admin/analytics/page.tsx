import Link from "next/link";
import { Activity, Map, LineChart } from "lucide-react";
import { KfAdminAnalyticsSubnav } from "@/components/kasifind/admin/kf-admin-analytics-subnav";

export const dynamic = "force-dynamic";

const CARDS = [
  {
    href: "/admin/events",
    title: "Events log",
    description: "Search impressions, profile views, contact taps, and discovery activity.",
    icon: Activity,
  },
  {
    href: "/admin/analytics/activity-map",
    title: "Activity map",
    description: "See where published listings are distributed across South Africa.",
    icon: Map,
  },
] as const;

export default function AdminAnalyticsHubPage() {
  return (
    <div className="kf-admin-page space-y-6">
      <header className="space-y-3">
        <div>
          <h2 className="kf-admin-section-title">Analytics</h2>
          <p className="text-sm text-[var(--kf-muted)]">
            Detailed product analytics and exploration. Summary trends will move here from the Inbox in a
            later phase.
          </p>
        </div>
        <KfAdminAnalyticsSubnav />
      </header>

      <ul className="kf-admin-hub-grid">
        {CARDS.map(({ href, title, description, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="kf-admin-hub-card">
              <span className="kf-admin-hub-card__icon" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="kf-admin-hub-card__body">
                <span className="kf-admin-hub-card__title">{title}</span>
                <span className="kf-admin-hub-card__desc">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--kf-muted)]">
        <LineChart className="mr-1 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
        The operational Inbox at <Link href="/admin" className="underline">/admin</Link> still shows platform
        charts until Phase 2.
      </p>
    </div>
  );
}