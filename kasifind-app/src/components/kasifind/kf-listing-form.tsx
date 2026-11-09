"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Camera, Loader2 } from "lucide-react";
import {
  kfAddListingPhoto,
  kfRemoveListingPhoto,
  kfSignOutProvider,
  kfUpsertListing,
} from "@/lib/kasifind/actions";
import {
  kfAdminAssistedAddListingPhoto,
  kfAdminAssistedRemoveListingPhoto,
  kfAdminAssistedUpsertListing,
} from "@/lib/kasifind/listing-assistance-actions";
import {
  publishLocationErrorMessage,
  requestCurrentPositionForPublish,
} from "@/lib/kasifind/request-current-position";
import { KfLocationPicker } from "@/components/kasifind/kf-location-picker";
import { KfWorkPhotoGallery } from "@/components/kasifind/kf-work-photo-gallery";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import { KfProfilePhotoField } from "@/components/kasifind/kf-profile-photo-field";
import {
  KfFormStepper,
  LISTING_FORM_STEPS,
} from "@/components/kasifind/kf-form-stepper";
import { KfListingWizardSummary } from "@/components/kasifind/kf-listing-wizard-summary";
import { KfPublishSuccessScreen } from "@/components/kasifind/kf-publish-success-screen";
import { useListingAssistance } from "@/components/kasifind/kf-listing-assistance-provider";
import { readCompletenessFromListingForm } from "@/lib/kasifind/listing-assistance-prompt";
import { useKfToast } from "@/components/kasifind/kf-toast";
import type { KfCategory } from "@/components/kasifind/types";

type ListingData = {
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
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

const LAST_STEP = LISTING_FORM_STEPS.length - 1;

function stepPanelClass(active: boolean) {
  return active ? "kf-form-section kf-wizard-step-panel" : "kf-form-section";
}

function validateWizardStep(form: HTMLFormElement, step: number, toastError: (msg: string) => void): boolean {
  const panel = form.querySelector(`[data-wizard-step="${step}"]`);
  if (!panel) return true;

  const fields = panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    "input:not([type=hidden]):not([type=file]), textarea, select"
  );
  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  if (step === 1) {
    const confirmed = form.querySelector('input[name="locationConfirmed"]') as HTMLInputElement | null;
    if (confirmed?.value !== "true") {
      toastError(
        "Set your location — tap the map for an approximate area, or use My location."
      );
      return false;
    }
  }

  if (step === 2) {
    const checked = form.querySelectorAll('input[name="categoryId"]:checked').length;
    if (checked === 0) {
      toastError("Select at least one category.");
      return false;
    }
  }

  return true;
}

