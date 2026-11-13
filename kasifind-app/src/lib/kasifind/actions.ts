"use server";

import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getUploadDir } from "@/lib/shared/uploads";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import {
  clearKasiFindSession,
  getKasiFindSessionUser,
  requireKasiFindProvider,
  setKasiFindSession,
} from "@/lib/kasifind/session";
import { isValidSaCoordinate, parseCoordinate } from "@/lib/kasifind/geo";
import {
  applyParsedListingUpsert,
  parseListingUpsertFormData,
} from "@/lib/kasifind/listing-upsert-shared";
import { validatePassword } from "@/lib/shared/auth-validation";

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

/** Guest wizard: create account after listing steps 1–3, then save listing draft server-side. */
export async function kfRegisterProviderWithListing(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const email = (formData.get("guestEmail") as string | null)?.trim().toLowerCase();
  const password = formData.get("guestPassword") as string | null;
  const name = (formData.get("guestName") as string | null)?.trim();

  if (!email || !password) return { error: "Email and password are required." };
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const parsed = parseListingUpsertFormData(formData);
  if ("error" in parsed) return { error: parsed.error };
  if (parsed.data.publish) {
    parsed.data.publish = false;
  }

  const kf = getKasiFindPrisma();
  const existingUser = await kf.kfUser.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists. Sign in and open My listing." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await kf.kfUser.create({
    data: { email, passwordHash, name: name || null, role: "PROVIDER" },
  });

  const created = await kf.kfProviderListing.create({
    data: {
      userId: user.id,
      displayName: parsed.data.displayName,
      description: parsed.data.description,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      locationLabel: parsed.data.locationLabel,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      hideExactLocation: parsed.data.hideExactLocation,
      priceHint: parsed.data.priceHint,
      hoursNote: parsed.data.hoursNote,
      status: "DRAFT",
      moderationStatus: "PENDING",
      ...(parsed.data.profileImageUrl ? { profileImageUrl: parsed.data.profileImageUrl } : {}),
    },
  });

  await applyParsedListingUpsert(kf, created.id, parsed.data);
  await setKasiFindSession(user.id);

  revalidatePath("/");
  revalidatePath("/account/listing");
  revalidatePath(`/providers/${created.id}`);

  return { success: true, listingId: created.id };
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

  const parsed = parseListingUpsertFormData(formData);
  if ("error" in parsed) return { error: parsed.error };

  const kf = getKasiFindPrisma();
  const existing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });

  if (
    existing?.profileImageUrl &&
    parsed.data.profileImageUrl &&
    existing.profileImageUrl !== parsed.data.profileImageUrl
  ) {
    await deleteLocalUpload(existing.profileImageUrl);
  }

  let listingId: string;
  if (existing) {
    await applyParsedListingUpsert(kf, existing.id, parsed.data);
    listingId = existing.id;
  } else {
    const created = await kf.kfProviderListing.create({
      data: {
        userId: auth.user.id,
        displayName: parsed.data.displayName,
        description: parsed.data.description,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        locationLabel: parsed.data.locationLabel,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        hideExactLocation: parsed.data.hideExactLocation,
        priceHint: parsed.data.priceHint,
        hoursNote: parsed.data.hoursNote,
        status: parsed.data.publish ? "PUBLISHED" : "DRAFT",
        moderationStatus: "PENDING",
        ...(parsed.data.profileImageUrl ? { profileImageUrl: parsed.data.profileImageUrl } : {}),
      },
    });
    listingId = created.id;
    await applyParsedListingUpsert(kf, listingId, parsed.data);
  }

  revalidatePath("/");
  revalidatePath(`/providers/${listingId}`);
  revalidatePath("/account/listing");

  return { success: true, listingId };
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

  revalidatePath(`/providers/${listingId}`);
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

  revalidatePath("/account/listing");
  revalidatePath(`/providers/${listing.id}`);
  return { success: true };
}

async function deleteLocalUpload(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  const filename = url.slice("/uploads/".length);
  const filePath = path.join(getUploadDir(), filename);
  await fs.unlink(filePath).catch(() => undefined);
}

