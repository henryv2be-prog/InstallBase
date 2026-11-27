import { NextResponse } from "next/server";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

type Body = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
  deviceLabel?: string;
};

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
  const p256dh = body.keys?.p256dh?.trim();
  const authKey = body.keys?.auth?.trim();
  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  const ua = request.headers.get("user-agent")?.slice(0, 500) ?? null;
  const kf = getKasiFindPrisma();

  await kf.kfAdminPushSubscription.upsert({
    where: { endpoint },
    create: {
      adminId: auth.user.id,
      endpoint,
      p256dh,
      auth: authKey,
      userAgent: ua,
      deviceLabel: body.deviceLabel?.trim().slice(0, 120) || null,
      active: true,
      failureCount: 0,
    },
    update: {
      adminId: auth.user.id,
      p256dh,
      auth: authKey,
      userAgent: ua,
      deviceLabel: body.deviceLabel?.trim().slice(0, 120) || null,
      active: true,
      failureCount: 0,
    },
  });

  return NextResponse.json({ ok: true });
}