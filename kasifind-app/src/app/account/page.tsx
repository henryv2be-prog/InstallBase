import { redirect } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { loginPathWithNext } from "@/lib/kasifind/auth-redirect";

export const dynamic = "force-dynamic";

/** R-H03 — single entry for signed-in providers. */
export default async function ProviderHubEntryPage() {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card rounded-2xl p-6">
        <p>Set KASIFIND_DATABASE_URL to manage your business.</p>
      </div>
    );
  }

  const user = await getKasiFindSessionUser();
  if (!user) redirect(loginPathWithNext("/account"));

  const listing = await getListingForUser(user.id);
  redirect(listing ? "/account/insights" : "/account/listing");
}