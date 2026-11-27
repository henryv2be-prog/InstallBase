"use client";

import { useCallback, useState, useTransition } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import type { ListingImageVariantHealth } from "@/lib/kasifind/listing-image-backfill";
import {
  kfAdminBackfillListingImageVariants,
  kfAdminGetListingImageVariantHealth,
} from "@/lib/kasifind/admin-listing-image-backfill-actions";

type Props = {
  initialHealth: ListingImageVariantHealth | null;
  disabled?: boolean;
};

export function KfAdminImageVariantPanel({ initialHealth, disabled }: Props) {
  const [health, setHealth] = useState<ListingImageVariantHealth | null>(initialHealth);
  const [afterPath, setAfterPath] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refreshHealth = useCallback(() => {
    startTransition(async () => {
      const res = await kfAdminGetListingImageVariantHealth();
      if ("health" in res && res.health) setHealth(res.health);
    });
  }, []);

  const runBatch = (formData: FormData) => {
    if (afterPath) formData.set("afterPath", afterPath);
    startTransition(async () => {
      setLastMessage(null);
      const res = await kfAdminBackfillListingImageVariants(formData);
      if ("error" in res && res.error) {
        setLastMessage(res.error);
        return;
      }
      if (!("result" in res) || !res.result) return;
      const r = res.result;
      setAfterPath(r.hasMore ? r.lastPath : null);
      const parts = [
        `Processed ${r.processed} listing photos.`,
        `${r.generatedVariantFiles} new variant files written.`,
      ];
      if (r.skippedVariantFiles > 0) parts.push(`${r.skippedVariantFiles} already existed.`);
      if (r.errors > 0) parts.push(`${r.errors} error(s).`);
      if (r.hasMore) parts.push("Run again to continue.");
      else parts.push("Backfill queue complete for referenced uploads.");
      setLastMessage(parts.join(" "));
      refreshHealth();
    });
  };

  if (!health) {
    return (
      <section className="kf-admin-inbox-section" aria-labelledby="admin-image-variants">
        <h3 id="admin-image-variants" className="kf-admin-inbox-section__title">
          Listing image variants
        </h3>
        <p className="text-sm text-[var(--kf-muted)]">Could not load variant stats. Try refresh when the database is available.</p>
      </section>
    );
  }

  const pct =
    health.originalsOnDisk > 0
      ? Math.round((health.withAnyVariant / health.originalsOnDisk) * 100)
      : 100;

  return (
    <section className="kf-admin-inbox-section" aria-labelledby="admin-image-variants">
      <div className="kf-admin-inbox-section__head">
        <h3 id="admin-image-variants" className="kf-admin-inbox-section__title">
          <ImageIcon className="inline h-4 w-4 mr-1.5 opacity-80" aria-hidden />
          Listing image variants
        </h3>
        <p className="kf-admin-inbox-section__hint">
          Legacy uploads before WebP variants — run batches until complete.
        </p>
      </div>
      <div className="kf-admin-inbox-alert" role="status">
        <div className="grid gap-1 text-sm">
          <p>
            <strong>{health.withAnyVariant}</strong> of <strong>{health.originalsOnDisk}</strong> on-disk
            originals have variants ({pct}%).
          </p>
          <p className="text-[var(--kf-muted)]">
            {health.referencedOriginals} unique paths in the database · {health.withoutVariants} need
            variants · {health.originalsMissing} missing originals on disk
          </p>
          {!health.variantsEnabled ? (
            <p className="text-[var(--kf-muted)]">
              Upload-time variants are disabled (KASIFIND_IMAGE_VARIANTS). New uploads will not get WebP
              files until re-enabled.
            </p>
          ) : null}
        </div>
      </div>
      <form
        className="mt-3 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          runBatch(new FormData(e.currentTarget));
        }}
      >
        <label className="text-sm">
          <span className="block font-medium mb-1">Batch size</span>
          <input
            name="limit"
            type="number"
            min={1}
            max={100}
            defaultValue={25}
            className="kf-input w-24"
            disabled={disabled || pending || !health.variantsEnabled}
          />
        </label>
        <button
          type="submit"
          className="kf-btn kf-btn-primary text-sm"
          disabled={disabled || pending || !health.variantsEnabled || health.withoutVariants === 0}
        >
          {pending ? (
            <>
              <Loader2 className="inline h-4 w-4 animate-spin mr-1" aria-hidden />
              Running…
            </>
          ) : (
            "Generate missing WebP batch"
          )}
        </button>
        <button
          type="button"
          className="kf-btn kf-btn-ghost text-sm"
          onClick={refreshHealth}
          disabled={pending}
        >
          Refresh stats
        </button>
      </form>
      {lastMessage ? (
        <p className="mt-2 text-sm text-[var(--kf-muted)]" role="status">
          {lastMessage}
        </p>
      ) : null}
    </section>
  );
}