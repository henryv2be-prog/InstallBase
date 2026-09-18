"use client";

import { MediaImage } from "@/components/ui/media-image";
import { VideoFeedPreview } from "@/components/ui/video-feed-preview";
import { isVideoMedia } from "@/lib/media";

interface HeroFeaturedMediaProps {
  url: string;
  type?: string;
  alt: string;
  priority?: boolean;
}

export function HeroFeaturedMedia({ url, type, alt, priority = false }: HeroFeaturedMediaProps) {
  if (isVideoMedia(type, url)) {
    return <VideoFeedPreview url={url} className="absolute inset-0 h-full w-full object-cover" />;
  }

  return (
    <MediaImage
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
      className={priority ? "object-cover" : "object-cover"}
    />
  );
}
