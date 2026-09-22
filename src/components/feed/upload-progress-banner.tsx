"use client";

import Link from "next/link";
import { Loader2, Upload } from "lucide-react";
import { useMediaUploadOptional } from "@/components/feed/media-upload-context";
import { cn } from "@/lib/utils";

export function UploadProgressBanner() {
  const upload = useMediaUploadOptional();
  if (!upload) return null;

  const { items, postQueued, isUploading, isSubmitting } = upload;
  const uploadingItems = items.filter((item) => item.status === "uploading");
  const failedItems = items.filter((item) => item.status === "error");

  if (uploadingItems.length === 0 && !postQueued && failedItems.length === 0) return null;

  const totalProgress =
    uploadingItems.length > 0
      ? Math.round(
          uploadingItems.reduce((sum, item) => sum + (item.progress ?? 0), 0) / uploadingItems.length
        )
      : 100;

  const primaryLabel = postQueued
    ? isUploading
      ? "Publishing when uploads finish…"
      : isSubmitting
        ? "Publishing your post…"
        : "Ready to publish…"
    : uploadingItems.length === 1
      ? `Uploading ${uploadingItems[0].label}`
      : `Uploading ${uploadingItems.length} files`;

  const secondaryLabel = postQueued
    ? "You can keep browsing — we'll post automatically."
    : failedItems.length > 0
      ? `${failedItems.length} upload${failedItems.length === 1 ? "" : "s"} failed — tap to fix`
      : `${totalProgress}% complete — tap to return to your post`;

  return (
    <Link
      href="/feed/watch"
      className={cn(
        "fixed left-3 right-3 z-40 mx-auto max-w-lg rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-xl",
        "bottom-[calc(var(--app-mobile-nav-reserve)+env(safe-area-inset-bottom))] md:bottom-6 md:left-auto md:right-6"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400">
          {isSubmitting || (postQueued && !isUploading) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{primaryLabel}</p>
          <p className="mt-0.5 text-xs text-muted">{secondaryLabel}</p>
          {(isUploading || postQueued) && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                style={{ width: `${Math.max(totalProgress, postQueued && !isUploading ? 100 : 8)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
