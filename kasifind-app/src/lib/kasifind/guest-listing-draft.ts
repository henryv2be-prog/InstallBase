/** Browser-only draft while a provider completes the listing wizard before registering. */

export const KF_GUEST_LISTING_DRAFT_KEY = "kf-guest-listing-draft-v1";

export type GuestListingDraft = {
  displayName?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  locationLabel?: string;
  latitude?: string;
  longitude?: string;
  locationConfirmed?: string;
  hideExactLocation?: string;
  priceHint?: string;
  hoursNote?: string;
  services?: string;
  categoryIds?: string[];
};

export function readGuestListingDraft(): GuestListingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KF_GUEST_LISTING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestListingDraft;
  } catch {
    return null;
  }
}

export function writeGuestListingDraftFromForm(form: HTMLFormElement): void {
  if (typeof window === "undefined") return;
  const categoryIds = Array.from(
    form.querySelectorAll<HTMLInputElement>('input[name="categoryId"]:checked')
  ).map((el) => el.value);

  const draft: GuestListingDraft = {
    displayName: (form.querySelector('[name="displayName"]') as HTMLInputElement | null)?.value,
    description: (form.querySelector('[name="description"]') as HTMLTextAreaElement | null)?.value,
    phone: (form.querySelector('[name="phone"]') as HTMLInputElement | null)?.value,
    whatsapp: (form.querySelector('[name="whatsapp"]') as HTMLInputElement | null)?.value,
    locationLabel: (form.querySelector('[name="locationLabel"]') as HTMLInputElement | null)?.value,
    latitude: (form.querySelector('[name="latitude"]') as HTMLInputElement | null)?.value,
    longitude: (form.querySelector('[name="longitude"]') as HTMLInputElement | null)?.value,
    locationConfirmed: (form.querySelector('[name="locationConfirmed"]') as HTMLInputElement | null)
      ?.value,
    hideExactLocation: (form.querySelector('[name="hideExactLocation"]') as HTMLInputElement | null)
      ?.checked
      ? "true"
      : "false",
    priceHint: (form.querySelector('[name="priceHint"]') as HTMLInputElement | null)?.value,
    hoursNote: (form.querySelector('[name="hoursNote"]') as HTMLInputElement | null)?.value,
    services: (form.querySelector('[name="services"]') as HTMLTextAreaElement | null)?.value,
    categoryIds,
  };

  try {
    sessionStorage.setItem(KF_GUEST_LISTING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota — ignore */
  }
}

export function applyGuestListingDraft(form: HTMLFormElement, draft: GuestListingDraft): void {
  const setValue = (name: string, value: string | undefined) => {
    if (value === undefined) return;
    const el = form.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el) el.value = value;
  };

  setValue("displayName", draft.displayName);
  setValue("description", draft.description);
  setValue("phone", draft.phone);
  setValue("whatsapp", draft.whatsapp);
  setValue("locationLabel", draft.locationLabel);
  setValue("latitude", draft.latitude);
  setValue("longitude", draft.longitude);
  setValue("locationConfirmed", draft.locationConfirmed);
  setValue("priceHint", draft.priceHint);
  setValue("hoursNote", draft.hoursNote);
  setValue("services", draft.services);

  const hideEl = form.querySelector('[name="hideExactLocation"]') as HTMLInputElement | null;
  if (hideEl) hideEl.checked = draft.hideExactLocation !== "false";

  if (draft.categoryIds?.length) {
    for (const id of draft.categoryIds) {
      const box = form.querySelector<HTMLInputElement>(
        `input[name="categoryId"][value="${CSS.escape(id)}"]`
      );
      if (box) box.checked = true;
    }
  }

  if (draft.locationConfirmed === "true") {
    window.dispatchEvent(new Event("resize"));
  }
}

export function clearGuestListingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KF_GUEST_LISTING_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
