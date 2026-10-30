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

const MAX_FLASH_SLIDES = 10;

type PhotoSource = {
  key: string;
  listingId: string;
  displayName: string;
  photoSrc: string;
  categorySlugs: Set<string>;
  fallbackLabel: string;
};

async function resolveListingPhotoSources(row: {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  photos: { url: string }[];
  categories: { category: { slug: string; name: string } }[];
}): Promise<PhotoSource[]> {
  const categorySlugs = new Set(row.categories.map((c) => c.category.slug));
  const fallbackLabel = row.categories[0]?.category.name ?? "Local services";
  const sources: PhotoSource[] = [];

  for (const photo of row.photos) {
    const resolved = await resolvePublicUploadUrl(photo.url);
    if (!resolved) continue;
    sources.push({
      key: `${row.id}:${resolved}`,
      listingId: row.id,
      displayName: row.displayName,
      photoSrc: resolved,
      categorySlugs,
      fallbackLabel,
    });
  }

  if (sources.length === 0 && row.profileImageUrl) {
    const resolved = await resolvePublicUploadUrl(row.profileImageUrl);
    if (resolved) {
      sources.push({
        key: `${row.id}:${resolved}`,
        listingId: row.id,
        displayName: row.displayName,
        photoSrc: resolved,
        categorySlugs,
        fallbackLabel,
      });
    }
  }

  return sources;
}

/**
 * Work photos from published listings only (never stock imagery).
 * Uses every reachable work photo; fills themed slides first, then any remaining photos.
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
      photos: { orderBy: { sortOrder: "asc" }, take: 8 },
      categories: { include: { category: { select: { slug: true, name: true } } } },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 80,
  });

  const allSources: PhotoSource[] = [];
  for (const row of rows) {
    const sources = await resolveListingPhotoSources(row);
    allSources.push(...sources);
  }

  const usedKeys = new Set<string>();
  const slides: CategoryFlashSlide[] = [];

  for (const theme of FLASH_BY_THEME) {
    if (slides.length >= MAX_FLASH_SLIDES) break;
    const match = allSources.find(
      (s) => !usedKeys.has(s.key) && theme.slugs.some((slug) => s.categorySlugs.has(slug))
    );
    if (!match) continue;
    usedKeys.add(match.key);
    slides.push({
      id: `${theme.id}-${match.listingId}-${slides.length}`,
      src: match.photoSrc,
      label: theme.label,
      providerName: match.displayName,
    });
  }

  for (const source of allSources) {
    if (slides.length >= MAX_FLASH_SLIDES) break;
    if (usedKeys.has(source.key)) continue;
    usedKeys.add(source.key);
    slides.push({
      id: `work-${source.listingId}-${slides.length}`,
      src: source.photoSrc,
      label: source.fallbackLabel,
      providerName: source.displayName,
    });
  }

  return slides;
}
