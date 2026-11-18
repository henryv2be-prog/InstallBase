"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import {
  applyParsedListingUpsert,
  diffListingSnapshots,
  loadListingUpsertSnapshot,
  parseListingUpsertFormData,
} from "@/lib/kasifind/listing-upsert-shared";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";
import { getUploadDir } from "@/lib/shared/uploads";

function dbGuard() {
  if (!isKasiFindDbConfigured()) {
    return { error: "KasiFind database is not configured (KASIFIND_DATABASE_URL)." };
  }
  return null;
}

async function deleteLocalUpload(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  const filename = url.slice("/uploads/".length);
  const filePath = path.join(getUploadDir(), filename);
  await fs.unlink(filePath).catch(() => undefined);
}

async function assertAdminListing(listingId: string) {
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found." as const };
  return { listing };
}

async function auditListingFieldEdits(
  adminId: string,
  listingId: string,
  diffs: { fieldName: string; previousValue: string | null; newValue: string | null }[]
) {
  if (diffs.length === 0) return;
  const kf = getKasiFindPrisma();
  await kf.kfAdminAudit.createMany({
    data: diffs.map((d) => ({
      adminId,
      action: "listing.admin_edit",
      targetId: listingId,
      detail: `${d.fieldName}: ${d.previousValue ?? "—"} → ${d.newValue ?? "—"}`,
    })),
  });
}

async function auditSingleFieldEdit(
  adminId: string,
  listingId: string,
  fieldName: string,
  previousValue: string | null,
  newValue: string | null
) {
  await auditListingFieldEdits(adminId, listingId, [{ fieldName, previousValue, newValue }]);
}

function revalidateListingPaths(listingId: string) {
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath("/");
  revalidatePath(`/providers/${listingId}`);
  revalidatePath("/account/listing");
}

export async function kfAdminDirectUpsertListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("adminEditListingId") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };

  const ctx = await assertAdminListing(listingId);
  if ("error" in ctx) return ctx;

  const parsed = parseListingUpsertFormData(formData);
  if ("error" in parsed) return { error: parsed.error };

  const kf = getKasiFindPrisma();
  const before = await loadListingUpsertSnapshot(kf, listingId);
  if (!before) return { error: "Listing not found." };

  if (
    before.profileImageUrl &&
    parsed.data.profileImageUrl &&
    before.profileImageUrl !== parsed.data.profileImageUrl
  ) {
    await deleteLocalUpload(before.profileImageUrl);
  }

  await applyParsedListingUpsert(kf, listingId, parsed.data, { preserveListingLifecycle: true });

  const after = await loadListingUpsertSnapshot(kf, listingId);
  if (!after) return { error: "Listing not found after save." };

  const diffs = diffListingSnapshots(before, after);
  await auditListingFieldEdits(auth.user.id, listingId, diffs);

  revalidateListingPaths(listingId);
  return { success: true, listingId };
}

export async function kfAdminDirectAddListingPhoto(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("adminEditListingId") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const ctx = await assertAdminListing(listingId);
  if ("error" in ctx) return ctx;

  const kf = getKasiFindPrisma();
  const count = await kf.kfProviderPhoto.count({ where: { listingId } });
  if (count >= 12) return { error: "Maximum 12 work photos." };

  await kf.kfProviderPhoto.create({
    data: { listingId, url, sortOrder: count },
  });
  await auditSingleFieldEdit(auth.user.id, listingId, "workPhoto.added", String(count), url);

  revalidateListingPaths(listingId);
  return { success: true };
}

export async function kfAdminDirectRemoveListingPhoto(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("adminEditListingId") as string | null)?.trim();
  const photoId = (formData.get("photoId") as string | null)?.trim();
  if (!listingId || !photoId) return { error: "Invalid request." };

  const ctx = await assertAdminListing(listingId);
  if ("error" in ctx) return ctx;

  const kf = getKasiFindPrisma();
  const photo = await kf.kfProviderPhoto.findFirst({ where: { id: photoId, listingId } });
  if (!photo) return { error: "Photo not found." };

  await kf.kfProviderPhoto.delete({ where: { id: photo.id } });
  if (photo.url.startsWith("/uploads/")) await deleteLocalUpload(photo.url);

  await auditSingleFieldEdit(auth.user.id, listingId, "workPhoto.removed", photo.url, null);

  revalidateListingPaths(listingId);
  return { success: true };
}

export async function kfAdminDirectSetListingProfileImage(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("adminEditListingId") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const ctx = await assertAdminListing(listingId);
  if ("error" in ctx) return ctx;

  const kf = getKasiFindPrisma();
  const listing = ctx.listing;
  const prev = listing.profileImageUrl;
  if (prev && prev !== url) await deleteLocalUpload(prev);

  await kf.kfProviderListing.update({
    where: { id: listingId },
    data: { profileImageUrl: url },
  });

  if (prev !== url) {
    await auditSingleFieldEdit(auth.user.id, listingId, "profileImageUrl", prev, url);
  }

  revalidateListingPaths(listingId);
  return { success: true };
}

export async function kfAdminDirectClearListingProfileImage(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("adminEditListingId") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };

  const ctx = await assertAdminListing(listingId);
  if ("error" in ctx) return ctx;

  const kf = getKasiFindPrisma();
  const prev = ctx.listing.profileImageUrl;

  await kf.kfProviderListing.update({
    where: { id: listingId },
    data: { profileImageUrl: null },
  });
  await deleteLocalUpload(prev);

  if (prev) {
    await auditSingleFieldEdit(auth.user.id, listingId, "profileImageUrl", prev, null);
  }

  revalidateListingPaths(listingId);
  return { success: true };
}