import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { ensureAdminNotificationDefaults } from "@/lib/kasifind/admin-notification-prefs";
import { PLATFORM_EVENT_REGISTRY } from "@/lib/kasifind/platform-event-registry";

export async function getAdminNotificationSettingsPage(adminId: string) {
  await ensureAdminNotificationDefaults(adminId);
  const kf = getKasiFindPrisma();

  const [settings, prefs, devices] = await Promise.all([
    kf.kfAdminNotificationSettings.findUnique({ where: { adminId } }),
    kf.kfAdminNotificationPreference.findMany({ where: { adminId } }),
    kf.kfAdminPushSubscription.findMany({
      where: { adminId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const prefMap = new Map(prefs.map((p) => [p.eventType, p]));

  return {
    pushMasterEnabled: settings?.pushMasterEnabled ?? false,
    devices: devices.map((d) => ({
      id: d.id,
      active: d.active,
      deviceLabel: d.deviceLabel,
      userAgent: d.userAgent,
      lastSuccessAt: d.lastSuccessAt,
      createdAt: d.createdAt,
    })),
    events: PLATFORM_EVENT_REGISTRY.map((def) => {
      const p = prefMap.get(def.eventType);
      return {
        ...def,
        inAppEnabled: p?.inAppEnabled ?? def.defaultInApp,
        pushEnabled: p?.pushEnabled ?? def.defaultPush,
      };
    }),
  };
}