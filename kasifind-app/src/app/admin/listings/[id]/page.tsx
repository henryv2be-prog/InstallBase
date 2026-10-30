import Link from "next/link";
import { notFound } from "next/navigation";
import {
  kfAdminDeleteListingAction,
  kfAdminModerateListingAction,
  kfAdminSetListingFeaturedAction,
} from "@/lib/kasifind/admin-actions";
import { getAdminListingDetail } from "@/lib/kasifind/admin-listings";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import { KfAdminDeleteButton } from "@/components/kasifind/kf-admin-delete-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminListingDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getAdminListingDetail(id);
  if (!data) notFound();

  const { listing, metrics, recentEvents } = data;

  return (
    <div className="space-y-6">
      <Link href="/admin/listings" className="text-sm underline">
        ← All listings
      </Link>

      <header className="kf-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{listing.displayName}</h2>
            <p className="text-sm text-[var(--kf-muted)]">
              {listing.user.email} · {listing.locationLabel}
            </p>
            <p className="mt-2 text-sm">
              Status <strong>{listing.status}</strong> · Moderation{" "}
              <strong>{listing.moderationStatus}</strong>
              {listing.featured ? " · Featured" : ""}
            </p>
          </div>
          <Link href={`/providers/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Public / preview URL
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="kf-admin-stat-card">
          <p className="kf-admin-stat-label">Views</p>
          <p className="kf-admin-stat-value">{metrics.views}</p>
        </div>
        <div className="kf-admin-stat-card">
          <p className="kf-admin-stat-label">Contact clicks</p>
          <p className="kf-admin-stat-value">{metrics.clicks}</p>
        </div>
        <div className="kf-admin-stat-card">
          <p className="kf-admin-stat-label">Click-through</p>
          <p className="kf-admin-stat-value">{metrics.conversion}%</p>
        </div>
      </section>

      <section className="kf-card p-5">
        <h3 className="font-semibold">Listing details</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">Phone</dt>
            <dd>{listing.phone}</dd>
          </div>
          <div>
            <dt className="font-medium">WhatsApp</dt>
            <dd>{listing.whatsapp ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Categories</dt>
            <dd>{listing.categories.map((c) => c.category.name).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Services</dt>
            <dd>{listing.services.map((s) => s.name).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Reviews / reports</dt>
            <dd>
              {listing._count.reviews} reviews · {listing._count.reports} reports
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-wrap gap-2">
        <form action={kfAdminModerateListingAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="decision" value="APPROVED" />
          <button type="submit" className="kf-btn kf-btn-primary">
            Approve
          </button>
        </form>
        <form action={kfAdminModerateListingAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="decision" value="REJECTED" />
          <button type="submit" className="kf-btn kf-btn-outline">
            Reject
          </button>
        </form>
        <form action={kfAdminSetListingFeaturedAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="featured" value={listing.featured ? "false" : "true"} />
          <button type="submit" className="kf-btn kf-btn-secondary">
            {listing.featured ? "Remove feature" : "Feature listing"}
          </button>
        </form>
        <KfAdminDeleteButton
          action={kfAdminDeleteListingAction}
          hiddenFields={{ listingId: listing.id }}
          label="Delete listing"
          confirmMessage="Delete this listing permanently?"
        />
      </section>

      <section>
        <h3 className="kf-admin-section-title">Recent events</h3>
        <div className="kf-admin-table-wrap mt-2">
          <table className="kf-admin-data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-sm text-[var(--kf-muted)]">
                    No tracked events yet.
                  </td>
                </tr>
              ) : (
                recentEvents.map((e) => (
                  <tr key={e.id}>
                    <td className="text-xs">{formatKfDateTime(e.createdAt)}</td>
                    <td className="text-sm">{e.eventType.replace(/_/g, " ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
