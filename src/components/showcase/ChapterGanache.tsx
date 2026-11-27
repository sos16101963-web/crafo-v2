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

interface ChapterGanacheProps {
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

export const ChapterGanache: React.FC<ChapterGanacheProps> = ({
  locale,
  profile,
  onActive,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(0);
  const dampedRef = useRef(0);
  const [uiProgress, setUiProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const isInstant = profile.tier === "instant";
  const activeCardIdx = isInstant ? 0 : uiProgress < 0.35 ? 0 : uiProgress < 0.7 ? 1 : 2;
  const activeMobileCard = SHOWCASE_COPY.ganache.cards[activeCardIdx];

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
      dirty = true;
    };
    window.addEventListener("resize", resize);

    // Declare before onScroll so zero TDZ ReferenceError occurs
    let isVisible = false;
    let dirty = true;
    let markedReady = false;
    let initialized = false;

    const onScroll = () => {
      if (!initialized && !isVisible) return;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const p = clamp01(-rect.top / scrollable);
      targetRef.current = p;
      setUiProgress(p);
      if (isVisible) {
        soundEngine.setGanacheAmbience(0.45 + Math.sin(p * Math.PI) * 0.55);
      }
      if (p > 0.25) {
        requestChapterSequence("tempering");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (!initialized) {
            initialized = true;
            resize();
            onScroll();
          }
          requestChapterSequence("ganache");
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
          prioritizeSequence("ganache");
          soundEngine.setGanacheAmbience(0.65);
          onActiveRef.current?.();
        } else {
          soundEngine.setGanacheAmbience(0);
        }
      },
      { threshold: 0.01 }
    );
    io.observe(section);

    const unsub = subscribeSequence("ganache", () => {
      dirty = true;
    });

    let rafId = 0;
    let lastPx = 0;
    let lastPy = 0;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      if (!isVisible) return;

      const total = getSequenceCount("ganache");
      const diff = targetRef.current - dampedRef.current;
      const px = pointerRef.current.x * -0.014;
      const py = pointerRef.current.y * -0.014;
      const pointerMoved = Math.abs(px - lastPx) > 0.0005 || Math.abs(py - lastPy) > 0.0005;

      if (Math.abs(diff) > 0.0004 || dirty || pointerMoved) {
        dampedRef.current += diff * 0.16;
        lastPx = px;
        lastPy = py;

        const p = dampedRef.current;
        const frameIdx = Math.min(total - 1, Math.floor(p * (total - 1)));
        const frameImg = getBestFrame("ganache", frameIdx);
        dirty = frameImg === null;

        if (frameImg) {
          if (!markedReady) {
            markedReady = true;
            setCanvasReady(true);
          }
          drawSequenceFrame(ctx, frameImg, canvas.width, canvas.height, {
            mode: "cover",
            scale: 1.04,
            offsetX: px,
            offsetY: py,
            featherVoid: false,
          });

          const w = canvas.width;
          const h = canvas.height;
          const grad = ctx.createRadialGradient(
            w * 0.5,
            h * 0.5,
            w * 0.16,
            w * 0.5,
            h * 0.5,
            w * 0.68
          );
          grad.addColorStop(0, "rgba(0,0,0,0.06)");
          grad.addColorStop(1, "rgba(0,0,0,0.74)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      nearIo.disconnect();
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      soundEngine.setGanacheAmbience(0);
    };
  }, [isInstant, profile.dprCap]);

  return (
    <section
      id="ganache"
      ref={sectionRef}
      className={isInstant ? "relative min-h-screen bg-black" : "relative h-[290vh] bg-black"}
    >
      <div className="sticky top-0 h-[100dvh] md:h-screen w-full overflow-hidden flex flex-col justify-between bg-black pt-20 pb-24 px-4 sm:py-24 sm:px-12 lg:px-20">
        <img
          src="/frames/posters/ganache.webp"
          alt="CraftChoco Ganache Macro"
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
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        <div className="relative z-10 max-w-2xl pointer-events-none">
          <p className="font-mono-tech text-[10px] sm:text-[11px] tracking-[0.26em] text-[#e7b866]/90 uppercase mb-1.5 sm:mb-3">
            {SHOWCASE_COPY.ganache.kicker[locale]}
          </p>
          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.04]">
            {SHOWCASE_COPY.ganache.heading[locale]}
          </h2>
        </div>

        {/* Desktop 3-card row */}
        <div className="hidden md:grid relative z-10 md:grid-cols-3 gap-6 pointer-events-none">
          {SHOWCASE_COPY.ganache.cards.map((card, idx) => {
            const start = 0.08 + idx * 0.22;
            const op = isInstant ? 1 : smoothstep(start, start + 0.18, uiProgress);
            return (
              <div
                key={card.tag}
                className="glass-panel rounded-2xl p-6 transition-transform duration-200"
                style={{
                  opacity: Math.max(0.24, op),
                  transform: `translate3d(0, ${(1 - op) * 28}px, 0)`,
                }}
              >
                <div className="font-mono-tech text-[10px] tracking-[0.2em] text-[#e7b866] uppercase mb-2">
                  {card.tag}
                </div>
                <h3 className="font-editorial text-2xl text-white m-0">
                  {card.title[locale]}
                </h3>
                <p className="text-sm text-white/75 mt-2.5 leading-relaxed m-0">
                  {card.text[locale]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile single active card synced to scroll progress so ganache macro stays unobstructed */}
        <div className="md:hidden relative z-10 pointer-events-none">
          <div className="glass-panel rounded-2xl p-3.5 transition-all duration-300">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono-tech text-[9px] tracking-[0.18em] text-[#e7b866] uppercase">
                {activeMobileCard.tag}
              </span>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-200 ${
                      i === activeCardIdx ? "w-4 bg-[#e7b866]" : "w-1.5 bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>
            <h3 className="font-editorial text-base text-white m-0 leading-snug">
              {activeMobileCard.title[locale]}
            </h3>
            <p className="text-xs text-white/75 mt-1 leading-relaxed line-clamp-2 m-0">
              {activeMobileCard.text[locale]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
