import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldRedirectToCanonicalHost } from "@/lib/canonical-host";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) return NextResponse.next();

  const canonical = shouldRedirectToCanonicalHost(host);
  if (!canonical) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = canonical;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
