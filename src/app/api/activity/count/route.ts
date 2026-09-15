import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActivityCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ total: 0 });
  }

  const { total } = await getActivityCounts(session.user.id);
  return NextResponse.json(
    { total },
    {
      headers: {
        "Cache-Control": "private, no-cache",
      },
    }
  );
}
