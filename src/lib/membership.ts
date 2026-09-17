import type { MemberTier } from "@/generated/prisma/client";

export const FOUNDING_MEMBER_MAX_RANK = 10;
export const EARLY_BUILDER_MAX_RANK = 50;

/** Small feed ranking boost for early community members. */
export const MEMBER_TIER_FEED_BOOST: Record<MemberTier, number> = {
  FOUNDING_MEMBER: 12,
  EARLY_BUILDER: 6,
};

export function memberTierForSignupRank(rank: number): MemberTier | null {
  if (rank <= 0) return null;
  if (rank <= FOUNDING_MEMBER_MAX_RANK) return "FOUNDING_MEMBER";
  if (rank <= EARLY_BUILDER_MAX_RANK) return "EARLY_BUILDER";
  return null;
}

export function getMemberTierLabel(tier: MemberTier | null | undefined): string | null {
  if (tier === "FOUNDING_MEMBER") return "Founding Member";
  if (tier === "EARLY_BUILDER") return "Early Builder";
  return null;
}

export function getMemberTierNote(tier: MemberTier | null | undefined): string | null {
  if (tier === "FOUNDING_MEMBER") {
    return `One of the first ${FOUNDING_MEMBER_MAX_RANK} people on InstallBase`;
  }
  if (tier === "EARLY_BUILDER") {
    return `One of the first ${EARLY_BUILDER_MAX_RANK} people on InstallBase`;
  }
  return null;
}

export function feedBoostForMemberTier(tier: MemberTier | null | undefined): number {
  if (!tier) return 0;
  return MEMBER_TIER_FEED_BOOST[tier] ?? 0;
}

export function buildMemberTierMap(userIdsInSignupOrder: string[]): Map<string, MemberTier | null> {
  const map = new Map<string, MemberTier | null>();
  for (let index = 0; index < userIdsInSignupOrder.length; index++) {
    map.set(userIdsInSignupOrder[index], memberTierForSignupRank(index + 1));
  }
  return map;
}
