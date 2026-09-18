import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { queueInstallVideoRegeneration } from "@/lib/video-compilation/draft-post";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { postId } = await context.params;
  try {
    await queueInstallVideoRegeneration(session.user.id, postId);
    return NextResponse.json({ status: "QUEUED" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not regenerate video";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
