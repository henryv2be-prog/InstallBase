"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, Loader2, X } from "lucide-react";
import {
  kfAddListingPhoto,
  kfRemoveListingPhoto,
  kfSignOutProvider,
  kfUpsertListing,
} from "@/lib/kasifind/actions";
import {
  publishLocationErrorMessage,
  requestCurrentPositionForPublish,
} from "@/lib/kasifind/request-current-position";
import { KfLocationPicker } from "@/components/kasifind/kf-location-picker";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import {
  KfFormStepper,
  LISTING_FORM_STEPS,
} from "@/components/kasifind/kf-form-stepper";
import type { KfCategory } from "@/components/kasifind/types";

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
  listingId: string | null;
};

function scrollToStatus(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [locatingPublish, setLocatingPublish] = useState(false);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const statusRef = useRef<HTMLDivElement>(null);

  const defaultServices = listing?.services.join("\n") ?? "Steel gates\nWelding\nSecurity gates";
  const formBusy = pending || locatingPublish;
  const publishedJustNow =
    message?.type === "success" && message.text.toLowerCase().includes("submitted");

  useEffect(() => {
    if (message) scrollToStatus(statusRef.current);
  }, [message]);

  const showStatus = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
  };

  const goToStep = (index: number) => {
    setActiveStep(index);
    const id = LISTING_FORM_STEPS[index]?.id;
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitListing = (formData: FormData) => {
    startTransition(async () => {
      const publish = formData.get("publish") === "true";
      const result = await kfUpsertListing(formData);
      if ("error" in result && result.error) {
        showStatus("error", result.error);
        return;
      }
      showStatus(
        "success",
        publish
          ? "Submitted for review — we will notify you when you are live in search."
          : "Draft saved — you can come back anytime to finish."
      );
      if (publish) setActiveStep(LISTING_FORM_STEPS.length - 1);
      router.refresh();
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const publish =
      submitter instanceof HTMLButtonElement &&
      submitter.name === "publish" &&
      submitter.value === "true";

    const formData = new FormData(form);
    formData.set("publish", publish ? "true" : "false");

    if (publish) {
      setLocatingPublish(true);
      const position = await requestCurrentPositionForPublish();
      setLocatingPublish(false);
      if (position.ok === false) {
        showStatus("error", publishLocationErrorMessage(position.reason));
        return;
      }
      const latInput = form.elements.namedItem("latitude") as HTMLInputElement | null;
      const lngInput = form.elements.namedItem("longitude") as HTMLInputElement | null;
      if (latInput) latInput.value = String(position.latitude);
      if (lngInput) lngInput.value = String(position.longitude);
      formData.set("latitude", String(position.latitude));
      formData.set("longitude", String(position.longitude));
    }

    submitListing(formData);
  };

  return (
    <div className="space-y-5 pb-28">
      <KfFormStepper
        steps={LISTING_FORM_STEPS}
        activeIndex={activeStep}
        onStepClick={goToStep}
      />

      <div ref={statusRef} tabIndex={-1} className="scroll-mt-24 space-y-3 outline-none">
        {publishedJustNow ? (
          <div className="kf-success-panel" role="status">
            <p className="kf-success-panel-title">Listing submitted for review</p>
            <ul className="kf-success-panel-list">
              <li>Our team usually reviews within 1–2 business days.</li>
              <li>You will appear in nearby search once approved.</li>
              <li>Location was refreshed from this device when you published.</li>
            </ul>
          </div>
        ) : message ? (
          <div
            role="status"
            className={message.type === "success" ? "kf-alert-success" : "kf-alert-error"}
          >
            {message.text}
          </div>
        ) : null}

        {listing?.listingId &&
          listing.moderationStatus === "PENDING" &&
          listing.status === "PUBLISHED" &&
          !publishedJustNow && (
            <div className="kf-alert-info">
              Your listing is awaiting moderation before it appears in search.
            </div>
          )}
      </div>

      {listing?.listingId && (
        <Link
          href={`/providers/${listing.listingId}`}
          className="inline-flex text-sm font-semibold text-[var(--kf-green-dark)] underline"
        >
          Preview public listing
        </Link>
      )}

      <form
        id="kf-listing-form"
        className="kf-card space-y-8 rounded-2xl p-5 sm:p-6"
        onSubmit={(e) => void handleFormSubmit(e)}
      >
        <section id="kf-step-business" className="kf-form-section">
          <div className="kf-form-section-head">
            <h2 className="kf-form-section-title">Basic info</h2>
            <p className="kf-form-section-sub">How neighbours will recognise your business.</p>
          </div>
          <div className="space-y-4">
            <label className="kf-label">
              Trading / display name
              <input
                name="displayName"
                required
                defaultValue={listing?.displayName ?? ""}
                className="kf-input mt-1"
                placeholder="e.g. Sipho Steel Works"
              />
            </label>
            <label className="kf-label">
              About your business
              <textarea
                name="description"
                required
                minLength={20}
                rows={4}
                defaultValue={listing?.description ?? ""}
                className="kf-input mt-1"
                placeholder="What you do, areas you cover, what makes you reliable…"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="kf-label">
                Phone
                <input
                  name="phone"
                  required
                  defaultValue={listing?.phone ?? ""}
                  className="kf-input mt-1"
                  inputMode="tel"
                />
              </label>
              <label className="kf-label">
                WhatsApp (optional)
                <input
                  name="whatsapp"
                  defaultValue={listing?.whatsapp ?? ""}
                  className="kf-input mt-1"
                  inputMode="tel"
                />
              </label>
            </div>
          </div>
        </section>

        <section id="kf-step-location" className="kf-form-section">
          <div className="kf-form-section-head">
            <h2 className="kf-form-section-title">Location</h2>
            <p className="kf-form-section-sub">
              Shown as a landmark publicly; map pin uses GPS when you publish.
            </p>
          </div>
          <div className="space-y-4">
            <label className="kf-label">
              Neighbourhood / landmark (shown publicly)
              <input
                name="locationLabel"
                required
                defaultValue={listing?.locationLabel ?? ""}
                placeholder="e.g. Near Maponya Mall, Soweto"
                className="kf-input mt-1"
              />
            </label>
            <KfLocationPicker
              key={`${listing?.latitude ?? -26.2041}-${listing?.longitude ?? 28.0473}-${listing?.hideExactLocation ?? true}`}
              initialLatitude={listing?.latitude ?? -26.2041}
              initialLongitude={listing?.longitude ?? 28.0473}
              initialHideExactLocation={listing?.hideExactLocation ?? true}
            />
          </div>
        </section>

        <section id="kf-step-services" className="kf-form-section">
          <div className="kf-form-section-head">
            <h2 className="kf-form-section-title">Services & categories</h2>
            <p className="kf-form-section-sub">Helps customers find you when they search.</p>
          </div>
          <div className="space-y-4">
            <fieldset>
              <legend className="kf-label">Categories</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {categories.map((c) => (
                  <label key={c.id} className="kf-category-check">
                    <input
                      type="checkbox"
                      name="categoryId"
                      value={c.id}
                      defaultChecked={listing?.categoryIds.includes(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="kf-label">
              Services (one per line)
              <textarea
                name="services"
                rows={4}
                defaultValue={defaultServices}
                className="kf-input mt-1 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="kf-label">
                Price hint (optional)
                <input
                  name="priceHint"
                  defaultValue={listing?.priceHint ?? ""}
                  placeholder="From R800 / gate"
                  className="kf-input mt-1"
                />
              </label>
              <label className="kf-label">
                Hours (optional)
                <input
                  name="hoursNote"
                  defaultValue={listing?.hoursNote ?? ""}
                  className="kf-input mt-1"
                  placeholder="Mon–Sat 8am–5pm"
                />
              </label>
            </div>
          </div>
        </section>

      </form>

      <section id="kf-step-photos" className="kf-form-section kf-card rounded-2xl p-5 sm:p-6">
        <div className="kf-form-section-head">
          <h2 className="kf-form-section-title">Work photos</h2>
          <p className="kf-form-section-sub">Show real examples — listings with photos get more enquiries.</p>
        </div>
        {listing?.photos.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {listing.photos.map((p) => (
              <div key={p.id} className="kf-photo-thumb">
                <KfListingImage src={p.url} alt="" className="aspect-square w-full object-cover" priority />
                <button
                  type="button"
                  className="kf-photo-remove"
                  aria-label="Remove photo"
                  disabled={removingPhotoId === p.id || pending || uploading}
                  onClick={() => {
                    setRemovingPhotoId(p.id);
                    startTransition(async () => {
                      try {
                        const fd = new FormData();
                        fd.set("photoId", p.id);
                        const result = await kfRemoveListingPhoto(fd);
                        if ("error" in result && result.error) {
                          showStatus("error", result.error);
                        } else {
                          showStatus("success", "Photo removed.");
                          router.refresh();
                        }
                      } finally {
                        setRemovingPhotoId(null);
                      }
                    });
                  }}
                >
                  {removingPhotoId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <X className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <KfEmptyState
            icon={<Camera className="h-6 w-6" aria-hidden />}
            title="No photos yet"
            description="Add at least one clear photo of your work so customers trust what you offer."
          />
        )}
        <label className="relative mt-4 block">
          <span className="kf-file-input">
            <input
              type="file"
              accept="image/*"
              disabled={uploading || pending}
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
                    showStatus("error", data.error ?? "Upload failed");
                    return;
                  }
                  const fd = new FormData();
                  fd.set("url", data.url);
                  const add = await kfAddListingPhoto(fd);
                  if ("error" in add && add.error) showStatus("error", add.error);
                  else {
                    showStatus("success", "Photo added.");
                    router.refresh();
                  }
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
            {uploading ? "Uploading…" : "Tap to add a photo"}
          </span>
        </label>
      </section>

      <section id="kf-step-publish" className="kf-form-section kf-card hidden rounded-2xl p-5 sm:block sm:p-6">
        <div className="kf-form-section-head">
          <h2 className="kf-form-section-title">Publish</h2>
          <p className="kf-form-section-sub">Save a draft anytime, or submit when you are ready.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            form="kf-listing-form"
            name="publish"
            value="false"
            disabled={formBusy}
            className="kf-btn kf-btn-outline flex-1"
          >
            Save draft
          </button>
          <button
            type="submit"
            form="kf-listing-form"
            name="publish"
            value="true"
            disabled={formBusy}
            className="kf-btn kf-btn-primary flex-1"
          >
            {locatingPublish ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Getting location…
              </>
            ) : pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              "Publish for review"
            )}
          </button>
        </div>
      </section>

      <div className="kf-publish-bar sm:hidden">
        <p className="mb-2 text-center text-xs text-[var(--kf-muted)]">
          Signed in as {userEmail} ·{" "}
          <button type="button" className="underline" onClick={() => goToStep(0)}>
            Jump to top
          </button>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            form="kf-listing-form"
            name="publish"
            value="false"
            disabled={formBusy}
            className="kf-btn kf-btn-outline"
          >
            Save draft
          </button>
          <button
            type="submit"
            form="kf-listing-form"
            name="publish"
            value="true"
            disabled={formBusy}
            className="kf-btn kf-btn-primary"
          >
            Publish
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[var(--kf-muted)]">
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
