import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function listKfCategories() {
  const kf = getKasiFindPrisma();
  return kf.kfCategory.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
}