/** Save business photo from wizard step 1 — creates a draft if needed (no full wizard save). */
export async function kfSaveListingProfileFromWizard(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;

  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const url = (formData.get("url") as string | null)?.trim();
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const displayName = (formData.get("displayName") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim();
  const whatsapp = (formData.get("whatsapp") as string | null)?.trim() || null;

  if (!displayName || displayName.length < 2) {
    return { error: "Enter your business name above, then add your photo." };
  }
  if (!description || description.length < 20) {
    return { error: "Add a short description (at least 20 characters), then add your photo." };
  }
  if (!phone || phone.length < 9) {
    return { error: "Enter your phone number above, then add your photo." };
  }

  const locationLabel = (formData.get("locationLabel") as string | null)?.trim();
  const lat = parseCoordinate(formData.get("latitude") as string);
  const lng = parseCoordinate(formData.get("longitude") as string);
  const locationConfirmed = formData.get("locationConfirmed") === "true";
  const hideExactLocation = formData.get("hideExactLocation") !== "false";

  const kf = getKasiFindPrisma();
  const existing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });

  if (existing?.profileImageUrl && existing.profileImageUrl !== url) {
    await deleteLocalUpload(existing.profileImageUrl);
  }

  const hasNewCoords =
    locationConfirmed && lat !== null && lng !== null && isValidSaCoordinate(lat, lng);

  if (!existing && !hasNewCoords) {
    return {
      error:
        "Go to the Location step and set your area on the map (or use My location) before adding your business photo.",
    };
  }

  const listing = existing
    ? await kf.kfProviderListing.update({
        where: { id: existing.id },
        data: {
          displayName,
          description,
          phone,
          whatsapp,
          ...(locationLabel ? { locationLabel: existing.locationLabel || locationLabel } : {}),
          ...(hasNewCoords
            ? { latitude: lat!, longitude: lng! }
            : {}),
          hideExactLocation,
          profileImageUrl: url,
        },
      })
    : await kf.kfProviderListing.create({
        data: {
          userId: auth.user.id,
          displayName,
          description,
          phone,
          whatsapp,
          locationLabel: locationLabel || "Service area",
          latitude: lat!,
          longitude: lng!,
          hideExactLocation,
          profileImageUrl: url,
          status: "DRAFT",
          moderationStatus: "PENDING",
        },
      });

  revalidatePath("/account/listing");
  revalidatePath(`/providers/${listing.id}`);
  revalidatePath("/");
  return { success: true, listingId: listing.id };
}

export async function kfSetListingProfileImage(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const url = (formData.get("url") as string | null)?.trim();
  if (!url || !url.startsWith("/uploads/")) return { error: "Invalid photo." };

  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });
  if (!listing) return { error: "Save a draft of your listing first, then add your business photo." };

  if (listing.profileImageUrl && listing.profileImageUrl !== url) {
    await deleteLocalUpload(listing.profileImageUrl);
  }

  await kf.kfProviderListing.update({
    where: { id: listing.id },
    data: { profileImageUrl: url },
  });

  revalidatePath("/account/listing");
  revalidatePath(`/providers/${listing.id}`);
  revalidatePath("/");
  return { success: true };
}

export async function kfClearListingProfileImage() {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({ where: { userId: auth.user.id } });
  if (!listing) return { error: "Listing not found." };

  await kf.kfProviderListing.update({
    where: { id: listing.id },
    data: { profileImageUrl: null },
  });
  await deleteLocalUpload(listing.profileImageUrl);

  revalidatePath("/account/listing");
  revalidatePath(`/providers/${listing.id}`);
  revalidatePath("/");
  return { success: true };
}

export async function kfRemoveListingPhoto(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindProvider();
  if ("error" in auth) return auth;

  const photoId = (formData.get("photoId") as string | null)?.trim();
  if (!photoId) return { error: "Photo not found." };

  const kf = getKasiFindPrisma();
  const photo = await kf.kfProviderPhoto.findFirst({
    where: { id: photoId, listing: { userId: auth.user.id } },
    select: { id: true, url: true, listingId: true },
  });
  if (!photo) return { error: "Photo not found." };

  await kf.kfProviderPhoto.delete({ where: { id: photo.id } });

  if (photo.url.startsWith("/uploads/")) {
    const filename = photo.url.slice("/uploads/".length);
    const filePath = path.join(getUploadDir(), filename);
    await fs.unlink(filePath).catch(() => undefined);
  }

  revalidatePath("/account/listing");
  revalidatePath(`/providers/${photo.listingId}`);
  return { success: true };
}
