import Link from "next/link";
import {
  kfAdminDeleteListingAction,
  kfAdminModerateListingAction,
  kfAdminSetListingFeaturedAction,
  kfAdminUnpublishListingAction,
} from "@/lib/kasifind/admin-actions";
import { getAdminListingsPage } from "@/lib/kasifind/admin-listings";
import { KfAdminDeleteButton } from "@/components/kasifind/kf-admin-delete-button";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminListingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const moderation = typeof sp.moderation === "string" ? sp.moderation : "";
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;

  const data = await getAdminListingsPage({ q, status, moderation, page });
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (moderation) params.set("moderation", moderation);
    for (const [k, v] of Object.entries(overrides)) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kf-admin-section-title">Listings</h2>
          <p className="text-sm text-[var(--kf-muted)]">{data.total} total</p>
        </div>
        <Link href="/admin/export/listings" className="kf-btn kf-btn-outline text-sm">
          Export CSV
        </Link>
      </div>

      <form method="get" className="kf-admin-filters">
        <input name="q" defaultValue={q} placeholder="Search title…" className="kf-input" aria-label="Search listings" />
        <select name="status" defaultValue={status} className="kf-input" aria-label="Status">
          <option value="">Any status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <select name="moderation" defaultValue={moderation} className="kf-input" aria-label="Moderation">
          <option value="">Any moderation</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button type="submit" className="kf-btn kf-btn-primary">
          Filter
        </button>
      </form>

      <div className="kf-admin-table-wrap">
        <table className="kf-admin-data-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[var(--kf-muted)]">
                  No listings match your filters.
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/listings/${row.id}`} className="font-medium underline">
                      {row.displayName}
                    </Link>
                    {row.featured ? (
                      <span className="kf-admin-badge ml-2">Featured</span>
                    ) : null}
                    <p className="text-xs text-[var(--kf-muted)]">{row.categories || "No category"}</p>
                  </td>
                  <td className="text-xs">{row.ownerEmail}</td>
                  <td className="text-xs">
                    {row.status}
                    <br />
                    {row.moderationStatus}
                  </td>
                  <td>{row.views}</td>
                  <td>{row.clicks}</td>
                  <td className="whitespace-nowrap text-xs">
                    {new Date(row.updatedAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="min-w-[9rem]">
                    <div className="flex flex-col gap-1">
                      <form action={kfAdminModerateListingAction} className="inline">
                        <input type="hidden" name="listingId" value={row.id} />
                        <input type="hidden" name="decision" value="APPROVED" />
                        <button type="submit" className="text-xs font-medium text-[var(--kf-forest)] underline">
                          Approve
                        </button>
                      </form>
                      <form action={kfAdminSetListingFeaturedAction} className="inline">
                        <input type="hidden" name="listingId" value={row.id} />
                        <input type="hidden" name="featured" value={row.featured ? "false" : "true"} />
                        <button type="submit" className="text-xs underline">
                          {row.featured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                      <form action={kfAdminUnpublishListingAction}>
                        <input type="hidden" name="listingId" value={row.id} />
                        <button type="submit" className="text-xs underline">
                          Unpublish
                        </button>
                      </form>
                      <KfAdminDeleteButton
                        action={kfAdminDeleteListingAction}
                        hiddenFields={{ listingId: row.id }}
                        label="Delete"
                        confirmMessage="Delete this listing permanently?"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex gap-2 text-sm">
          {data.page > 1 ? (
            <Link href={`/admin/listings${buildQuery({ page: String(data.page - 1) })}`} className="underline">
              Previous
            </Link>
          ) : null}
          <span className="text-[var(--kf-muted)]">
            Page {data.page} of {totalPages}
          </span>
          {data.page < totalPages ? (
            <Link href={`/admin/listings${buildQuery({ page: String(data.page + 1) })}`} className="underline">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
