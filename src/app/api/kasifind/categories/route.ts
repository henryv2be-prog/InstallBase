import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { listKfCategories } from "@/lib/kasifind/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isKasiFindDbConfigured()) {
    return Response.json({ error: "KasiFind is not configured." }, { status: 503 });
  }
  try {
    const categories = await listKfCategories();
    return Response.json({
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        children: c.children.map((ch) => ({ id: ch.id, slug: ch.slug, name: ch.name })),
      })),
    });
  } catch (error) {
    console.error("[kasifind] categories failed:", error);
    return Response.json({ error: "Could not load categories." }, { status: 500 });
  }
}