export function KfListingForm({
  categories,
  listing,
  userEmail,
  adminAssist,
}: {
  categories: KfCategory[];
  listing: ListingData | null;
  userEmail: string;
  adminAssist?: { assistanceRequestId: string };
}) {
  const router = useRouter();
  const listingAssistance = useListingAssistance();
  const upsertListing = adminAssist ? kfAdminAssistedUpsertListing : kfUpsertListing;
  const addListingPhoto = adminAssist ? kfAdminAssistedAddListingPhoto : kfAddListingPhoto;
  const removeListingPhoto = adminAssist ? kfAdminAssistedRemoveListingPhoto : kfRemoveListingPhoto;
  const toast = useKfToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishComplete, setPublishComplete] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(
    listing?.listingId ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [locatingPublish, setLocatingPublish] = useState(false);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const defaultServices = listing?.services.join("\n") ?? "Steel gates\nWelding\nSecurity gates";
  const formBusy = pending || locatingPublish || savingDraft;
  const currentStepMeta = LISTING_FORM_STEPS[activeStep];
  const photoCount = listing?.photos.length ?? 0;

  useEffect(() => {
    document.body.classList.add("kf-listing-flow-active");
    return () => document.body.classList.remove("kf-listing-flow-active");
  }, []);

  useEffect(() => {
    requestAnimationFrame(scrollActiveStepPanel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scroll after step DOM updates
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 1) return;
    const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    return () => window.clearTimeout(t);
  }, [activeStep]);

  const scrollActiveStepPanel = () => {
    const form = formRef.current;
    if (!form) return;
    const panel = form.querySelector<HTMLElement>(`[data-wizard-step="${activeStep}"]`);
    panel?.scrollTo({ top: 0, behavior: "auto" });
  };

  const goToStep = (index: number) => {
    if (index < 0 || index > LAST_STEP) return;
    setActiveStep(index);
  };

  const persistDraftIfNeeded = async (form: HTMLFormElement): Promise<boolean> => {
    if (listing?.listingId) return true;
    const confirmed =
      (form.querySelector('input[name="locationConfirmed"]') as HTMLInputElement | null)?.value ===
      "true";
    if (!confirmed) return true;

    for (let step = 0; step <= Math.min(activeStep, 2); step += 1) {
      if (!validateWizardStep(form, step, toast.error)) {
        goToStep(step);
        return false;
      }
    }

    const formData = new FormData(form);
    formData.set("publish", "false");
    setSavingDraft(true);
    try {
      if (adminAssist) formData.set("assistanceRequestId", adminAssist.assistanceRequestId);
      const result = await upsertListing(formData);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setSavingDraft(false);
    }
  };

  const goNext = () => {
    const form = formRef.current;
    if (!form) return;
    if (!validateWizardStep(form, activeStep, toast.error)) return;

    const advance = () => goToStep(Math.min(activeStep + 1, LAST_STEP));

    if (!listing?.listingId && activeStep >= 1) {
      startTransition(async () => {
        const ok = await persistDraftIfNeeded(form);
        if (ok) advance();
      });
      return;
    }

    advance();
  };

  const goBack = () => goToStep(Math.max(activeStep - 1, 0));

  const submitListing = (formData: FormData) => {
    startTransition(async () => {
      const publish = formData.get("publish") === "true";
      if (adminAssist) formData.set("assistanceRequestId", adminAssist.assistanceRequestId);
      const result = await upsertListing(formData);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      const id =
        "listingId" in result && typeof result.listingId === "string"
          ? result.listingId
          : listing?.listingId ?? null;
      if (adminAssist) {
        toast.success("Listing updated for this provider.");
        router.refresh();
        return;
      }
      if (publish) {
        setPublishedListingId(id);
        setPublishComplete(true);
        requestAnimationFrame(scrollActiveStepPanel);
      } else {
        toast.success("Draft saved — pick up where you left off anytime.");
      }
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

    if (publish) {
      for (let step = 0; step <= 2; step += 1) {
        if (!validateWizardStep(form, step, toast.error)) {
          goToStep(step);
          return;
        }
      }
    } else if (!validateWizardStep(form, activeStep, toast.error)) {
      return;
    }

    if (publish && listingAssistance && !adminAssist) {
      const completeness = readCompletenessFromListingForm(
        form,
        photoCount,
        Boolean(listing?.profileImageUrl)
      );
      const choice = await listingAssistance.offerHelpBeforePublish(completeness);
      if (choice === "help" || choice === "cancel") return;
    }

    const formData = new FormData(form);
    formData.set("publish", publish ? "true" : "false");

    const hideExactLocation = formData.get("hideExactLocation") !== "false";

    if (publish && !hideExactLocation) {
      setLocatingPublish(true);
      const position = await requestCurrentPositionForPublish();
      setLocatingPublish(false);
      if (position.ok === false) {
        toast.error(publishLocationErrorMessage(position.reason));
        goToStep(1);
        return;
      }
      const latInput = form.elements.namedItem("latitude") as HTMLInputElement | null;
      const lngInput = form.elements.namedItem("longitude") as HTMLInputElement | null;
      if (latInput) latInput.value = String(position.latitude);
      if (lngInput) lngInput.value = String(position.longitude);
      formData.set("latitude", String(position.latitude));
      formData.set("longitude", String(position.longitude));
      formData.set("locationConfirmed", "true");
    }

    if (formData.get("locationConfirmed") !== "true") {
      toast.error("Set your location on the Location step before saving.");
      goToStep(1);
      return;
    }

    submitListing(formData);
  };

  if (publishComplete) {
    return <KfPublishSuccessScreen listingId={publishedListingId} />;
  }

  return (
    <div className="kf-listing-flow kf-classic-wizard">
      <header className="kf-listing-flow-head kf-classic-wizard-head">
        <KfFormStepper
          steps={LISTING_FORM_STEPS}
          activeIndex={activeStep}
          onStepClick={(index) => {
            if (index <= activeStep) goToStep(index);
          }}
        />
        {currentStepMeta ? (
          <div className="kf-wizard-step-banner">
            <p className="kf-wizard-step-kicker">
              Step {activeStep + 1} of {LISTING_FORM_STEPS.length}
            </p>
            <h2 className="kf-wizard-step-heading">{currentStepMeta.label}</h2>
          </div>
        ) : null}
        {listing?.listingId &&
          listing.moderationStatus === "PENDING" &&
          listing.status === "PUBLISHED" && (
            <p className="kf-listing-flow-banner" role="status">
              Your listing is awaiting moderation before it appears in search.
            </p>
          )}
        {listing?.listingId && activeStep === LAST_STEP ? (
          <Link href={`/providers/${listing.listingId}`} className="kf-listing-flow-preview">
            Preview your listing
          </Link>
        ) : null}
      </header>

      <div className="kf-listing-flow-body kf-classic-wizard-body">
        <form
          ref={formRef}
          id="kf-listing-form"
          className="kf-card kf-wizard-card rounded-2xl p-4 sm:p-5"
          onSubmit={(e) => void handleFormSubmit(e)}
        >
        {adminAssist ? (
          <input type="hidden" name="assistanceRequestId" value={adminAssist.assistanceRequestId} />
        ) : null}
        <section
          id="kf-step-business"
          data-wizard-step="0"
          className={stepPanelClass(activeStep === 0)}
          hidden={activeStep !== 0}
        >
          <p className="kf-wizard-step-lead">How neighbours will recognise your business.</p>
          <div className="kf-wizard-fields">
            <label className="kf-label">
              Trading / display name
              <input
                name="displayName"
                required
                defaultValue={listing?.displayName ?? ""}
                className="kf-input kf-input-compact mt-1"
                placeholder="e.g. Sipho Steel Works"
                autoComplete="organization"
              />
            </label>
            <label className="kf-label">
              About your business
              <textarea
                name="description"
                required
                minLength={20}
                rows={3}
                defaultValue={listing?.description ?? ""}
                className="kf-input kf-input-compact kf-listing-flow-textarea mt-1"
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
                  className="kf-input kf-input-compact mt-1"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>
              <label className="kf-label">
                WhatsApp <span className="font-normal text-[var(--kf-muted)]">(optional)</span>
                <input
                  name="whatsapp"
                  defaultValue={listing?.whatsapp ?? ""}
                  className="kf-input kf-input-compact mt-1"
                  inputMode="tel"
                />
              </label>
            </div>
          </div>
        </section>

        <section
          id="kf-step-location"
          data-wizard-step="1"
          className={stepPanelClass(activeStep === 1)}
          hidden={activeStep !== 1}
        >
          <p className="kf-wizard-step-lead">
            Tap the map for an approximate area, or use My location. We never guess your pin.
          </p>
          <div className="kf-wizard-fields kf-listing-flow-stack kf-listing-flow-stack--map">
            <label className="kf-label">
              Neighbourhood / landmark (shown publicly)
              <input
                name="locationLabel"
                required
                defaultValue={listing?.locationLabel ?? ""}
                placeholder="e.g. Near Maponya Mall, Soweto"
                className="kf-input kf-input-compact mt-1"
              />
            </label>
            <div className="kf-location-map--flow">
              <KfLocationPicker
                key={`${listing?.latitude ?? "new"}-${listing?.longitude ?? "new"}-${listing?.hideExactLocation ?? true}`}
                initialLatitude={listing?.latitude ?? null}
                initialLongitude={listing?.longitude ?? null}
                initialHideExactLocation={listing?.hideExactLocation ?? true}
              />
            </div>
          </div>
        </section>

        <section
          id="kf-step-services"
          data-wizard-step="2"
          className={stepPanelClass(activeStep === 2)}
          hidden={activeStep !== 2}
        >
          <p className="kf-wizard-step-lead">Pick categories and list what you offer — search uses these words.</p>
          <div className="kf-wizard-fields">
            <fieldset className="kf-wizard-fieldset">
              <legend className="kf-label">Categories</legend>
              <div className="kf-wizard-category-grid mt-2 grid gap-2 sm:grid-cols-2">
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
              Services <span className="font-normal text-[var(--kf-muted)]">(one per line)</span>
              <textarea
                name="services"
                rows={3}
                defaultValue={defaultServices}
                className="kf-input kf-input-compact kf-listing-flow-textarea mt-1 text-sm"
              />
            </label>
            <details className="kf-wizard-optional">
              <summary>Price & hours (optional)</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="kf-label">
                  Price hint
                  <input
                    name="priceHint"
                    defaultValue={listing?.priceHint ?? ""}
                    placeholder="From R800 / gate"
                    className="kf-input kf-input-compact mt-1"
                  />
                </label>
                <label className="kf-label">
                  Hours
                  <input
                    name="hoursNote"
                    defaultValue={listing?.hoursNote ?? ""}
                    className="kf-input kf-input-compact mt-1"
                    placeholder="Mon–Sat 8am–5pm"
                  />
                </label>
              </div>
            </details>
          </div>
        </section>

        <section
          id="kf-step-photos"
          data-wizard-step="3"
          className={stepPanelClass(activeStep === 3)}
          hidden={activeStep !== 3}
        >
          <p className="kf-wizard-step-lead">
            Add your business photo and examples of your work — customers decide with their eyes.
          </p>
          {listing?.listingId ? (
            <>
              <div className="kf-profile-photo-field--flow mb-4">
                <KfProfilePhotoField
                  listingId={listing.listingId}
                  profileImageUrl={listing.profileImageUrl ?? null}
                  disabled={formBusy}
                  wizardFormRef={formRef}
                  assistanceRequestId={adminAssist?.assistanceRequestId}
                />
              </div>
              {photoCount > 0 ? (
                <KfWorkPhotoGallery
                  priorityFirst
                  photos={listing.photos.map((p) => ({ id: p.id, src: p.url, alt: "Your work photo" }))}
                  removeDisabled={pending || uploading}
                  removingPhotoId={removingPhotoId}
                  onRemovePhoto={(photoId) => {
                    setRemovingPhotoId(photoId);
                    startTransition(async () => {
                      try {
                        const fd = new FormData();
                        fd.set("photoId", photoId);
                        if (adminAssist) fd.set("assistanceRequestId", adminAssist.assistanceRequestId);
                        const result = await removeListingPhoto(fd);
                        if ("error" in result && result.error) toast.error(result.error);
                        else {
                          toast.success("Photo removed.");
                          router.refresh();
                        }
                      } finally {
                        setRemovingPhotoId(null);
                      }
                    });
                  }}
                />
              ) : (
                <KfEmptyState
                  icon={<Camera className="h-6 w-6" aria-hidden />}
                  title="No work photos yet"
                  description="Add at least one clear photo of your work. Customers often message before they visit — photos help them choose you with confidence."
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
                          toast.error(data.error ?? "Upload failed");
                          return;
                        }
                        const fd = new FormData();
                        fd.set("url", data.url);
                        if (adminAssist) fd.set("assistanceRequestId", adminAssist.assistanceRequestId);
                        const add = await addListingPhoto(fd);
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
                  {uploading ? "Uploading…" : "Tap to add a photo"}
                </span>
              </label>
            </>
          ) : (
            <KfEmptyState
              icon={<Camera className="h-6 w-6" aria-hidden />}
              title="Complete location first"
              description="Go back to Location and set your area on the map, then tap Next — we will save a draft automatically so you can upload photos here."
            />
          )}
        </section>

        <section
          id="kf-step-publish"
          data-wizard-step="4"
          className={stepPanelClass(activeStep === LAST_STEP)}
          hidden={activeStep !== LAST_STEP}
        >
          <p className="kf-wizard-step-lead">
            Review everything, save a draft, or submit for moderation.
          </p>
          <KfListingWizardSummary
            formRef={formRef}
            photoCount={photoCount}
            hasProfilePhoto={Boolean(listing?.profileImageUrl)}
          />
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              name="publish"
              value="false"
              disabled={formBusy}
              className="kf-btn kf-btn-outline min-h-[3rem] flex-1 text-base"
            >
              Save draft
            </button>
            <button
              type="submit"
              name="publish"
              value="true"
              disabled={formBusy}
              className="kf-btn kf-btn-primary min-h-[3rem] flex-1 text-base"
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
        </form>
      </div>

      <footer className="kf-listing-flow-foot kf-classic-wizard-foot">
        <nav className="kf-wizard-nav kf-listing-flow-nav" aria-label="Listing steps">
          {activeStep > 0 && activeStep < LAST_STEP ? (
            <button
              type="button"
              className="kf-btn kf-btn-outline min-h-[2.75rem] flex-1"
              onClick={goBack}
              disabled={formBusy}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
          ) : (
            <span aria-hidden />
          )}

          {activeStep < LAST_STEP ? (
            <button
              type="button"
              className="kf-btn kf-btn-primary min-h-[2.75rem] flex-1"
              onClick={goNext}
              disabled={formBusy}
            >
              {savingDraft ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="kf-btn kf-btn-ghost min-h-[2.75rem] flex-1 text-sm"
              onClick={() => goToStep(0)}
              disabled={formBusy}
            >
              Edit earlier steps
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
