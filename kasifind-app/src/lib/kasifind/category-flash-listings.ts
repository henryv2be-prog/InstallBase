import "server-only";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import type { CategoryFlashSlide } from "@/lib/kasifind/category-flash-intro";
import {
  CATEGORY_FLASH_MAX_LISTINGS,
  CATEGORY_FLASH_THEMES,
} from "@/lib/kasifind/category-flash-config";
import {
  categoryFlashListingWeight,
  shuffleArray,
  weightedRandomPick,
} from "@/lib/kasifind/category-flash-selection";
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
 * Up to {@link CATEGORY_FLASH_MAX_LISTINGS} distinct listings — one work photo each.
 * Random selection with bias toward featured listings; montage order shuffled each load.
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

  const themes = shuffleArray(CATEGORY_FLASH_THEMES);
  for (const theme of themes) {
    if (selected.length >= CATEGORY_FLASH_MAX_LISTINGS) break;
    const pool = allPicks.filter(
      (p) =>
        !usedListingIds.has(p.listingId) &&
        theme.slugs.some((slug) => p.categorySlugs.has(slug))
    );
    const match = weightedRandomPick<ListingPick>(pool, categoryFlashListingWeight);
    if (!match) continue;
    usedListingIds.add(match.listingId);
    selected.push({ ...match, label: theme.label });
  }

  while (selected.length < CATEGORY_FLASH_MAX_LISTINGS) {
    const pool = allPicks.filter((p) => !usedListingIds.has(p.listingId));
    if (pool.length === 0) break;
    const pick = weightedRandomPick<ListingPick>(pool, categoryFlashListingWeight);
    if (!pick) break;
    usedListingIds.add(pick.listingId);
    selected.push(pick);
  }

  if (selected.length === 0) return [];

  const hero =
    weightedRandomPick<ListingPick>(selected, categoryFlashListingWeight) ?? selected[0]!;
  const montage = shuffleArray(selected.filter((p) => p.listingId !== hero.listingId));

  return [
    ...montage.map((p, i) => toSlide(p, `montage-${i}`)),
    toSlide(hero, "hero", true),
  ];
}
