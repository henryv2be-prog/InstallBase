import type { Prisma } from "@/generated/prisma/client";

/**
 * Audience filter for product analytics: exclude events tied to signed-in KasiFind admins.
 * Anonymous events (no userId) remain included.
 */
export const analyticsExcludeAdminWhere: Prisma.KfAnalyticsEventWhereInput = {
  OR: [{ userId: null }, { user: { role: { not: "ADMIN" } } }],
};

export function withAnalyticsAudience(
  where: Prisma.KfAnalyticsEventWhereInput = {}
): Prisma.KfAnalyticsEventWhereInput {
  const hasKeys = Object.keys(where).length > 0;
  if (!hasKeys) return analyticsExcludeAdminWhere;
  return { AND: [where, analyticsExcludeAdminWhere] };
}