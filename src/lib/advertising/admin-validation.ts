import type { AdType } from "@/generated/prisma/client";
import { ALL_PLACEMENT_KEYS } from "./placements";
import { isAllowedMediaUrl, sanitizeAdDestinationUrl, sanitizeAdText } from "./security";

const AD_TYPES: AdType[] = [
  "IMAGE",
  "BANNER",
  "SPONSORED_POST",
  "SPONSORED_PRODUCT",
  "SPONSORED_ARTICLE",
  "VIDEO",
];

export type AdvertisementFormField =
  | "campaignId"
  | "advertiserId"
  | "title"
  | "type"
  | "destinationUrl"
  | "mediaUrl"
  | "placements";

export function parsePlacementsFromForm(formData: FormData): string[] {
  const fromCheckboxes = formData
    .getAll("placementKeys")
    .map((value) => String(value).trim())
    .filter((p) => ALL_PLACEMENT_KEYS.includes(p as (typeof ALL_PLACEMENT_KEYS)[number]));

  if (fromCheckboxes.length) return fromCheckboxes;

  const value = String(formData.get("placements") ?? "");
  const placements = value
    .split(",")
    .map((p) => p.trim())
    .filter((p) => ALL_PLACEMENT_KEYS.includes(p as (typeof ALL_PLACEMENT_KEYS)[number]));
  return placements.length ? placements : ["feed_between_posts"];
}

export function validateAdvertisementForm(formData: FormData) {
  const errors: Partial<Record<AdvertisementFormField, string>> = {};

  const campaignId = String(formData.get("campaignId") ?? "").trim();
  const advertiserId = String(formData.get("advertiserId") ?? "").trim();
  const title = sanitizeAdText(String(formData.get("title") ?? ""), 120);
  const type = String(formData.get("type") ?? "").trim() as AdType;
  const destinationRaw = String(formData.get("destinationUrl") ?? "").trim();
  const internalChecked = formData.get("isInternalLink") === "true";
  const isInternal = internalChecked || destinationRaw.startsWith("/");
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();

  if (!campaignId) errors.campaignId = "Select a campaign";
  if (!advertiserId) errors.advertiserId = "Select an advertiser";
  if (!title) errors.title = "Title is required";
  if (!type || !AD_TYPES.includes(type)) errors.type = "Select an ad type";

  if (!destinationRaw) {
    errors.destinationUrl = "Destination URL is required";
  } else {
    const destinationUrl = sanitizeAdDestinationUrl(destinationRaw, isInternal);
    if (!destinationUrl) {
      errors.destinationUrl = isInternal
        ? "Enter a valid internal path like /discover"
        : "Enter a full https:// URL, or an internal path like /discover (check “Internal link”)";
    }
  }

  if (mediaUrl && !isAllowedMediaUrl(mediaUrl)) {
    errors.mediaUrl = "Media must be https://… or a path like /ads/… or /uploads/…";
  }

  const placements = parsePlacementsFromForm(formData);
  if (!placements.length) {
    errors.placements = "Choose at least one placement";
  }

  const destinationUrl = destinationRaw
    ? sanitizeAdDestinationUrl(destinationRaw, isInternal)
    : null;

  return {
    errors,
    data:
      Object.keys(errors).length === 0
        ? {
            campaignId,
            advertiserId,
            title,
            type,
            destinationUrl: destinationUrl!,
            isInternal,
            mediaUrl: mediaUrl || null,
            placements,
          }
        : null,
  };
}

export function advertisementFormErrorSummary(
  errors: Partial<Record<AdvertisementFormField, string>>
) {
  const messages = Object.values(errors).filter(Boolean);
  if (messages.length === 0) return "Please fix the highlighted fields";
  if (messages.length === 1) return messages[0]!;
  return `Fix ${messages.length} fields: ${messages.slice(0, 3).join(" · ")}`;
}
