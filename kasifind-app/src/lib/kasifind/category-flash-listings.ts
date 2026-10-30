import "server-only";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import type { CategoryFlashSlide } from "@/lib/kasifind/category-flash-intro";
import {
  CATEGORY_FLASH_MAX_LISTINGS,
  CATEGORY_FLASH_THEMES,
} from "@/lib/kasifind/category-flash-config";
import { resolvePublicUploadUrl } from "@/lib/kasifind/upload-asset";

type ListingPick = {
  listingId: string;
  displayName: string;
  photoSrc: string;
  categorySlugs: Set<string>;
  label: string;
  featured: boolean;
  workPhotoCount: number;
};

async function pickListingWorkPhoto(row: {
  id: string;
  displayName: string;
  featured: boolean;
  photos: { url: string }[];
  categories: { category: { slug: string; name: string } }[];
}): Promise<ListingPick | null> {
  const categorySlugs = new Set(row.categories.map((c) => c.category.slug));
  const label = row.categories[0]?.category.name ?? "Local services";
  let photoSrc: string | null = null;

  for (const photo of row.photos) {
    const resolved = await resolvePublicUploadUrl(photo.url);
    if (resolved) {
      photoSrc = resolved;
      break;
    }
  }

  if (!photoSrc) return null;

  return {
    listingId: row.id,
    displayName: row.displayName,
    photoSrc,
    categorySlugs,
    label,
    featured: row.featured,
    workPhotoCount: row.photos.length,
  };
}

function heroScore(pick: ListingPick): number {
  return (pick.featured ? 1000 : 0) + pick.workPhotoCount * 10;
}

function toSlide(pick: ListingPick, idSuffix: string, isHero?: boolean): CategoryFlashSlide {
  return {
    id: `${idSuffix}-${pick.listingId}`,
    src: pick.photoSrc,
    label: pick.label,
    listingId: pick.listingId,
    providerName: pick.displayName,
    isHero,
  };
}

/**
 * Up to {@link CATEGORY_FLASH_MAX_LISTINGS} distinct listings — one strong work photo each.
 * Themed diversity first, then backfill; hero frame = strongest visual candidate (featured + work photos).
 */
export async function getCategoryFlashSlidesFromListings(): Promise<CategoryFlashSlide[]> {
  if (!isKasiFindDbConfigured()) return [];

  const kf = getKasiFindPrisma();
  const rows = await kf.kfProviderListing.findMany({
    where: {
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
      photos: { some: {} },
    },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: { select: { slug: true, name: true } } } },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });

  const byListingId = new Map<string, ListingPick>();
  for (const row of rows) {
    if (byListingId.has(row.id)) continue;
    const pick = await pickListingWorkPhoto(row);
    if (pick) byListingId.set(row.id, pick);
  }

  const allPicks = [...byListingId.values()];
  if (allPicks.length === 0) return [];

  const usedListingIds = new Set<string>();
  const selected: ListingPick[] = [];

  for (const theme of CATEGORY_FLASH_THEMES) {
    if (selected.length >= CATEGORY_FLASH_MAX_LISTINGS) break;
    const match = allPicks.find(
      (p) =>
        !usedListingIds.has(p.listingId) &&
        theme.slugs.some((slug) => p.categorySlugs.has(slug))
    );
    if (!match) continue;
    usedListingIds.add(match.listingId);
    selected.push({ ...match, label: theme.label });
  }

  const usedCategorySlugs = new Set<string>();
  for (const pick of selected) {
    for (const slug of pick.categorySlugs) usedCategorySlugs.add(slug);
  }

  const backfillCandidates = allPicks
    .filter((p) => !usedListingIds.has(p.listingId))
    .sort((a, b) => {
      const aNewCat = [...a.categorySlugs].some((s) => !usedCategorySlugs.has(s)) ? 1 : 0;
      const bNewCat = [...b.categorySlugs].some((s) => !usedCategorySlugs.has(s)) ? 1 : 0;
      if (bNewCat !== aNewCat) return bNewCat - aNewCat;
      return heroScore(b) - heroScore(a);
    });

  for (const pick of backfillCandidates) {
    if (selected.length >= CATEGORY_FLASH_MAX_LISTINGS) break;
    usedListingIds.add(pick.listingId);
    for (const slug of pick.categorySlugs) usedCategorySlugs.add(slug);
    selected.push(pick);
  }

  if (selected.length === 0) return [];

  const hero = [...selected].sort((a, b) => heroScore(b) - heroScore(a))[0]!;
  const montage = selected.filter((p) => p.listingId !== hero.listingId);

  return [
    ...montage.map((p, i) => toSlide(p, `montage-${i}`)),
    toSlide(hero, "hero", true),
  ];
}
