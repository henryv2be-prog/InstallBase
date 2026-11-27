import { NextResponse } from "next/server";
import { getVapidPublicConfig } from "@/lib/kasifind/admin-push";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

export async function GET() {
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { publicKey, configured } = getVapidPublicConfig();
  return NextResponse.json({ publicKey, configured });
}