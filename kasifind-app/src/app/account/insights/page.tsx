import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import {
  KfListingStatusChip,
  listingStatusSummary,
} from "@/components/kasifind/kf-listing-status";
import { countMissingLocalUploads } from "@/lib/kasifind/upload-asset";
import { getListingEngagementMetrics } from "@/lib/kasifind/listing-metrics";
import { getProviderListingAssistanceRequest } from "@/lib/kasifind/listing-assistance";
import { canProviderSubmitListingAssistance } from "@/lib/kasifind/listing-assistance-status";
import {
  KfListingAssistanceHeroExtras,
  KfListingAssistanceProvider,
} from "@/components/kasifind/kf-listing-assistance-provider";
import { KfProviderListingActions } from "@/components/kasifind/kf-provider-listing-actions";
import { loginPathWithNext } from "@/lib/kasifind/auth-redirect";

export const dynamic = "force-dynamic";

export default async function ProviderInsightsPage() {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card rounded-2xl p-6">
        <p>Set KASIFIND_DATABASE_URL to view insights.</p>
      </div>
    );
  }

  const user = await getKasiFindSessionUser();
  if (!user) redirect(loginPathWithNext("/account/insights"));

  const [listing, assistanceRequest] = await Promise.all([
    getListingForUser(user.id),
    getProviderListingAssistanceRequest(user.id),
  ]);

  if (!listing) {
    redirect("/account/listing");
  }

  const canRequestAssistance = canProviderSubmitListingAssistance(assistanceRequest?.status ?? null);
  const engagement = await getListingEngagementMetrics(listing.id);
  const missingPhotoCount = await countMissingLocalUploads([
    ...listing.photos.map((p) => p.url),
    ...(listing.profileImageUrl ? [listing.profileImageUrl] : []),
  ]);

  const listingStatus = {
    status: listing.status,
    moderationStatus: listing.moderationStatus,
  };
  const statusCopy = listingStatusSummary(listingStatus);

  return (
    <Suspense fallback={null}>
    <KfListingAssistanceProvider
      hasListing
      canSubmit={canRequestAssistance}
      currentRequest={assistanceRequest}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--kf-muted)]">
              Your listing
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--kf-charcoal)]">
              {listing.displayName}
            </h1>
          </div>
          <KfListingStatusChip listing={listingStatus} />
        </div>

        <p className="text-sm leading-relaxed text-[var(--kf-muted)]">{statusCopy.detail}</p>

        <KfListingAssistanceHeroExtras
          currentRequest={assistanceRequest}
          canSubmit={canRequestAssistance}
          tone="surface"
        />

        {missingPhotoCount > 0 ? (
          <div className="kf-alert-info" role="status">
            <strong>
              {missingPhotoCount} work photo{missingPhotoCount === 1 ? "" : "s"}
            </strong>{" "}
            need to be added again on the server.{" "}
            <Link href="/account/listing" className="font-semibold underline">
              Update photos
            </Link>
          </div>
        ) : null}

        <div className="kf-dashboard-hero kf-animate-in">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            How people find you
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Listing engagement">
            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/75">
                Seen in search
              </p>
              <p className="text-xl font-bold tabular-nums">{engagement.impressions}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/75">
                Profile views
              </p>
              <p className="text-xl font-bold tabular-nums">{engagement.profileViews}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/75">
                Contact taps
              </p>
              <p className="text-xl font-bold tabular-nums">{engagement.clicks}</p>
            </div>
          </div>
        </div>

        <KfProviderListingActions
          manageHref="/account/listing"
          manageLabel="Edit listing"
          listingId={listing.id}
          displayName={listing.displayName}
          shareEnabled={
            listing.status === "PUBLISHED" && listing.moderationStatus === "APPROVED"
          }
          layout="inline"
        />
        <Link
          href={`/providers/${listing.id}`}
          className="text-sm font-semibold text-[var(--kf-forest)] underline underline-offset-2"
        >
          View public listing
        </Link>
      </div>
    </KfListingAssistanceProvider>
    </Suspense>
  );
}
