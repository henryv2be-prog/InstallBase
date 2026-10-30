import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, Eye, MousePointerClick, Users } from "lucide-react";
import { getAdminDashboardStats } from "@/lib/kasifind/admin-stats";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import { getUploadStorageStatus } from "@/lib/kasifind/upload-storage-status";
import { KfAdminCharts } from "@/components/kasifind/kf-admin-charts";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: ReactNode;
}) {
  return (
    <div className="kf-admin-stat-card">
      <p className="kf-admin-stat-label">{label}</p>
      <p className="kf-admin-stat-value">{value}</p>
      {hint ? <p className="kf-admin-stat-hint">{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, uploadHealth] = await Promise.all([
    getAdminDashboardStats(),
    getUploadStorageStatus().catch(() => null),
  ]);
  const { cards } = stats;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="kf-admin-section-title">Platform overview</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Registered users" value={cards.totalUsers} hint={`${cards.signupsWeek} this week`} />
          <StatCard label="Providers" value={cards.totalProviders} hint={`${cards.signupsMonth} new this month`} />
          <StatCard
            label="Published listings"
            value={cards.publishedListings}
            hint={`${cards.pendingListings} pending · ${cards.draftListings} drafts`}
          />
          <StatCard label="Featured listings" value={cards.featuredListings} />
        </div>
      </section>

      <section>
        <h2 className="kf-admin-section-title">Engagement</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Listing views (all time)"
            value={cards.totalViews}
            hint={`7d: ${cards.viewsLast7} · 30d: ${cards.viewsLast30}`}
          />
          <StatCard
            label="Contact clicks (all time)"
            value={cards.totalClicks}
            hint={`7d: ${cards.clicksLast7} · 30d: ${cards.clicksLast30}`}
          />
          <StatCard
            label="Views → click rate"
            value={`${cards.conversionRate}%`}
            hint="WhatsApp, call, and directions"
          />
          <StatCard
            label="Open reports"
            value={cards.openReports}
            hint={
              cards.openReports > 0 ? (
                <Link href="/admin/reports" className="underline">
                  Review queue
                </Link>
              ) : (
                "No open flags"
              )
            }
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="kf-admin-stat-card flex items-start gap-3">
            <Eye className="mt-1 h-5 w-5 text-[var(--kf-forest)]" aria-hidden />
            <div>
              <p className="kf-admin-stat-label">Views breakdown</p>
              <p className="text-sm text-[var(--kf-text)]">
                Registered {cards.registeredViews} · Anonymous {cards.anonymousViews}
              </p>
            </div>
          </div>
          <div className="kf-admin-stat-card flex items-start gap-3">
            <MousePointerClick className="mt-1 h-5 w-5 text-[var(--kf-orange)]" aria-hidden />
            <div>
              <p className="kf-admin-stat-label">Clicks breakdown</p>
              <p className="text-sm text-[var(--kf-text)]">
                Registered {cards.registeredClicks} · Anonymous {cards.anonymousClicks}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="kf-admin-section-title">Trends</h2>
        <div className="mt-4">
          <KfAdminCharts charts={stats.charts} />
        </div>
      </section>

      {stats.charts.geoActivity.length > 0 ? (
        <section>
          <h2 className="kf-admin-section-title">Geographic activity (30 days)</h2>
          <ul className="kf-admin-table mt-3">
            {stats.charts.geoActivity.map((g) => (
              <li key={g.region} className="flex justify-between border-b border-[var(--kf-border)] py-2 text-sm">
                <span>{g.region}</span>
                <span className="font-semibold">{g.events} events</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="kf-admin-section-title flex items-center gap-2">
          <Activity className="h-5 w-5" aria-hidden />
          Recent activity
        </h2>
        <div className="kf-admin-table-wrap mt-3">
          <table className="kf-admin-data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Event</th>
                <th>Listing</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[var(--kf-muted)]">
                    Activity will appear when people search and view listings.
                  </td>
                </tr>
              ) : (
                stats.recentActivity.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap text-xs text-[var(--kf-muted)]">
                      {formatKfDateTime(e.createdAt)}
                    </td>
                    <td className="text-sm">{e.eventType.replace(/_/g, " ")}</td>
                    <td className="text-sm">{e.listingName ?? "—"}</td>
                    <td className="text-sm">{e.userEmail ?? `Visitor …${e.visitorId}`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="kf-admin-section-title flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden />
          System health
        </h2>
        <div className="kf-card mt-3 p-4 text-sm">
          {uploadHealth ? (
            <ul className="space-y-1">
              <li>
                Upload storage:{" "}
                <strong>{uploadHealth.configured ? "Volume configured" : "Ephemeral (warning)"}</strong>
              </li>
              <li>
                Writable: <strong>{uploadHealth.writable ? "Yes" : "No"}</strong>
              </li>
              {uploadHealth.warnings.map((w) => (
                <li key={w} className="text-[var(--kf-orange)]">
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[var(--kf-muted)]">Upload health check unavailable.</p>
          )}
          <p className="mt-3 text-xs text-[var(--kf-muted)]">
            API: <Link href="/api/health" className="underline">/api/health</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
