import { KfHeader, type KfHeaderUser } from "@/components/kasifind/kf-header";
import { getPublishedListingCount } from "@/lib/kasifind/listing-count";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export async function KfHeaderAsync() {
  const dbReady = isKasiFindDbConfigured();
  const sessionUser = dbReady ? await getKasiFindSessionUser().catch(() => null) : null;
  const headerUser: KfHeaderUser | null = sessionUser
    ? { role: sessionUser.role, email: sessionUser.email }
    : null;
  const publishedListingCount = dbReady
    ? await getPublishedListingCount().catch(() => null)
    : null;

  return <KfHeader user={headerUser} publishedListingCount={publishedListingCount} />;
}
