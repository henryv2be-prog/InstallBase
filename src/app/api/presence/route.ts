import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOnline } from "@/lib/presence";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ users: [] }, { status: 401 });
  }

  const ids = new URL(request.url).searchParams
    .get("ids")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 40) ?? [];

  if (ids.length === 0) return Response.json({ users: [] });

  const rows = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, lastSeenAt: true },
  });

  return Response.json({
    users: rows.map((row) => ({
      id: row.id,
      lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
      online: isOnline(row.lastSeenAt),
    })),
  });
}
