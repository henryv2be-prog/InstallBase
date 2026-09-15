import { NextResponse } from "next/server";

/** Legacy path — redirect to static manifest icons (reliable on Huawei/OEM launchers). */
export async function GET(request: Request, { params }: { params: Promise<{ size: string }> }) {
  const n = Number((await params).size);
  if (![192, 512].includes(n)) {
    return new Response("Not found", { status: 404 });
  }

  const maskable = new URL(request.url).searchParams.get("maskable") === "1";
  const file = maskable ? `icon-${n}-maskable.png` : `icon-${n}.png`;
  return NextResponse.redirect(new URL(`/icons/${file}`, request.url), 308);
}
