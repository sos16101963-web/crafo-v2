"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";
import { SHOWCASE_COPY } from "@/lib/showcase/content";
import { soundEngine } from "@/lib/showcase/soundEngine";
import {
  drawSequenceFrame,
  getBestFrame,
  getSequenceCount,
  prioritizeSequence,
  requestChapterSequence,
  subscribeSequence,
} from "@/lib/showcase/frameSequence";

interface ChapterCrunchProps {
  locale: Locale;
  profile: DeviceProfile;
  onActive?: () => void;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

export const ChapterCrunch: React.FC<ChapterCrunchProps> = ({ locale, profile, onActive }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const dampedRef = useRef(0);
  const snappedStateRef = useRef(false);
  const [uiProgress, setUiProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const isInstant = profile.tier === "instant";

  useEffect(() => {
    if (isInstant) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(320, Math.floor(w * dpr));
      canvas.height = Math.max(200, Math.floor(h * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    let isVisible = false;
    let dirty = true;
    let markedReady = false;

    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          requestChapterSequence("crunch");
        }
      },
      { rootMargin: "500px 0px" }
    );
    nearIo.observe(section);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible) {
          dirty = true;
          prioritizeSequence("crunch");
          onActiveRef.current?.();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(section);

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const p = clamp01(-rect.top / scrollable);
      targetRef.current = p;
      setUiProgress(p);

      if (p >= 0.14 && !snappedStateRef.current) {
        snappedStateRef.current = true;
        soundEngine.playSnap(false);
      } else if (p < 0.11 && snappedStateRef.current) {
        snappedStateRef.current = false;
        soundEngine.playSnap(true);
      }
      if (p > 0.25) {
        requestChapterSequence("layers");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const unsub = subscribeSequence("crunch", () => {
      dirty = true;
    });

    let rafId = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      const total = getSequenceCount("crunch");
      const diff = targetRef.current - dampedRef.current;
      if (Math.abs(diff) > 0.0004 || dirty) {
        dampedRef.current += diff * 0.18;

        const p = dampedRef.current;
        const frameIdx = Math.min(total - 1, Math.floor(p * (total - 1)));
        const frameImg = getBestFrame("crunch", frameIdx);
        dirty = frameImg === null;

        if (frameImg) {
          if (!markedReady) {
            markedReady = true;
            setCanvasReady(true);
          }
          const isMobile = (canvas.clientWidth || window.innerWidth) < 768;
          drawSequenceFrame(ctx, frameImg, canvas.width, canvas.height, {
            mode: "contain",
            scale: isMobile ? 0.98 : 1.02,
            offsetY: isMobile ? -0.02 : 0.02,
            featherVoid: true,
          });
        }
      }
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      nearIo.disconnect();
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isInstant, profile.dprCap]);

  const snapProgress = isInstant ? 1 : smoothstep(0.08, 0.56, uiProgress);
  const dbValue = Math.round(28 + snapProgress * 66);
  const shardsAirborne = Math.round(
    (isInstant ? 1 : smoothstep(0.1, 0.78, uiProgress)) * 180
  );
  const showUncrunch = !isInstant && uiProgress > 0.62;

  return (
    <section
      id="crunch"
      ref={sectionRef}
      className={isInstant ? "relative min-h-screen bg-black" : "relative h-[340vh] bg-black"}
    >
      <div className="sticky top-0 h-[100dvh] md:h-screen w-full overflow-hidden flex flex-col justify-between bg-black pt-20 pb-24 px-4 sm:py-24 sm:px-12 lg:px-20">
        <img
          src={isInstant ? "/plates/split-passion.png" : "/frames/posters/crunch.webp"}
          alt="CraftChoco Crunch"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-300"
          style={{ opacity: canvasReady ? 0 : 1 }}
        />

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
              "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        <div className="relative z-10 max-w-2xl pointer-events-none">
          <p className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.26em] text-[#e7b866]/85 uppercase mb-1.5 sm:mb-3">
            {SHOWCASE_COPY.crunch.kicker[locale]}
          </p>
          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.04]">
            {SHOWCASE_COPY.crunch.heading[locale]}
          </h2>
          <p className="hidden sm:block text-sm sm:text-base text-white/65 mt-3 max-w-lg leading-relaxed">
            {SHOWCASE_COPY.crunch.sub[locale]}
          </p>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-6 pointer-events-none">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4">
            <div className="glass-panel rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 sm:min-w-[200px]">
              <div className="font-mono-tech text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-white/50 truncate">
                {SHOWCASE_COPY.crunch.dbLabel[locale]}
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <span className="font-mono-tech text-xl sm:text-4xl font-semibold gold-gradient-text">
                  {dbValue}
                </span>
                <span className="font-mono-tech text-[10px] sm:text-xs text-[#e7b866]/80">dB SPL</span>
              </div>
              <div className="flex items-end gap-0.5 sm:gap-1 h-3 sm:h-5 mt-2 sm:mt-3">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const threshold = idx / 16;
                  const active = snapProgress >= threshold;
                  const barHeight = 25 + ((idx * 19) % 75);
                  return (
                    <span
                      key={idx}
                      className="flex-1 rounded-sm transition-all duration-150"
                      style={{
                        height: `${active ? barHeight : 20}%`,
                        background: active
                          ? idx > 11
                            ? "#f43f5e"
                            : "#e7b866"
                          : "rgba(255,255,255,0.14)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 sm:min-w-[180px]">
              <div className="font-mono-tech text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-white/50 truncate">
                {SHOWCASE_COPY.crunch.shardsLabel[locale]}
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <span className="font-mono-tech text-xl sm:text-4xl font-semibold text-white">
                  {shardsAirborne}
                </span>
                <span className="font-mono-tech text-[10px] sm:text-xs text-white/45">/ 180</span>
              </div>
              <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e7b866] to-[#fff3ce] transition-all duration-75"
                  style={{ width: `${(shardsAirborne / 180) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className="font-editorial text-sm sm:text-2xl text-[#f3d28e] transition-opacity duration-300"
            style={{ opacity: showUncrunch ? 1 : 0 }}
          >
            {SHOWCASE_COPY.crunch.uncrunch[locale]}
          </div>
        </div>
      </div>
    </section>
  );
};
