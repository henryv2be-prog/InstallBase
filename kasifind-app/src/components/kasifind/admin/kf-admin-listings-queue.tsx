import Link from "next/link";
import type { KfListingStatus, KfModerationStatus } from "@/generated/prisma/enums";
import {
  buildAdminListingsDetailHref,
  buildAdminListingsIndexHref,
  type AdminListingsListParams,
} from "@/lib/kasifind/admin-listings-nav";
import { formatKfDate } from "@/lib/kasifind/format-datetime";

export type AdminListingsQueueRow = {
  id: string;
  displayName: string;
  status: KfListingStatus;
  moderationStatus: KfModerationStatus;
  featured: boolean;
  ownerEmail: string;
  categories: string;
  impressions: number;
  views: number;
  clicks: number;
  updatedAt: string;
};

type Props = {
  rows: AdminListingsQueueRow[];
  listParams: AdminListingsListParams;
  selectedId: string | null;
  total: number;
  page: number;
  pageSize: number;
  exportHref: string;
};

export function KfAdminListingsQueue({
  rows,
  listParams,
  selectedId,
  total,
  page,
  pageSize,
  exportHref,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filterAction = selectedId ? `/admin/listings/${selectedId}` : "/admin/listings";
  const pageHref = (nextPage: number) =>
    selectedId
      ? buildAdminListingsDetailHref(selectedId, { ...listParams, page: nextPage })
      : buildAdminListingsIndexHref({ ...listParams, page: nextPage });

  return (
    <aside className="kf-admin-master-detail-queue" aria-label="Listings queue">
      <header className="kf-admin-master-detail-queue__head">
        <h3 className="kf-admin-master-detail-queue__title">Queue</h3>
        <p className="kf-admin-master-detail-queue__meta">{total} listings</p>
        <Link href={exportHref} className="kf-admin-master-detail-queue__export">
          Export CSV
        </Link>
      </header>

      <form method="get" className="kf-admin-master-detail-queue__filters" action={filterAction}>
        <input
          name="q"
          defaultValue={listParams.q ?? ""}
          placeholder="Search title…"
          className="kf-input kf-admin-master-detail-queue__search"
          aria-label="Search listings"
        />
        <select name="status" defaultValue={listParams.status ?? ""} className="kf-input" aria-label="Status">
          <option value="">Any status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <select
          name="moderation"
          defaultValue={listParams.moderation ?? ""}
          className="kf-input"
          aria-label="Moderation"
        >
          <option value="">Any moderation</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button type="submit" className="kf-btn kf-btn-primary kf-admin-master-detail-queue__filter-btn">
          Filter
        </button>
      </form>

      <ul className="kf-admin-master-detail-queue__list">
        {rows.length === 0 ? (
          <li className="kf-admin-master-detail-queue__empty">No listings match this filter.</li>
        ) : (
          rows.map((row) => {
            const active = row.id === selectedId;
            return (
              <li key={row.id}>
                <Link
                  href={buildAdminListingsDetailHref(row.id, listParams)}
                  className={`kf-admin-master-detail-queue__item${active ? " kf-admin-master-detail-queue__item--active" : ""}`}
                  aria-current={active ? "true" : undefined}
                  draggable={false}
                >
                  <span className="kf-admin-master-detail-queue__item-top">
                    <span className="kf-admin-master-detail-queue__primary">{row.displayName}</span>
                    {row.featured ? (
                      <span className="kf-admin-master-detail-queue__pill kf-admin-master-detail-queue__pill--featured">
                        Featured
                      </span>
                    ) : null}
                  </span>
                  <span className="kf-admin-master-detail-queue__sub">
                    {row.status} · {row.moderationStatus}
                  </span>
                  <span className="kf-admin-master-detail-queue__sub">{row.ownerEmail}</span>
                  <span className="kf-admin-master-detail-queue__meta-line">
                    {row.views} views · {formatKfDate(row.updatedAt)}
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>

      {totalPages > 1 ? (
        <nav className="kf-admin-master-detail-queue__pager" aria-label="Listings pagination">
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
        <Link href={buildAdminListingsIndexHref(listParams)} className="kf-admin-master-detail-queue__back lg:hidden">
          ← Back to queue
        </Link>
      ) : null}
    </aside>
  );
}