export const LISTING_ASSISTANCE_ENTRY_DISMISS_KEY = "kf-listing-assistance-entry-dismissed";

export type ListingCompletenessInput = {
  description: string;
  categoryIds: string[];
  services: string[];
  workPhotoCount: number;
  hasProfilePhoto: boolean;
};

export function getListingCompletenessGaps(input: ListingCompletenessInput): string[] {
  const gaps: string[] = [];
  if (!input.hasProfilePhoto) gaps.push("a business photo");
  if (input.workPhotoCount === 0) gaps.push("at least one work photo");
  if (input.categoryIds.length === 0) gaps.push("a category");
  if (input.services.length === 0) gaps.push("at least one service");
  if ((input.description?.trim().length ?? 0) < 20) gaps.push("a longer description");
  return gaps;
}

export function isListingIncompleteForPublish(input: ListingCompletenessInput): boolean {
  return getListingCompletenessGaps(input).length > 0;
}

export function formatCompletenessGapsSentence(gaps: string[]): string {
  if (gaps.length === 0) return "";
  if (gaps.length === 1) return gaps[0];
  if (gaps.length === 2) return `${gaps[0]} and ${gaps[1]}`;
  return `${gaps.slice(0, -1).join(", ")}, and ${gaps[gaps.length - 1]}`;
}

function fieldValue(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!el || !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return "";
  return el.value;
}

export function readCompletenessFromListingForm(
  form: HTMLFormElement,
  workPhotoCount: number,
  hasProfilePhoto: boolean
): ListingCompletenessInput {
  const description = fieldValue(form, "description").trim();
  const servicesRaw = fieldValue(form, "services");
  const services = servicesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const categoryIds = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="categoryId"]:checked')).map(
    (el) => el.value
  );
  return {
    description,
    categoryIds,
    services,
    workPhotoCount,
    hasProfilePhoto,
  };
}
