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
  /** Full-bleed create flow — fills parent, minimal chrome */
  immersive?: boolean;
}

/** Instant style preview — cycles uploaded photo previews without server render. */
export function CreateVideoStyleLivePreview({
  styleId,
  imageUrls,
  className,
  immersive,
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
          "flex items-center justify-center text-center text-xs text-muted",
          immersive
            ? "h-full w-full bg-black text-white/70"
            : "aspect-[9/16] max-w-[220px] rounded-2xl border border-dashed border-border bg-muted/20",
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
    <div
      className={cn(
        "relative w-full",
        !immersive && "mx-auto max-w-[220px]",
        immersive && "h-full min-h-0",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-black",
          immersive ? "h-full min-h-0 w-full" : "aspect-[9/16] rounded-2xl shadow-md ring-1 ring-border/60"
        )}
      >
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
        {!immersive ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
            <p className="text-[10px] font-medium text-white/90">Live preview</p>
            <p className="text-[9px] text-white/70">Final export uses HD ffmpeg</p>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end bg-gradient-to-b from-black/50 to-transparent p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              Live preview
            </span>
          </div>
        )}
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
