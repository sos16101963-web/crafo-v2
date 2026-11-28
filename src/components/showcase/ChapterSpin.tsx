"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";
import { SHOWCASE_COPY } from "@/lib/showcase/content";
import {
  activateStreaming,
  drawSequenceFrame,
  getBestFrame,
  getSequenceCount,
  prioritizeSequence,
  requestChapterSequence,
  subscribeSequence,
} from "@/lib/showcase/frameSequence";
import { soundEngine } from "@/lib/showcase/soundEngine";
import { HERO_POSTER_MOBILE_DATA_URI } from "@/lib/showcase/heroPosterInline";

interface ChapterSpinProps {
  locale: Locale;
  profile: DeviceProfile;
  onActive?: () => void;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

export const ChapterSpin: React.FC<ChapterSpinProps> = ({ locale, profile, onActive }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const dampedRef = useRef(0);
  const [uiProgress, setUiProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const isInstant = profile.tier === "instant";

  useEffect(() => {
    if (isInstant) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let started = false;
    let isMobile = window.innerWidth < 768;
    let isVisible = true;
    let dirty = false;
    let hasFrame = false;
    let markedReady = false;
    let rafId = 0;
    let io: IntersectionObserver | null = null;

    const render = () => {
      rafId = 0;
      if (!isVisible) return;

      const total = getSequenceCount("spin");
      const diff = targetRef.current - dampedRef.current;
      if (hasFrame && Math.abs(diff) > 0.0004) {
        dampedRef.current += diff * 0.16;
      }

      const p = dampedRef.current;
      const riseT = smoothstep(0.0, 0.34, p);
      const glideRight = smoothstep(0.38, 0.52, p);
      const glideLeft = smoothstep(0.66, 0.78, p);

      const scale = lerp(0.64, isMobile ? 0.94 : 1.0, riseT);
      const offsetY = isMobile ? lerp(0.16, -0.09, riseT) : lerp(0.18, 0.0, riseT);
      const offsetX = isMobile ? 0 : glideRight * 0.22 - glideLeft * 0.44;

      const frameIdx = Math.min(total - 1, Math.floor(p * (total - 1)));
      const frameImg = getBestFrame("spin", frameIdx);

      if (frameImg) {
        hasFrame = true;
        dirty = false;
        if (!markedReady) {
          markedReady = true;
          setCanvasReady(true);
        }
        drawSequenceFrame(ctx, frameImg, canvas.width, canvas.height, {
          mode: "contain",
          scale,
          offsetX,
          offsetY,
          featherVoid: true,
        });
        if (Math.abs(targetRef.current - dampedRef.current) > 0.0004) {
          rafId = requestAnimationFrame(render);
        }
      } else {
        // Не крутим 60fps цикл впустую до прихода первого реального кадра
        dirty = false;
      }
    };

    const scheduleRender = () => {
      if (!started || rafId || !isVisible) return;
      rafId = requestAnimationFrame(render);
    };

    const readScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const p = clamp01(-rect.top / scrollable);
      targetRef.current = p;
      setUiProgress(p);
      if (p > 0.01) {
        activateStreaming();
        requestChapterSequence("spin");
      }
      if (p > 0.15) {
        requestChapterSequence("crunch");
      }
      dirty = true;
      scheduleRender();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
      isMobile = window.innerWidth < 768;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(320, Math.floor(w * dpr));
      canvas.height = Math.max(200, Math.floor(h * dpr));
      dirty = true;
      scheduleRender();
    };

    const startEngine = () => {
      if (started) return;
      started = true;
      removeWakeListeners();

      // Сначала читаем геометрию (readScroll), затем пишем canvas.width/height (resize) — 0 forced reflow
      readScroll();
      resize();

      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
          if (isVisible) {
            dirty = true;
            prioritizeSequence("spin");
            onActiveRef.current?.();
            scheduleRender();
          }
        },
        { threshold: 0.01 },
      );
      io.observe(section);

      window.addEventListener("resize", resize);
      window.addEventListener("scroll", readScroll, { passive: true });
    };

    const onWake = () => startEngine();
    const removeWakeListeners = () => {
      window.removeEventListener("scroll", onWake);
      window.removeEventListener("wheel", onWake);
      window.removeEventListener("touchstart", onWake);
      window.removeEventListener("pointerdown", onWake);
      window.removeEventListener("keydown", onWake);
    };

    const unsub = subscribeSequence("spin", () => {
      if (!started) {
        startEngine();
      }
      hasFrame = true;
      dirty = true;
      scheduleRender();
    });

    if (window.scrollY > 4) {
      startEngine();
    } else {
      window.addEventListener("scroll", onWake, { passive: true, once: true });
      window.addEventListener("wheel", onWake, { passive: true, once: true });
      window.addEventListener("touchstart", onWake, { passive: true, once: true });
      window.addEventListener("pointerdown", onWake, { passive: true, once: true });
      window.addEventListener("keydown", onWake, { passive: true, once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      removeWakeListeners();
      io?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", readScroll);
    };
  }, [isInstant, profile.dprCap]);

  const titleOpacity = isInstant ? 1 : 1 - smoothstep(0.14, 0.34, uiProgress);
  const titleTranslateY = isInstant ? 0 : -smoothstep(0.1, 0.34, uiProgress) * 60;

  const stat1Opacity = isInstant
    ? 0
    : smoothstep(0.46, 0.54, uiProgress) * (1 - smoothstep(0.62, 0.68, uiProgress));
  const stat2Opacity = isInstant ? 0 : smoothstep(0.76, 0.84, uiProgress);

  const jumpCatalog = () => {
    soundEngine.playTick();
    const el = document.getElementById("catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = locale === "uk" ? "/katalog" : "/ru/katalog";
    }
  };

  return (
    <section
      id="spin"
      ref={sectionRef}
      className={isInstant ? "relative h-screen bg-black" : "relative h-[380vh] bg-black"}
    >
      <div className="sticky top-0 h-[100dvh] md:h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Instant LCP Poster (8.4 KB mobile frame / 22 KB desktop poster, zero animation frames until gesture) */}
        <picture
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{
            opacity: canvasReady ? 0 : 1,
            transform: "translate3d(0, 18%, 0) scale(0.64)",
          }}
        >
          <source media="(max-width: 767px)" srcSet={HERO_POSTER_MOBILE_DATA_URI} />
          <img
            src="/frames/posters/spin.webp"
            alt="CraftChoco BONBON PRO"
            width={1280}
            height={720}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="w-full h-full object-contain"
          />
        </picture>

        {!isInstant && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block transition-opacity duration-300"
            style={{ opacity: canvasReady ? 1 : 0 }}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 34%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* Phase 1: Flagship Title Header + Instant Catalog Escape Hatch */}
        <div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto select-none"
          style={{
            opacity: titleOpacity,
            transform: `translate3d(0, ${titleTranslateY - 120}px, 0)`,
            pointerEvents: titleOpacity > 0.25 ? "auto" : "none",
          }}
        >
          <p className="font-mono-tech text-[11px] sm:text-xs tracking-[0.34em] text-[#e7b866]/85 uppercase mb-3">
            {SHOWCASE_COPY.spin.kicker[locale]}
          </p>
          <h1 className="text-[clamp(2.9rem,9vw,8rem)] font-extrabold tracking-[-0.04em] leading-[0.92] gold-gradient-text m-0">
            {SHOWCASE_COPY.spin.title}
            <span className="sr-only">
              {locale === "uk"
                ? " — Шоколад та цукерки ручної роботи в Харкові CraftChoco"
                : " — Шоколад и конфеты ручной работы в Харькове CraftChoco"}
            </span>
          </h1>
          <p className="font-editorial text-lg sm:text-2xl md:text-3xl text-white/90 mt-3 tracking-tight">
            {SHOWCASE_COPY.spin.subtitle[locale]}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={jumpCatalog}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#e7b866] to-[#fff3ce] text-black hover:brightness-110 transition-all cursor-pointer border-0 shadow-[0_8px_32px_rgba(231,184,102,0.3)]"
            >
              {SHOWCASE_COPY.spin.catalogCta[locale]} ↓
            </button>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
        <div
          className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: isInstant ? 0.85 : Math.max(0, 1 - uiProgress * 6) }}
        >
          <span className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-white/60 whitespace-nowrap">
            {SHOWCASE_COPY.spin.scrollHint[locale]}
          </span>
          <ArrowDown className="w-4 h-4 text-[#e7b866] animate-bounce" />
        </div>

        {/* Phase 2: Bottom-docked on mobile, Left-aligned on desktop ("0.8 мм.") */}
        {stat1Opacity > 0.01 && (
          <div className="absolute bottom-24 inset-x-4 md:bottom-auto md:inset-x-auto md:left-12 lg:left-20 md:top-1/2 md:-translate-y-1/2 z-10 md:max-w-md pointer-events-none">
            <div
              className="p-3.5 md:p-0 rounded-2xl md:rounded-none bg-black/75 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-white/10 md:border-0 transition-transform duration-150"
              style={{
                opacity: stat1Opacity,
                transform: `translate3d(0, ${(1 - stat1Opacity) * 16}px, 0)`,
              }}
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-[#e7b866]/30 bg-black/75 backdrop-blur-md mb-2 md:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e7b866]" />
                <span className="font-mono-tech text-[9px] md:text-[10px] tracking-[0.2em] text-[#f3d28e] uppercase">
                  CALLEBAUT 70.5% · FORM V
                </span>
              </div>
              <div className="text-[clamp(2.2rem,7vw,6rem)] font-bold tracking-tight leading-none gold-gradient-text">
                {SHOWCASE_COPY.spin.stat1Val}
              </div>
              <div className="font-editorial text-base sm:text-2xl text-white mt-1.5 md:mt-3">
                {SHOWCASE_COPY.spin.stat1Label[locale]}
              </div>
              <p className="text-xs sm:text-base text-white/70 mt-1.5 md:mt-3 leading-relaxed line-clamp-2 md:line-clamp-none m-0">
                {SHOWCASE_COPY.spin.stat1Desc[locale]}
              </p>
            </div>
          </div>
        )}

        {/* Phase 3: Bottom-docked on mobile, Right-aligned on desktop ("5 слоёв.") */}
        {stat2Opacity > 0.01 && (
          <div className="absolute bottom-24 inset-x-4 md:bottom-auto md:inset-x-auto md:right-12 lg:right-20 md:top-1/2 md:-translate-y-1/2 z-10 md:max-w-md md:text-right pointer-events-none">
            <div
              className="p-3.5 md:p-0 rounded-2xl md:rounded-none bg-black/75 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-white/10 md:border-0 transition-transform duration-150"
              style={{
                opacity: stat2Opacity,
                transform: `translate3d(0, ${(1 - stat2Opacity) * 16}px, 0)`,
              }}
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-[#2dd4bf]/35 bg-black/75 backdrop-blur-md mb-2 md:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
                <span className="font-mono-tech text-[9px] md:text-[10px] tracking-[0.2em] text-[#99f6e4] uppercase">
                  CRAFTCHOCO ATELIER · KHARKIV
                </span>
              </div>
              <div className="text-[clamp(2.2rem,7vw,6rem)] font-bold tracking-tight leading-none gold-gradient-text">
                {SHOWCASE_COPY.spin.stat2Val}
              </div>
              <div className="font-editorial text-base sm:text-2xl text-white mt-1.5 md:mt-3">
                {SHOWCASE_COPY.spin.stat2Label[locale]}
              </div>
              <p className="text-xs sm:text-base text-white/70 mt-1.5 md:mt-3 leading-relaxed line-clamp-2 md:line-clamp-none m-0">
                {SHOWCASE_COPY.spin.stat2Desc[locale]}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
