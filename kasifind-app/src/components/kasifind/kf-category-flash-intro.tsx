"use client";

import { useEffect, useState } from "react";
import {
  categoryFlashFrameMs,
  type CategoryFlashSlide,
  markCategoryFlashIntroPlayed,
  preloadCategoryFlashImages,
} from "@/lib/kasifind/category-flash-intro";

type Props = {
  slides: CategoryFlashSlide[];
  onComplete: () => void;
};

/**
 * First-visit-only burst of real listing work photos (~4s total, n ≤ 10).
 */
export function KfCategoryFlashIntro({ slides, onComplete }: Props) {
  const [playableSlides, setPlayableSlides] = useState<CategoryFlashSlide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const slideCount = playableSlides.length;
  const frameMs = categoryFlashFrameMs(slideCount);

  useEffect(() => {
    let cancelled = false;
    void preloadCategoryFlashImages(slides).then((ready) => {
      if (cancelled) return;
      if (ready.length === 0) {
        markCategoryFlashIntroPlayed();
        onComplete();
        return;
      }
      setPlayableSlides(ready);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slides, onComplete]);

  useEffect(() => {
    if (!loaded || slideCount === 0) return;

    if (frameIndex >= slideCount) {
      setExiting(true);
      const doneTimer = window.setTimeout(() => {
        markCategoryFlashIntroPlayed();
        onComplete();
      }, 120);
      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => {
      setFrameIndex((i) => i + 1);
    }, frameMs);

    return () => window.clearTimeout(timer);
  }, [loaded, frameIndex, onComplete, slideCount, frameMs]);

  if (!loaded && slides.length === 0) return null;

  const slide =
    slideCount === 0
      ? slides[0]
      : frameIndex < slideCount
        ? playableSlides[frameIndex]
        : playableSlides[slideCount - 1];

  if (!slide) return null;

  return (
    <div
      className={`kf-category-flash${exiting ? " kf-category-flash--exit" : ""}`}
      style={{ ["--kf-category-flash-frame" as string]: `${frameMs}ms` }}
      role="presentation"
      aria-hidden
    >
      <div className="kf-category-flash-inner">
        {!loaded ? (
          <div className="kf-category-flash-loader" aria-hidden />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={slide.id}
              src={slide.src}
              alt=""
              className="kf-category-flash-img"
              decoding="sync"
              fetchPriority="high"
            />
            {frameIndex === slideCount - 1 ? (
              <p className="kf-category-flash-tagline">
                Whatever you need, there&apos;s probably someone nearby who can help.
              </p>
            ) : null}
            <div className="kf-category-flash-caption">
              <p className="kf-category-flash-label">{slide.label}</p>
              {slide.providerName ? (
                <p className="kf-category-flash-provider">Real work · {slide.providerName}</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
