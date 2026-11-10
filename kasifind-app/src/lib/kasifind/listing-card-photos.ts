/** Ordered provider photos for search result cards (gallery first, then profile fallback). */
export function collectListingCardPhotoUrls(input: {
  photoUrls: readonly string[];
  profileImageUrl: string | null;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.photoUrls) {
    const url = raw?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  const profile = input.profileImageUrl?.trim();
  if (out.length === 0 && profile && !seen.has(profile)) {
    out.push(profile);
  }
  return out;
}
