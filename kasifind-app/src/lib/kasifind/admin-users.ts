import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getAdminUsersPage(options: {
  q?: string;
  role?: string;
  suspended?: string;
  page?: number;
  pageSize?: number;
}) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 25));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (options.q?.trim()) {
    const q = options.q.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { listing: { displayName: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (options.role === "ADMIN" || options.role === "PROVIDER") {
    where.role = options.role;
  }
  if (options.suspended === "true") where.suspended = true;
  if (options.suspended === "false") where.suspended = false;

  const [total, rows] = await Promise.all([
    kf.kfUser.count({ where }),
    kf.kfUser.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        listing: { select: { id: true, displayName: true, status: true, moderationStatus: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      suspended: u.suspended,
      createdAt: u.createdAt.toISOString(),
      lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
      listing: u.listing
        ? {
            id: u.listing.id,
            displayName: u.listing.displayName,
            status: u.listing.status,
            moderationStatus: u.listing.moderationStatus,
          }
        : null,
    })),
  };
}
