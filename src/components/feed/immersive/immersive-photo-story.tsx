"use client";

import { useEffect, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { cn } from "@/lib/utils";

const PHOTO_MS = 3800;

interface ImmersivePhotoStoryProps {
  urls: string[];
  active: boolean;
  className?: string;
}

export function ImmersivePhotoStory({ urls, active, className }: ImmersivePhotoStoryProps) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [urls]);

  useEffect(() => {
    if (!active || urls.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % urls.length);
      setTick((t) => t + 1);
    }, PHOTO_MS);
    return () => window.clearInterval(timer);
  }, [active, urls.length]);

  if (urls.length === 0) return null;

  const current = urls[index] ?? urls[0];

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      {urls.map((url, i) => {
        const visible = i === index;
        return (
          <div
            key={`${url}-${i}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              visible ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!visible}
          >
            <MediaImage
              src={url}
              alt=""
              fill
              className={cn(
                "object-cover transition-transform duration-[3800ms] ease-out",
                visible && active ? "scale-[1.08]" : "scale-100"
              )}
              sizes="100vw"
            />
          </div>
        );
      })}

      {urls.length > 1 && (
        <div className="absolute left-0 right-0 top-3 z-10 flex justify-center gap-1 px-4">
          {urls.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-0.5 flex-1 max-w-8 rounded-full bg-white/30 transition-colors",
                i === index && "bg-white"
              )}
            />
          ))}
        </div>
      )}

      {/* Ken-burns nudge keyed to tick so each slide restarts zoom */}
      <span className="sr-only" aria-live="polite">
        {active ? `Installation photo ${index + 1} of ${urls.length}` : ""}
      </span>
      <span key={tick} className="hidden" />
    </div>
  );
}
