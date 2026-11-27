"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";
import { ANATOMY_LAYERS, SHOWCASE_COPY } from "@/lib/showcase/content";
import { soundEngine } from "@/lib/showcase/soundEngine";
import {
  drawSequenceFrame,
  getBestFrame,
  getSequenceCount,
  prioritizeSequence,
  requestChapterSequence,
  subscribeSequence,
} from "@/lib/showcase/frameSequence";

interface ChapterLaminationProps {
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

export const ChapterLamination: React.FC<ChapterLaminationProps> = ({
  locale,
  profile,
  onActive,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const dampedRef = useRef(0);
  const [uiProgress, setUiProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  const isInstant = profile.tier === "instant";
  const expandProgress = isInstant ? 1 : smoothstep(0.12, 0.88, uiProgress);
  const activeLayerIdx = Math.min(6, Math.floor(expandProgress * 7));
  const prevLayerRef = useRef(-1);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  useEffect(() => {
    if (prevLayerRef.current !== -1 && prevLayerRef.current !== activeLayerIdx) {
      soundEngine.playLayerLock(activeLayerIdx);
    }
    prevLayerRef.current = activeLayerIdx;
  }, [activeLayerIdx]);

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
      dirty = true;
    };
    window.addEventListener("resize", resize);

    let isVisible = false;
    let dirty = true;
    let markedReady = false;
    let initialized = false;

    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (!initialized) {
            initialized = true;
            resize();
            onScroll();
          }
          requestChapterSequence("layers");
        }
      },
      { rootMargin: "500px 0px" }
    );
    nearIo.observe(section);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible) {
          if (!initialized) {
            initialized = true;
            resize();
            onScroll();
          }
          dirty = true;
          prioritizeSequence("layers");
          onActiveRef.current?.();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(section);

    const onScroll = () => {
      if (!initialized && !isVisible) return;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const p = clamp01(-rect.top / scrollable);
      targetRef.current = p;
      setUiProgress(p);
      if (p > 0.25) {
        requestChapterSequence("ganache");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const unsub = subscribeSequence("layers", () => {
      dirty = true;
    });

    let rafId = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      const total = getSequenceCount("layers");
      const diff = targetRef.current - dampedRef.current;
      if (Math.abs(diff) > 0.0004 || dirty) {
        dampedRef.current += diff * 0.18;

        const p = dampedRef.current;
        const frameIdx = Math.min(total - 1, Math.floor(p * (total - 1)));
        const frameImg = getBestFrame("layers", frameIdx);
        dirty = frameImg === null;

        if (frameImg) {
          if (!markedReady) {
            markedReady = true;
            setCanvasReady(true);
          }
          const isMobile = (canvas.clientWidth || window.innerWidth) < 768;
          drawSequenceFrame(ctx, frameImg, canvas.width, canvas.height, {
            mode: "contain",
            scale: isMobile ? 0.96 : 1.0,
            offsetY: -0.02,
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

  const layersCount = Math.round(expandProgress * 7);
  const hoursCount = Math.round(expandProgress * 28);
  const cocoaPct = (expandProgress * 70.5).toFixed(1);
  const activeLayer = ANATOMY_LAYERS[activeLayerIdx];

  return (
    <section
      id="lamination"
      ref={sectionRef}
      className={isInstant ? "relative min-h-screen bg-black" : "relative h-[340vh] bg-black"}
    >
      <div className="sticky top-0 h-[100dvh] md:h-screen w-full overflow-hidden flex flex-col justify-between bg-black pt-20 pb-24 px-4 sm:py-24 sm:px-12 lg:px-20">
        <img
          src="/frames/posters/layers.webp"
          alt="CraftChoco 7 Layers"
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
              "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, transparent 25%, transparent 72%, rgba(0,0,0,0.82) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-2.5 sm:gap-6 pointer-events-none">
          <div className="max-w-xl">
            <p className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.26em] text-[#e7b866]/85 uppercase mb-1 sm:mb-3">
              {SHOWCASE_COPY.lamination.kicker[locale]}
            </p>
            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.04]">
              {SHOWCASE_COPY.lamination.heading[locale]}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-4">
            <div className="glass-panel rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-3 sm:min-w-[118px]">
              <div className="font-mono-tech text-base sm:text-3xl font-bold gold-gradient-text whitespace-nowrap">
                {layersCount} <span className="text-[11px] sm:text-sm text-white/40">/ 7</span>
              </div>
              <div className="font-mono-tech text-[8px] sm:text-[10px] tracking-wider uppercase text-white/50 mt-0.5 sm:mt-1 leading-tight truncate">
                {SHOWCASE_COPY.lamination.layersLabel[locale]}
              </div>
            </div>
            <div className="glass-panel rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-3 sm:min-w-[118px]">
              <div className="font-mono-tech text-base sm:text-3xl font-bold text-white whitespace-nowrap">
                {hoursCount}{" "}
                <span className="text-[11px] sm:text-sm text-white/40">
                  {locale === "uk" ? "год" : "ч"}
                </span>
              </div>
              <div className="font-mono-tech text-[8px] sm:text-[10px] tracking-wider uppercase text-white/50 mt-0.5 sm:mt-1 leading-tight truncate">
                {SHOWCASE_COPY.lamination.hoursLabel[locale]}
              </div>
            </div>
            <div className="glass-panel rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-3 sm:min-w-[125px]">
              <div className="font-mono-tech text-base sm:text-3xl font-bold text-white whitespace-nowrap">
                {cocoaPct}%
              </div>
              <div className="font-mono-tech text-[8px] sm:text-[10px] tracking-wider uppercase text-white/50 mt-0.5 sm:mt-1 leading-tight truncate">
                {SHOWCASE_COPY.lamination.cocoaLabel[locale]}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:gap-4 pointer-events-none">
          <div className="glass-panel rounded-2xl p-3 sm:p-5 max-w-2xl flex items-start gap-3 sm:gap-4">
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1.5 shrink-0"
              style={{
                backgroundColor: activeLayer.color,
                boxShadow: `0 0 16px ${activeLayer.color}`,
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="font-mono-tech text-[10px] sm:text-[11px] text-[#e7b866] tracking-wider">
                  0{activeLayer.id} / 07
                </span>
                <span className="font-mono-tech text-[10px] sm:text-[11px] text-white/45">
                  {activeLayer.thickness}
                </span>
              </div>
              <div className="text-sm sm:text-xl font-semibold text-white mt-0.5 leading-snug">
                {activeLayer.title[locale]}
              </div>
              <p className="text-[11px] sm:text-sm text-white/65 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none m-0">
                {activeLayer.spec[locale]}
              </p>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-px rounded-2xl overflow-hidden border border-white/12 bg-white/10">
            {SHOWCASE_COPY.lamination.specs.map((sp) => (
              <div key={sp.k} className="bg-black/85 backdrop-blur-md px-4 py-3">
                <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/45 uppercase">
                  {sp.k}
                </div>
                <div className="font-mono-tech text-sm sm:text-base font-semibold text-[#f3d28e] mt-0.5">
                  {typeof sp.v === "string" ? sp.v : sp.v[locale]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-only clean spec strip below sticky viewport so 7-slice bonbon stays 100% clear */}
      <div className="md:hidden bg-black px-4 py-5 border-t border-white/10">
        <div className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden border border-white/12 bg-white/10">
          {SHOWCASE_COPY.lamination.specs.map((sp) => (
            <div key={sp.k} className="bg-[#070709] px-3.5 py-2.5">
              <div className="font-mono-tech text-[9px] tracking-[0.16em] text-white/45 uppercase">
                {sp.k}
              </div>
              <div className="font-mono-tech text-xs font-semibold text-[#f3d28e] mt-0.5">
                {typeof sp.v === "string" ? sp.v : sp.v[locale]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
