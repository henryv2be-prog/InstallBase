import Link from "next/link";
import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";
import {
  ADMIN_ASSISTANCE_STATUS_FILTERS,
  adminAssistanceStatusLabel,
  buildAdminAssistanceDetailHref,
  buildAdminAssistanceIndexHref,
  type AdminAssistanceListParams,
} from "@/lib/kasifind/admin-assistance-nav";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";

export type AssistanceQueueRow = {
  id: string;
  businessName: string;
  providerEmail: string;
  providerName: string | null;
  status: KfListingAssistanceStatus;
  createdAt: string;
};

type Props = {
  summary: { pending: number; inProgress: number; completed: number };
  rows: AssistanceQueueRow[];
  listParams: AdminAssistanceListParams;
  selectedId: string | null;
  total: number;
  page: number;
  pageSize: number;
};

export function KfAdminAssistanceQueue({
  summary,
  rows,
  listParams,
  selectedId,
  total,
  page,
  pageSize,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const status = listParams.status ?? "";
  const filterAction = selectedId
    ? `/admin/listing-assistance/${selectedId}`
    : "/admin/listing-assistance";
  const pageHref = (nextPage: number) =>
    selectedId
      ? buildAdminAssistanceDetailHref(selectedId, { ...listParams, page: nextPage })
      : buildAdminAssistanceIndexHref({ ...listParams, page: nextPage });

  return (
    <aside className="kf-admin-assistance-queue" aria-label="Assistance queue">
      <header className="kf-admin-assistance-queue__head">
        <h2 className="kf-admin-assistance-queue__title">Queue</h2>
        <p className="kf-admin-assistance-queue__meta">
          {summary.pending} pending · {summary.inProgress} in progress
        </p>
      </header>

      <form method="get" className="kf-admin-assistance-queue__filters" action={filterAction}>
        <select
          name="status"
          defaultValue={status}
          className="kf-input kf-admin-assistance-queue__select"
          aria-label="Filter by status"
        >
          {ADMIN_ASSISTANCE_STATUS_FILTERS.map((f) => (
            <option key={f.value || "all"} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="submit" className="kf-btn kf-btn-primary kf-admin-assistance-queue__filter-btn">
          Filter
        </button>
      </form>

      <ul className="kf-admin-assistance-queue__list">
        {rows.length === 0 ? (
          <li className="kf-admin-assistance-queue__empty">No requests match this filter.</li>
        ) : (
          rows.map((r) => {
            const active = r.id === selectedId;
            const href = buildAdminAssistanceDetailHref(r.id, listParams);
            return (
              <li key={r.id}>
                <Link
                  href={href}
                  className={`kf-admin-assistance-queue__item${active ? " kf-admin-assistance-queue__item--active" : ""}`}
                  aria-current={active ? "true" : undefined}
                  draggable={false}
                >
                  <span className="kf-admin-assistance-queue__item-top">
                    <span className="kf-admin-assistance-queue__business">{r.businessName}</span>
                    <span
                      className={`kf-admin-assistance-queue__status kf-admin-assistance-queue__status--${r.status.toLowerCase()}`}
                    >
                      {adminAssistanceStatusLabel(r.status)}
                    </span>
                  </span>
                  <span className="kf-admin-assistance-queue__sub">{r.providerEmail}</span>
                  <span className="kf-admin-assistance-queue__time">{formatKfDateTime(r.createdAt)}</span>
                </Link>
              </li>
            );
          })
        )}
      </ul>

      {totalPages > 1 ? (
        <nav className="kf-admin-assistance-queue__pager" aria-label="Queue pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="kf-admin-assistance-queue__pager-link">
              Newer
            </Link>
          ) : null}
          <span className="kf-admin-assistance-queue__pager-meta">
            {page}/{totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="kf-admin-assistance-queue__pager-link">
              Older
            </Link>
          ) : null}
        </nav>
      ) : null}

      {selectedId ? (
        <Link
          href={buildAdminAssistanceIndexHref(listParams)}
          className="kf-admin-assistance-queue__back lg:hidden"
        >
          ← Back to queue only
        </Link>
      ) : null}
    </aside>
  );
}