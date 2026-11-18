import {
  kfAdminDeleteListingAction,
  kfAdminModerateListingAction,
  kfAdminSetListingFeaturedAction,
  kfAdminUnpublishListingAction,
} from "@/lib/kasifind/admin-actions";
import { KfAdminDeleteButton } from "@/components/kasifind/kf-admin-delete-button";

type Props = {
  listingId: string;
  featured: boolean;
  compact?: boolean;
};

export function KfAdminListingQuickActions({ listingId, featured, compact }: Props) {
  const btnClass = compact ? "kf-btn kf-btn-outline text-xs" : "kf-btn kf-btn-outline text-sm";
  const primaryClass = compact ? "kf-btn kf-btn-primary text-xs" : "kf-btn kf-btn-primary text-sm";

  return (
    <div className="kf-admin-listing-quick-actions">
      <form action={kfAdminModerateListingAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="decision" value="APPROVED" />
        <button type="submit" className={primaryClass}>
          Approve
        </button>
      </form>
      <form action={kfAdminModerateListingAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="decision" value="REJECTED" />
        <button type="submit" className={btnClass}>
          Reject
        </button>
      </form>
      <form action={kfAdminSetListingFeaturedAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="featured" value={featured ? "false" : "true"} />
        <button type="submit" className={btnClass}>
          {featured ? "Unfeature" : "Feature"}
        </button>
      </form>
      <form action={kfAdminUnpublishListingAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <button type="submit" className={btnClass}>
          Unpublish
        </button>
      </form>
      <KfAdminDeleteButton
        action={kfAdminDeleteListingAction}
        hiddenFields={{ listingId }}
        label="Delete"
        confirmMessage="Delete this listing permanently?"
      />
    </div>
  );
}