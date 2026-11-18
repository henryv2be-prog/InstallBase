import Link from "next/link";
import type { KfUserRole } from "@/generated/prisma/enums";
import {
  buildAdminProvidersDetailHref,
  buildAdminProvidersIndexHref,
  type AdminProvidersListParams,
} from "@/lib/kasifind/admin-providers-nav";
import { formatKfDate } from "@/lib/kasifind/format-datetime";

export type AdminProvidersQueueRow = {
  id: string;
  email: string;
  name: string | null;
  role: KfUserRole;
  suspended: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  listing: {
    id: string;
    displayName: string;
    status: string;
    moderationStatus: string;
  } | null;
};

type Props = {
  rows: AdminProvidersQueueRow[];
  listParams: AdminProvidersListParams;
  selectedId: string | null;
  total: number;
  page: number;
  pageSize: number;
  exportHref: string;
};

export function KfAdminProvidersQueue({
  rows,
  listParams,
  selectedId,
  total,
  page,
  pageSize,
  exportHref,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filterAction = selectedId ? `/admin/users/${selectedId}` : "/admin/users";
  const pageHref = (nextPage: number) =>
    selectedId
      ? buildAdminProvidersDetailHref(selectedId, { ...listParams, page: nextPage })
      : buildAdminProvidersIndexHref({ ...listParams, page: nextPage });

  return (
    <aside className="kf-admin-master-detail-queue" aria-label="Providers queue">
      <header className="kf-admin-master-detail-queue__head">
        <h3 className="kf-admin-master-detail-queue__title">Queue</h3>
        <p className="kf-admin-master-detail-queue__meta">{total} accounts</p>
        <Link href={exportHref} className="kf-admin-master-detail-queue__export">
          Export CSV
        </Link>
      </header>

      <form method="get" className="kf-admin-master-detail-queue__filters" action={filterAction}>
        <input
          name="q"
          defaultValue={listParams.q ?? ""}
          placeholder="Search name or email…"
          className="kf-input kf-admin-master-detail-queue__search"
          aria-label="Search providers"
        />
        <select name="role" defaultValue={listParams.role ?? ""} className="kf-input" aria-label="Role">
          <option value="">All roles</option>
          <option value="PROVIDER">Provider</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select name="suspended" defaultValue={listParams.suspended ?? ""} className="kf-input" aria-label="Status">
          <option value="">Any status</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </select>
        <button type="submit" className="kf-btn kf-btn-primary kf-admin-master-detail-queue__filter-btn">
          Filter
        </button>
      </form>

      <ul className="kf-admin-master-detail-queue__list">
        {rows.length === 0 ? (
          <li className="kf-admin-master-detail-queue__empty">No accounts match this filter.</li>
        ) : (
          rows.map((row) => {
            const active = row.id === selectedId;
            return (
              <li key={row.id}>
                <Link
                  href={buildAdminProvidersDetailHref(row.id, listParams)}
                  className={`kf-admin-master-detail-queue__item${active ? " kf-admin-master-detail-queue__item--active" : ""}`}
                  aria-current={active ? "true" : undefined}
                  draggable={false}
                >
                  <span className="kf-admin-master-detail-queue__item-top">
                    <span className="kf-admin-master-detail-queue__primary">{row.name ?? row.email}</span>
                    <span
                      className={`kf-admin-master-detail-queue__pill${row.suspended ? " kf-admin-master-detail-queue__pill--muted" : ""}`}
                    >
                      {row.suspended ? "Suspended" : row.role}
                    </span>
                  </span>
                  <span className="kf-admin-master-detail-queue__sub">{row.email}</span>
                  <span className="kf-admin-master-detail-queue__sub">
                    {row.listing ? row.listing.displayName : "No listing"}
                  </span>
                  <span className="kf-admin-master-detail-queue__meta-line">
                    Joined {formatKfDate(row.createdAt)}
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>

      {totalPages > 1 ? (
        <nav className="kf-admin-master-detail-queue__pager" aria-label="Providers pagination">
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
        <Link href={buildAdminProvidersIndexHref(listParams)} className="kf-admin-master-detail-queue__back lg:hidden">
          ← Back to queue
        </Link>
      ) : null}
    </aside>
  );
}