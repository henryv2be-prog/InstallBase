import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

/** Published, approved listings visible in public discovery. */
export async function getPublishedListingCount(): Promise<number> {
  const kf = getKasiFindPrisma();
  return kf.kfProviderListing.count({
    where: { status: "PUBLISHED", moderationStatus: "APPROVED" },
  });
}
