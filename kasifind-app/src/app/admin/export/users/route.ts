import { NextResponse } from "next/server";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

export async function GET() {
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kf = getKasiFindPrisma();
  const users = await kf.kfUser.findMany({
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { displayName: true } } },
  });

  const header = ["id", "email", "name", "role", "suspended", "createdAt", "lastSeenAt", "listingName"];
  const lines = [header.join(",")];
  for (const u of users) {
    const row = [
      u.id,
      u.email,
      u.name ?? "",
      u.role,
      u.suspended ? "true" : "false",
      u.createdAt.toISOString(),
      u.lastSeenAt?.toISOString() ?? "",
      u.listing?.displayName ?? "",
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`);
    lines.push(row.join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kasifind-users.csv"',
    },
  });
}
