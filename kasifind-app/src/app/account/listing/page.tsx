import Link from "next/link";
import { redirect } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { listKfCategories } from "@/lib/kasifind/categories";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";
import {
  KfListingStatusChip,
  listingStatusSummary,
} from "@/components/kasifind/kf-listing-status";
import { countMissingLocalUploads } from "@/lib/kasifind/upload-asset";

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

  const [categories, listing] = await Promise.all([
    listKfCategories(),
    getListingForUser(user.id),
  ]);

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

  const statusCopy = listingData
    ? listingStatusSummary(listingData)
    : {
        label: "Get started",
        detail: "Create your free listing — no company registration required.",
      };

  return (
    <div className="kf-listing-page-flow kf-listing-page-classic">
      <div className="kf-dashboard-hero kf-animate-in">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Provider dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {listingData?.displayName ?? "Your listing"}
            </h1>
          </div>
          {listingData ? <KfListingStatusChip listing={listingData} /> : null}
        </div>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90">{statusCopy.detail}</p>
        {!listingData && (
          <p className="mt-2 text-sm text-white/75">
            Add services like &quot;steel gates&quot; so people can find you in search.
          </p>
        )}
      </div>
      {missingPhotoCount > 0 ? (
        <div className="kf-alert-info" role="status">
          <strong>{missingPhotoCount} work photo{missingPhotoCount === 1 ? "" : "s"}</strong> need to
          be added again — the files are missing on the server (common after a deploy without an
          uploads volume). Re-add your <strong>business photo</strong> and <strong>work photos</strong>.
        </div>
      ) : null}
      {user.role === "ADMIN" && (
        <Link href="/admin" className="kf-link text-sm underline">
          Open admin moderation
        </Link>
      )}
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
  );
}
