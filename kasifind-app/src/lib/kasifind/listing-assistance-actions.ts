"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";
import { canProviderSubmitListingAssistance } from "@/lib/kasifind/listing-assistance-status";
import {
  applyParsedListingUpsert,
  diffListingSnapshots,
  loadListingUpsertSnapshot,
  parseListingUpsertFormData,
} from "@/lib/kasifind/listing-upsert-shared";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import {
  requireKasiFindAdmin,
  requireKasiFindProvider,
} from "@/lib/kasifind/session";
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

async function assertAssistanceRequestForAdmin(requestId: string, adminId: string) {
  const kf = getKasiFindPrisma();
  const request = await kf.kfListingAssistanceRequest.findUnique({
    where: { id: requestId },
    include: { listing: true },
  });
  if (!request) return { error: "Assistance request not found." as const };
  return { request, adminId };
}

export async function kfSubmitListingAssistanceRequest(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const message = (formData.get("providerMessage") as string | null)?.trim() || null;
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });
  if (!listing) {
    return { error: "Create your listing first, then you can request help." };
  }

  const latest = await kf.kfListingAssistanceRequest.findFirst({
    where: { listingId: listing.id },
    orderBy: { createdAt: "desc" },
  });
  if (!canProviderSubmitListingAssistance(latest?.status ?? null)) {
    return { error: "You already have an open assistance request for this listing." };
  }

  await kf.kfListingAssistanceRequest.create({
    data: {
      listingId: listing.id,
      userId: auth.user.id,
      providerMessage: message,
      status: "PENDING",
    },
  });

  revalidatePath("/account/listing");
  revalidatePath("/admin/listing-assistance");
  return { success: true };
}

export async function kfAdminUpdateAssistanceStatus(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("requestId") as string | null)?.trim();
  const toStatus = (formData.get("status") as string | null)?.trim() as KfListingAssistanceStatus;
  const note = (formData.get("note") as string | null)?.trim() || null;

  if (!requestId) return { error: "Request id required." };
  const allowed: KfListingAssistanceStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "DECLINED",
  ];
  if (!allowed.includes(toStatus)) return { error: "Invalid status." };

  const kf = getKasiFindPrisma();
  const request = await kf.kfListingAssistanceRequest.findUnique({ where: { id: requestId } });
  if (!request) return { error: "Request not found." };

  const fromStatus = request.status;
  if (fromStatus === toStatus) return { success: true };

  await kf.$transaction([
    kf.kfListingAssistanceRequest.update({
      where: { id: requestId },
      data: {
        status: toStatus,
        completedAt: toStatus === "COMPLETED" ? new Date() : request.completedAt,
      },
    }),
    kf.kfListingAssistanceStatusEvent.create({
      data: {
        requestId,
        fromStatus,
        toStatus,
        adminId: auth.user.id,
        note,
      },
    }),
  ]);

  revalidatePath("/admin/listing-assistance");
  revalidatePath(`/admin/listing-assistance/${requestId}`);
  revalidatePath("/account/listing");
  return { success: true };
}

export async function kfAdminSaveAssistanceNotes(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("requestId") as string | null)?.trim();
  const adminNotes = (formData.get("adminNotes") as string | null)?.trim() || null;
  if (!requestId) return { error: "Request id required." };

  const kf = getKasiFindPrisma();
  const updated = await kf.kfListingAssistanceRequest.updateMany({
    where: { id: requestId },
    data: { adminNotes },
  });
  if (updated.count === 0) return { error: "Request not found." };

  revalidatePath(`/admin/listing-assistance/${requestId}`);
  return { success: true };
}

export async function kfAdminAssistedUpsertListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("assistanceRequestId") as string | null)?.trim();
  if (!requestId) return { error: "Assistance request required." };

  const ctx = await assertAssistanceRequestForAdmin(requestId, auth.user.id);
  if ("error" in ctx) return ctx;
  const { request } = ctx;

  const parsed = parseListingUpsertFormData(formData);
  if ("error" in parsed) return { error: parsed.error };

  const kf = getKasiFindPrisma();
  const before = await loadListingUpsertSnapshot(kf, request.listingId);
  if (!before) return { error: "Listing not found." };

  if (
    before.profileImageUrl &&
    parsed.data.profileImageUrl &&
    before.profileImageUrl !== parsed.data.profileImageUrl
  ) {
    await deleteLocalUpload(before.profileImageUrl);
  }

  await applyParsedListingUpsert(kf, request.listingId, parsed.data, {
    preserveListingLifecycle: true,
  });

  const after = await loadListingUpsertSnapshot(kf, request.listingId);
  if (!after) return { error: "Listing not found after save." };

  const diffs = diffListingSnapshots(before, after);
  if (diffs.length > 0) {
    await kf.kfListingAssistanceAuditEntry.createMany({
      data: diffs.map((d) => ({
        requestId,
        listingId: request.listingId,
        adminId: auth.user.id,
        fieldName: d.fieldName,
        previousValue: d.previousValue,
        newValue: d.newValue,
      })),
    });
  }

  revalidatePath("/");
  revalidatePath(`/providers/${request.listingId}`);
  revalidatePath("/account/listing");
  revalidatePath(`/admin/listing-assistance/${requestId}`);
  return { success: true, listingId: request.listingId };
}

