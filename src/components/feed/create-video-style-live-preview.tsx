"use client";

import { useEffect, useMemo, useState } from "react";
import {
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationStyleId,
} from "@/lib/video-compilation/style-presets";
import { cn } from "@/lib/utils";

interface CreateVideoStyleLivePreviewProps {
  styleId: VideoCompilationStyleId;
  imageUrls: string[];
  className?: string;
}

/** Instant style preview — cycles uploaded photo previews without server render. */
export function CreateVideoStyleLivePreview({
  styleId,
  imageUrls,
  className,
}: CreateVideoStyleLivePreviewProps) {
  const style = VIDEO_COMPILATION_STYLES[styleId];
  const slides = useMemo(() => imageUrls.filter(Boolean).slice(0, 12), [imageUrls]);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const holdMs = Math.max(900, Math.min(style.photoDurationSec * 700, 2800));
  const transitionMs = style.preview.transitionMs;

  useEffect(() => {
    setIndex(0);
    setPrevIndex(0);
  }, [styleId, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => {
        setPrevIndex(current);
        setAnimKey((k) => k + 1);
        return (current + 1) % slides.length;
      });
    }, holdMs);
    return () => window.clearInterval(id);
  }, [slides.length, holdMs, styleId]);

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-[9/16] max-w-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-center text-xs text-muted",
          className
        )}
      >
        Add photos to preview styles
      </div>
    );
  }

  const current = slides[index]!;
  const previous = slides[prevIndex] ?? current;
  const showPrevious = index !== prevIndex && style.preview.transition !== "cut";

  return (
    <div className={cn("relative mx-auto w-full max-w-[220px]", className)}>
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-md ring-1 ring-border/60">
        {showPrevious && (
          <PreviewSlide
            key={`prev-${animKey}`}
            url={previous}
            style={style}
            phase="exit"
            transition={style.preview.transition}
            transitionMs={transitionMs}
          />
        )}
        <PreviewSlide
          key={`cur-${animKey}-${index}`}
          url={current}
          style={style}
          phase="enter"
          transition={style.preview.transition}
          transitionMs={transitionMs}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
          <p className="text-[10px] font-medium text-white/90">Live preview</p>
          <p className="text-[9px] text-white/70">Final export uses HD ffmpeg</p>
        </div>
      </div>
    </div>
  );
}

function PreviewSlide({
  url,
  style,
  phase,
  transition,
  transitionMs,
}: {
  url: string;
  style: (typeof VIDEO_COMPILATION_STYLES)[VideoCompilationStyleId];
  phase: "enter" | "exit";
  transition: (typeof VIDEO_COMPILATION_STYLES)[VideoCompilationStyleId]["preview"]["transition"];
  transitionMs: number;
}) {
  const kenBurns =
    style.preview.kenBurns &&
    (style.preview.kenBurnsIntensity === "strong" ? "animate-ken-burns-strong" : "animate-ken-burns");

  const transitionClass =
    phase === "enter"
      ? transition === "slide-left"
        ? "animate-slide-in-left"
        : transition === "slide-right"
          ? "animate-slide-in-right"
          : transition === "zoom-pop"
            ? "animate-zoom-pop-in"
            : transition === "fade"
              ? "animate-fade-in"
              : ""
      : transition === "slide-left"
        ? "animate-slide-out-left"
        : transition === "slide-right"
          ? "animate-slide-out-right"
          : transition === "fade"
            ? "animate-fade-out"
            : "";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        kenBurns,
        transitionClass,
        phase === "exit" && "z-0",
        phase === "enter" && "z-10"
      )}
      style={{
        animationDuration: transitionClass ? `${transitionMs}ms` : undefined,
      }}
    />
  );
}
