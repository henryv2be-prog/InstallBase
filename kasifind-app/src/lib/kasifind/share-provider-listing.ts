export function listingPublicPath(listingId: string): string {
  return `/providers/${listingId}`;
}

export function listingPublicUrl(listingId: string, origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${listingPublicPath(listingId)}`;
}

export function buildListingShareMessage(displayName: string): string {
  const name = displayName.trim() || "my business";
  return `Hi — find ${name} on KasiFind (local services near you):`;
}

/** Clipboard / paste targets: one block with a single link line */
export function buildListingShareText(displayName: string, publicUrl: string): string {
  return `${buildListingShareMessage(displayName)}\n${publicUrl}`;
}

export type ShareProviderListingResult =
  | { mode: "native_share" }
  | { mode: "clipboard" }
  | { mode: "cancelled" };

export async function shareProviderListing(input: {
  listingId: string;
  displayName: string;
  origin: string;
}): Promise<ShareProviderListingResult> {
  const url = listingPublicUrl(input.listingId, input.origin);
  const text = buildListingShareText(input.displayName, url);
  const shareMessage = buildListingShareMessage(input.displayName);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      /* `url` is appended by many targets — do not repeat it inside `text` */
      await navigator.share({
        title: `${input.displayName.trim() || "KasiFind listing"}`,
        text: shareMessage,
        url,
      });
      return { mode: "native_share" };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { mode: "cancelled" };
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return { mode: "clipboard" };
  }

  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.left = "-9999px";
  document.body.appendChild(fallback);
  fallback.select();
  document.execCommand("copy");
  document.body.removeChild(fallback);
  return { mode: "clipboard" };
}
