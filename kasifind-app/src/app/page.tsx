import { KfHomeClient } from "@/components/kasifind/kf-home-client";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getCategoryFlashSlidesFromListings } from "@/lib/kasifind/category-flash-listings";

export const dynamic = "force-dynamic";

export default async function KasiFindHomePage() {
  const dbConfigured = isKasiFindDbConfigured();
  const categoryFlashSlides = dbConfigured ? await getCategoryFlashSlidesFromListings() : [];

  return (
    <KfHomeClient dbConfigured={dbConfigured} categoryFlashSlides={categoryFlashSlides} />
  );
}
