import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { getVapidPublicKey } from "@/lib/vapid";
import { getActivityCounts } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;
  const vapidPublicKey = getVapidPublicKey();
  const activityCount = user?.id ? (await getActivityCounts(user.id)).total : 0;

  return (
    <>
      <AppShell user={user} activityCount={activityCount}>{children}</AppShell>
      {user ? <PresenceHeartbeat /> : null}
      {user && vapidPublicKey ? <NotificationPrompt vapidPublicKey={vapidPublicKey} /> : null}
    </>
  );
}
