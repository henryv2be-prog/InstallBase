import { renderAppIcon } from "@/lib/app-icon";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const n = Number((await params).size);
  if (![192, 512].includes(n)) {
    return new Response("Not found", { status: 404 });
  }
  return renderAppIcon(n, true);
}
