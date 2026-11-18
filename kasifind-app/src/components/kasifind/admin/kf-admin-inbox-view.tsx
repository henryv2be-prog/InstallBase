import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HandHelping,
  LineChart,
  ListChecks,
  Megaphone,
  ShieldAlert,
} from "lucide-react";
import { KfAdminCharts } from "@/components/kasifind/kf-admin-charts";
import { KfAdminInboxActivityPanel } from "@/components/kasifind/admin/kf-admin-inbox-activity-panel";
import { KfAdminInboxRefresh } from "@/components/kasifind/admin/kf-admin-inbox-refresh";
import type { AdminDashboardStats } from "@/lib/kasifind/admin-stats";
import type { AdminAuditFeedRow, AdminInboxCompletedItem } from "@/lib/kasifind/admin-audit-feed";
import type { getAdminInboxGrowthKpis, getAdminInboxQueueCounts } from "@/lib/kasifind/admin-inbox";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import type { getUploadStorageStatus } from "@/lib/kasifind/upload-storage-status";

type UploadStorageStatus = Awaited<ReturnType<typeof getUploadStorageStatus>>;

type GrowthKpis = Awaited<ReturnType<typeof getAdminInboxGrowthKpis>>;
type QueueCounts = Awaited<ReturnType<typeof getAdminInboxQueueCounts>>;

type Props = {
  generatedAt: string;
  queues: QueueCounts;
  growth: GrowthKpis;
  stats: AdminDashboardStats;
  adminFeed: AdminAuditFeedRow[];
  completed: AdminInboxCompletedItem[];
  platformFeed: AdminDashboardStats["recentActivity"];
  uploadHealth: UploadStorageStatus | null;
};

function WowHint({ changePercent }: { changePercent: number | null }) {
  if (changePercent === null) return null;
  const sign = changePercent > 0 ? "+" : "";
  return (
    <span className="kf-admin-inbox-kpi__wow">
      {sign}
      {changePercent}% vs prior week
    </span>
  );
}

function KpiTile({
  label,
  value,
  wow,
}: {
  label: string;
  value: string | number;
  wow?: ReactNode;
}) {
  return (
    <div className="kf-admin-inbox-kpi">
      <p className="kf-admin-inbox-kpi__label">{label}</p>
      <p className="kf-admin-inbox-kpi__value">{value}</p>
      {wow ? <p className="kf-admin-inbox-kpi__hint">{wow}</p> : null}
    </div>
  );
}

function AttentionCard({
  title,
  count,
  status,
  description,
  href,
  cta,
  tone,
}: {
  title: string;
  count: number;
  status: "action" | "watch" | "clear";
  description: string;
  href: string;
  cta: string;
  tone: "forest" | "orange" | "neutral";
}) {
  return (
    <article className={`kf-admin-attention-card kf-admin-attention-card--${tone}`}>
      <div className="kf-admin-attention-card__head">
        <h3 className="kf-admin-attention-card__title">{title}</h3>
        <span className={`kf-admin-attention-card__count kf-admin-attention-card__count--${status}`}>
          {count}
        </span>
      </div>
      <p className="kf-admin-attention-card__desc">{description}</p>
      {count > 0 ? (
        <Link href={href} className="kf-admin-attention-card__cta">
          {cta}
        </Link>
      ) : (
        <p className="kf-admin-attention-card__clear">
          <CheckCircle2 className="inline h-3.5 w-3.5" aria-hidden /> All clear
        </p>
      )}
    </article>
  );
}

