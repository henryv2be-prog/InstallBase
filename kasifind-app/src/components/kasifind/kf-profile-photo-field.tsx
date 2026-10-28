"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Building2, Loader2, X } from "lucide-react";
import {
  kfClearListingProfileImage,
  kfSetListingProfileImage,
} from "@/lib/kasifind/actions";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { useKfToast } from "@/components/kasifind/kf-toast";

type Props = {
  listingId: string | null;
  profileImageUrl: string | null;
  disabled?: boolean;
};

export function KfProfilePhotoField({ listingId, profileImageUrl, disabled }: Props) {
  const router = useRouter();
  const toast = useKfToast();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  if (!listingId) {
    return (
      <div className="kf-profile-photo-field kf-profile-photo-field--locked">
        <div className="kf-profile-photo-placeholder" aria-hidden>
          <Building2 className="h-8 w-8 text-[var(--kf-sage)]" />
        </div>
        <p className="text-sm text-[var(--kf-muted)]">
          Save a <strong>draft</strong> of your listing once — then you can add the business photo
          shown at the top of your public profile.
        </p>
      </div>
    );
  }

  const busy = disabled || pending || uploading;

  return (
    <div className="kf-profile-photo-field">
      <div className="kf-profile-photo-preview">
        {profileImageUrl ? (
          <>
            <KfListingImage
              src={profileImageUrl}
              alt=""
              className="h-28 w-28 rounded-xl object-cover ring-2 ring-white shadow-sm"
              priority
            />
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
                    router.refresh();
                  }
                });
              }}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
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
                  startTransition(async () => {
                    const result = await kfSetListingProfileImage(fd);
                    if ("error" in result && result.error) toast.error(result.error);
                    else {
                      toast.success("Business photo updated.");
                      router.refresh();
                    }
                  });
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
            {uploading ? "Uploading…" : profileImageUrl ? "Replace photo" : "Add business photo"}
          </span>
        </label>
      </div>
    </div>
  );
}
