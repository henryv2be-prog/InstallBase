"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronRight,
  Loader2,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import {
  kfAddListingPhoto,
  kfSignOutProvider,
  kfUpsertListing,
} from "@/lib/kasifind/actions";
import {
  publishLocationErrorMessage,
  requestCurrentPositionForPublish,
} from "@/lib/kasifind/request-current-position";
import { APPROXIMATE_MAP_RADIUS_M } from "@/lib/kasifind/location-display";
import { KfLocationMap } from "@/components/kasifind/kf-location-map";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { KfPublishSuccessScreen } from "@/components/kasifind/kf-publish-success-screen";
import { useKfToast } from "@/components/kasifind/kf-toast";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import type { KfCategory } from "@/components/kasifind/types";

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };
const TOTAL_STEPS = 6;
const LAST_STEP = TOTAL_STEPS - 1;

const STEP_PROMPT = [
  "Business name",
  "Phone number",
  "Your area on the map",
  "Pick what you do",
  "Add a work photo",
  "Ready to publish",
] as const;

const STEP_HINT = [
  "What should people call you?",
  "Customers will WhatsApp or call this number.",
  "Tap the map or use GPS. Add a landmark customers know.",
  "Tap one or more — swipe for more trades.",
  "Optional — helps people trust you.",
  "Check quickly, then publish.",
] as const;

type ListingData = {
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  latitude: number;
  longitude: number;
  hideExactLocation: boolean;
  priceHint: string | null;
  hoursNote: string | null;
  status: string;
  moderationStatus: string;
  categoryIds: string[];
  services: string[];
  photos: { id: string; url: string }[];
  profileImageUrl: string | null;
  listingId: string | null;
};

type Draft = {
  displayName: string;
  phone: string;
  whatsapp: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  hideExactLocation: boolean;
  categoryIds: string[];
  servicesLine: string;
};

function buildFormData(draft: Draft, publish: boolean): FormData {
  const fd = new FormData();
  fd.set("displayName", draft.displayName.trim());
  fd.set("phone", draft.phone.trim());
  fd.set("whatsapp", (draft.whatsapp.trim() || draft.phone.trim()) || "");
  fd.set("locationLabel", draft.locationLabel.trim());
  fd.set("latitude", String(draft.latitude));
  fd.set("longitude", String(draft.longitude));
  fd.set("hideExactLocation", draft.hideExactLocation ? "true" : "false");
  fd.set("description", "");
  fd.set(
    "services",
    draft.servicesLine
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n")
  );
  fd.set("priceHint", "");
  fd.set("hoursNote", "");
  draft.categoryIds.forEach((id) => fd.append("categoryId", id));
  fd.set("publish", publish ? "true" : "false");
  return fd;
}

