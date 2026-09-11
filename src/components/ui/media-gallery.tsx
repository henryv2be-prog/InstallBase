"use client";

import { useCallback, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { MediaLightbox } from "@/components/ui/media-lightbox";
import { VideoFeedPreview } from "@/components/ui/video-feed-preview";
import { useLightboxHistory } from "@/hooks/use-lightbox-history";
import { isVideoMedia } from "@/lib/media";
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
  const hiddenCount = limit && items.length > limit ? items.length - limit : 0;

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const closeLightboxWithHistory = useLightboxHistory(activeIndex !== null, closeLightbox);

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
        {visible.map((media, index) => {
          const isLastVisible = index === visible.length - 1;
          const showOverflow = isLastVisible && hiddenCount > 0;

          return (
            <button
              key={`${media.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={
                isVideoMedia(media.type, media.url)
                  ? "Play video"
                  : `View photo${items.length > 1 ? ` ${index + 1} of ${items.length}` : ""}`
              }
            >
              {isVideoMedia(media.type, media.url) ? (
                <VideoFeedPreview url={media.url} />
              ) : (
                <MediaImage
                  src={media.url}
                  alt={media.caption ?? "Installation photo"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              )}
              {showOverflow && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                  +{hiddenCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeIndex !== null && items[activeIndex] && (
        <MediaLightbox
          items={items}
          index={activeIndex}
          onClose={closeLightboxWithHistory}
          onIndexChange={setActiveIndex}
        />
      )}
    </>
  );
}
