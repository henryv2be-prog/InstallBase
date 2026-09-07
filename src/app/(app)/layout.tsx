import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { getVapidPublicKey } from "@/lib/vapid";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;
  const vapidPublicKey = getVapidPublicKey();

  return (
    <>
      <AppShell user={user}>{children}</AppShell>
      {user ? <PresenceHeartbeat /> : null}
      {user && vapidPublicKey ? <NotificationPrompt vapidPublicKey={vapidPublicKey} /> : null}
    </>
  );
}
