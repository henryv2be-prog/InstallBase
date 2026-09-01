"use client";

import { useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { MediaLightbox } from "@/components/ui/media-lightbox";
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

function isVideo(type?: string, url?: string) {
  return type === "video" || Boolean(url?.match(/\.(mp4|webm|mov)(\?|$)/i));
}

export function MediaGallery({ items, className, limit }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const visible = limit ? items.slice(0, limit) : items;

  if (visible.length === 0) return null;

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

      {activeIndex !== null && items[activeIndex] && (
        <MediaLightbox
          items={items}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      )}
    </>
  );
}
