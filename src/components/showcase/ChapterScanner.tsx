"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScanEye, Flame, SplitSquareHorizontal } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";
import { SHOWCASE_COPY } from "@/lib/showcase/content";
import { soundEngine } from "@/lib/showcase/soundEngine";

type ScanMode = "xray" | "thermal" | "split";

interface SampleTelemetry {
  px: number;
  py: number;
  r: number;
  g: number;
  b: number;
  density: string;
  tempC: string;
  zone: Record<Locale, string>;
}

const DEFAULT_TELEMETRY: SampleTelemetry = {
  px: 50,
  py: 50,
  r: 34,
  g: 211,
  b: 238,
  density: "1.28",
  tempC: "19.4",
  zone: {
    uk: "Ядро фруктового ганашу",
    ru: "Ядро фруктового ганаша",
  },
};

function drawCover(
  targetCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dstW: number,
  dstH: number,
) {
  const iw = img.naturalWidth || 1280;
  const ih = img.naturalHeight || 720;
  const scale = Math.max(dstW / iw, dstH / ih);
  const sw = dstW / scale;
  const sh = dstH / scale;
  const sx = (iw - sw) * 0.5;
  const sy = (ih - sh) * 0.5;
  targetCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dstW, dstH);
}

export const ChapterScanner: React.FC<{
  locale: Locale;
  profile: DeviceProfile;
  onActive?: () => void;
}> = ({ locale, profile, onActive }) => {
  const [mode, setMode] = useState<ScanMode>("xray");
  const [telemetry, setTelemetry] = useState<SampleTelemetry>(DEFAULT_TELEMETRY);
  const [hoverActive, setHoverActive] = useState(false);
  const [platesReady, setPlatesReady] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<ScanMode>("xray");
  const cursorRef = useRef({ nx: 0.5, ny: 0.52, active: false });
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const isInstant = profile.tier === "instant";

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (isInstant) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let loadStarted = false;
    let readyMask = 0;

    const heroImg = new Image();
    const xrayImg = new Image();
    const thermalImg = new Image();

    const offW = 640;
    const offH = 360;
    const makeSampler = () => {
      const c = document.createElement("canvas");
      c.width = offW;
      c.height = offH;
      return {
        canvas: c,
        ctx: c.getContext("2d", { willReadFrequently: true }),
      };
    };
    const xrayBuf = makeSampler();
    const thermalBuf = makeSampler();

    const markLoaded = (bit: number) => {
      if (cancelled || (readyMask & bit) !== 0) return;
      readyMask |= bit;
      if (readyMask === 7) {
        xrayBuf.ctx?.drawImage(xrayImg, 0, 0, offW, offH);
        thermalBuf.ctx?.drawImage(thermalImg, 0, 0, offW, offH);
        setPlatesReady(true);
      }
    };

    const startLoadPlates = () => {
      if (loadStarted || cancelled) return;
      loadStarted = true;

      heroImg.onload = () => markLoaded(1);
      xrayImg.onload = () => markLoaded(2);
      thermalImg.onload = () => markLoaded(4);

      heroImg.src = "/plates/hero-plate.png";
      xrayImg.src = "/plates/xray-plate.png";
      thermalImg.src = "/plates/thermal-plate.png";

      if (heroImg.complete && heroImg.naturalWidth > 0) markLoaded(1);
      if (xrayImg.complete && xrayImg.naturalWidth > 0) markLoaded(2);
      if (thermalImg.complete && thermalImg.naturalWidth > 0) markLoaded(4);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.max(240, Math.floor(rect.height * dpr));
    };
    resize();
    window.addEventListener("resize", resize);

    let isVisible = false;
    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startLoadPlates();
          onActiveRef.current?.();
        }
      },
      { rootMargin: "900px 0px" },
    );
    nearIo.observe(section);

    const rect0 = section.getBoundingClientRect();
    if (rect0.top < window.innerHeight + 1200) {
      startLoadPlates();
    }

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible) {
          startLoadPlates();
          onActiveRef.current?.();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    let rafId = 0;
    let time = 0;
    let lastSampleMs = 0;

    const render = (now: number) => {
      if (cancelled) return;
      rafId = requestAnimationFrame(render);
      if (!isVisible) return;
      time += 0.016;

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (readyMask !== 7) return;

      if (!cursorRef.current.active) {
        cursorRef.current.nx = 0.5 + Math.cos(time * 0.85) * 0.16;
        cursorRef.current.ny = 0.5 + Math.sin(time * 1.15) * 0.11;
      }

      const cx = cursorRef.current.nx * w;
      const cy = cursorRef.current.ny * h;
      const currentMode = modeRef.current;

      drawCover(ctx, heroImg, w, h);

      if (currentMode === "split") {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cx, h);
        ctx.clip();
        drawCover(ctx, xrayImg, w, h);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, 0, w - cx, h);
        ctx.clip();
        ctx.globalAlpha = 0.9;
        drawCover(ctx, thermalImg, w, h);
        ctx.restore();

        ctx.strokeStyle = "rgba(231, 184, 102, 0.92)";
        ctx.lineWidth = Math.max(2, w * 0.002);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();
      } else {
        const radius = Math.min(w, h) * (w < 900 ? 0.28 : 0.22);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();
        drawCover(ctx, currentMode === "xray" ? xrayImg : thermalImg, w, h);
        ctx.restore();

        const ringColor = currentMode === "xray" ? "#38bdf8" : "#fb923c";
        ctx.save();
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = Math.max(2.5, w * 0.0024);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.86, 0, Math.PI * 2);
        ctx.stroke();

        const gap = radius * 0.18;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.moveTo(cx - radius * 0.45, cy);
        ctx.lineTo(cx - gap, cy);
        ctx.moveTo(cx + gap, cy);
        ctx.lineTo(cx + radius * 0.45, cy);
        ctx.moveTo(cx, cy - radius * 0.45);
        ctx.lineTo(cx, cy - gap);
        ctx.moveTo(cx, cy + gap);
        ctx.lineTo(cx, cy + radius * 0.45);
        ctx.stroke();
      }

      if (now - lastSampleMs > 55 && xrayBuf.ctx && thermalBuf.ctx) {
        lastSampleMs = now;
        const iw = xrayImg.naturalWidth || 1280;
        const ih = xrayImg.naturalHeight || 720;
        const coverScale = Math.max(w / iw, h / ih);
        const viewOnImgW = w / coverScale;
        const viewOnImgH = h / coverScale;
        const offImgX = (iw - viewOnImgW) * 0.5;
        const offImgY = (ih - viewOnImgH) * 0.5;
        const imgU = (offImgX + cursorRef.current.nx * viewOnImgW) / iw;
        const imgV = (offImgY + cursorRef.current.ny * viewOnImgH) / ih;
        const sx = Math.max(0, Math.min(offW - 1, Math.floor(imgU * offW)));
        const sy = Math.max(0, Math.min(offH - 1, Math.floor(imgV * offH)));

        const xrayPx = xrayBuf.ctx.getImageData(sx, sy, 1, 1).data;
        const thermPx = thermalBuf.ctx.getImageData(sx, sy, 1, 1).data;
        const activePx = currentMode === "thermal" ? thermPx : xrayPx;

        const xluma = (0.2126 * xrayPx[0] + 0.7152 * xrayPx[1] + 0.0722 * xrayPx[2]) / 255;
        const tluma = (0.2126 * thermPx[0] + 0.7152 * thermPx[1] + 0.0722 * thermPx[2]) / 255;

        const densityNum = xluma < 0.04 ? 0 : 0.88 + xluma * 0.52;
        const tempNum = tluma < 0.04 ? 16.0 : 16.4 + tluma * 6.4;

        let zone: Record<Locale, string>;
        if (xluma < 0.05 && tluma < 0.05) {
          zone = { uk: "Космічний вакуум (#000)", ru: "Космический вакуум (#000)" };
        } else if (cursorRef.current.ny > 0.62) {
          zone = { uk: "Хрустке праліне + денце", ru: "Хрустящее пралине + донышко" };
        } else if (tluma > 0.62) {
          zone = { uk: "Емульсійний фруктовий ганаш", ru: "Эмульсионный фруктовый ганаш" };
        } else if (xluma > 0.48) {
          zone = { uk: "Оболонка Callebaut 70.5% (0.8 мм)", ru: "Оболочка Callebaut 70.5% (0.8 мм)" };
        } else {
          zone = { uk: "Конфі та розпис какао-маслом", ru: "Конфи и роспись какао-маслом" };
        }

        setTelemetry({
          px: Math.round(cursorRef.current.nx * 100),
          py: Math.round(cursorRef.current.ny * 100),
          r: activePx[0],
          g: activePx[1],
          b: activePx[2],
          density: densityNum.toFixed(2),
          tempC: tempNum.toFixed(1),
          zone,
        });
      }
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      nearIo.disconnect();
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [isInstant, profile.dprCap]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorRef.current.nx = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
    cursorRef.current.ny = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height));
    cursorRef.current.active = true;
    if (!hoverActive) setHoverActive(true);
  };

  const handlePointerLeave = () => {
    cursorRef.current.active = false;
    setHoverActive(false);
  };

  const selectMode = (m: ScanMode) => {
    setMode(m);
    soundEngine.playScanTone(m);
  };

  return (
    <section
      id="scanner"
      ref={sectionRef}
      className="relative bg-black py-16 sm:py-28 px-4 sm:px-12 lg:px-20"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <p className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.26em] text-[#e7b866]/85 uppercase mb-2 sm:mb-3">
              {SHOWCASE_COPY.scanner.kicker[locale]}
            </p>
            <h2 className="text-3xl sm:text-6xl font-bold tracking-tight text-white leading-[1.02]">
              {SHOWCASE_COPY.scanner.heading[locale]}
            </h2>
            <p className="text-xs sm:text-base text-white/60 mt-2.5 sm:mt-3 leading-relaxed">
              {SHOWCASE_COPY.scanner.sub[locale]}
            </p>
          </div>

          <div className="inline-flex flex-wrap gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-2xl sm:rounded-full glass-panel self-start">
            <button
              type="button"
              onClick={() => selectMode("xray")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full font-mono-tech text-[11px] sm:text-xs transition-all cursor-pointer border-0 ${
                mode === "xray"
                  ? "bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/50"
                  : "bg-transparent text-white/55 hover:text-white"
              }`}
            >
              <ScanEye className="w-3.5 h-3.5" />
              {SHOWCASE_COPY.scanner.modeXray[locale]}
            </button>
            <button
              type="button"
              onClick={() => selectMode("thermal")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full font-mono-tech text-[11px] sm:text-xs transition-all cursor-pointer border-0 ${
                mode === "thermal"
                  ? "bg-orange-400/20 text-orange-300 ring-1 ring-orange-400/50"
                  : "bg-transparent text-white/55 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              {SHOWCASE_COPY.scanner.modeThermal[locale]}
            </button>
            <button
              type="button"
              onClick={() => selectMode("split")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full font-mono-tech text-[11px] sm:text-xs transition-all cursor-pointer border-0 ${
                mode === "split"
                  ? "bg-[#e7b866]/20 text-[#fff3ce] ring-1 ring-[#e7b866]/50"
                  : "bg-transparent text-white/55 hover:text-white"
              }`}
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              {SHOWCASE_COPY.scanner.modeSplit[locale]}
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black">
          {isInstant ? (
            <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden">
              <img
                src={
                  mode === "thermal"
                    ? "/plates/thermal-plate.png"
                    : mode === "xray"
                      ? "/plates/xray-plate.png"
                      : "/plates/hero-plate.png"
                }
                alt={SHOWCASE_COPY.scanner.heading[locale]}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-black">
              <img
                src={mode === "thermal" ? "/plates/thermal-plate.png" : "/plates/xray-plate.png"}
                alt={SHOWCASE_COPY.scanner.heading[locale]}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none transition-opacity duration-300"
                style={{ opacity: platesReady ? 0 : 1 }}
              />
              <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative z-10 w-full h-full block cursor-crosshair touch-none"
              />
            </div>
          )}

          <div className="sm:absolute sm:bottom-6 sm:left-6 z-20 glass-panel rounded-2xl p-3.5 sm:p-5 sm:w-[330px] mt-3 sm:mt-0 mx-3 mb-3 sm:m-0">
            <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/30"
                  style={{ backgroundColor: `rgb(${telemetry.r}, ${telemetry.g}, ${telemetry.b})` }}
                />
                <span className="font-mono-tech text-[11px] text-white/80">
                  XY [{telemetry.px}%, {telemetry.py}%]
                </span>
              </div>
              <span className="font-mono-tech text-[10px] text-[#e7b866] uppercase">
                {hoverActive ? "LIVE CURSOR" : "AUTO SCAN"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2.5 sm:mt-3">
              <div>
                <div className="font-mono-tech text-[10px] text-white/45 uppercase">
                  {mode === "thermal" ? "FLIR TEMP" : "DENSITY"}
                </div>
                <div className="font-mono-tech text-xl sm:text-2xl font-semibold text-white mt-0.5">
                  {mode === "thermal" ? `${telemetry.tempC} °C` : `${telemetry.density} g/cm³`}
                </div>
              </div>
              <div>
                <div className="font-mono-tech text-[10px] text-white/45 uppercase">
                  PIXEL RGB
                </div>
                <div className="font-mono-tech text-xs text-white/80 mt-1.5 sm:mt-2">
                  {telemetry.r}, {telemetry.g}, {telemetry.b}
                </div>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/10">
              <div className="font-mono-tech text-[10px] text-white/45 uppercase">
                DETECTED ZONE
              </div>
              <div className="font-display italic text-base sm:text-lg text-[#f3d28e] mt-0.5">
                {telemetry.zone[locale]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
