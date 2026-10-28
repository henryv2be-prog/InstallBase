import { KfHomeClient } from "@/components/kasifind/kf-home-client";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export const dynamic = "force-dynamic";

export default function KasiFindHomePage() {
  const dbConfigured = isKasiFindDbConfigured();
  return <KfHomeClient dbConfigured={dbConfigured} />;
}
