import "server-only";

export function truncateForMeta(text: string, max = 160): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

export function buildListingOgDescription(description: string, locationLabel: string): string {
  const body = truncateForMeta(description, 140);
  const place = locationLabel.trim();
  if (!place) return body;
  return `${body} · ${place}`;
}
