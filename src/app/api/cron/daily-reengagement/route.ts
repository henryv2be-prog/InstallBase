import { NextRequest } from "next/server";
import { getCronSecret, runDailyReengagement } from "@/lib/reengagement";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const secret = getCronSecret();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const cronHeader = request.headers.get("x-cron-secret");
  return cronHeader === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "1" || searchParams.get("dryRun") === "true";
  const force = searchParams.get("force") === "1" || searchParams.get("force") === "true";
  const userId = searchParams.get("userId") ?? undefined;

  const result = await runDailyReengagement({ dryRun, force, userId });

  return Response.json(result);
}

/** Some schedulers issue GET; support it with the same auth. */
export async function GET(request: NextRequest) {
  return POST(request);
}
