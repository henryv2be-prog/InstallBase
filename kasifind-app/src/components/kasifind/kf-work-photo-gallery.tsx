"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, X, ZoomIn } from "lucide-react";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";

export type KfWorkPhotoItem = {
  id?: string;
  src: string;
  alt?: string;
};

type Props = {
  photos: KfWorkPhotoItem[];
  className?: string;
  priorityFirst?: boolean;
  onRemovePhoto?: (photoId: string) => void;
  removingPhotoId?: string | null;
  removeDisabled?: boolean;
};

export function KfWorkPhotoGallery({
  photos,
  className = "",
  priorityFirst = false,
  onRemovePhoto,
  removingPhotoId = null,
  removeDisabled = false,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const goPrev = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || photos.length < 2) return i;
      return (i - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || photos.length < 2) return i;
      return (i + 1) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, goPrev, goNext]);

  if (photos.length === 0) return null;

  const active = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <ul className={`kf-work-photo-grid ${className}`.trim()}>
        {photos.map((photo, index) => (
          <li key={photo.id ?? photo.src} className="kf-photo-thumb">
            <button
              type="button"
              className="kf-work-photo-open"
              aria-label={`View work photo ${index + 1} of ${photos.length} full size`}
              onClick={() => setOpenIndex(index)}
            >
              <KfListingImage
                src={photo.src}
                alt={photo.alt ?? ""}
                className="aspect-square w-full object-cover"
                priority={priorityFirst && index === 0}
              />
              <span className="kf-work-photo-zoom-hint" aria-hidden>
                <ZoomIn className="h-4 w-4" />
              </span>
            </button>
            {onRemovePhoto && photo.id ? (
              <button
                type="button"
                className="kf-photo-remove"
                aria-label="Remove photo"
                disabled={removeDisabled || removingPhotoId === photo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePhoto(photo.id!);
                }}
              >
                {removingPhotoId === photo.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <X className="h-4 w-4" aria-hidden />
                )}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {active && openIndex !== null ? (
        <div className="kf-photo-lightbox" role="presentation">
          <button
            type="button"
            className="kf-photo-lightbox-backdrop"
            aria-label="Close enlarged photo"
            onClick={close}
          />
          <div
            className="kf-photo-lightbox-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged work photo"
          >
            <button type="button" className="kf-photo-lightbox-close" aria-label="Close" onClick={close}>
              <X className="h-6 w-6" aria-hidden />
            </button>
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  className="kf-photo-lightbox-nav kf-photo-lightbox-nav--prev"
                  aria-label="Previous photo"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-7 w-7" aria-hidden />
                </button>
                <button
                  type="button"
                  className="kf-photo-lightbox-nav kf-photo-lightbox-nav--next"
                  aria-label="Next photo"
                  onClick={goNext}
                >
                  <ChevronRight className="h-7 w-7" aria-hidden />
                </button>
                <p className="kf-photo-lightbox-counter">
                  {openIndex + 1} / {photos.length}
                </p>
              </>
            ) : null}
            <div className="kf-photo-lightbox-image-wrap">
              <KfListingImage
                src={active.src}
                alt={active.alt ?? "Work photo"}
                className="kf-photo-lightbox-image"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
