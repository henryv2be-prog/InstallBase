import type { KfListingStatus, KfModerationStatus } from "@/generated/prisma/enums";
import { isValidSaCoordinate, parseCoordinate } from "@/lib/kasifind/geo";
import type { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export type ParsedListingUpsert = {
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  latitude: number;
  longitude: number;
  hideExactLocation: boolean;
  priceHint: string | null;
  hoursNote: string | null;
  publish: boolean;
  categoryIds: string[];
  serviceLines: string[];
  profileImageUrl: string | null;
};

export type ListingUpsertSnapshot = {
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  latitude: number;
  longitude: number;
  hideExactLocation: boolean;
  priceHint: string | null;
  hoursNote: string | null;
  status: KfListingStatus;
  moderationStatus: KfModerationStatus;
  profileImageUrl: string | null;
  categoryIds: string[];
  services: string[];
  photoUrls: string[];
};

export function parseListingUpsertFormData(
  formData: FormData
): { error: string } | { data: ParsedListingUpsert } {
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
  const hideExactLocation = formData.get("hideExactLocation") !== "false";
  const locationConfirmed = formData.get("locationConfirmed") === "true";

  if (!displayName || displayName.length < 2) return { error: "Business name is required." };
  if (!phone || phone.length < 9) return { error: "A valid phone number is required." };
  if (!locationLabel) return { error: "Neighbourhood or landmark is required." };
  if (
    !locationConfirmed ||
    lat === null ||
    lng === null ||
    !isValidSaCoordinate(lat, lng)
  ) {
    return {
      error:
        "Set your service area on the Location step — tap the map or use My location. We do not use a default city.",
    };
  }

  let finalDescription = description ?? "";
  if (finalDescription.length < 20) {
    finalDescription = `${displayName} — local services around ${locationLabel}. WhatsApp or call for prices and availability.`;
  }

  const serviceLines = servicesRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);

  const profileImageUrlRaw = (formData.get("profileImageUrl") as string | null)?.trim() || null;
  const profileImageUrl =
    profileImageUrlRaw && profileImageUrlRaw.startsWith("/uploads/") ? profileImageUrlRaw : null;

  return {
    data: {
      displayName,
      description: finalDescription,
      phone,
      whatsapp,
      locationLabel,
      latitude: lat,
      longitude: lng,
      hideExactLocation,
      priceHint,
      hoursNote,
      publish,
      categoryIds,
      serviceLines,
      profileImageUrl,
    },
  };
}

type KfDb = ReturnType<typeof getKasiFindPrisma>;

export async function loadListingUpsertSnapshot(
  kf: KfDb,
  listingId: string
): Promise<ListingUpsertSnapshot | null> {
  const listing = await kf.kfProviderListing.findUnique({
    where: { id: listingId },
    include: {
      categories: { select: { categoryId: true } },
      services: { select: { name: true } },
      photos: { select: { url: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!listing) return null;
  return {
    displayName: listing.displayName,
    description: listing.description,
    phone: listing.phone,
    whatsapp: listing.whatsapp,
    locationLabel: listing.locationLabel,
    latitude: listing.latitude,
    longitude: listing.longitude,
    hideExactLocation: listing.hideExactLocation,
    priceHint: listing.priceHint,
    hoursNote: listing.hoursNote,
    status: listing.status,
    moderationStatus: listing.moderationStatus,
    profileImageUrl: listing.profileImageUrl,
    categoryIds: listing.categories.map((c) => c.categoryId).sort(),
    services: listing.services.map((s) => s.name).sort(),
    photoUrls: listing.photos.map((p) => p.url),
  };
}

export function diffListingSnapshots(
  before: ListingUpsertSnapshot,
  after: ListingUpsertSnapshot
): Array<{ fieldName: string; previousValue: string | null; newValue: string | null }> {
  const scalarFields: (keyof ListingUpsertSnapshot)[] = [
    "displayName",
    "description",
    "phone",
    "whatsapp",
    "locationLabel",
    "priceHint",
    "hoursNote",
    "profileImageUrl",
  ];
  const rows: Array<{ fieldName: string; previousValue: string | null; newValue: string | null }> =
    [];

  for (const field of scalarFields) {
    const prev = before[field] == null ? null : String(before[field]);
    const next = after[field] == null ? null : String(after[field]);
    if (prev !== next) rows.push({ fieldName: field, previousValue: prev, newValue: next });
  }

  const fmtCoord = (lat: number, lng: number) => `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const prevCoord = fmtCoord(before.latitude, before.longitude);
  const nextCoord = fmtCoord(after.latitude, after.longitude);
  if (prevCoord !== nextCoord) {
    rows.push({ fieldName: "coordinates", previousValue: prevCoord, newValue: nextCoord });
  }
  if (before.hideExactLocation !== after.hideExactLocation) {
    rows.push({
      fieldName: "hideExactLocation",
      previousValue: String(before.hideExactLocation),
      newValue: String(after.hideExactLocation),
    });
  }

  if (before.categoryIds.join(",") !== after.categoryIds.join(",")) {
    rows.push({
      fieldName: "categories",
      previousValue: before.categoryIds.join(", "),
      newValue: after.categoryIds.join(", "),
    });
  }
  if (before.services.join("|") !== after.services.join("|")) {
    rows.push({
      fieldName: "services",
      previousValue: before.services.join(", "),
      newValue: after.services.join(", "),
    });
  }
  if (before.photoUrls.join("|") !== after.photoUrls.join("|")) {
    rows.push({
      fieldName: "workPhotos",
      previousValue: `${before.photoUrls.length} photo(s)`,
      newValue: `${after.photoUrls.length} photo(s) — ${after.photoUrls.join(", ")}`,
    });
  }

  return rows;
}

export async function applyParsedListingUpsert(
  kf: KfDb,
  listingId: string,
  parsed: ParsedListingUpsert,
  options?: { preserveListingLifecycle?: boolean }
): Promise<{ listingId: string }> {
  const preserve = options?.preserveListingLifecycle ?? false;
  const existing = await kf.kfProviderListing.findUnique({ where: { id: listingId } });
  if (!existing) throw new Error("listing_not_found");

  const data = {
    displayName: parsed.displayName,
    description: parsed.description,
    phone: parsed.phone,
    whatsapp: parsed.whatsapp,
    locationLabel: parsed.locationLabel,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    hideExactLocation: parsed.hideExactLocation,
    priceHint: parsed.priceHint,
    hoursNote: parsed.hoursNote,
    ...(parsed.profileImageUrl ? { profileImageUrl: parsed.profileImageUrl } : {}),
    ...(!preserve
      ? {
          status: parsed.publish ? ("PUBLISHED" as const) : ("DRAFT" as const),
          moderationStatus: "PENDING" as const,
        }
      : {}),
  };

  await kf.kfProviderListing.update({ where: { id: listingId }, data });

  await kf.kfListingCategory.deleteMany({ where: { listingId } });
  if (parsed.categoryIds.length > 0) {
    await kf.kfListingCategory.createMany({
      data: parsed.categoryIds.map((categoryId) => ({ listingId, categoryId })),
    });
  }

  await kf.kfProviderService.deleteMany({ where: { listingId } });
  if (parsed.serviceLines.length > 0) {
    await kf.kfProviderService.createMany({
      data: parsed.serviceLines.map((name) => ({
        listingId,
        name,
        keywords: name.toLowerCase(),
      })),
    });
  }

  return { listingId };
}
