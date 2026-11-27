"use server";

import { revalidatePath } from "next/cache";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";
import {
  getListingImageVariantHealth,
  runListingImageVariantBackfillBatch,
} from "@/lib/kasifind/listing-image-backfill";

export async function kfAdminGetListingImageVariantHealth() {
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return { error: auth.error as string };
  try {
    const health = await getListingImageVariantHealth();
    return { health };
  } catch {
    return { error: "Could not read image variant status." };
  }
}

export async function kfAdminBackfillListingImageVariants(formData: FormData) {
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return { error: auth.error as string };

  const limitRaw = formData.get("limit");
  const afterPath = (formData.get("afterPath") as string | null)?.trim() || null;
  const limit = limitRaw != null ? Number(limitRaw) : 25;
  if (!Number.isFinite(limit) || limit < 1) {
    return { error: "Enter a batch size between 1 and 100." };
  }

  try {
    const result = await runListingImageVariantBackfillBatch({ limit, afterPath });
    revalidatePath("/admin");
    return { result };
  } catch {
    return { error: "Backfill batch failed." };
  }
}