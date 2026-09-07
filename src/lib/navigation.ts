/** Append a query param to a path, preserving any existing search string. */
export function appendQueryParam(href: string, key: string, value: string) {
  if (href === "#" || !href.startsWith("/")) return href;
  const [path, search = ""] = href.split("?");
  const params = new URLSearchParams(search);
  params.set(key, value);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Mark navigation as coming from the Activity hub (enables back links). */
export function withFromActivity(href: string) {
  if (href === "#" || href.includes("from=activity")) return href;
  return appendQueryParam(href, "from", "activity");
}
