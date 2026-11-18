import Link from "next/link";
import type { AdminModerationListParams, AdminModerationTab } from "@/lib/kasifind/admin-moderation-nav";
import {
  buildAdminModerationIndexHref,
  buildAdminModerationItemHref,
} from "@/lib/kasifind/admin-moderation-nav";
import { formatKfDate } from "@/lib/kasifind/format-datetime";

export type ModerationQueueRow = {
  id: string;
  kind: "pending" | "report" | "review";
  title: string;
  subtitle: string;
  meta: string;
  excerpt: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  tab: AdminModerationTab;
  counts: { pendingModeration: number; openReports: number; visibleReviews: number };
  rows: ModerationQueueRow[];
  listParams: AdminModerationListParams;
  selectedId: string | null;
  total: number;
  page: number;
  pageSize: number;
};

const TABS: { id: AdminModerationTab; label: string; countKey: keyof Props["counts"] }[] = [
  { id: "pending", label: "Pending listings", countKey: "pendingModeration" },
  { id: "reports", label: "Open reports", countKey: "openReports" },
  { id: "reviews", label: "Reviews", countKey: "visibleReviews" },
];

export function KfAdminModerationQueue({
  tab,
  counts,
  rows,
  listParams,
  selectedId,
  total,
  page,
  pageSize,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const formAction = "/admin/reports";

  const pageHref = (nextPage: number) =>
    selectedId
      ? buildAdminModerationItemHref(selectedId, { ...listParams, page: nextPage })
      : buildAdminModerationIndexHref({ ...listParams, page: nextPage });

  return (
    <aside className="kf-admin-master-detail-queue kf-admin-moderation-queue" aria-label="Moderation queue">
      <nav className="kf-admin-moderation-tabs" aria-label="Moderation views">
        {TABS.map((t) => {
          const active = tab === t.id;
          const href = buildAdminModerationIndexHref({ tab: t.id, page: 1, q: "" });
          return (
            <Link
              key={t.id}
              href={href}
              className={`kf-admin-moderation-tabs__tab${active ? " kf-admin-moderation-tabs__tab--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
              <span className="kf-admin-moderation-tabs__count">{counts[t.countKey]}</span>
            </Link>
          );
        })}
      </nav>

      {tab === "reviews" ? (
        <form method="get" className="kf-admin-master-detail-queue__filters" action={formAction}>
          <input type="hidden" name="tab" value="reviews" />
          {selectedId ? <input type="hidden" name="id" value={selectedId} /> : null}
          <input
            name="q"
            defaultValue={listParams.q ?? ""}
            placeholder="Search reviews…"
            className="kf-input kf-admin-master-detail-queue__search"
            aria-label="Search reviews"
          />
          <button type="submit" className="kf-btn kf-btn-primary kf-admin-master-detail-queue__filter-btn">
            Search
          </button>
        </form>
      ) : null}

      <ul className="kf-admin-master-detail-queue__list">
        {rows.length === 0 ? (
          <li className="kf-admin-master-detail-queue__empty">Nothing in this queue.</li>
        ) : (
          rows.map((row) => {
            const active = row.id === selectedId;
            const href = buildAdminModerationItemHref(row.id, listParams);
            const when = row.updatedAt ?? row.createdAt;
            return (
              <li key={row.id}>
                <Link
                  href={href}
                  className={`kf-admin-master-detail-queue__item${active ? " kf-admin-master-detail-queue__item--active" : ""}`}
                  aria-current={active ? "true" : undefined}
                  draggable={false}
                >
                  <span className="kf-admin-master-detail-queue__item-top">
                    <span className="kf-admin-master-detail-queue__primary">{row.title}</span>
                    <span className="kf-admin-moderation-queue__kind">{row.kind}</span>
                  </span>
                  <span className="kf-admin-master-detail-queue__sub">{row.subtitle}</span>
                  <span className="kf-admin-master-detail-queue__sub">{row.meta}</span>
                  {row.excerpt ? (
                    <span className="kf-admin-moderation-queue__excerpt">{row.excerpt}</span>
                  ) : null}
                  {when ? (
                    <span className="kf-admin-master-detail-queue__meta-line">
                      {formatKfDate(when)}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })
        )}
      </ul>

      {totalPages > 1 ? (
        <nav className="kf-admin-master-detail-queue__pager" aria-label="Moderation pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="kf-admin-master-detail-queue__pager-link">
              Newer
            </Link>
          ) : null}
          <span className="kf-admin-master-detail-queue__pager-meta">
            {page}/{totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="kf-admin-master-detail-queue__pager-link">
              Older
            </Link>
          ) : null}
        </nav>
      ) : null}

      {selectedId ? (
        <Link href={buildAdminModerationIndexHref(listParams)} className="kf-admin-master-detail-queue__back lg:hidden">
          ← Back to queue
        </Link>
      ) : null}
    </aside>
  );
}