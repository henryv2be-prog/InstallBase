import { KfHomeClient } from "@/components/kasifind/kf-home-client";
import { getCategoryFlashSlidesFromListings } from "@/lib/kasifind/category-flash-listings";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";

export const dynamic = "force-dynamic";

export default async function KasiFindHomePage() {
  const dbConfigured = isKasiFindDbConfigured();
  const categoryFlashSlides = dbConfigured ? await getCategoryFlashSlidesFromListings() : [];

  let providerListCta: { href: string; label: string; hint: string } | null = null;
  if (dbConfigured) {
    const user = await getKasiFindSessionUser().catch(() => null);
    if (user) {
      const listing = await getListingForUser(user.id).catch(() => null);
      providerListCta = {
        href: "/account/listing",
        label: listing ? "Manage your listing" : "Create your free listing",
        hint: listing
          ? "Update photos, services, and publish from your dashboard."
          : "Set up in minutes — no company registration required.",
      };
    } else {
      providerListCta = {
        href: "/register",
        label: "List your business — it's free",
        hint: "Reach neighbours searching for your trade on KasiFind.",
      };
    }
  }

  return (
    <KfHomeClient
      dbConfigured={dbConfigured}
      categoryFlashSlides={categoryFlashSlides}
      providerListCta={providerListCta}
    />
  );
}
