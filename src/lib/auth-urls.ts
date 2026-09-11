/** Only allow in-app relative paths after login/signup. */
export function safeAuthNext(value: string | null | undefined) {
  if (!value) return "/feed";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) return "/feed";
  return value;
}

export function loginHref(next?: string) {
  const path = safeAuthNext(next);
  return `/login?next=${encodeURIComponent(path)}`;
}

export function signupHref(next?: string) {
  const path = safeAuthNext(next);
  return `/signup?next=${encodeURIComponent(path)}`;
}
