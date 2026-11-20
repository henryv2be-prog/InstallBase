import {
  kfAddListingPhoto,
  kfSetListingProfileImage,
} from "@/lib/kasifind/actions";
import { uploadListingImageFile } from "@/lib/kasifind/upload-file-client";
import {
  MAX_LISTING_WORK_PHOTOS,
  planWorkPhotoUploads,
} from "@/lib/kasifind/listing-photo-limits";

export type GuestPendingPhotos = {
  profileFile: File | null;
  workFiles: File[];
};

export function countGuestPendingPhotos(pending: GuestPendingPhotos): number {
  return (pending.profileFile ? 1 : 0) + pending.workFiles.length;
}

/** Upload staged guest picks after account + listing are created (session required). */
export async function attachGuestPendingPhotos(
  pending: GuestPendingPhotos
): Promise<{ error?: string; uploadedWork: number; profileSet: boolean }> {
  let profileSet = false;
  let uploadedWork = 0;

  if (pending.profileFile) {
    const uploaded = await uploadListingImageFile(pending.profileFile, () => {});
    if ("error" in uploaded) return { error: uploaded.error, uploadedWork, profileSet };
    const fd = new FormData();
    fd.set("url", uploaded.url);
    const result = await kfSetListingProfileImage(fd);
    if ("error" in result && result.error) return { error: result.error, uploadedWork, profileSet };
    profileSet = true;
  }

  const { accepted } = planWorkPhotoUploads(pending.workFiles, 0, 0);
  for (const file of accepted.slice(0, MAX_LISTING_WORK_PHOTOS)) {
    const uploaded = await uploadListingImageFile(file, () => {});
    if ("error" in uploaded) return { error: uploaded.error, uploadedWork, profileSet };
    const fd = new FormData();
    fd.set("url", uploaded.url);
    const add = await kfAddListingPhoto(fd);
    if ("error" in add && add.error) return { error: add.error, uploadedWork, profileSet };
    uploadedWork += 1;
  }

  return { uploadedWork, profileSet };
}