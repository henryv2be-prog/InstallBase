import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { listKfCategories } from "@/lib/kasifind/categories";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";
import { countMissingLocalUploads } from "@/lib/kasifind/upload-asset";
import { KfListingAssistanceProvider } from "@/components/kasifind/kf-listing-assistance-provider";
import { canProviderSubmitListingAssistance } from "@/lib/kasifind/listing-assistance-status";
import { getProviderListingAssistanceRequest } from "@/lib/kasifind/listing-assistance";

export const dynamic = "force-dynamic";

export default async function KfListingEditorPage() {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card rounded-2xl p-6">
        <p>Set KASIFIND_DATABASE_URL to manage listings.</p>
      </div>
    );
  }

  const user = await getKasiFindSessionUser();
  if (!user) redirect("/login");

  const [categories, listing, assistanceRequest] = await Promise.all([
    listKfCategories(),
    getListingForUser(user.id),
    getProviderListingAssistanceRequest(user.id),
  ]);

  const canRequestAssistance = canProviderSubmitListingAssistance(assistanceRequest?.status ?? null);

  const listingData = listing
    ? {
        listingId: listing.id,
        displayName: listing.displayName,
        description: listing.description,
        phone: listing.phone,
        whatsapp: listing.whatsapp,
        locationLabel: listing.locationLabel,
        latitude: listing.latitude,
        longitude: listing.longitude,
        hideExactLocation: listing.hideExactLocation,
        priceHint: listing.priceHint,
        hoursNote: listing.hoursNote,
        status: listing.status,
        moderationStatus: listing.moderationStatus,
        categoryIds: listing.categories.map((c) => c.categoryId),
        services: listing.services.map((s) => s.name),
        photos: listing.photos.map((p) => ({ id: p.id, url: p.url })),
        profileImageUrl: listing.profileImageUrl,
      }
    : null;

  const missingPhotoCount = listing
    ? await countMissingLocalUploads([
        ...listing.photos.map((p) => p.url),
        ...(listing.profileImageUrl ? [listing.profileImageUrl] : []),
      ])
    : 0;

  return (
    <Suspense fallback={null}>
      <KfListingAssistanceProvider
        hasListing={Boolean(listingData)}
        canSubmit={canRequestAssistance}
        currentRequest={assistanceRequest}
      >
        <div className="kf-listing-page-flow kf-listing-page-classic">
          {missingPhotoCount > 0 ? (
            <div className="kf-alert-info kf-listing-flow-alert" role="status">
              <strong>
                {missingPhotoCount} work photo{missingPhotoCount === 1 ? "" : "s"}
              </strong>{" "}
              need to be re-uploaded after a deploy. Add them again in the Photos step.
            </div>
          ) : null}
          <KfListingForm
            categories={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              children: c.children.map((ch) => ({ id: ch.id, slug: ch.slug, name: ch.name })),
            }))}
            listing={listingData}
            userEmail={user.email}
          />
        </div>
      </KfListingAssistanceProvider>
    </Suspense>
  );
}
