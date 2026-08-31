import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { getVapidPublicKey } from "@/lib/vapid";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const vapidPublicKey = getVapidPublicKey();

  return (
    <>
      <AppShell user={session.user}>{children}</AppShell>
      <PresenceHeartbeat />
      {vapidPublicKey ? <NotificationPrompt vapidPublicKey={vapidPublicKey} /> : null}
    </>
  );
}
