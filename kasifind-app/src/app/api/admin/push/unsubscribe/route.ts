import { NextResponse } from "next/server";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

type Body = { endpoint?: string };

export async function POST(request: Request) {
  if (!isKasiFindDbConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const endpoint = body.endpoint?.trim();
  if (!endpoint) return NextResponse.json({ error: "endpoint_required" }, { status: 400 });

  const kf = getKasiFindPrisma();
  await kf.kfAdminPushSubscription.updateMany({
    where: { endpoint, adminId: auth.user.id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}