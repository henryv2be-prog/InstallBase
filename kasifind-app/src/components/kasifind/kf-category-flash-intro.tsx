"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
 * Cinematic first-visit intro: accelerating montage (~1.7s), hero + brand (~0.75s), fade (~1.1s).
 */
export function KfCategoryFlashIntro({ slides, onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const preloadStartedRef = useRef(false);
  const heroEnteredRef = useRef(false);

  const [playableSlides, setPlayableSlides] = useState<CategoryFlashSlide[]>([]);
  const [phase, setPhase] = useState<IntroPhase>("preload");
  const [montageStep, setMontageStep] = useState(0);
  const [visibleSlide, setVisibleSlide] = useState<CategoryFlashSlide | null>(null);
  const [montageFast, setMontageFast] = useState(false);

  const finish = useCallback(() => {
    markCategoryFlashIntroPlayed();
    onCompleteRef.current();
  }, []);

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

  const enterHero = useCallback(() => {
    if (heroEnteredRef.current || !heroSlide) return;
    heroEnteredRef.current = true;
    setVisibleSlide(heroSlide);
    setPhase("hero");
  }, [heroSlide]);

  useEffect(() => {
    if (preloadStartedRef.current) return;
    preloadStartedRef.current = true;

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
        heroEnteredRef.current = true;
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
      enterHero();
      return;
    }

    setVisibleSlide(montageSlides[step.slideIndex] ?? null);
    setMontageFast(step.slideIndex >= Math.max(1, Math.floor(montageSchedule.length * 0.35)));

    const timer = window.setTimeout(() => {
      setMontageStep((s) => s + 1);
    }, step.durationMs);

    return () => window.clearTimeout(timer);
  }, [phase, montageStep, montageSchedule, montageSlides, enterHero]);

  useEffect(() => {
    if (phase !== "hero") return;
    const timer = window.setTimeout(() => setPhase("fade"), heroMs);
    return () => window.clearTimeout(timer);
  }, [phase, heroMs]);

  useEffect(() => {
    if (phase !== "fade") return;
    const timer = window.setTimeout(() => finish(), fadeMs);
    return () => window.clearTimeout(timer);
  }, [phase, finish, fadeMs]);

  if (phase === "preload" && slides.length === 0) return null;

  const showBrand = phase === "hero" || phase === "fade";
  const freezeHeroFrame = phase === "hero" || phase === "fade";

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
              key={freezeHeroFrame ? "hero-frame" : visibleSlide.id}
              src={visibleSlide.src}
              alt=""
              className={`kf-category-flash-img${
                montageFast && phase === "montage" ? " kf-category-flash-img--fast" : ""
              }${freezeHeroFrame ? " kf-category-flash-img--hold" : ""}`}
              decoding="async"
              fetchPriority="high"
            />
            {phase === "montage" ? (
              <div className="kf-category-flash-caption kf-category-flash-caption--montage">
                <p className="kf-category-flash-label">{visibleSlide.label}</p>
              </div>
            ) : null}
            {showBrand ? (
              <div className="kf-category-flash-brand">
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
