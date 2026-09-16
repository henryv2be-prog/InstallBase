"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MediaImage } from "@/components/ui/media-image";
import { MediaLightbox } from "@/components/ui/media-lightbox";
import { VideoFeedPreview } from "@/components/ui/video-feed-preview";
import { useLightboxHistory } from "@/hooks/use-lightbox-history";
import { isVideoMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import { toggleMediaBragPoint } from "@/lib/actions";
import { promptJoin } from "@/components/auth/guest-cta";
import { toast } from "sonner";

export interface MediaItem {
  id?: string;
  url: string;
  type?: string;
  caption?: string | null;
  bragScore?: number;
  braggedByViewer?: boolean;
}

interface MediaGalleryProps {
  items: MediaItem[];
  className?: string;
  limit?: number;
  canBrag?: boolean;
  currentUserId?: string;
  onPostBragScoreChange?: (score: number) => void;
}

export function MediaGallery({
  items,
  className,
  limit,
  canBrag = false,
  currentUserId,
  onPostBragScoreChange,
}: MediaGalleryProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mediaState, setMediaState] = useState(items);

  useEffect(() => {
    setMediaState(items);
  }, [items]);

  const visible = limit ? mediaState.slice(0, limit) : mediaState;
  const hiddenCount = limit && mediaState.length > limit ? mediaState.length - limit : 0;

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const closeLightboxWithHistory = useLightboxHistory(activeIndex !== null, closeLightbox);

  const handleBrag = (index: number) => {
    const item = mediaState[index];
    if (!item?.id) return;

    if (!currentUserId) {
      promptJoin("give brag points");
      return;
    }

    const wasBragged = item.braggedByViewer ?? false;
    const prevScore = item.bragScore ?? 0;
    setMediaState((prev) =>
      prev.map((media, i) =>
        i === index
          ? {
              ...media,
              braggedByViewer: !wasBragged,
              bragScore: wasBragged ? Math.max(0, prevScore - 1) : prevScore + 1,
            }
          : media
      )
    );

    startTransition(async () => {
      try {
        const result = await toggleMediaBragPoint(item.id!);
        if (result.error) {
          setMediaState((prev) =>
            prev.map((media, i) =>
              i === index
                ? { ...media, braggedByViewer: wasBragged, bragScore: prevScore }
                : media
            )
          );
          toast.error(result.error);
          return;
        }
        if (result.mediaBragScore !== undefined) {
          setMediaState((prev) =>
            prev.map((media, i) =>
              i === index ? { ...media, bragScore: result.mediaBragScore } : media
            )
          );
        }
        if (result.bragged !== undefined) {
          setMediaState((prev) =>
            prev.map((media, i) =>
              i === index ? { ...media, braggedByViewer: result.bragged } : media
            )
          );
        }
        if (result.postBragScore !== undefined) {
          onPostBragScoreChange?.(result.postBragScore);
        }
        router.refresh();
      } catch {
        setMediaState((prev) =>
          prev.map((media, i) =>
            i === index
              ? { ...media, braggedByViewer: wasBragged, bragScore: prevScore }
              : media
          )
        );
        toast.error("Could not update brag points");
      }
    });
  };

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
          const showBragBadge = canBrag && (media.bragScore ?? 0) > 0;

          return (
            <button
              key={media.id ?? `${media.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={
                isVideoMedia(media.type, media.url)
                  ? "Play video"
                  : `View photo${mediaState.length > 1 ? ` ${index + 1} of ${mediaState.length}` : ""}`
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
              {showBragBadge && (
                <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-semibold text-orange-300">
                  🏆 {media.bragScore}
                </div>
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

      {activeIndex !== null && mediaState[activeIndex] && (
        <MediaLightbox
          items={mediaState}
          index={activeIndex}
          onClose={closeLightboxWithHistory}
          onIndexChange={setActiveIndex}
          canBrag={canBrag}
          bragPending={pending}
          onBrag={handleBrag}
        />
      )}
    </>
  );
}
