"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { cn } from "@/lib/utils";

export interface MediaItem {
  url: string;
  type?: string;
  caption?: string | null;
}

interface MediaGalleryProps {
  items: MediaItem[];
  className?: string;
  limit?: number;
}

export function MediaGallery({ items, className, limit }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const visible = limit ? items.slice(0, limit) : items;

  useEffect(() => {
    if (activeIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i !== null ? Math.min(i + 1, items.length - 1) : i));
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i !== null ? Math.max(i - 1, 0) : i));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, items.length]);

  if (visible.length === 0) return null;

  const active = activeIndex !== null ? items[activeIndex] : null;
  const isVideo = (type?: string, url?: string) =>
    type === "video" || url?.match(/\.(mp4|webm|mov)(\?|$)/i);

  return (
    <>
      <div
        className={cn(
          "grid gap-2",
          visible.length === 1 ? "grid-cols-1" : "grid-cols-2",
          className
        )}
      >
        {visible.map((media, index) => (
          <button
            key={`${media.url}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isVideo(media.type, media.url) ? (
              <>
                <video src={media.url} className="h-full w-full object-cover" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white">
                    ▶
                  </div>
                </div>
              </>
            ) : (
              <MediaImage
                src={media.url}
                alt={media.caption ?? "Installation photo"}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )}
          </button>
        ))}
      </div>

      {active && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {items.length > 1 && activeIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(activeIndex - 1);
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {items.length > 1 && activeIndex < items.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(activeIndex + 1);
              }}
              className="absolute right-4 top-16 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {isVideo(active.type, active.url) ? (
              <video
                src={active.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-[90vw] rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.url}
                alt={active.caption ?? "Installation photo"}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            )}
            {active.caption && (
              <p className="mt-3 text-center text-sm text-white/80">{active.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
