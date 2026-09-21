"use client";

import { useEffect, useRef } from "react";
import type { PostCardData } from "@/lib/queries";
import { ImmersiveMediaStage } from "@/components/feed/immersive/immersive-media-stage";
import { ImmersiveSlideOverlay } from "@/components/feed/immersive/immersive-slide-overlay";

interface ImmersiveSlideProps {
  post: PostCardData;
  active: boolean;
  currentUserId?: string;
  followingIds?: Set<string>;
  onVisible?: () => void;
  slideHeightClass: string;
}

export function ImmersiveSlide({
  post,
  active,
  currentUserId,
  followingIds,
  onVisible,
  slideHeightClass,
}: ImmersiveSlideProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !onVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          onVisible();
        }
      },
      { threshold: [0.55, 0.75] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <section
      ref={ref}
      data-active={active ? "true" : "false"}
      className={`relative w-full shrink-0 snap-start snap-always overflow-hidden ${slideHeightClass}`}
      aria-label={`Installation by ${post.author.name ?? "installer"}`}
    >
      <ImmersiveMediaStage post={post} active={active} />
      <ImmersiveSlideOverlay post={post} currentUserId={currentUserId} followingIds={followingIds} />
    </section>
  );
}
