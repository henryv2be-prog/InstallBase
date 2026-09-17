"use client";

import { useEffect, useState } from "react";
import { LANDING_SLIDES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 4500;

export function LandingSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LANDING_SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const current = LANDING_SLIDES[index];

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10 sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/4]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {LANDING_SLIDES.map((shot, i) => (
        // Unsplash loads in the browser — do not proxy through /_next/image
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span className="absolute bottom-4 left-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white drop-shadow-md">
        {current.label}
      </span>
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {LANDING_SLIDES.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            aria-label={`Show ${shot.label} install`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}
