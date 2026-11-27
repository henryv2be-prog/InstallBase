import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { PLATFORM_EVENT_REGISTRY } from "@/lib/kasifind/platform-event-registry";

export async function listActiveAdminIds(): Promise<string[]> {
  const kf = getKasiFindPrisma();
  const rows = await kf.kfUser.findMany({
    where: { role: "ADMIN", suspended: false },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function ensureAdminNotificationDefaults(adminId: string) {
  const kf = getKasiFindPrisma();
  await kf.kfAdminNotificationSettings.upsert({
    where: { adminId },
    create: { adminId, pushMasterEnabled: false },
    update: {},
  });

  const existing = await kf.kfAdminNotificationPreference.findMany({
    where: { adminId },
    select: { eventType: true },
  });
  const have = new Set(existing.map((e) => e.eventType));
  const missing = PLATFORM_EVENT_REGISTRY.filter((d) => !have.has(d.eventType));
  if (missing.length === 0) return;

  await kf.kfAdminNotificationPreference.createMany({
    data: missing.map((d) => ({
      adminId,
      eventType: d.eventType,
      inAppEnabled: d.defaultInApp,
      pushEnabled: d.defaultPush,
    })),
    skipDuplicates: true,
  });
}

export async function seedAllAdminNotificationDefaults() {
  const adminIds = await listActiveAdminIds();
  await Promise.all(adminIds.map((id) => ensureAdminNotificationDefaults(id)));
}