import "server-only";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import type { CategoryFlashSlide } from "@/lib/kasifind/category-flash-intro";
import { resolvePublicUploadUrl } from "@/lib/kasifind/upload-asset";

const FLASH_BY_THEME: { id: string; slugs: string[]; label: string }[] = [
  { id: "security", slugs: ["gates-security", "metalwork-welding"], label: "Security gates & burglar bars" },
  { id: "aluminium", slugs: ["aluminium-windows"], label: "Aluminium windows" },
  { id: "plumbing", slugs: ["plumbing"], label: "Plumbing" },
  { id: "electrical", slugs: ["electrical"], label: "Electrical services" },
  { id: "automotive", slugs: ["automotive"], label: "Car repairs" },
  { id: "gas", slugs: ["gas"], label: "Gas suppliers" },
  { id: "garden", slugs: ["cleaning", "construction"], label: "Gardening & landscaping" },
  { id: "hair", slugs: ["hair-beauty"], label: "Hairdressers & barbers" },
  { id: "building", slugs: ["construction", "metalwork-welding"], label: "Building & construction" },
  { id: "food", slugs: ["food-shops"], label: "Food & catering" },
];

type ListingCandidate = {
  id: string;
  displayName: string;
  categorySlugs: Set<string>;
  photoSrc: string | null;
};

/**
 * Work photos from published listings only (never stock imagery).
 */
export async function getCategoryFlashSlidesFromListings(): Promise<CategoryFlashSlide[]> {
  if (!isKasiFindDbConfigured()) return [];

  const kf = getKasiFindPrisma();
  const rows = await kf.kfProviderListing.findMany({
    where: {
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
      OR: [{ photos: { some: {} } }, { profileImageUrl: { not: null } }],
    },
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 4 },
      categories: { include: { category: { select: { slug: true } } } },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 80,
  });

  const candidates: ListingCandidate[] = [];
  for (const row of rows) {
    const urls = [...row.photos.map((p) => p.url), row.profileImageUrl].filter(Boolean) as string[];
    let photoSrc: string | null = null;
    for (const raw of urls) {
      const resolved = await resolvePublicUploadUrl(raw);
      if (resolved) {
        photoSrc = resolved;
        break;
      }
    }
    if (!photoSrc) continue;
    candidates.push({
      id: row.id,
      displayName: row.displayName,
      categorySlugs: new Set(row.categories.map((c) => c.category.slug)),
      photoSrc,
    });
  }

  const usedListingIds = new Set<string>();
  const slides: CategoryFlashSlide[] = [];

  for (const theme of FLASH_BY_THEME) {
    const match = candidates.find(
      (c) =>
        !usedListingIds.has(c.id) && theme.slugs.some((slug) => c.categorySlugs.has(slug))
    );
    if (!match) continue;
    usedListingIds.add(match.id);
    slides.push({
      id: `${theme.id}-${match.id}`,
      src: match.photoSrc,
      label: theme.label,
      providerName: match.displayName,
    });
  }

  return slides.slice(0, 10);
}
