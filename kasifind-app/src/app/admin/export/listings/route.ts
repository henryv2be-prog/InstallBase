import { NextResponse } from "next/server";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

export async function GET() {
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kf = getKasiFindPrisma();
  const listings = await kf.kfProviderListing.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  const header = [
    "id",
    "displayName",
    "ownerEmail",
    "status",
    "moderationStatus",
    "featured",
    "locationLabel",
    "createdAt",
    "updatedAt",
  ];
  const lines = [header.join(",")];
  for (const l of listings) {
    const row = [
      l.id,
      l.displayName,
      l.user.email,
      l.status,
      l.moderationStatus,
      l.featured ? "true" : "false",
      l.locationLabel,
      l.createdAt.toISOString(),
      l.updatedAt.toISOString(),
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`);
    lines.push(row.join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kasifind-listings.csv"',
    },
  });
}
