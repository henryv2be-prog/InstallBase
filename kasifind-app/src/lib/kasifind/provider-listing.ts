import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getListingForUser(userId: string) {
  const kf = getKasiFindPrisma();
  return kf.kfProviderListing.findUnique({
    where: { userId },
    include: {
      categories: true,
      services: true,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
}
