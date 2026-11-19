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

export async function getKfCategoryBySlug(slug: string) {
  const kf = getKasiFindPrisma();
  return kf.kfCategory.findFirst({
    where: { slug },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
      parent: { select: { slug: true, name: true } },
    },
  });
}

export async function listKfCategorySlugsForSitemap() {
  const kf = getKasiFindPrisma();
  return kf.kfCategory.findMany({
    select: { slug: true, createdAt: true },
    orderBy: { sortOrder: "asc" },
  });
}
