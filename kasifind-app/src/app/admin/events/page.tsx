import Link from "next/link";
import { KfAnalyticsEventType } from "@/generated/prisma/enums";
import { getAdminEventsPage } from "@/lib/kasifind/admin-events";
import { formatAdminEventTypeLabel } from "@/lib/kasifind/admin-event-labels";
import { formatKfClickIdentity } from "@/lib/kasifind/contact-click-display";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminEventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const eventType = typeof sp.eventType === "string" ? sp.eventType : "";
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;

  const data = await getAdminEventsPage({ q, eventType, page });
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (eventType) params.set("eventType", eventType);
    for (const [k, v] of Object.entries(overrides)) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="kf-admin-section-title">Analytics events</h2>
        <p className="text-sm text-[var(--kf-muted)]">
          Search impressions, profile views, contact taps, searches, and category browses.{" "}
          {data.total.toLocaleString()} matching event{data.total === 1 ? "" : "s"}.
        </p>
      </div>

      <form method="get" className="kf-admin-filters">
        <input
          name="q"
          defaultValue={q}
          placeholder="Listing, email, visitor ID, search text…"
          className="kf-input min-w-[12rem] flex-1"
          aria-label="Search events"
        />
        <select name="eventType" defaultValue={eventType} className="kf-input" aria-label="Event type">
          <option value="">All event types</option>
          {Object.values(KfAnalyticsEventType).map((type) => (
            <option key={type} value={type}>
              {formatAdminEventTypeLabel(type)}
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
              <th>Event</th>
              <th>Listing</th>
              <th>Who</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-[var(--kf-muted)]">
                  No events match these filters.
                </td>
              </tr>
            ) : (
              data.rows.map((e) => {
                const who = formatKfClickIdentity({
                  userName: e.userName,
                  userEmail: e.userEmail,
                  visitorId: e.visitorId,
                });
                const contextParts = [
                  e.query ? `Search: “${e.query}”` : null,
                  e.regionLabel ? `Area: ${e.regionLabel}` : null,
                  e.categoryName ? `Category: ${e.categoryName}` : null,
                ].filter(Boolean);

                return (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap text-xs text-[var(--kf-muted)]">
                      {formatKfDateTime(e.createdAt)}
                    </td>
                    <td className="text-sm font-medium">{formatAdminEventTypeLabel(e.eventType)}</td>
                    <td className="text-sm">
                      {e.listingId && e.listingName ? (
                        <Link href={`/admin/listings/${e.listingId}`} className="underline">
                          {e.listingName}
                        </Link>
                      ) : e.listingId ? (
                        <Link href={`/admin/listings/${e.listingId}`} className="text-xs underline">
                          {e.listingId.slice(0, 10)}…
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-sm">
                      <span>{who.label}</span>
                      {who.detail ? (
                        <span className="mt-0.5 block text-xs text-[var(--kf-muted)]">{who.detail}</span>
                      ) : null}
                    </td>
                    <td className="max-w-[14rem] text-xs text-[var(--kf-muted)]">
                      {contextParts.length > 0 ? (
                        <ul className="space-y-0.5">
                          {contextParts.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/admin/events${buildQuery({ page: String(page - 1) })}`} className="kf-btn kf-btn-outline">
              Previous
            </Link>
          ) : null}
          <span className="text-[var(--kf-muted)]">
            Page {data.page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin/events${buildQuery({ page: String(page + 1) })}`} className="kf-btn kf-btn-outline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
