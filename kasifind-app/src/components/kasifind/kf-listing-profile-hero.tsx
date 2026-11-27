"use client";

import { useCallback, useState, type SyntheticEvent } from "react";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { fitModeForProfileHero } from "@/lib/kasifind/listing-profile-hero-fit";

type Props = {
  src: string;
  alt: string;
};

export function KfListingProfileHero({ src, alt }: Props) {
  const [fit, setFit] = useState<"cover" | "contain">("contain");

  const onImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setFit(fitModeForProfileHero(img.naturalWidth / img.naturalHeight));
  }, []);

  return (
    <div
      className={`kf-listing-profile-hero kf-listing-profile-hero--${fit}`}
      role="img"
      aria-label={alt}
    >
      <KfListingImage
        src={src}
        alt=""
        widthIntent="hero"
        priority
        className="kf-listing-profile-hero-img"
        onLoad={onImageLoad}
      />
    </div>
  );
}