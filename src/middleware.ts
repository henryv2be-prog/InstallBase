import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon" ||
    pathname === "/apple-icon"
  );
}

function isAllowed(pathname: string) {
  if (isPublicAsset(pathname)) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/study")) return true;
  if (pathname.startsWith("/uploads/")) return true;
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAllowed(pathname)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/study", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
