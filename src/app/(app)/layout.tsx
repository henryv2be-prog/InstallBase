import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { AppShell, AppShellFallback } from "@/components/layout/app-shell";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { getVapidPublicKey } from "@/lib/vapid";

export const dynamic = "force-dynamic";

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
  const session = await getSession();
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
