/** Routes accessible without current policy acceptance (signed-in users). */
export const POLICY_EXEMPT_PATHS = [
  "/policy-acceptance",
  "/terms",
  "/privacy",
  "/community-guidelines",
  "/content-policy",
  "/cookies",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export function isPolicyExemptPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return POLICY_EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
