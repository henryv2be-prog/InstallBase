import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { AppShell, AppShellFallback } from "@/components/layout/app-shell";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { SessionProvider } from "@/components/providers/session-provider";
import { getVapidPublicKey } from "@/lib/vapid";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <AppShellFallback>
          <AppPageSkeleton />
        </AppShellFallback>
      }
    >
      <AppLayoutSession>{children}</AppLayoutSession>
    </Suspense>
  );
}

async function AppLayoutSession({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;
  const vapidPublicKey = getVapidPublicKey();

  return (
    <SessionProvider session={session}>
      <AppShell user={user}>{children}</AppShell>
      {user ? <PresenceHeartbeat /> : null}
      {user && vapidPublicKey ? <NotificationPrompt vapidPublicKey={vapidPublicKey} /> : null}
    </SessionProvider>
  );
}
