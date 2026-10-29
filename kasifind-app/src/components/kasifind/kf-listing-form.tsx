"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
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
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { KfPublishSuccessScreen } from "@/components/kasifind/kf-publish-success-screen";
import { useKfToast } from "@/components/kasifind/kf-toast";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import type { KfCategory } from "@/components/kasifind/types";

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };
const TOTAL_STEPS = 6;
const LAST_STEP = TOTAL_STEPS - 1;

const STEP_TITLES = [
  "What should customers call your business?",
  "How can customers WhatsApp or call you?",
  "Where do people usually find you?",
  "What work do you do?",
  "Got a photo of your work?",
  "Looking good — publish your listing",
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

function EasyProgress({ step }: { step: number }) {
  return (
    <div className="kf-easy-progress" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
      <p className="kf-easy-progress-text">
        Step {step + 1} of {TOTAL_STEPS}
      </p>
      <div className="kf-easy-dots" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span key={i} className={`kf-easy-dot${i <= step ? " kf-easy-dot--on" : ""}`} />
        ))}
      </div>
    </div>
  );
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
    if (step === 0) {
      if (draft.displayName.trim().length < 2) {
        toast.error("Please enter your business name.");
        return false;
      }
    }
    if (step === 1) {
      if (draft.phone.trim().length < 9) {
        toast.error("Please enter a phone number.");
        return false;
      }
    }
    if (step === 2) {
      if (!draft.locationLabel.trim()) {
        toast.error("Tell us your area or a landmark nearby.");
        return false;
      }
    }
    return true;
  };

  const goToStep = (index: number) => {
    if (index < 0 || index > LAST_STEP) return;
    setActiveStep(index);
    window.scrollTo({ top: 0, behavior: "auto" });
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
      toast.success("Location updated.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when opening photo step
  }, [activeStep, listingId]);

  if (publishComplete) {
    return <KfPublishSuccessScreen listingId={publishedListingId} />;
  }

  return (
    <div className="kf-easy-wizard">
      <EasyProgress step={activeStep} />

      <div className="kf-easy-step">
        <h2 className="kf-easy-title">{STEP_TITLES[activeStep]}</h2>

        {activeStep === 0 ? (
          <input
            className="kf-easy-input"
            value={draft.displayName}
            onChange={(e) => patchDraft({ displayName: e.target.value })}
            placeholder="e.g. Sipho Steel Works"
            autoComplete="organization"
            enterKeyHint="next"
          />
        ) : null}

        {activeStep === 1 ? (
          <div className="kf-easy-stack">
            <label className="kf-easy-field">
              <span className="kf-easy-label">Phone number</span>
              <input
                className="kf-easy-input"
                value={draft.phone}
                onChange={(e) => patchDraft({ phone: e.target.value })}
                inputMode="tel"
                autoComplete="tel"
                placeholder="082 123 4567"
              />
            </label>
            <label className="kf-easy-field">
              <span className="kf-easy-label">WhatsApp (optional)</span>
              <input
                className="kf-easy-input"
                value={draft.whatsapp}
                onChange={(e) => patchDraft({ whatsapp: e.target.value })}
                inputMode="tel"
                placeholder="Same as phone is fine"
              />
            </label>
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="kf-easy-stack">
            <label className="kf-easy-field">
              <span className="kf-easy-label">Area or landmark</span>
              <input
                className="kf-easy-input"
                value={draft.locationLabel}
                onChange={(e) => patchDraft({ locationLabel: e.target.value })}
                placeholder="e.g. Near Maponya Mall, Soweto"
              />
            </label>
            <button
              type="button"
              className="kf-btn kf-btn-secondary kf-easy-big-btn"
              disabled={locating}
              onClick={() => void useMyLocation()}
            >
              {locating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Getting location…
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5" aria-hidden />
                  Use my location
                </>
              )}
            </button>
            <p className="kf-easy-hint">
              <MapPin className="inline h-4 w-4" aria-hidden /> Customers see your area, not your
              exact home address.
            </p>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="kf-easy-stack">
            <div className="kf-easy-category-grid">
              {categories.map((c) => {
                const Icon = categoryIconForSlug(c.slug);
                const on = draft.categoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`kf-easy-category${on ? " kf-easy-category--on" : ""}`}
                    onClick={() => toggleCategory(c.id)}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
            <label className="kf-easy-field">
              <span className="kf-easy-label">Anything else? (optional)</span>
              <input
                className="kf-easy-input"
                value={draft.servicesLine}
                onChange={(e) => patchDraft({ servicesLine: e.target.value })}
                placeholder="e.g. welding, gates, repairs"
              />
            </label>
          </div>
        ) : null}

        {activeStep === 4 ? (
          <div className="kf-easy-stack kf-easy-stack--center">
            <p className="kf-easy-hint">A clear photo helps customers trust you. You can add more later.</p>
            {listingId && photos.length > 0 ? (
              <div className="kf-easy-photo-row">
                {photos.slice(0, 3).map((p) => (
                  <div key={p.id} className="kf-photo-thumb">
                    <KfListingImage src={p.url} alt="" className="aspect-square w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="kf-easy-photo-placeholder" aria-hidden>
                <Camera className="h-10 w-10" />
              </div>
            )}
            {listingId ? (
              <label className="relative block w-full">
                <span className="kf-file-input kf-easy-big-btn">
                  <input
                    type="file"
                    accept="image/*"
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
                  {uploading ? "Uploading…" : "Add a photo"}
                </span>
              </label>
            ) : (
              <p className="text-sm text-[var(--kf-muted)]">Saving your details…</p>
            )}
          </div>
        ) : null}

        {activeStep === 5 ? (
          <div className="kf-easy-stack">
            <ul className="kf-easy-review">
              <li>
                <strong>{draft.displayName || "—"}</strong>
              </li>
              <li>
                <Phone className="inline h-4 w-4" aria-hidden /> {draft.phone || "—"}
              </li>
              <li>
                <MapPin className="inline h-4 w-4" aria-hidden /> {draft.locationLabel || "—"}
              </li>
              <li>
                {draft.categoryIds.length > 0
                  ? categories
                      .filter((c) => draft.categoryIds.includes(c.id))
                      .map((c) => c.name)
                      .join(", ")
                  : "General services (you can add categories later)"}
              </li>
              <li>{photos.length > 0 ? `${photos.length} photo(s) added` : "No photos yet — OK to publish"}</li>
            </ul>
            <p className="kf-easy-hint">
              <Sparkles className="inline h-4 w-4" aria-hidden /> We check listings before they go
              live — usually 1–2 days.
            </p>
          </div>
        ) : null}
      </div>

      <nav className="kf-easy-nav" aria-label="Listing steps">
        {activeStep > 0 ? (
          <button type="button" className="kf-btn kf-btn-outline kf-easy-nav-btn" onClick={goBack} disabled={formBusy}>
            <ArrowLeft className="h-5 w-5" aria-hidden />
            Back
          </button>
        ) : (
          <span className="kf-easy-nav-spacer" aria-hidden />
        )}

        {activeStep < LAST_STEP ? (
          activeStep === 3 || activeStep === 4 ? (
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="kf-btn kf-btn-outline kf-easy-nav-btn flex-1"
                onClick={() => void goNext()}
                disabled={formBusy}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="kf-btn kf-btn-primary kf-easy-nav-btn flex-1"
                onClick={() => void goNext()}
                disabled={formBusy}
              >
                Next
                <ArrowRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="kf-btn kf-btn-primary kf-easy-nav-btn"
              onClick={() => void goNext()}
              disabled={formBusy}
            >
              Next
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          )
        ) : (
          <button
            type="button"
            className="kf-btn kf-btn-primary kf-easy-nav-btn"
            onClick={publish}
            disabled={formBusy}
          >
            {locatingPublish || pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Publishing…
              </>
            ) : (
              "Publish my listing"
            )}
          </button>
        )}
      </nav>

      <p className="kf-easy-footer">
        Signed in as {userEmail} ·{" "}
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
    </div>
  );
}
