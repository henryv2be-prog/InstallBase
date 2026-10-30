"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_FLASH_FRAME_MS,
  CATEGORY_FLASH_SLIDES,
  markCategoryFlashIntroPlayed,
  preloadCategoryFlashImages,
} from "@/lib/kasifind/category-flash-intro";

type Props = {
  onComplete: () => void;
};

/**
 * First-visit-only rapid category burst (~1.7s). Parent controls mount via session + reduced-motion checks.
 */
export function KfCategoryFlashIntro({ onComplete }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void preloadCategoryFlashImages().then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (frameIndex >= CATEGORY_FLASH_SLIDES.length) {
      setExiting(true);
      const doneTimer = window.setTimeout(() => {
        markCategoryFlashIntroPlayed();
        onComplete();
      }, 120);
      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => {
      setFrameIndex((i) => i + 1);
    }, CATEGORY_FLASH_FRAME_MS);

    return () => window.clearTimeout(timer);
  }, [loaded, frameIndex, onComplete]);

  const slide =
    frameIndex < CATEGORY_FLASH_SLIDES.length
      ? CATEGORY_FLASH_SLIDES[frameIndex]
      : CATEGORY_FLASH_SLIDES[CATEGORY_FLASH_SLIDES.length - 1];

  return (
    <div
      className={`kf-category-flash${exiting ? " kf-category-flash--exit" : ""}`}
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
            {frameIndex === CATEGORY_FLASH_SLIDES.length - 1 ? (
              <p className="kf-category-flash-tagline">
                Whatever you need, there&apos;s probably someone nearby who can help.
              </p>
            ) : null}
            <p className="kf-category-flash-label">{slide.label}</p>
          </>
        )}
      </div>
    </div>
  );
}
