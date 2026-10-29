import "server-only";
import { redirect } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

export async function requireAdminPage() {
  if (!isKasiFindDbConfigured()) {
    redirect("/");
  }
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) redirect("/login");
  return auth.user;
}
