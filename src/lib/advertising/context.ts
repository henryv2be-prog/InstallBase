import "server-only";
import { prisma } from "@/lib/prisma";
import type { TargetingContext } from "./types";

export async function getTargetingContext(userId?: string): Promise<TargetingContext> {
  if (!userId) return {};
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      specialties: true,
      country: true,
      city: true,
      experienceLevel: true,
    },
  });
  if (!profile) return { userId };
  return {
    userId,
    specialties: profile.specialties,
    country: profile.country ?? undefined,
    city: profile.city ?? undefined,
    experienceLevel: profile.experienceLevel,
    userType: "installer",
  };
}
