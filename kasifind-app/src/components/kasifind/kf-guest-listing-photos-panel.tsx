"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { Building2, Camera, X } from "lucide-react";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import {
  MAX_LISTING_WORK_PHOTOS,
  planWorkPhotoUploads,
} from "@/lib/kasifind/listing-photo-limits";
import { useKfToast } from "@/components/kasifind/kf-toast";
import type { GuestPendingPhotos } from "@/lib/kasifind/guest-listing-pending-photos";

type WorkPreview = { id: string; file: File; previewUrl: string };

function revokeObjectUrl(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function KfGuestListingPhotosPanel({
  pending,
  onChange,
}: {
  pending: GuestPendingPhotos;
  onChange: (next: GuestPendingPhotos) => void;
}) {
  const toast = useKfToast();
  const profileInputId = useId();
  const workInputId = useId();
  const workPreviewsRef = useRef<WorkPreview[]>([]);

  const workPreviews = useMemo(() => {
    for (const row of workPreviewsRef.current) {
      if (!pending.workFiles.includes(row.file)) revokeObjectUrl(row.previewUrl);
    }
    const next: WorkPreview[] = pending.workFiles.map((file) => {
      const existing = workPreviewsRef.current.find((r) => r.file === file);
      if (existing) return existing;
      return { id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) };
    });
    workPreviewsRef.current = next;
    return next;
  }, [pending.workFiles]);

  const profilePreviewUrl = useMemo(() => {
    if (!pending.profileFile) return null;
    return URL.createObjectURL(pending.profileFile);
  }, [pending.profileFile]);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) revokeObjectUrl(profilePreviewUrl);
    };
  }, [profilePreviewUrl]);

  useEffect(() => {
    return () => {
      for (const row of workPreviewsRef.current) revokeObjectUrl(row.previewUrl);
    };
  }, []);

  const workCount = pending.workFiles.length;
  const atWorkLimit = workCount >= MAX_LISTING_WORK_PHOTOS;

  const onProfilePick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
      toast.error("Please choose a photo (JPG, PNG, WebP).");
      return;
    }
    onChange({ ...pending, profileFile: file });
  };

  const onWorkPick = (files: FileList | null) => {
    if (!files?.length) return;
    const { accepted, skippedNonImage, skippedOverLimit } = planWorkPhotoUploads(
      Array.from(files),
      workCount,
      0
    );
    if (skippedNonImage > 0) toast.error("Only image files (JPG, PNG, WebP) can be added as work photos.");
    if (skippedOverLimit > 0) toast.error("Maximum 12 work photos — extra files were not added.");
    if (accepted.length === 0) return;
    onChange({ ...pending, workFiles: [...pending.workFiles, ...accepted] });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs leading-relaxed text-[var(--kf-muted)]">
        Pick photos now — we save them to your listing right after you create your free account on
        the last step.
      </p>

      <div className="kf-profile-photo-field">
        <div className="kf-profile-photo-preview">
          {profilePreviewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profilePreviewUrl}
                alt=""
                className="h-28 w-28 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
              <button
                type="button"
                className="kf-profile-photo-remove"
                aria-label="Remove company logo or profile photo"
                onClick={() => onChange({ ...pending, profileFile: null })}
              >
                <X className="h-4 w-4" aria-hidden />
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
          <p className="kf-label mb-1">Company logo / profile photo</p>
          <p className="text-xs leading-relaxed text-[var(--kf-muted)]">
            Shown at the top of your listing — your logo, storefront, or a clear photo of you at work.
          </p>
          <label htmlFor={profileInputId} className="kf-btn kf-btn-outline mt-3 inline-flex cursor-pointer">
            {pending.profileFile ? "Change logo or profile photo" : "Add logo or profile photo"}
          </label>
          <input
            id={profileInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              onProfilePick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {workCount > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {workPreviews.map((row, index) => (
            <li key={row.id} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.previewUrl} alt={`Work photo ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
                aria-label={`Remove work photo ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...pending,
                    workFiles: pending.workFiles.filter((f) => f !== row.file),
                  })
                }
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <KfEmptyState
          icon={<Camera className="h-6 w-6" aria-hidden />}
          title="No work photos yet"
          description="Add at least one clear photo of your work. Customers often message before they visit — photos help them choose you with confidence."
        />
      )}

      <div className="kf-work-photo-upload">
        <label htmlFor={workInputId} className="relative mt-4 block">
          <span className="kf-file-input">
            <input
              id={workInputId}
              type="file"
              accept="image/*"
              multiple
              disabled={atWorkLimit}
              onChange={(e) => {
                onWorkPick(e.target.files);
                e.target.value = "";
              }}
            />
            {atWorkLimit
              ? "Maximum work photos reached"
              : "Tap to add photos (select several at once)"}
          </span>
        </label>
      </div>
    </div>
  );
}