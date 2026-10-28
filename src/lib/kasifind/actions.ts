"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import {
  clearKasiFindSession,
  getKasiFindSessionUser,
  requireKasiFindProvider,
  setKasiFindSession,
} from "@/lib/kasifind/session";
import { isValidSaCoordinate, parseCoordinate } from "@/lib/kasifind/geo";
import { validatePassword } from "@/lib/auth-validation";

function dbGuard() {
  if (!isKasiFindDbConfigured()) {
    return { error: "KasiFind database is not configured (KASIFIND_DATABASE_URL)." };
  }
  return null;
}

export async function kfRegisterProvider(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const name = (formData.get("name") as string | null)?.trim();

  if (!email || !password) return { error: "Email and password are required." };
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const kf = getKasiFindPrisma();
  const existing = await kf.kfUser.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await kf.kfUser.create({
    data: { email, passwordHash, name: name || null, role: "PROVIDER" },
  });

  await setKasiFindSession(user.id);
  return { success: true };
}

export async function kfSignInProvider(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  if (!email || !password) return { error: "Email and password are required." };

  const kf = getKasiFindPrisma();
  const user = await kf.kfUser.findUnique({ where: { email } });
  if (!user?.passwordHash || user.suspended) return { error: "Invalid email or password." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password." };

  await setKasiFindSession(user.id);
  return { success: true };
}

export async function kfSignOutProvider() {
  await clearKasiFindSession();
  return { success: true };
}

export async function kfUpsertListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const displayName = (formData.get("displayName") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim();
  const whatsapp = (formData.get("whatsapp") as string | null)?.trim() || null;
  const locationLabel = (formData.get("locationLabel") as string | null)?.trim();
  const priceHint = (formData.get("priceHint") as string | null)?.trim() || null;
  const hoursNote = (formData.get("hoursNote") as string | null)?.trim() || null;
  const servicesRaw = (formData.get("services") as string | null)?.trim() ?? "";
  const categoryIds = formData.getAll("categoryId").map(String).filter(Boolean);
  const publish = formData.get("publish") === "true";

  const lat = parseCoordinate(formData.get("latitude") as string);
  const lng = parseCoordinate(formData.get("longitude") as string);

  if (!displayName || displayName.length < 2) return { error: "Business name is required." };
  if (!description || description.length < 20) return { error: "Description must be at least 20 characters." };
  if (!phone || phone.length < 9) return { error: "A valid phone number is required." };
  if (!locationLabel) return { error: "Neighbourhood or landmark is required." };
  if (lat === null || lng === null || !isValidSaCoordinate(lat, lng)) {
    return { error: "Set a valid location in South Africa on the map." };
  }
  if (categoryIds.length === 0) return { error: "Select at least one category." };

  const serviceLines = servicesRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);

  const kf = getKasiFindPrisma();
  const existing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });

  const data = {
    displayName,
    description,
    phone,
    whatsapp,
    locationLabel,
    latitude: lat,
    longitude: lng,
    priceHint,
    hoursNote,
    status: publish ? ("PUBLISHED" as const) : ("DRAFT" as const),
    moderationStatus: publish ? ("PENDING" as const) : ("PENDING" as const),
  };

  const listing = existing
    ? await kf.kfProviderListing.update({
        where: { id: existing.id },
        data,
      })
    : await kf.kfProviderListing.create({
        data: { ...data, userId: auth.user.id },
      });

  await kf.kfListingCategory.deleteMany({ where: { listingId: listing.id } });
  await kf.kfListingCategory.createMany({
    data: categoryIds.map((categoryId) => ({ listingId: listing.id, categoryId })),
  });

  await kf.kfProviderService.deleteMany({ where: { listingId: listing.id } });
  if (serviceLines.length > 0) {
    await kf.kfProviderService.createMany({
      data: serviceLines.map((name) => ({
        listingId: listing.id,
        name,
        keywords: name.toLowerCase(),
      })),
    });
  }

  revalidatePath("/kasifind");
  revalidatePath(`/kasifind/provider/${listing.id}`);
  revalidatePath("/kasifind/provider/listing");

  return { success: true, listingId: listing.id };
}

export async function kfSubmitReview(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const listingId = (formData.get("listingId") as string | null)?.trim();
  const rating = Number.parseInt(String(formData.get("rating") ?? ""), 10);
  const body = (formData.get("body") as string | null)?.trim();
  const authorName = (formData.get("authorName") as string | null)?.trim() || null;

  if (!listingId) return { error: "Listing not found." };
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return { error: "Rating must be 1–5 stars." };
  if (!body || body.length < 8) return { error: "Please write a short review." };

  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findFirst({
    where: { id: listingId, status: "PUBLISHED", moderationStatus: "APPROVED" },
  });
  if (!listing) return { error: "Listing not found." };

  const sessionUser = await getKasiFindSessionUser();

  await kf.kfReview.create({
    data: {
      listingId,
      rating,
      body,
      authorName: authorName ?? sessionUser?.name ?? "Community member",
      userId: sessionUser?.id ?? null,
      verified: false,
    },
  });

  revalidatePath(`/kasifind/provider/${listingId}`);
  return { success: true };
}

export async function kfAddListingPhoto(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const url = (formData.get("url") as string | null)?.trim();
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });
  if (!listing) return { error: "Create your listing first." };

  const count = await kf.kfProviderPhoto.count({ where: { listingId: listing.id } });
  if (count >= 12) return { error: "Maximum 12 work photos." };

  await kf.kfProviderPhoto.create({
    data: { listingId: listing.id, url, sortOrder: count },
  });

  revalidatePath("/kasifind/account/listing");
  revalidatePath(`/kasifind/provider/${listing.id}`);
  return { success: true };
}
