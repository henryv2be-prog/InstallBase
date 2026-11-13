import Link from "next/link";
import { redirect } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { getProviderListingAssistanceRequest } from "@/lib/kasifind/listing-assistance";
import { canProviderSubmitListingAssistance } from "@/lib/kasifind/listing-assistance-status";
import { KfListingSupportPanel } from "@/components/kasifind/kf-listing-support-panel";
import { loginPathWithNext } from "@/lib/kasifind/auth-redirect";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Listing support",
};

export default async function ListingSupportPage() {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card rounded-2xl p-6">
        <p>Set KASIFIND_DATABASE_URL to use listing support.</p>
      </div>
    );
  }

  const user = await getKasiFindSessionUser();
  if (!user) redirect(loginPathWithNext("/account/listing-support"));

  const [listing, assistanceRequest] = await Promise.all([
    getListingForUser(user.id),
    getProviderListingAssistanceRequest(user.id),
  ]);

  const canRequestAssistance = canProviderSubmitListingAssistance(assistanceRequest?.status ?? null);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/account/insights" className="text-sm underline text-[var(--kf-muted)]">
        ← Back to insights
      </Link>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--kf-muted)]">
        Provider services
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-charcoal)]">Listing support</h1>
      <KfListingSupportPanel
        hasListing={Boolean(listing)}
        canSubmit={canRequestAssistance}
        currentRequest={assistanceRequest}
      />
    </div>
  );
}
