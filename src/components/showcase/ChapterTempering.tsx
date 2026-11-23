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

interface ChapterTemperingProps {
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

function computeTempC(p: number): number {
  if (p < 0.45) {
    return lerp(45.0, 27.2, p / 0.45);
  }
  if (p < 0.72) {
    return lerp(27.2, 31.2, (p - 0.45) / 0.27);
  }
  return lerp(31.2, 18.0, (p - 0.72) / 0.28);
}

export const ChapterTempering: React.FC<ChapterTemperingProps> = ({
  locale,
  profile,
  onActive,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(0);
  const dampedRef = useRef(0);
  const [progress, setProgress] = useState(0);
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
      canvas.width = Math.max(320, Math.floor((canvas.clientWidth || window.innerWidth) * dpr));
      canvas.height = Math.max(200, Math.floor((canvas.clientHeight || window.innerHeight) * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    let isVisible = false;
    let dirty = true;
    let markedReady = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const p = clamp01(-rect.top / scrollable);
      targetRef.current = p;
      setProgress(p);

      if (isVisible) {
        const temp = computeTempC(p);
        const bell = Math.sin(
          Math.min(1, Math.max(0, rect.top < window.innerHeight && rect.bottom > 0 ? 1 : 0)) *
            Math.PI *
            0.5
        );
        soundEngine.setTemperHum(bell * 0.85, temp);
      }
    };

    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          requestChapterSequence("tempering");
        }
      },
      { rootMargin: "500px 0px" }
    );
    nearIo.observe(section);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (!isVisible) {
          soundEngine.setTemperHum(0, 20);
        } else {
          dirty = true;
          prioritizeSequence("tempering");
          update();
          onActiveRef.current?.();
        }
      },
      { threshold: 0.02 }
    );
    io.observe(section);

    update();
    window.addEventListener("scroll", update, { passive: true });

    const unsub = subscribeSequence("tempering", () => {
      dirty = true;
    });

    let rafId = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      const total = getSequenceCount("tempering");
      const diff = targetRef.current - dampedRef.current;
      if (Math.abs(diff) > 0.0004 || dirty) {
        dampedRef.current += diff * 0.16;

        const p = dampedRef.current;
        const frameIdx = Math.min(total - 1, Math.floor(p * (total - 1)));
        const frameImg = getBestFrame("tempering", frameIdx);
        dirty = frameImg === null;

        if (frameImg) {
          if (!markedReady) {
            markedReady = true;
            setCanvasReady(true);
          }
          drawSequenceFrame(ctx, frameImg, canvas.width, canvas.height, {
            mode: "cover",
            scale: 1.02,
            offsetY: 0,
            featherVoid: false,
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
      window.removeEventListener("scroll", update);
      soundEngine.setTemperHum(0, 20);
    };
  }, [isInstant, profile.dprCap]);

  const effectiveP = isInstant ? 0.85 : progress;
  const tempC = computeTempC(effectiveP);
  const totalSec = Math.round(effectiveP * (18 * 60 + 40));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const crystalPct = clamp01((effectiveP - 0.25) / 0.7) * 99.4;

  const stageIndex = effectiveP < 0.28 ? 0 : effectiveP < 0.55 ? 1 : effectiveP < 0.8 ? 2 : 3;
  const stageColor = SHOWCASE_COPY.tempering.stages[stageIndex][locale];

  const svgX = 16 + effectiveP * 248;
  const svgY = 92 - ((tempC - 16) / 31) * 74;
  const mobSvgY = 48 - ((tempC - 16) / 31) * 38;

  return (
    <section
      id="tempering"
      ref={sectionRef}
      className={isInstant ? "relative min-h-screen bg-black" : "relative h-[300vh] bg-black"}
    >
      <div className="sticky top-0 h-[100dvh] md:h-screen w-full overflow-hidden flex flex-col justify-between bg-black pt-20 pb-24 px-4 sm:py-24 sm:px-12 lg:px-20">
        <img
          src={isInstant ? "/plates/temper-gloss.png" : "/frames/posters/tempering.webp"}
          alt="CraftChoco Form V Tempering"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-300"
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
              "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.06) 36%, rgba(0,0,0,0.06) 64%, rgba(0,0,0,0.84) 100%)",
          }}
        />

        <div className="relative z-10 max-w-2xl pointer-events-none">
          <p className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.26em] text-[#e7b866]/90 uppercase mb-1.5 sm:mb-3">
            {SHOWCASE_COPY.tempering.kicker[locale]}
          </p>
          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.04]">
            {SHOWCASE_COPY.tempering.heading[locale]}
          </h2>
          <p className="hidden sm:block text-sm sm:text-base text-white/65 mt-3 max-w-lg leading-relaxed">
            {SHOWCASE_COPY.tempering.sub[locale]}
          </p>
        </div>

        {/* Desktop telemetry grid + Form-V curve */}
        <div className="hidden md:grid relative z-10 grid-cols-12 gap-4 items-end">
          <div className="col-span-8 grid grid-cols-4 gap-3">
            <div className="glass-panel rounded-2xl p-4">
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/45 uppercase">
                {SHOWCASE_COPY.tempering.timerLabel[locale]}
              </div>
              <div className="font-mono-tech text-3xl font-semibold text-white mt-1.5">
                {mm}:{ss}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/45 uppercase">
                {SHOWCASE_COPY.tempering.tempLabel[locale]}
              </div>
              <div className="font-mono-tech text-3xl font-semibold gold-gradient-text mt-1.5">
                {tempC.toFixed(1)}°C
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/45 uppercase">
                {SHOWCASE_COPY.tempering.crystalLabel[locale]}
              </div>
              <div className="font-mono-tech text-3xl font-semibold text-white mt-1.5">
                {crystalPct.toFixed(1)}%
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/45 uppercase">
                {SHOWCASE_COPY.tempering.colorLabel[locale]}
              </div>
              <div className="font-editorial text-xl text-[#f3d28e] mt-1.5 leading-tight">
                {stageColor}
              </div>
            </div>
          </div>

          <div className="col-span-4 glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono-tech text-[10px] tracking-[0.18em] uppercase text-white/50">
                CURVE V · 45° → 27.2° → 31.2° → 18°C
              </span>
              <span className="w-2 h-2 rounded-full bg-[#e7b866] animate-pulse" />
            </div>
            <svg viewBox="0 0 280 105" className="w-full h-24 overflow-visible">
              <defs>
                <linearGradient id="tempGradV2" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="45%" stopColor="#38bdf8" />
                  <stop offset="72%" stopColor="#e7b866" />
                  <stop offset="100%" stopColor="#fff3ce" />
                </linearGradient>
              </defs>
              <line x1="16" y1="22" x2="264" y2="22" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1="16" y1="58" x2="264" y2="58" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1="16" y1="88" x2="264" y2="88" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <path
                d="M 16 23 L 128 65 L 195 56 L 264 87"
                fill="none"
                stroke="url(#tempGradV2)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={svgX} cy={svgY} r="9" fill="rgba(231,184,102,0.22)" />
              <circle cx={svgX} cy={svgY} r="4.5" fill="#fff3ce" stroke="#000" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Mobile compact telemetry bar + mini sparkline freeing center animation stage */}
        <div className="md:hidden relative z-10 glass-panel rounded-2xl p-3 pointer-events-none">
          <div className="grid grid-cols-4 gap-1.5 text-center items-center">
            <div>
              <div className="font-mono-tech text-[8px] tracking-wider text-white/45 uppercase truncate">
                {locale === "uk" ? "ЧАС" : "ВРЕМЯ"}
              </div>
              <div className="font-mono-tech text-sm font-semibold text-white mt-0.5">
                {mm}:{ss}
              </div>
            </div>
            <div>
              <div className="font-mono-tech text-[8px] tracking-wider text-white/45 uppercase truncate">
                TEMP
              </div>
              <div className="font-mono-tech text-sm font-semibold gold-gradient-text mt-0.5">
                {tempC.toFixed(1)}°C
              </div>
            </div>
            <div>
              <div className="font-mono-tech text-[8px] tracking-wider text-white/45 uppercase truncate">
                FORM V
              </div>
              <div className="font-mono-tech text-sm font-semibold text-white mt-0.5">
                {crystalPct.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="font-mono-tech text-[8px] tracking-wider text-white/45 uppercase truncate">
                {locale === "uk" ? "ФАЗА" : "ФАЗА"}
              </div>
              <div className="font-editorial text-[11px] text-[#f3d28e] mt-0.5 leading-tight truncate">
                {stageColor}
              </div>
            </div>
          </div>

          <svg viewBox="0 0 280 56" className="w-full h-10 mt-1.5 overflow-visible">
            <defs>
              <linearGradient id="tempGradV2Mob" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="45%" stopColor="#38bdf8" />
                <stop offset="72%" stopColor="#e7b866" />
                <stop offset="100%" stopColor="#fff3ce" />
              </linearGradient>
            </defs>
            <path
              d="M 16 12 L 128 34 L 195 29 L 264 46"
              fill="none"
              stroke="url(#tempGradV2Mob)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={svgX} cy={mobSvgY} r="7" fill="rgba(231,184,102,0.22)" />
            <circle cx={svgX} cy={mobSvgY} r="3.5" fill="#fff3ce" stroke="#000" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    </section>
  );
};
