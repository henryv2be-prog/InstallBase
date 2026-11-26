import { KfHeader, type KfHeaderUser } from "@/components/kasifind/kf-header";
import { getPublishedListingCount } from "@/lib/kasifind/listing-count";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export async function KfHeaderAsync() {
  const dbReady = isKasiFindDbConfigured();
  const sessionUser = dbReady ? await getKasiFindSessionUser().catch(() => null) : null;
  const headerUser: KfHeaderUser | null = sessionUser
    ? { role: sessionUser.role, email: sessionUser.email }
    : null;
  const hasListing =
    sessionUser && dbReady
      ? Boolean(await getListingForUser(sessionUser.id).catch(() => null))
      : false;
  const publishedListingCount = dbReady
    ? await getPublishedListingCount().catch(() => null)
    : null;

  return (
    <KfHeader
      user={headerUser}
      hasListing={hasListing}
      publishedListingCount={publishedListingCount}
    />
  );
}
