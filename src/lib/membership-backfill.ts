import "server-only";
import { prisma } from "@/lib/prisma";
import { buildMemberTierMap } from "@/lib/membership";

/** Reassign founding / early-builder tiers from current signup order. */
export async function backfillMemberTiers(): Promise<{ users: number; profilesUpdated: number }> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const assignments = buildMemberTierMap(users.map((user) => user.id));
  let profilesUpdated = 0;

  await prisma.$transaction(async (tx) => {
    for (const [userId, memberTier] of assignments) {
      const result = await tx.profile.updateMany({
        where: { userId },
        data: { memberTier },
      });
      profilesUpdated += result.count;
    }
  });

  return { users: users.length, profilesUpdated };
}