export function KfAdminInboxView({
  generatedAt,
  queues,
  growth,
  stats,
  adminFeed,
  completed,
  platformFeed,
  uploadHealth,
}: Props) {
  const updatedLabel = formatKfDateTime(generatedAt);
  const outstandingTotal =
    queues.assistance.pending +
    queues.assistance.inProgress +
    queues.pendingModeration +
    queues.openReports +
    queues.draftListings;

  return (
    <div className="kf-admin-inbox">
      <header className="kf-admin-inbox-header">
        <div>
          <h2 className="kf-admin-inbox-header__title">Inbox</h2>
          <p className="kf-admin-inbox-header__sub">Your KasiFind operations at a glance.</p>
        </div>
        <KfAdminInboxRefresh updatedAtLabel={updatedLabel} />
      </header>

      {uploadHealth?.warnings.length ? (
        <div className="kf-admin-inbox-alert" role="status">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <p>{uploadHealth.warnings.join(" ")}</p>
        </div>
      ) : null}

      <section className="kf-admin-inbox-section" aria-labelledby="inbox-needs-attention">
        <div className="kf-admin-inbox-section__head">
          <h3 id="inbox-needs-attention" className="kf-admin-inbox-section__title">
            Needs attention
          </h3>
          {outstandingTotal === 0 ? (
            <p className="kf-admin-inbox-section__hint">Nothing outstanding — good time for proactive work.</p>
          ) : null}
        </div>
        <div className="kf-admin-attention-grid">
          <AttentionCard
            title="Listing assistance · new"
            count={queues.assistance.pending}
            status={queues.assistance.pending > 0 ? "action" : "clear"}
            description="Providers waiting for help with their listing."
            href="/admin/listing-assistance?status=PENDING"
            cta="Open pending queue"
            tone="forest"
          />
          <AttentionCard
            title="Listing assistance · in progress"
            count={queues.assistance.inProgress}
            status={queues.assistance.inProgress > 0 ? "watch" : "clear"}
            description="Work already assigned — continue where you left off."
            href="/admin/listing-assistance?status=IN_PROGRESS"
            cta="View in-progress"
            tone="forest"
          />
          <AttentionCard
            title="Listing moderation"
            count={queues.pendingModeration}
            status={queues.pendingModeration > 0 ? "action" : "clear"}
            description="Listings waiting for approval before they can go live."
            href="/admin/listings?moderation=PENDING"
            cta="Review pending listings"
            tone="orange"
          />
          <AttentionCard
            title="Open reports"
            count={queues.openReports}
            status={queues.openReports > 0 ? "action" : "clear"}
            description="User-submitted flags that still need a decision."
            href="/admin/reports"
            cta="Open moderation workspace"
            tone="orange"
          />
          <AttentionCard
            title="Draft listings"
            count={queues.draftListings}
            status={queues.draftListings > 0 ? "watch" : "clear"}
            description="Registered providers who have not published yet (status: draft)."
            href="/admin/listings?status=DRAFT"
            cta="Browse drafts"
            tone="neutral"
          />
        </div>
      </section>

      <section className="kf-admin-inbox-kpi-strip" aria-label="Growth snapshot">
        <KpiTile label="Registered providers" value={growth.totalProviders.toLocaleString()} />
        <KpiTile label="Published listings" value={growth.publishedListings.toLocaleString()} />
        <KpiTile
          label="New providers (7d)"
          value={growth.newProviders.current}
          wow={<WowHint changePercent={growth.newProviders.changePercent} />}
        />
        <KpiTile
          label="New listings (7d)"
          value={growth.newListings.current}
          wow={<WowHint changePercent={growth.newListings.changePercent} />}
        />
        <KpiTile
          label="Listing views (7d)"
          value={growth.listingViews.current.toLocaleString()}
          wow={<WowHint changePercent={growth.listingViews.changePercent} />}
        />
        <KpiTile
          label="Contact clicks (7d)"
          value={growth.contactClicks.current.toLocaleString()}
          wow={<WowHint changePercent={growth.contactClicks.changePercent} />}
        />
      </section>

      <div className="kf-admin-inbox-columns">
        <section className="kf-admin-inbox-panel" aria-labelledby="inbox-completed">
          <h3 id="inbox-completed" className="kf-admin-inbox-panel__title">
            Recently completed
          </h3>
          <ul className="kf-admin-inbox-feed">
            {completed.length === 0 ? (
              <li className="kf-admin-inbox-empty">Completed work will show here.</li>
            ) : (
              completed.map((item) => (
                <li key={item.id} className="kf-admin-inbox-feed__item">
                  <p className="kf-admin-inbox-feed__label">
                    {item.href ? (
                      <Link href={item.href} className="underline">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </p>
                  {item.subtitle ? <p className="kf-admin-inbox-feed__sub">{item.subtitle}</p> : null}
                  <p className="kf-admin-inbox-feed__meta">{formatKfDateTime(item.createdAt)}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <KfAdminInboxActivityPanel
          adminFeed={adminFeed}
          platformFeed={platformFeed.slice(0, 12)}
        />
      </div>

      <section className="kf-admin-inbox-platform" aria-label="Last 7 days highlights">
        <h3 className="kf-admin-inbox-panel__title">Platform pulse (7 days)</h3>
        <ul className="kf-admin-inbox-pulse">
          <li>
            <Megaphone className="h-4 w-4" aria-hidden />
            <span>
              <strong>{stats.cards.signupsWeek}</strong> provider signups
            </span>
          </li>
          <li>
            <ListChecks className="h-4 w-4" aria-hidden />
            <span>
              <strong>{growth.newListings.current}</strong> new listings
            </span>
          </li>
          <li>
            <HandHelping className="h-4 w-4" aria-hidden />
            <span>
              <strong>{stats.cards.viewsLast7.toLocaleString()}</strong> profile views
            </span>
          </li>
          <li>
            <ShieldAlert className="h-4 w-4" aria-hidden />
            <span>
              <strong>{stats.cards.clicksLast7.toLocaleString()}</strong> contact taps
            </span>
          </li>
        </ul>
      </section>

      <section className="kf-admin-inbox-charts" aria-labelledby="inbox-charts">
        <div className="kf-admin-inbox-charts__head">
          <h3 id="inbox-charts" className="kf-admin-inbox-section__title">
            Trends
          </h3>
          <Link
            href="/admin/analytics"
            className="kf-admin-inbox-charts__link inline-flex items-center gap-1 text-sm font-semibold text-[var(--kf-forest)] underline"
          >
            <LineChart className="h-4 w-4" aria-hidden />
            Analytics hub
          </Link>
        </div>
        <div className="kf-admin-inbox-charts__body">
          <KfAdminCharts charts={stats.charts} />
        </div>
      </section>
    </div>
  );
}