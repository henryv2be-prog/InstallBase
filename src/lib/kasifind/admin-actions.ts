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

  revalidatePath("/kasifind/admin");
  revalidatePath("/kasifind");
  revalidatePath(`/kasifind/provider/${listingId}`);
  return { success: true };
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

  revalidatePath("/kasifind/admin");
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
