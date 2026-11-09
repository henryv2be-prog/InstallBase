import Link from "next/link";
import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";
import {
  getAdminAssistanceRequests,
  getAdminAssistanceSummary,
} from "@/lib/kasifind/listing-assistance";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const STATUS_FILTERS: { value: KfListingAssistanceStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
];

function statusLabel(status: KfListingAssistanceStatus) {
  return STATUS_FILTERS.find((f) => f.value === status)?.label ?? status;
}

export default async function AdminListingAssistancePage({ searchParams }: Props) {
  const sp = await searchParams;
  const status =
    typeof sp.status === "string" ? (sp.status as KfListingAssistanceStatus | "") : "";
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;

  const [summary, data] = await Promise.all([
    getAdminAssistanceSummary(),
    getAdminAssistanceRequests({ status, page }),
  ]);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    for (const [k, v] of Object.entries(overrides)) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="kf-admin-section-title">Listing assistance</h2>
        <p className="text-sm text-[var(--kf-muted)]">
          Providers who need help updating their listing. Newest requests first.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="kf-admin-stat-card">
          <p className="kf-admin-stat-label">Pending</p>
          <p className="kf-admin-stat-value">{summary.pending}</p>
        </div>
        <div className="kf-admin-stat-card">
          <p className="kf-admin-stat-label">In progress</p>
          <p className="kf-admin-stat-value">{summary.inProgress}</p>
        </div>
        <div className="kf-admin-stat-card">
          <p className="kf-admin-stat-label">Completed</p>
          <p className="kf-admin-stat-value">{summary.completed}</p>
        </div>
      </section>

      <form method="get" className="kf-admin-filters">
        <select name="status" defaultValue={status} className="kf-input" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <option key={f.value || "all"} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="submit" className="kf-btn kf-btn-primary">
          Filter
        </button>
      </form>

      <div className="kf-admin-table-wrap">
        <table className="kf-admin-data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Business</th>
              <th>Provider</th>
              <th>Message</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-[var(--kf-muted)]">
                  No assistance requests match this filter.
                </td>
              </tr>
            ) : (
              data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap text-xs text-[var(--kf-muted)]">
                    {formatKfDateTime(r.createdAt)}
                  </td>
                  <td className="text-sm font-medium">{r.businessName}</td>
                  <td className="text-sm">
                    {r.providerName ? (
                      <>
                        {r.providerName}
                        <br />
                      </>
                    ) : null}
                    <span className="text-[var(--kf-muted)]">{r.providerEmail}</span>
                  </td>
                  <td className="max-w-xs text-sm text-[var(--kf-muted)]">
                    {r.providerMessage ?? "—"}
                  </td>
                  <td className="text-sm">{statusLabel(r.status)}</td>
                  <td className="text-right">
                    <Link href={`/admin/listing-assistance/${r.id}`} className="kf-btn kf-btn-outline text-sm">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/admin/listing-assistance${buildQuery({ page: String(page - 1) })}`} className="underline">
              ← Newer page
            </Link>
          ) : null}
          <span className="text-[var(--kf-muted)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin/listing-assistance${buildQuery({ page: String(page + 1) })}`} className="underline">
              Older page →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