export function KfListingForm({
  categories,
  listing,
  userEmail,
}: {
  categories: KfCategory[];
  listing: ListingData | null;
  userEmail: string;
}) {
  const router = useRouter();
  const toast = useKfToast();
  const [pending, startTransition] = useTransition();
  const [publishComplete, setPublishComplete] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(
    listing?.listingId ?? null
  );
  const [activeStep, setActiveStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locatingPublish, setLocatingPublish] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [showWhatsappField, setShowWhatsappField] = useState(Boolean(listing?.whatsapp));

  const [draft, setDraft] = useState<Draft>(() => ({
    displayName: listing?.displayName ?? "",
    phone: listing?.phone ?? "",
    whatsapp: listing?.whatsapp ?? "",
    locationLabel: listing?.locationLabel ?? "",
    latitude: listing?.latitude ?? DEFAULT_CENTER.lat,
    longitude: listing?.longitude ?? DEFAULT_CENTER.lng,
    hideExactLocation: listing?.hideExactLocation ?? true,
    categoryIds: listing?.categoryIds ?? [],
    servicesLine: listing?.services.join(", ") ?? "",
  }));

  const listingId = publishedListingId ?? listing?.listingId ?? null;
  const photos = listing?.photos ?? [];
  const formBusy = pending || locatingPublish || draftSaving || locating;

  const patchDraft = (partial: Partial<Draft>) => setDraft((d) => ({ ...d, ...partial }));

  useEffect(() => {
    document.body.classList.add("kf-listing-flow-active");
    return () => document.body.classList.remove("kf-listing-flow-active");
  }, []);

  useEffect(() => {
    if (activeStep !== 2) return;
    const t = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
    return () => window.clearTimeout(t);
  }, [activeStep]);

  const toggleCategory = (id: string) => {
    setDraft((d) => ({
      ...d,
      categoryIds: d.categoryIds.includes(id)
        ? d.categoryIds.filter((c) => c !== id)
        : [...d.categoryIds, id],
    }));
  };

  const saveDraft = useCallback(async (): Promise<string | null> => {
    setDraftSaving(true);
    try {
      const fd = buildFormData(draft, false);
      const result = await kfUpsertListing(fd);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return null;
      }
      const id =
        "listingId" in result && typeof result.listingId === "string" ? result.listingId : listingId;
      if (id) setPublishedListingId(id);
      router.refresh();
      return id ?? null;
    } finally {
      setDraftSaving(false);
    }
  }, [draft, listingId, router, toast]);

  const validateStep = (step: number): boolean => {
    if (step === 0 && draft.displayName.trim().length < 2) {
      toast.error("Please enter your business name.");
      return false;
    }
    if (step === 1 && draft.phone.trim().length < 9) {
      toast.error("Please enter your phone number.");
      return false;
    }
    if (step === 2 && !draft.locationLabel.trim()) {
      toast.error("Add a landmark or area name.");
      return false;
    }
    return true;
  };

  const goToStep = (index: number) => {
    if (index < 0 || index > LAST_STEP) return;
    setActiveStep(index);
  };

  const goNext = async () => {
    if (!validateStep(activeStep)) return;
    if (activeStep === 2 && !listingId) {
      const id = await saveDraft();
      if (!id) return;
    }
    goToStep(activeStep + 1);
  };

  const goBack = () => goToStep(activeStep - 1);

  const useMyLocation = async () => {
    setLocating(true);
    const position = await requestCurrentPositionForPublish();
    setLocating(false);
    if (position.ok === true) {
      patchDraft({ latitude: position.latitude, longitude: position.longitude });
      toast.success("Pin moved to you.");
    } else {
      toast.error(publishLocationErrorMessage(position.reason));
    }
  };

  const publish = () => {
    startTransition(async () => {
      if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
        goToStep(0);
        return;
      }
      setLocatingPublish(true);
      const position = await requestCurrentPositionForPublish();
      setLocatingPublish(false);
      if (position.ok === false) {
        toast.error(publishLocationErrorMessage(position.reason));
        return;
      }
      const publishDraft = {
        ...draft,
        latitude: position.latitude,
        longitude: position.longitude,
      };
      const fd = buildFormData(publishDraft, true);
      const result = await kfUpsertListing(fd);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      const id =
        "listingId" in result && typeof result.listingId === "string"
          ? result.listingId
          : listingId;
      setPublishedListingId(id);
      setPublishComplete(true);
      router.refresh();
    });
  };

  useEffect(() => {
    if (activeStep !== 4 || listingId || draftSaving) return;
    void saveDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, listingId]);

  if (publishComplete) {
    return <KfPublishSuccessScreen listingId={publishedListingId} />;
  }

  const skipOptional =
    activeStep === 3 || activeStep === 4 ? (
      <button
        type="button"
        className="kf-listing-flow-skip"
        disabled={formBusy}
        onClick={() => void goNext()}
      >
        Skip for now
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    ) : null;

  return (
    <div className="kf-listing-flow">
      <header className="kf-listing-flow-head">
        <div className="kf-listing-flow-progress" aria-label={`Step ${activeStep + 1} of ${TOTAL_STEPS}`}>
          <span className="kf-listing-flow-step-label">
            Step {activeStep + 1}/{TOTAL_STEPS}
          </span>
          <div className="kf-easy-dots" aria-hidden>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span key={i} className={`kf-easy-dot${i <= activeStep ? " kf-easy-dot--on" : ""}`} />
            ))}
          </div>
        </div>
        <h1 className="kf-listing-flow-title">{STEP_PROMPT[activeStep]}</h1>
        <p className="kf-listing-flow-hint">{STEP_HINT[activeStep]}</p>
      </header>

      <div className="kf-listing-flow-body">
        {activeStep === 0 ? (
          <input
            className="kf-listing-flow-input"
            value={draft.displayName}
            onChange={(e) => patchDraft({ displayName: e.target.value })}
            placeholder="e.g. Sipho Steel Works"
            autoComplete="organization"
            enterKeyHint="next"
          />
        ) : null}

        {activeStep === 1 ? (
          <div className="kf-listing-flow-stack">
            <input
              className="kf-listing-flow-input"
              value={draft.phone}
              onChange={(e) => patchDraft({ phone: e.target.value })}
              inputMode="tel"
              autoComplete="tel"
              placeholder="082 123 4567"
            />
            {!showWhatsappField ? (
              <button
                type="button"
                className="kf-listing-flow-link"
                onClick={() => setShowWhatsappField(true)}
              >
                Different WhatsApp number?
              </button>
            ) : (
              <input
                className="kf-listing-flow-input kf-listing-flow-input--secondary"
                value={draft.whatsapp}
                onChange={(e) => patchDraft({ whatsapp: e.target.value })}
                inputMode="tel"
                placeholder="WhatsApp number"
              />
            )}
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="kf-listing-flow-stack kf-listing-flow-stack--map">
            <KfLocationMap
              latitude={draft.latitude}
              longitude={draft.longitude}
              approximate={draft.hideExactLocation}
              radiusMeters={draft.hideExactLocation ? APPROXIMATE_MAP_RADIUS_M : null}
              interactive
              className="kf-location-map--flow"
              onLocationChange={(lat, lng) => patchDraft({ latitude: lat, longitude: lng })}
            />
            <div className="kf-listing-flow-map-actions">
              <button
                type="button"
                className="kf-btn kf-btn-ghost kf-listing-flow-gps"
                disabled={locating}
                onClick={() => void useMyLocation()}
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Navigation className="h-4 w-4" aria-hidden />
                )}
                GPS
              </button>
              <input
                className="kf-listing-flow-input kf-listing-flow-input--inline"
                value={draft.locationLabel}
                onChange={(e) => patchDraft({ locationLabel: e.target.value })}
                placeholder="Landmark e.g. Maponya Mall"
              />
            </div>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="kf-listing-flow-stack">
            <div className="kf-listing-flow-categories" role="list">
              {categories.map((c) => {
                const Icon = categoryIconForSlug(c.slug);
                const on = draft.categoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="listitem"
                    className={`kf-listing-flow-chip${on ? " kf-listing-flow-chip--on" : ""}`}
                    onClick={() => toggleCategory(c.id)}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {c.name}
                  </button>
                );
              })}
            </div>
            <input
              className="kf-listing-flow-input kf-listing-flow-input--secondary"
              value={draft.servicesLine}
              onChange={(e) => patchDraft({ servicesLine: e.target.value })}
              placeholder="Other work? e.g. welding, gates"
            />
          </div>
        ) : null}

        {activeStep === 4 ? (
          <div className="kf-listing-flow-photo-step">
            {listingId && photos.length > 0 ? (
              <div className="kf-listing-flow-photo-row">
                {photos.slice(0, 2).map((p) => (
                  <KfListingImage key={p.id} src={p.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ))}
              </div>
            ) : (
              <div className="kf-listing-flow-photo-empty" aria-hidden>
                <Camera className="h-8 w-8" />
              </div>
            )}
            {listingId ? (
              <label className="kf-btn kf-btn-secondary kf-listing-flow-photo-btn">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading || formBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const body = new FormData();
                      body.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body });
                      const data = await res.json();
                      if (!res.ok) {
                        toast.error(data.error ?? "Upload failed");
                        return;
                      }
                      const fd = new FormData();
                      fd.set("url", data.url);
                      const add = await kfAddListingPhoto(fd);
                      if ("error" in add && add.error) toast.error(add.error);
                      else {
                        toast.success("Photo added.");
                        router.refresh();
                      }
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
                {uploading ? "Uploading…" : "Choose photo"}
              </label>
            ) : (
              <p className="text-center text-sm text-[var(--kf-muted)]">One moment…</p>
            )}
          </div>
        ) : null}

        {activeStep === 5 ? (
          <ul className="kf-listing-flow-review">
            <li>
              <strong>{draft.displayName}</strong>
            </li>
            <li>
              <Phone className="inline h-3.5 w-3.5" aria-hidden /> {draft.phone}
            </li>
            <li>
              <MapPin className="inline h-3.5 w-3.5" aria-hidden /> {draft.locationLabel}
            </li>
            <li>
              {draft.categoryIds.length
                ? categories
                    .filter((c) => draft.categoryIds.includes(c.id))
                    .map((c) => c.name)
                    .join(", ")
                : "General — add categories later"}
            </li>
            <li>{photos.length ? `${photos.length} photo(s)` : "No photos yet"}</li>
          </ul>
        ) : null}
      </div>

      <footer className="kf-listing-flow-foot">
        {skipOptional}
        <nav className="kf-listing-flow-nav" aria-label="Listing steps">
          {activeStep > 0 ? (
            <button type="button" className="kf-btn kf-btn-outline" onClick={goBack} disabled={formBusy}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
          ) : (
            <span aria-hidden />
          )}
          {activeStep < LAST_STEP ? (
            <button type="button" className="kf-btn kf-btn-primary" onClick={() => void goNext()} disabled={formBusy}>
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button type="button" className="kf-btn kf-btn-primary" onClick={publish} disabled={formBusy}>
              {locatingPublish || pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Publishing…
                </>
              ) : (
                "Publish"
              )}
            </button>
          )}
        </nav>
        <p className="kf-listing-flow-account">
          {userEmail}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              startTransition(async () => {
                await kfSignOutProvider();
                router.push("/");
                router.refresh();
              });
            }}
          >
            Sign out
          </button>
        </p>
      </footer>
    </div>
  );
}
