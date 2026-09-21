"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { isLocalUpload } from "@/lib/uploads";

/** Wider than this → treat as landscape install shot (rack, room, ceiling, etc.). */
const LANDSCAPE_RATIO = 1.12;
/** Very wide shots get a slow horizontal pan when the slide is active. */
const PANORAMA_RATIO = 1.55;

type Orientation = "unknown" | "portrait" | "landscape";

interface ImmersiveInstallPhotoProps {
  src: string;
  alt?: string;
  active?: boolean;
  /** Subtle zoom on portrait photos in photo stories */
  kenBurns?: boolean;
  className?: string;
}

export function ImmersiveInstallPhoto({
  src,
  alt = "",
  active = true,
  kenBurns = false,
  className,
}: ImmersiveInstallPhotoProps) {
  const [orientation, setOrientation] = useState<Orientation>("unknown");
  const [panorama, setPanorama] = useState(false);

  const onLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    setPanorama(ratio >= PANORAMA_RATIO);
    setOrientation(ratio > LANDSCAPE_RATIO ? "landscape" : "portrait");
  }, []);

  const isLandscape = orientation === "landscape";

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      {isLandscape && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={isLocalUpload(src) ? "eager" : "lazy"}
        decoding="async"
        onLoad={onLoad}
        className={cn(
          "absolute inset-0 h-full w-full",
          isLandscape || orientation === "unknown"
            ? cn(
                "object-contain",
                panorama && active && "immersive-panorama-pan"
              )
            : cn(
                "object-cover transition-transform duration-[3800ms] ease-out",
                kenBurns && active && "scale-[1.06]"
              )
        )}
      />
    </div>
  );
}
