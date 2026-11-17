/** Two-letter monogram for listing placeholders (search cards, etc.). */
export function listingDisplayMonogram(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  const single = displayName.trim();
  if (single.length >= 2) return single.slice(0, 2).toUpperCase();
  if (single.length === 1) return single.toUpperCase();
  return "?";
}