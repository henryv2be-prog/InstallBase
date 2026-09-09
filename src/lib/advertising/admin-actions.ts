"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type {
  AdStatus,
  AdType,
  CampaignStatus,
  PricingModel,
  Prisma,
} from "@/generated/prisma/client";
import { sanitizeAdText } from "./security";
import { parseTargetingRules } from "./targeting";
import {
  advertisementFormErrorSummary,
  parsePlacementsFromForm,
  validateAdvertisementForm,
} from "./admin-validation";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

function parseTargetingJson(raw: FormDataEntryValue | null) {
  const text = String(raw ?? "").trim();
  if (!text) return {};
  try {
    return parseTargetingRules(JSON.parse(text));
  } catch {
    return {};
  }
}

export async function upsertAdvertiser(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const name = sanitizeAdText(String(formData.get("name") ?? ""), 120);
  if (!name) return { error: "Name is required" };

  const slugBase = slugify(name);
  let slug = slugBase;
  let n = 0;
  while (await prisma.advertiser.findFirst({ where: { slug, ...(id ? { NOT: { id } } : {}) } })) {
    n += 1;
    slug = `${slugBase}-${n}`;
  }
  const data = {
    name,
    slug,
    description: sanitizeAdText(String(formData.get("description") ?? ""), 500) || null,
    website: sanitizeAdDestinationUrl(String(formData.get("website") ?? "")) || null,
    contactEmail: sanitizeAdText(String(formData.get("contactEmail") ?? ""), 120) || null,
    contactPhone: sanitizeAdText(String(formData.get("contactPhone") ?? ""), 40) || null,
    companyType: sanitizeAdText(String(formData.get("companyType") ?? ""), 80) || null,
    logoUrl: isAllowedMediaUrl(String(formData.get("logoUrl") ?? ""))
      ? String(formData.get("logoUrl") ?? "").trim() || null
      : null,
  };

  if (id) {
    await prisma.advertiser.update({ where: { id }, data });
  } else {
    await prisma.advertiser.create({ data });
  }

  revalidatePath("/admin/ads");
  return { success: true };
}

export async function upsertCampaign(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const advertiserId = String(formData.get("advertiserId") ?? "");
  const name = sanitizeAdText(String(formData.get("name") ?? ""), 120);
  if (!advertiserId || !name) return { error: "Advertiser and name are required" };

  const status = (formData.get("status") as CampaignStatus) || "DRAFT";
  const pricingModel = (formData.get("pricingModel") as PricingModel) || null;
  const budgetRaw = formData.get("budget");
  const budget = budgetRaw ? Number(budgetRaw) : null;
  const priority = Number(formData.get("priority") ?? 0);
  const startDate = formData.get("startDate")
    ? new Date(String(formData.get("startDate")))
    : null;
  const endDate = formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null;

  const data = {
    advertiserId,
    name,
    description: sanitizeAdText(String(formData.get("description") ?? ""), 500) || null,
    status,
    pricingModel: pricingModel || null,
    budget,
    priority: Number.isFinite(priority) ? priority : 0,
    startDate,
    endDate,
  };

  if (id) {
    await prisma.adCampaign.update({ where: { id }, data });
  } else {
    await prisma.adCampaign.create({ data });
  }

  revalidatePath("/admin/ads");
  return { success: true };
}

export async function upsertAdvertisement(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const { errors, data: validated } = validateAdvertisementForm(formData);

  if (!validated) {
    return {
      error: advertisementFormErrorSummary(errors),
      fields: errors,
    };
  }

  const {
    campaignId,
    advertiserId,
    title,
    type,
    destinationUrl,
    isInternal,
    mediaUrl,
    placements,
  } = validated;

  const data = {
    campaignId,
    advertiserId,
    title,
    description: sanitizeAdText(String(formData.get("description") ?? ""), 500) || null,
    type,
    placements,
    status: (formData.get("status") as AdStatus) || "DRAFT",
    mediaUrl,
    mediaType: String(formData.get("mediaType") ?? "").trim() || null,
    destinationUrl,
    ctaText: sanitizeAdText(String(formData.get("ctaText") ?? ""), 40) || null,
    isInternalLink: isInternal,
    sponsoredProductId: String(formData.get("sponsoredProductId") ?? "").trim() || null,
    sponsoredPostId: String(formData.get("sponsoredPostId") ?? "").trim() || null,
    priority: Number(formData.get("priority") ?? 0) || 0,
    startDate: formData.get("startDate")
      ? new Date(String(formData.get("startDate")))
      : null,
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null,
    targetingRules: parseTargetingJson(formData.get("targetingRules")) as Prisma.InputJsonValue,
  };

  if (id) {
    await prisma.advertisement.update({ where: { id }, data });
  } else {
    await prisma.advertisement.create({ data });
  }

  revalidatePath("/admin/ads");
  return { success: true };
}

export async function updateAdStatus(adId: string, status: AdStatus) {
  await requireAdmin();
  await prisma.advertisement.update({ where: { id: adId }, data: { status } });
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function updateCampaignStatus(campaignId: string, status: CampaignStatus) {
  await requireAdmin();
  await prisma.adCampaign.update({ where: { id: campaignId }, data: { status } });
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function deleteAdvertisement(adId: string) {
  await requireAdmin();
  const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
  if (!ad) return { error: "Advertisement not found" };

  await prisma.advertisement.delete({ where: { id: adId } });
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function duplicateAdvertisement(adId: string) {
  await requireAdmin();
  const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
  if (!ad) return { error: "Advertisement not found" };

  const { id: _id, impressions, clicks, uniqueImpressions, uniqueClicks, createdAt, updatedAt, ...rest } = ad;
  await prisma.advertisement.create({
    data: {
      ...rest,
      title: `${rest.title} (copy)`,
      status: "DRAFT",
      impressions: 0,
      clicks: 0,
      uniqueImpressions: 0,
      uniqueClicks: 0,
    },
  });

  revalidatePath("/admin/ads");
  return { success: true };
}

export async function updateAdSettings(formData: FormData) {
  await requireAdmin();
  await prisma.adSettings.upsert({
    where: { id: "global" },
    create: { id: "global" },
    update: {
      adsEnabled: formData.get("adsEnabled") === "true",
      sponsoredEnabled: formData.get("sponsoredEnabled") === "true",
      analyticsEnabled: formData.get("analyticsEnabled") === "true",
      maxFeedAds: Number(formData.get("maxFeedAds") ?? 3),
      minPostsBetweenAds: Number(formData.get("minPostsBetweenAds") ?? 4),
      maxPageAds: Number(formData.get("maxPageAds") ?? 5),
      mobileMaxFeedAds: Number(formData.get("mobileMaxFeedAds") ?? 2),
      desktopMaxFeedAds: Number(formData.get("desktopMaxFeedAds") ?? 3),
      defaultPriority: Number(formData.get("defaultPriority") ?? 0),
      provider: String(formData.get("provider") ?? "internal"),
    },
  });
  revalidatePath("/admin/ads");
  return { success: true };
}

export async function toggleInventoryPlacement(placementKey: string, enabled: boolean) {
  await requireAdmin();
  await prisma.adInventory.update({
    where: { placementKey },
    data: { enabled },
  });
  revalidatePath("/admin/ads");
  return { success: true };
}
