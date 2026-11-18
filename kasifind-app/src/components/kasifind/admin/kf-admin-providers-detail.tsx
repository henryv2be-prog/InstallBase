import Link from "next/link";
import { KfAdminDeleteButton } from "@/components/kasifind/kf-admin-delete-button";
import { KfAdminListingQuickActions } from "@/components/kasifind/admin/kf-admin-listing-quick-actions";
import { kfAdminDeleteUserAction, kfAdminUpdateUserAction } from "@/lib/kasifind/admin-actions";
import { buildAdminAssistanceDetailHref } from "@/lib/kasifind/admin-assistance-nav";
import { buildAdminListingsDetailHref } from "@/lib/kasifind/admin-listings-nav";
import { formatKfDate, formatKfDateTime } from "@/lib/kasifind/format-datetime";
import type { getAdminUserDetail } from "@/lib/kasifind/admin-users";

type ProviderDetail = NonNullable<Awaited<ReturnType<typeof getAdminUserDetail>>>;

type Props = {
  user: ProviderDetail;
};

export function KfAdminProvidersDetail({ user }: Props) {
  const listing = user.listing;

  return (
    <div className="kf-admin-providers-detail">
      <header className="kf-admin-providers-detail__hero">
        <div>
          <h3 className="kf-admin-providers-detail__title">{user.name ?? user.email}</h3>
          <p className="kf-admin-providers-detail__meta">{user.email}</p>
          <dl className="kf-admin-providers-detail__facts">
            <div>
              <dt>Role</dt>
              <dd>{user.role}</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>{user.suspended ? "Suspended" : "Active"}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{formatKfDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt>Last active</dt>
              <dd>{user.lastSeenAt ? formatKfDateTime(user.lastSeenAt) : "—"}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="kf-admin-providers-detail__pinned">
        <h4 className="kf-admin-providers-detail__section-title">Manage account</h4>
        <form action={kfAdminUpdateUserAction} className="kf-admin-providers-detail__manage-form">
          <input type="hidden" name="userId" value={user.id} />
          <label className="block text-xs">
            Role
            <select name="role" defaultValue={user.role} className="kf-input mt-1 text-sm">
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="block text-xs">
            Status
            <select
              name="suspended"
              defaultValue={user.suspended ? "true" : "false"}
              className="kf-input mt-1 text-sm"
            >
              <option value="false">Active</option>
              <option value="true">Suspended</option>
            </select>
          </label>
          <button type="submit" className="kf-btn kf-btn-primary text-sm">
            Save account
          </button>
        </form>
        <KfAdminDeleteButton
          action={kfAdminDeleteUserAction}
          hiddenFields={{ userId: user.id }}
          label="Delete user"
          confirmMessage="Delete this user and their listing permanently?"
        />
      </section>

      <section className="kf-admin-providers-detail__listing-card">
        <h4 className="kf-admin-providers-detail__section-title">Listing</h4>
        {listing ? (
          <>
            <p className="text-sm font-semibold">{listing.displayName}</p>
            <p className="text-sm text-[var(--kf-muted)]">
              {listing.status} · {listing.moderationStatus}
              {listing.featured ? " · Featured" : ""} · {listing.locationLabel}
            </p>
            <p className="mt-1 text-xs text-[var(--kf-muted)]">
              {listing.reviewCount} reviews · {listing.reportCount} reports · Updated{" "}
              {formatKfDate(listing.updatedAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={buildAdminListingsDetailHref(listing.id, {})}
                className="kf-btn kf-btn-primary text-sm"
              >
                Open in listings workspace
              </Link>
              <Link href={`/providers/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
                Public listing
              </Link>
            </div>
            <div className="mt-4">
              <KfAdminListingQuickActions listingId={listing.id} featured={listing.featured} compact />
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--kf-muted)]">This account has not created a listing yet.</p>
        )}
      </section>

      {user.latestAssistance ? (
        <section className="kf-admin-providers-detail__assistance">
          <h4 className="kf-admin-providers-detail__section-title">Listing assistance</h4>
          <p className="text-sm">
            Latest request: <strong>{user.latestAssistance.status}</strong> ·{" "}
            {formatKfDateTime(user.latestAssistance.createdAt)}
          </p>
          <Link
            href={buildAdminAssistanceDetailHref(user.latestAssistance.id, {})}
            className="kf-btn kf-btn-outline mt-2 text-sm"
          >
            Open assistance workspace
          </Link>
        </section>
      ) : null}
    </div>
  );
}