"use client";

import { Download, Image as ImageIcon } from "lucide-react";

type ImageRow = {
  imageKey: string;
  label: string;
  url: string;
};

type Props = {
  requestId: string;
  displayName: string;
  images: ImageRow[];
};

export function KfAdminAssistanceImages({
  requestId,
  displayName,
  images,
}: Props) {
  const zipHref = `/admin/listing-assistance/${requestId}/download-images`;

  if (images.length === 0) {
    return (
      <section className="kf-card p-5">
        <h3 className="font-semibold">Provider images</h3>
        <p className="mt-2 text-sm text-[var(--kf-muted)]">
          {displayName} has not uploaded a profile or work photos yet. Once they add images, you can
          download them here, edit offline, then re-upload the fixed files in the listing editor
          below.
        </p>
      </section>
    );
  }

  return (
    <section className="kf-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Provider images</h3>
          <p className="mt-1 max-w-prose text-sm text-[var(--kf-muted)]">
            Download the photos on this listing, edit them on your computer, then upload the fixed
            versions in the editor below (replace profile photo, remove the old work photo, and add
            the corrected one). Changes are audited on this request.
          </p>
        </div>
        <a href={zipHref} className="kf-btn kf-btn-primary shrink-0 text-sm">
          <Download className="h-4 w-4" aria-hidden />
          Download all (ZIP)
        </a>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => {
          const downloadHref = `${zipHref}?imageKey=${encodeURIComponent(image.imageKey)}`;
          return (
            <li
              key={image.imageKey}
              className="overflow-hidden rounded-xl border border-[var(--kf-border)] bg-[var(--kf-ivory)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--kf-surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of provider upload paths */}
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                  <ImageIcon className="h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
                  <span className="truncate">{image.label}</span>
                </span>
                <a
                  href={downloadHref}
                  className="kf-btn kf-btn-outline shrink-0 px-2 py-1 text-xs"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Save
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}