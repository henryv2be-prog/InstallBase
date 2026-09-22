import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { AppShell, AppShellFallback } from "@/components/layout/app-shell";
import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { AppProviders } from "@/components/layout/app-providers";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { getVapidPublicKey } from "@/lib/vapid";
import { isUserPolicyCompliant } from "@/lib/legal/compliance";
import { PolicyGate } from "@/components/legal/policy-gate";

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
  const policyCompliant = user?.id ? await isUserPolicyCompliant(user.id) : true;

  return (
    <>
      <AppProviders signedIn={Boolean(user)}>
        <AppShell user={user}>
          <PolicyGate compliant={policyCompliant}>{children}</PolicyGate>
        </AppShell>
      </AppProviders>
      {user ? <PresenceHeartbeat /> : null}
      {user && vapidPublicKey ? <NotificationPrompt vapidPublicKey={vapidPublicKey} /> : null}
    </>
  );
}
