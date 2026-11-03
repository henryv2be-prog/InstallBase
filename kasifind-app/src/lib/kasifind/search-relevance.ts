import {
  foldedFieldIncludes,
  searchNeedlesForToken,
} from "@/lib/kasifind/search-normalize";

export type ListingSearchFields = {
  displayName: string;
  description: string;
  locationLabel: string;
  services: { name: string; keywords: string }[];
  categories: { name: string }[];
};

/** Higher = stronger match tier for one token on one field group. */
export const RELEVANCE_TIER = {
  none: 0,
  category: 40,
  location: 30,
  description: 50,
  serviceKeyword: 70,
  serviceName: 100,
  businessName: 85,
} as const;

export type SearchRelevanceScore = {
  /** Sum of best tier per token; 0 when query non-empty but no token matched. */
  total: number;
  /** True when every token matched at least one field. */
  allTokensMatched: boolean;
};

function bestTierForToken(
  fields: ListingSearchFields,
  token: string
): number {
  const needles = searchNeedlesForToken(token);
  let best: number = RELEVANCE_TIER.none;

  const bump = (tier: number) => {
    if (tier > best) best = tier;
  };

  for (const needle of needles) {
    if (foldedFieldIncludes(fields.displayName, needle)) bump(RELEVANCE_TIER.businessName);
    for (const s of fields.services) {
      if (foldedFieldIncludes(s.name, needle)) bump(RELEVANCE_TIER.serviceName);
      if (foldedFieldIncludes(s.keywords, needle)) bump(RELEVANCE_TIER.serviceKeyword);
    }
    if (foldedFieldIncludes(fields.description, needle)) bump(RELEVANCE_TIER.description);
    for (const c of fields.categories) {
      if (foldedFieldIncludes(c.name, needle)) bump(RELEVANCE_TIER.category);
    }
    if (foldedFieldIncludes(fields.locationLabel, needle)) bump(RELEVANCE_TIER.location);
  }

  return best;
}

export function scoreListingRelevance(
  fields: ListingSearchFields,
  tokens: string[]
): SearchRelevanceScore {
  if (tokens.length === 0) {
    return { total: 0, allTokensMatched: true };
  }

  let total = 0;
  let matchedCount = 0;
  for (const token of tokens) {
    const tier = bestTierForToken(fields, token);
    if (tier > RELEVANCE_TIER.none) {
      matchedCount += 1;
      total += tier;
    }
  }

  return {
    total,
    allTokensMatched: matchedCount === tokens.length,
  };
}

export type RankableSearchHit = {
  relevanceTotal: number;
  distanceKm: number;
  featured: boolean;
  reviewCount: number;
  averageRating: number | null;
  displayName: string;
};

const FEATURED_TIEBREAK = 2;
const REVIEW_TIEBREAK_SCALE = 0.01;

/**
 * Unified ordering: relevance first, then distance (when finite), then light featured/review tie-breaks.
 */
export function compareSearchRanking(
  a: RankableSearchHit,
  b: RankableSearchHit,
  options: { hasQuery: boolean; useDistance: boolean }
): number {
  if (options.hasQuery) {
    if (a.relevanceTotal !== b.relevanceTotal) return b.relevanceTotal - a.relevanceTotal;
  }

  if (options.useDistance) {
    const aDist = Number.isFinite(a.distanceKm) ? a.distanceKm : Number.POSITIVE_INFINITY;
    const bDist = Number.isFinite(b.distanceKm) ? b.distanceKm : Number.POSITIVE_INFINITY;
    if (aDist !== bDist) return aDist - bDist;
  }

  const aFeat = a.featured ? FEATURED_TIEBREAK : 0;
  const bFeat = b.featured ? FEATURED_TIEBREAK : 0;
  if (aFeat !== bFeat) return bFeat - aFeat;

  if (a.reviewCount !== b.reviewCount) {
    return (b.reviewCount - a.reviewCount) * REVIEW_TIEBREAK_SCALE;
  }

  const aRating = a.averageRating ?? 0;
  const bRating = b.averageRating ?? 0;
  if (aRating !== bRating) return bRating - aRating;

  return a.displayName.localeCompare(b.displayName);
}

/** Exported for tests — detect strong service-level match for a token set. */
export function listingMatchesSearchTokens(
  fields: ListingSearchFields,
  tokens: string[]
): boolean {
  if (tokens.length === 0) return true;
  return scoreListingRelevance(fields, tokens).allTokensMatched;
}
