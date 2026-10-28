"use client";

import { useRouter } from "next/navigation";
import { type RefObject, useState, useTransition } from "react";
import { Building2, Loader2, X } from "lucide-react";
import {
  kfClearListingProfileImage,
  kfSaveListingProfileFromWizard,
  kfSetListingProfileImage,
} from "@/lib/kasifind/actions";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { useKfToast } from "@/components/kasifind/kf-toast";

type Props = {
  listingId: string | null;
  profileImageUrl: string | null;
  disabled?: boolean;
  /** When no listing exists yet, step-1 fields are read from this form to save a draft + photo. */
  wizardFormRef?: RefObject<HTMLFormElement | null>;
};

function validateStep0ForPhoto(form: HTMLFormElement, toastError: (msg: string) => void): boolean {
  const displayName = (form.elements.namedItem("displayName") as HTMLInputElement | null)?.value.trim();
  const description = (form.elements.namedItem("description") as HTMLTextAreaElement | null)?.value.trim();
  const phone = (form.elements.namedItem("phone") as HTMLInputElement | null)?.value.trim();

  if (!displayName || displayName.length < 2) {
    toastError("Enter your business name first, then add your photo.");
    return false;
  }
  if (!description || description.length < 20) {
    toastError("Add your description (at least 20 characters), then add your photo.");
    return false;
  }
  if (!phone || phone.length < 9) {
    toastError("Enter your phone number first, then add your photo.");
    return false;
  }
  return true;
}

export function KfProfilePhotoField({
  listingId,
  profileImageUrl,
  disabled,
  wizardFormRef,
}: Props) {
  const router = useRouter();
  const toast = useKfToast();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const shownUrl = profileImageUrl ?? localPreviewUrl;
  const busy = disabled || pending || uploading;

  const uploadAndAttach = async (file: File) => {
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

      if (listingId) {
        const fd = new FormData();
        fd.set("url", data.url);
        startTransition(async () => {
          const result = await kfSetListingProfileImage(fd);
          if ("error" in result && result.error) toast.error(result.error);
          else {
            toast.success("Business photo updated.");
            setLocalPreviewUrl(null);
            router.refresh();
          }
        });
        return;
      }

      const form = wizardFormRef?.current;
      if (!form) {
        toast.error("Could not save photo — refresh and try again.");
        return;
      }
      if (!validateStep0ForPhoto(form, toast.error)) return;

      const fd = new FormData(form);
      fd.set("url", data.url);
      setLocalPreviewUrl(data.url);

      startTransition(async () => {
        const result = await kfSaveListingProfileFromWizard(fd);
        if ("error" in result && result.error) {
          toast.error(result.error);
          setLocalPreviewUrl(null);
          return;
        }
        toast.success("Business photo saved.");
        router.refresh();
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="kf-profile-photo-field">
      <div className="kf-profile-photo-preview">
        {shownUrl ? (
          <>
            <KfListingImage
              src={shownUrl}
              alt=""
              className="h-28 w-28 rounded-xl object-cover ring-2 ring-white shadow-sm"
              priority
            />
            {listingId ? (
              <button
                type="button"
                className="kf-profile-photo-remove"
                aria-label="Remove business photo"
                disabled={busy}
                onClick={() => {
                  startTransition(async () => {
                    const result = await kfClearListingProfileImage();
                    if ("error" in result && result.error) toast.error(result.error);
                    else {
                      toast.success("Business photo removed.");
                      setLocalPreviewUrl(null);
                      router.refresh();
                    }
                  });
                }}
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </button>
            ) : null}
          </>
        ) : (
          <div className="kf-profile-photo-placeholder">
            <Building2 className="h-8 w-8 text-[var(--kf-sage)]" aria-hidden />
            <span className="text-xs text-[var(--kf-muted-soft)]">No photo yet</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="kf-label mb-1">Business photo</p>
        <p className="text-xs leading-relaxed text-[var(--kf-muted)]">
          Shown at the top of your public listing — your logo, storefront, or a clear photo of you
          at work. Square or portrait works best.
          {!listingId ? (
            <>
              {" "}
              Fill in your name, description, and phone above, then tap below to add your photo.
            </>
          ) : null}
        </p>
        <label className="relative mt-3 block">
          <span className="kf-file-input">
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  await uploadAndAttach(file);
                } finally {
                  e.target.value = "";
                }
              }}
            />
            {uploading ? "Uploading…" : shownUrl ? "Replace photo" : "Add business photo"}
          </span>
        </label>
      </div>
    </div>
  );
}
