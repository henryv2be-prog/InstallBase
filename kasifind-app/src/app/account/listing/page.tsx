import Link from "next/link";
import { redirect } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { listKfCategories } from "@/lib/kasifind/categories";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";
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

  return (
    <div className="kf-listing-page-flow">
      {missingPhotoCount > 0 ? (
        <div className="kf-alert-info kf-listing-page-alert" role="status">
          <strong>{missingPhotoCount} photo{missingPhotoCount === 1 ? "" : "s"}</strong> need to be
          re-uploaded after a server change.
        </div>
      ) : null}
      {user.role === "ADMIN" ? (
        <Link href="/admin" className="kf-listing-page-admin kf-link text-xs underline">
          Admin
        </Link>
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
  );
}
