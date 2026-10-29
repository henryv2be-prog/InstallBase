"use server";

import { revalidatePath } from "next/cache";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

function dbGuard() {
  if (!isKasiFindDbConfigured()) {
    return { error: "KasiFind database is not configured (KASIFIND_DATABASE_URL)." };
  }
  return null;
}

async function audit(adminId: string, action: string, targetId: string | null, detail?: string) {
  const kf = getKasiFindPrisma();
  await kf.kfAdminAudit.create({
    data: { adminId, action, targetId, detail: detail ?? null },
  });
}

export async function kfAdminModerateListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("listingId") as string | null)?.trim();
  const decision = (formData.get("decision") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };
  if (decision !== "APPROVED" && decision !== "REJECTED" && decision !== "DISABLED") {
    return { error: "Invalid moderation decision." };
  }

  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found." };

  const data =
    decision === "DISABLED"
      ? { status: "DISABLED" as const, moderationStatus: listing.moderationStatus }
      : {
          moderationStatus: decision as "APPROVED" | "REJECTED",
          status: decision === "APPROVED" ? ("PUBLISHED" as const) : listing.status,
        };

  await kf.kfProviderListing.update({ where: { id: listingId }, data });
  await audit(auth.user.id, `listing.${decision.toLowerCase()}`, listingId);

  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath("/");
  revalidatePath(`/providers/${listingId}`);
  return { success: true };
}

export async function kfAdminSetListingFeatured(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("listingId") as string | null)?.trim();
  const featured = formData.get("featured") === "true";
  if (!listingId) return { error: "Listing id required." };

  const kf = getKasiFindPrisma();
  await kf.kfProviderListing.update({
    where: { id: listingId },
    data: { featured, featuredAt: featured ? new Date() : null },
  });
  await audit(auth.user.id, featured ? "listing.featured" : "listing.unfeatured", listingId);
  revalidatePath("/admin/listings");
  revalidatePath("/");
  return { success: true };
}

export async function kfAdminSetListingFeaturedAction(formData: FormData): Promise<void> {
  await kfAdminSetListingFeatured(formData);
}

export async function kfAdminUnpublishListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("listingId") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };

  const kf = getKasiFindPrisma();
  await kf.kfProviderListing.update({
    where: { id: listingId },
    data: { status: "DRAFT", moderationStatus: "PENDING" },
  });
  await audit(auth.user.id, "listing.unpublished", listingId);
  revalidatePath("/admin/listings");
  revalidatePath("/");
  return { success: true };
}

export async function kfAdminUnpublishListingAction(formData: FormData): Promise<void> {
  await kfAdminUnpublishListing(formData);
}

export async function kfAdminDeleteListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const listingId = (formData.get("listingId") as string | null)?.trim();
  if (!listingId) return { error: "Listing id required." };

  const kf = getKasiFindPrisma();
  await kf.kfProviderListing.delete({ where: { id: listingId } });
  await audit(auth.user.id, "listing.deleted", listingId);
  revalidatePath("/admin/listings");
  revalidatePath("/");
  return { success: true };
}

export async function kfAdminDeleteListingAction(formData: FormData): Promise<void> {
  await kfAdminDeleteListing(formData);
}

export async function kfAdminUpdateUser(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const userId = (formData.get("userId") as string | null)?.trim();
  const role = (formData.get("role") as string | null)?.trim();
  const suspendedRaw = formData.get("suspended");
  if (!userId) return { error: "User id required." };

  const kf = getKasiFindPrisma();
  if (userId === auth.user.id && suspendedRaw === "true") {
    return { error: "You cannot suspend your own admin account." };
  }

  const data: { role?: "PROVIDER" | "ADMIN"; suspended?: boolean; name?: string } = {};
  if (role === "ADMIN" || role === "PROVIDER") data.role = role;
  if (suspendedRaw === "true") data.suspended = true;
  if (suspendedRaw === "false") data.suspended = false;
  const name = (formData.get("name") as string | null)?.trim();
  if (name) data.name = name;

  await kf.kfUser.update({ where: { id: userId }, data });
  await audit(auth.user.id, "user.updated", userId, JSON.stringify(data));
  revalidatePath("/admin/users");
  return { success: true };
}

export async function kfAdminUpdateUserAction(formData: FormData): Promise<void> {
  await kfAdminUpdateUser(formData);
}

export async function kfAdminDeleteUser(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const userId = (formData.get("userId") as string | null)?.trim();
  if (!userId) return { error: "User id required." };
  if (userId === auth.user.id) return { error: "You cannot delete your own account." };

  const kf = getKasiFindPrisma();
  await kf.kfUser.delete({ where: { id: userId } });
  await audit(auth.user.id, "user.deleted", userId);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function kfAdminDeleteUserAction(formData: FormData): Promise<void> {
  await kfAdminDeleteUser(formData);
}

export async function kfAdminUpsertCategory(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const id = (formData.get("id") as string | null)?.trim();
  const name = (formData.get("name") as string | null)?.trim();
  const slug = (formData.get("slug") as string | null)?.trim().toLowerCase();
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);

  if (!name || !slug) return { error: "Name and slug are required." };

  const kf = getKasiFindPrisma();
  if (id) {
    await kf.kfCategory.update({
      where: { id },
      data: { name, slug, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
    });
    await audit(auth.user.id, "category.updated", id);
  } else {
    const created = await kf.kfCategory.create({
      data: { name, slug, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
    });
    await audit(auth.user.id, "category.created", created.id);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function kfAdminUpsertCategoryAction(formData: FormData): Promise<void> {
  await kfAdminUpsertCategory(formData);
}

export async function kfAdminDeleteCategory(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const id = (formData.get("id") as string | null)?.trim();
  if (!id) return { error: "Category id required." };

  const kf = getKasiFindPrisma();
  const linked = await kf.kfListingCategory.count({ where: { categoryId: id } });
  if (linked > 0) return { error: "Remove this category from listings before deleting." };

  await kf.kfCategory.delete({ where: { id } });
  await audit(auth.user.id, "category.deleted", id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function kfAdminDeleteCategoryAction(formData: FormData): Promise<void> {
  await kfAdminDeleteCategory(formData);
}

/** Form-friendly wrapper (no return value). */
export async function kfAdminModerateListingAction(formData: FormData): Promise<void> {
  await kfAdminModerateListing(formData);
}

export async function kfAdminResolveReport(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const reportId = (formData.get("reportId") as string | null)?.trim();
  if (!reportId) return { error: "Report id required." };

  const kf = getKasiFindPrisma();
  await kf.kfReport.update({ where: { id: reportId }, data: { resolved: true } });
  await audit(auth.user.id, "report.resolved", reportId);

  revalidatePath("/admin");
  return { success: true };
}

export async function kfAdminResolveReportAction(formData: FormData): Promise<void> {
  await kfAdminResolveReport(formData);
}

export async function kfReportListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const listingId = (formData.get("listingId") as string | null)?.trim();
  const reason = (formData.get("reason") as string | null)?.trim();
  const details = (formData.get("details") as string | null)?.trim() || null;
  if (!listingId || !reason || reason.length < 4) {
    return { error: "Please describe why you are reporting this listing." };
  }

  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found." };

  await kf.kfReport.create({
    data: { listingId, reason, details },
  });
  return { success: true };
}
