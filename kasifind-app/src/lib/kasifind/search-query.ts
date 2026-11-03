import type { Prisma } from "@/generated/prisma/client";
import { searchNeedlesForToken, tokenizeSearchQuery } from "@/lib/kasifind/search-normalize";

const PUBLISHED_WHERE = {
  status: "PUBLISHED" as const,
  moderationStatus: "APPROVED" as const,
};

function needleOrField(needle: string): Prisma.KfProviderListingWhereInput {
  return {
    OR: [
      { displayName: { contains: needle, mode: "insensitive" } },
      { description: { contains: needle, mode: "insensitive" } },
      { locationLabel: { contains: needle, mode: "insensitive" } },
      {
        services: {
          some: {
            OR: [
              { name: { contains: needle, mode: "insensitive" } },
              { keywords: { contains: needle, mode: "insensitive" } },
            ],
          },
        },
      },
      {
        categories: {
          some: { category: { name: { contains: needle, mode: "insensitive" } } },
        },
      },
    ],
  };
}

/** One token must match at least one field (any needle variant). */
function tokenWhere(token: string): Prisma.KfProviderListingWhereInput {
  const needles = searchNeedlesForToken(token);
  if (needles.length === 1) return needleOrField(needles[0]!);
  return { OR: needles.map((n) => needleOrField(n)) };
}

export function buildPublishedListingWhere(input: {
  query: string;
  categorySlug?: string | null;
  geo?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}): Prisma.KfProviderListingWhereInput {
  const tokens = tokenizeSearchQuery(input.query);
  const and: Prisma.KfProviderListingWhereInput[] = [PUBLISHED_WHERE];

  if (input.geo) {
    and.push({
      latitude: { gte: input.geo.minLat, lte: input.geo.maxLat },
      longitude: { gte: input.geo.minLng, lte: input.geo.maxLng },
    });
  }

  if (input.categorySlug) {
    and.push({
      categories: { some: { category: { slug: input.categorySlug } } },
    });
  }

  for (const token of tokens) {
    and.push(tokenWhere(token));
  }

  return { AND: and };
}
