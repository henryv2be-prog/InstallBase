import Link from "next/link";
import { redirect } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { listKfCategories } from "@/lib/kasifind/categories";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";

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
      }
    : null;

  return (
    <div className="space-y-4">
      <h1 className="kf-hero-title text-2xl">Your listing</h1>
      {!listingData && (
        <p className="text-sm text-[var(--kf-muted)]">
          Tell neighbours what you do — add services like &quot;steel gates&quot; so people can find
          you.
        </p>
      )}
      {user.role === "ADMIN" && (
        <Link href="/admin" className="text-sm font-semibold text-[var(--kf-green-dark)] underline">
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
