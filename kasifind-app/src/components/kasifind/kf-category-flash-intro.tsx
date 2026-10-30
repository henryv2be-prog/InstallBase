"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";
import {
  buildCinematicMontageSchedule,
  cinematicPhaseDurations,
  type CategoryFlashSlide,
  markCategoryFlashIntroPlayed,
  preloadCategoryFlashImages,
  splitMontageAndHero,
} from "@/lib/kasifind/category-flash-intro";

type Props = {
  slides: CategoryFlashSlide[];
  onComplete: () => void;
};

type IntroPhase = "preload" | "montage" | "hero" | "fade";

/**
 * Cinematic first-visit intro: accelerating montage (~1.5s), hero + brand (~0.4s), fade (~1.1s).
 */
export function KfCategoryFlashIntro({ slides, onComplete }: Props) {
  const [playableSlides, setPlayableSlides] = useState<CategoryFlashSlide[]>([]);
  const [phase, setPhase] = useState<IntroPhase>("preload");
  const [montageStep, setMontageStep] = useState(0);
  const [visibleSlide, setVisibleSlide] = useState<CategoryFlashSlide | null>(null);
  const [montageFast, setMontageFast] = useState(false);

  const finish = useCallback(() => {
    markCategoryFlashIntroPlayed();
    onComplete();
  }, [onComplete]);

  const { montageSlides, heroSlide } = useMemo(
    () => splitMontageAndHero(playableSlides),
    [playableSlides]
  );

  const montageSchedule = useMemo(
    () => buildCinematicMontageSchedule(montageSlides.length),
    [montageSlides.length]
  );

  const { heroMs, fadeMs } = useMemo(
    () => cinematicPhaseDurations(montageSlides.length),
    [montageSlides.length]
  );

  useEffect(() => {
    let cancelled = false;
    void preloadCategoryFlashImages(slides).then((ready) => {
      if (cancelled) return;
      if (ready.length === 0) {
        finish();
        return;
      }
      setPlayableSlides(ready);
      const { montageSlides: m, heroSlide: h } = splitMontageAndHero(ready);
      if (m.length === 0 && h) {
        setVisibleSlide(h);
        setPhase("hero");
      } else {
        setVisibleSlide(m[0] ?? h);
        setPhase("montage");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slides, finish]);

  useEffect(() => {
    if (phase !== "montage" || montageSlides.length === 0) return;

    const step = montageSchedule[montageStep];
    if (!step) {
      setVisibleSlide(heroSlide);
      setPhase("hero");
      return;
    }

    setVisibleSlide(montageSlides[step.slideIndex] ?? null);
    setMontageFast(step.slideIndex >= Math.max(1, Math.floor(montageSchedule.length * 0.35)));

    const timer = window.setTimeout(() => {
      setMontageStep((s) => s + 1);
    }, step.durationMs);

    return () => window.clearTimeout(timer);
  }, [phase, montageStep, montageSchedule, montageSlides, heroSlide]);

  useEffect(() => {
    if (phase !== "hero" || !heroSlide) return;
    setVisibleSlide(heroSlide);
    const timer = window.setTimeout(() => setPhase("fade"), heroMs);
    return () => window.clearTimeout(timer);
  }, [phase, heroSlide, heroMs]);

  useEffect(() => {
    if (phase !== "fade") return;
    const timer = window.setTimeout(() => finish(), fadeMs);
    return () => window.clearTimeout(timer);
  }, [phase, finish, fadeMs]);

  if (phase === "preload" && slides.length === 0) return null;

  const showBrand = phase === "hero" || phase === "fade";
  const isHeroFrame = phase === "hero" || (phase === "fade" && visibleSlide?.isHero);

  return (
    <div
      className={`kf-category-flash${
        phase !== "preload" ? " kf-category-flash--opaque" : ""
      }${phase === "fade" ? " kf-category-flash--reveal" : ""}`}
      style={phase === "fade" ? { animationDuration: `${fadeMs}ms` } : undefined}
      role="presentation"
      aria-hidden
    >
      <div className="kf-category-flash-inner">
        {phase === "preload" ? (
          <div className="kf-category-flash-loader" aria-hidden />
        ) : visibleSlide ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={visibleSlide.id}
              src={visibleSlide.src}
              alt=""
              className={`kf-category-flash-img${
                montageFast && phase === "montage" ? " kf-category-flash-img--fast" : ""
              }${isHeroFrame ? " kf-category-flash-img--hero" : ""}`}
              decoding="async"
              fetchPriority="high"
            />
            {phase === "montage" ? (
              <div className="kf-category-flash-caption kf-category-flash-caption--montage">
                <p className="kf-category-flash-label">{visibleSlide.label}</p>
              </div>
            ) : null}
            {showBrand ? (
              <div
                className={`kf-category-flash-brand${phase === "fade" ? " kf-category-flash-brand--hold" : ""}`}
              >
                <KfBrandLogo className="kf-category-flash-logo" />
                <p className="kf-category-flash-wordmark">KasiFind</p>
                {visibleSlide.providerName ? (
                  <p className="kf-category-flash-provider kf-category-flash-provider--hero">
                    Real work · {visibleSlide.providerName}
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