export async function kfAdminAssistedAddListingPhoto(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("assistanceRequestId") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim();
  if (!requestId) return { error: "Assistance request required." };
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const ctx = await assertAssistanceRequestForAdmin(requestId, auth.user.id);
  if ("error" in ctx) return ctx;
  const { request } = ctx;

  const kf = getKasiFindPrisma();
  const count = await kf.kfProviderPhoto.count({ where: { listingId: request.listingId } });
  if (count >= 12) return { error: "Maximum 12 work photos." };

  await kf.kfProviderPhoto.create({
    data: { listingId: request.listingId, url, sortOrder: count },
  });

  await kf.kfListingAssistanceAuditEntry.create({
    data: {
      requestId,
      listingId: request.listingId,
      adminId: auth.user.id,
      fieldName: "workPhoto.added",
      previousValue: String(count),
      newValue: url,
    },
  });

  revalidatePath(`/providers/${request.listingId}`);
  revalidatePath(`/admin/listing-assistance/${requestId}`);
  return { success: true };
}

export async function kfAdminAssistedRemoveListingPhoto(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("assistanceRequestId") as string | null)?.trim();
  const photoId = (formData.get("photoId") as string | null)?.trim();
  if (!requestId || !photoId) return { error: "Invalid request." };

  const ctx = await assertAssistanceRequestForAdmin(requestId, auth.user.id);
  if ("error" in ctx) return ctx;
  const { request } = ctx;

  const kf = getKasiFindPrisma();
  const photo = await kf.kfProviderPhoto.findFirst({
    where: { id: photoId, listingId: request.listingId },
  });
  if (!photo) return { error: "Photo not found." };

  await kf.kfProviderPhoto.delete({ where: { id: photo.id } });
  if (photo.url.startsWith("/uploads/")) {
    await deleteLocalUpload(photo.url);
  }

  await kf.kfListingAssistanceAuditEntry.create({
    data: {
      requestId,
      listingId: request.listingId,
      adminId: auth.user.id,
      fieldName: "workPhoto.removed",
      previousValue: photo.url,
      newValue: null,
    },
  });

  revalidatePath(`/providers/${request.listingId}`);
  revalidatePath(`/admin/listing-assistance/${requestId}`);
  return { success: true };
}

export async function kfAdminAssistedSetListingProfileImage(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("assistanceRequestId") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim();
  if (!requestId) return { error: "Assistance request required." };
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const ctx = await assertAssistanceRequestForAdmin(requestId, auth.user.id);
  if ("error" in ctx) return ctx;
  const { request } = ctx;

  const kf = getKasiFindPrisma();
  const listing = request.listing;
  const prev = listing.profileImageUrl;
  if (prev && prev !== url) await deleteLocalUpload(prev);

  await kf.kfProviderListing.update({
    where: { id: listing.id },
    data: { profileImageUrl: url },
  });

  if (prev !== url) {
    await kf.kfListingAssistanceAuditEntry.create({
      data: {
        requestId,
        listingId: listing.id,
        adminId: auth.user.id,
        fieldName: "profileImageUrl",
        previousValue: prev,
        newValue: url,
      },
    });
  }

  revalidatePath(`/providers/${listing.id}`);
  revalidatePath(`/admin/listing-assistance/${requestId}`);
  revalidatePath("/account/listing");
  return { success: true };
}

export async function kfAdminAssistedClearListingProfileImage(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const requestId = (formData.get("assistanceRequestId") as string | null)?.trim();
  if (!requestId) return { error: "Assistance request required." };

  const ctx = await assertAssistanceRequestForAdmin(requestId, auth.user.id);
  if ("error" in ctx) return ctx;
  const { request } = ctx;

  const kf = getKasiFindPrisma();
  const listing = request.listing;
  const prev = listing.profileImageUrl;

  await kf.kfProviderListing.update({
    where: { id: listing.id },
    data: { profileImageUrl: null },
  });
  await deleteLocalUpload(prev);

  if (prev) {
    await kf.kfListingAssistanceAuditEntry.create({
      data: {
        requestId,
        listingId: listing.id,
        adminId: auth.user.id,
        fieldName: "profileImageUrl",
        previousValue: prev,
        newValue: null,
      },
    });
  }

  revalidatePath(`/providers/${listing.id}`);
  revalidatePath(`/admin/listing-assistance/${requestId}`);
  revalidatePath("/account/listing");
  return { success: true };
}
