import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { recordReengagementOpen } from "@/lib/reengagement/analytics";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let notificationId: string | undefined;
  try {
    const body = await request.json();
    notificationId = typeof body?.notificationId === "string" ? body.notificationId : undefined;
  } catch {
    /* optional body */
  }

  await recordReengagementOpen({ userId, notificationId });
  return Response.json({ recorded: true });
}
