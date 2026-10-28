"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import {
  kfAddListingPhoto,
  kfRemoveListingPhoto,
  kfSignOutProvider,
  kfUpsertListing,
} from "@/lib/kasifind/actions";
import type { KfCategory } from "@/components/kasifind/types";

type ListingData = {
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  latitude: number;
  longitude: number;
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
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const defaultServices = listing?.services.join("\n") ?? "Steel gates\nWelding\nSecurity gates";

  useEffect(() => {
    if (message) scrollToStatus(statusRef.current);
  }, [message]);

  const showStatus = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--kf-muted)]">Signed in as {userEmail}</p>
        <button
          type="button"
          className="text-sm underline"
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
      </div>

      <div ref={statusRef} tabIndex={-1} className="scroll-mt-24 space-y-3 outline-none">
        {message ? (
          <div
            role="status"
            className={message.type === "success" ? "kf-alert-success" : "kf-alert-error"}
          >
            {message.text}
          </div>
        ) : null}

        {listing?.listingId &&
          listing.moderationStatus === "PENDING" &&
          listing.status === "PUBLISHED" && (
            <div className="kf-alert-info">
              Your listing is awaiting moderation before it appears in search.
            </div>
          )}
      </div>

      {listing?.listingId && (
        <Link
          href={`/providers/${listing.listingId}`}
          className="text-sm font-semibold text-[var(--kf-green-dark)] underline"
        >
          Preview public listing
        </Link>
      )}

      <form
        className="kf-card space-y-4 rounded-2xl p-5"
        action={(formData) => {
          startTransition(async () => {
            const publish = formData.get("publish") === "true";
            const result = await kfUpsertListing(formData);
            if ("error" in result && result.error) {
              showStatus("error", result.error);
              return;
            }
            showStatus("success", publish ? "Submitted for review." : "Draft saved.");
            router.refresh();
          });
        }}
      >
        <label className="kf-label">
          Trading / display name
          <input
            name="displayName"
            required
            defaultValue={listing?.displayName ?? ""}
            className="kf-input mt-1"
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
            />
          </label>
          <label className="kf-label">
            WhatsApp (optional)
            <input
              name="whatsapp"
              defaultValue={listing?.whatsapp ?? ""}
              className="kf-input mt-1"
            />
          </label>
        </div>
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
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="kf-label">
            Latitude
            <input
              name="latitude"
              required
              inputMode="decimal"
              defaultValue={listing?.latitude ?? -26.2041}
              className="kf-input mt-1"
            />
          </label>
          <label className="kf-label">
            Longitude
            <input
              name="longitude"
              required
              inputMode="decimal"
              defaultValue={listing?.longitude ?? 28.0473}
              className="kf-input mt-1"
            />
          </label>
        </div>
        <p className="text-xs text-[var(--kf-muted)]">
          Exact coordinates are used for distance search only — your street address is not shown by
          default.
        </p>
        <fieldset>
          <legend className="kf-label">Categories</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
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
          Services (one per line — used for search)
          <textarea
            name="services"
            rows={4}
            defaultValue={defaultServices}
            className="kf-input mt-1 font-mono text-sm"
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
            />
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            name="publish"
            value="false"
            disabled={pending}
            className="kf-btn kf-btn-outline flex-1"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="publish"
            value="true"
            disabled={pending}
            className="kf-btn kf-btn-primary flex-1"
          >
            Publish for review
          </button>
        </div>
      </form>

      <section className="kf-card rounded-2xl p-5">
        <h2 className="font-bold">Work photos</h2>
        <p className="mt-1 text-xs text-[var(--kf-muted)]">
          Upload examples of your work. Tap remove if you added one by mistake.
        </p>
        {listing?.photos.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {listing.photos.map((p) => (
              <div key={p.id} className="kf-photo-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" />
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
          <p className="mt-3 text-sm text-[var(--kf-muted-soft)]">No photos yet.</p>
        )}
        <label className="mt-4 block">
          <span className="text-sm font-medium">Upload photo</span>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
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
        </label>
        {uploading ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--kf-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Uploading…
          </p>
        ) : null}
      </section>
    </div>
  );
}
