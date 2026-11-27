"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCw, MoveHorizontal, Sparkles, Scissors } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeviceProfile } from "@/lib/showcase/deviceTier";
import { FLAVORS, SHOWCASE_COPY, type FlavorSpec } from "@/lib/showcase/content";
import { soundEngine } from "@/lib/showcase/soundEngine";
import type { SequenceId } from "@/lib/showcase/sequenceManifest";
import {
  drawSequenceFrame,
  getBestFrame,
  getSequenceCount,
  prioritizeSequence,
  requestChapterSequence,
  subscribeSequence,
} from "@/lib/showcase/frameSequence";

const FLAVOR_CRUNCH_SEQ: Record<FlavorSpec["id"], SequenceId> = {
  passion: "crunch_passion",
  raspberry: "crunch",
  pistachio: "crunch_pistachio",
  truffle: "crunch_truffle",
};

export const ChapterInspector360: React.FC<{
  locale: Locale;
  profile: DeviceProfile;
  onActive?: () => void;
}> = ({ locale, profile, onActive }) => {
  const [flavorId, setFlavorId] = useState<FlavorSpec["id"]>("passion");
  const [splitPct, setSplitPct] = useState(0);
  const [autoSpin, setAutoSpin] = useState(true);
  const [azimuthDeg, setAzimuthDeg] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flavorRef = useRef<FlavorSpec["id"]>("passion");
  const targetSplitRef = useRef(0);
  const dampedSplitRef = useRef(0);
  const spinProgressRef = useRef(0);
  const spinVelRef = useRef(0);
  const autoSpinRef = useRef(true);
  const dragRef = useRef({ dragging: false, lastX: 0 });
  const snappedRef = useRef(false);
  const dirtyRef = useRef(true);
  const nearPreloadedRef = useRef(false);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const isInstant = profile.tier === "instant";

  useEffect(() => {
    flavorRef.current = flavorId;
    dirtyRef.current = true;
    const seq = FLAVOR_CRUNCH_SEQ[flavorId];
    if (nearPreloadedRef.current && !isInstant) {
      requestChapterSequence(seq);
      prioritizeSequence(seq);
    }
  }, [flavorId, isInstant]);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  const applySplitValue = (pct: number, playScrubSound = false) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    setSplitPct(clamped);
    targetSplitRef.current = clamped / 100;
    dirtyRef.current = true;

    const seq = FLAVOR_CRUNCH_SEQ[flavorRef.current];
    if (clamped > 0 && !isInstant) {
      requestChapterSequence(seq);
      prioritizeSequence(seq);
    }

    if (clamped >= 14 && !snappedRef.current) {
      snappedRef.current = true;
      soundEngine.playSnap(false);
    } else if (clamped < 10 && snappedRef.current) {
      snappedRef.current = false;
      soundEngine.playSnap(true);
    } else if (playScrubSound && clamped > 14) {
      soundEngine.playScrubCrumble(clamped / 100);
    }
  };

  useEffect(() => {
    if (isInstant) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.max(240, Math.floor(rect.height * dpr));
      dirtyRef.current = true;
    };
    window.addEventListener("resize", resize);

    let sized = false;
    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (!sized) {
            sized = true;
            resize();
          }
          onActiveRef.current?.();
          if (!nearPreloadedRef.current) {
            nearPreloadedRef.current = true;
            requestChapterSequence("spin");
            requestChapterSequence(FLAVOR_CRUNCH_SEQ[flavorRef.current]);
            prioritizeSequence(FLAVOR_CRUNCH_SEQ[flavorRef.current]);
          }
        }
      },
      { rootMargin: "500px 0px" },
    );
    nearIo.observe(section);

    let isVisible = false;
    const visIo = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible) {
          onActiveRef.current?.();
          dirtyRef.current = true;
          const activeSeq =
            flavorRef.current === "passion" && targetSplitRef.current < 0.015
              ? "spin"
              : FLAVOR_CRUNCH_SEQ[flavorRef.current];
          requestChapterSequence(activeSeq);
          prioritizeSequence(activeSeq);
        }
      },
      { threshold: 0.01 },
    );
    visIo.observe(canvas);

    const watchedSeqs: SequenceId[] = [
      "spin",
      "crunch",
      "crunch_passion",
      "crunch_pistachio",
      "crunch_truffle",
    ];
    const unsubs = watchedSeqs.map((seqId) =>
      subscribeSequence(seqId, () => {
        if (seqId === "spin" && flavorRef.current === "passion" && dampedSplitRef.current < 0.015) {
          dirtyRef.current = true;
        } else if (seqId === FLAVOR_CRUNCH_SEQ[flavorRef.current]) {
          dirtyRef.current = true;
        }
      }),
    );

    let rafId = 0;
    let lastDegUpdate = 0;

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      const curFlavorId = flavorRef.current;

      const splitDiff = targetSplitRef.current - dampedSplitRef.current;
      if (Math.abs(splitDiff) > 0.0005) {
        dampedSplitRef.current += splitDiff * 0.18;
        dirtyRef.current = true;
      } else {
        dampedSplitRef.current = targetSplitRef.current;
      }

      const split = dampedSplitRef.current;

      if (curFlavorId === "passion" && split < 0.015) {
        if (!dragRef.current.dragging) {
          if (autoSpinRef.current && Math.abs(spinVelRef.current) < 0.0005) {
            spinProgressRef.current = (spinProgressRef.current + 0.0022) % 1;
            dirtyRef.current = true;
          } else if (Math.abs(spinVelRef.current) > 0.0001) {
            spinProgressRef.current =
              (((spinProgressRef.current + spinVelRef.current) % 1) + 1) % 1;
            spinVelRef.current *= 0.92;
            dirtyRef.current = true;
          }
        }
      }

      if (dirtyRef.current) {
        const w = canvas.width;
        const h = canvas.height;
        let frameImg: HTMLImageElement | null = null;

        if (curFlavorId === "passion" && split < 0.015) {
          const total = getSequenceCount("spin");
          const idx = ((Math.round(spinProgressRef.current * total) % total) + total) % total;
          frameImg = getBestFrame("spin", idx);
        } else {
          const seqId = FLAVOR_CRUNCH_SEQ[curFlavorId];
          const total = getSequenceCount(seqId);
          const idx = Math.max(0, Math.min(total - 1, Math.round(split * (total - 1))));
          frameImg = getBestFrame(seqId, idx);
        }

        dirtyRef.current = frameImg === null;

        drawSequenceFrame(ctx, frameImg, w, h, {
          mode: "contain",
          scale: 1.04,
          featherVoid: true,
        });

        if (now - lastDegUpdate > 55) {
          lastDegUpdate = now;
          const deg = ((Math.round(spinProgressRef.current * 360) % 360) + 360) % 360;
          setAzimuthDeg(deg);
        }
      }
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      unsubs.forEach((u) => u());
      nearIo.disconnect();
      visIo.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [isInstant, profile.dprCap]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { dragging: true, lastX: e.clientX };
    spinVelRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;

    if (flavorRef.current === "passion" && targetSplitRef.current < 0.015) {
      const delta = dx * 0.0024;
      spinProgressRef.current = (((spinProgressRef.current + delta) % 1) + 1) % 1;
      spinVelRef.current = delta;
      dirtyRef.current = true;
    } else {
      const nextPct = targetSplitRef.current * 100 + dx * 0.28;
      applySplitValue(nextPct, true);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current.dragging) {
      dragRef.current.dragging = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const toggleCrackAnimation = () => {
    const next = splitPct > 35 ? 0 : 82;
    applySplitValue(next, false);
  };

  const activeFlavor = FLAVORS.find((f) => f.id === flavorId) ?? FLAVORS[0];
  const showFillingTags = splitPct >= 35;

  return (
    <section
      id="inspector"
      ref={sectionRef}
      className="relative bg-black py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="font-mono-tech text-[11px] tracking-[0.26em] text-[#e7b866]/85 uppercase mb-3">
              {SHOWCASE_COPY.inspector.kicker[locale]}
            </p>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.02]">
              {SHOWCASE_COPY.inspector.heading[locale]}
            </h2>
            <p className="text-sm sm:text-base text-white/60 mt-3 leading-relaxed">
              {SHOWCASE_COPY.inspector.sub[locale]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start">
            <div className="glass-panel rounded-full px-4 py-2 font-mono-tech text-xs text-[#f3d28e]">
              {splitPct > 0
                ? `SPLIT ${String(splitPct).padStart(3, "0")}%`
                : flavorId === "passion"
                  ? `AZIMUTH ${String(azimuthDeg).padStart(3, "0")}°`
                  : `${activeFlavor.cocoaPct}`}
            </div>

            {!isInstant && flavorId === "passion" && splitPct === 0 && (
              <button
                type="button"
                onClick={() => {
                  setAutoSpin((v) => !v);
                  soundEngine.playTick();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono-tech text-xs cursor-pointer transition-all border ${
                  autoSpin
                    ? "bg-[#e7b866]/20 border-[#e7b866]/55 text-[#fff3ce]"
                    : "bg-white/[0.04] border-white/15 text-white/60"
                }`}
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${autoSpin ? "animate-spin" : ""}`}
                  style={{ animationDuration: "6s" }}
                />
                {SHOWCASE_COPY.inspector.autoSpin[locale]}
              </button>
            )}

            <button
              type="button"
              onClick={toggleCrackAnimation}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-mono-tech text-xs font-medium bg-gradient-to-r from-[#e7b866] to-[#f3d28e] text-black hover:brightness-110 transition-all cursor-pointer border-0"
            >
              <Scissors className="w-3.5 h-3.5" />
              {splitPct > 35
                ? SHOWCASE_COPY.inspector.reassembleBtn[locale]
                : SHOWCASE_COPY.inspector.crackBtn[locale]}
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-white/12 bg-black">
          <div className="relative bg-black">
            {isInstant ? (
              <div className="relative h-[300px] sm:h-[500px] w-full bg-black overflow-hidden">
                <img
                  src={activeFlavor.plate}
                  alt={activeFlavor.name[locale]}
                  loading="lazy"
                  className="h-full w-full object-contain transition-opacity duration-300"
                  style={{ opacity: 1 - splitPct / 100 }}
                />
                <img
                  src={activeFlavor.splitPlate}
                  alt={`${activeFlavor.name[locale]} — ${SHOWCASE_COPY.inspector.splitLabel[locale]}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
                  style={{ opacity: splitPct / 100 }}
                />
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="w-full h-[320px] sm:h-[500px] lg:h-[580px] block cursor-grab active:cursor-grabbing touch-none"
              />
            )}

            <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-white/15 font-mono-tech text-[9px] sm:text-[10px] tracking-wider text-white/75 pointer-events-none">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#e7b866]" />
              {flavorId === "passion" && splitPct === 0
                ? "DRAG TO SPIN 360°"
                : "DRAG TO OPEN / CLOSE SPLIT"}
            </div>

            {/* Desktop filling badges overlaid along bottom edge of stage */}
            <div
              className="hidden sm:flex absolute bottom-5 left-6 right-6 flex-wrap items-center justify-center gap-2.5 pointer-events-none transition-all duration-300"
              style={{
                opacity: showFillingTags ? 1 : 0,
                transform: `translate3d(0, ${showFillingTags ? 0 : 12}px, 0)`,
              }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 border border-[#e7b866]/45 font-mono-tech text-[10px] tracking-widest text-[#e7b866] uppercase">
                <Sparkles className="w-3 h-3" />
                {SHOWCASE_COPY.inspector.fillingTitle[locale]}
              </span>
              {activeFlavor.insideLayers[locale].map((layerText, idx) => (
                <span
                  key={layerText}
                  className="px-3.5 py-1.5 rounded-full glass-panel text-xs text-white/95 font-medium flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? activeFlavor.accentHex
                          : idx === 1
                            ? "#e7b866"
                            : "#f3d28e",
                    }}
                  />
                  {layerText}
                </span>
              ))}
            </div>
          </div>

          {/* Mobile filling badges cleanly below the bonbon stage */}
          {showFillingTags && (
            <div className="sm:hidden flex flex-wrap items-center gap-1.5 px-3.5 py-2.5 bg-[#070709] border-t border-white/10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 border border-[#e7b866]/45 font-mono-tech text-[9px] tracking-widest text-[#e7b866] uppercase">
                <Sparkles className="w-2.5 h-2.5" />
                {SHOWCASE_COPY.inspector.fillingTitle[locale]}
              </span>
              {activeFlavor.insideLayers[locale].map((layerText, idx) => (
                <span
                  key={layerText}
                  className="px-2.5 py-1 rounded-full glass-panel text-[11px] text-white/95 font-medium flex items-center gap-1.5"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? activeFlavor.accentHex
                          : idx === 1
                            ? "#e7b866"
                            : "#f3d28e",
                    }}
                  />
                  {layerText}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 bg-[#070709]/95 border-t border-white/10 items-center">
            <div className="lg:col-span-7 flex flex-wrap gap-2.5">
              {FLAVORS.map((flv) => {
                const isSelected = flv.id === flavorId;
                return (
                  <button
                    key={flv.id}
                    type="button"
                    onClick={() => {
                      setFlavorId(flv.id);
                      soundEngine.playTick();
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-white/10 border-[#e7b866] text-white shadow-[0_0_16px_rgba(231,184,102,0.2)]"
                        : "bg-white/[0.03] border-white/12 text-white/65 hover:border-white/30"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/30"
                      style={{
                        background: `linear-gradient(135deg, ${flv.swirlColorsHex[0]}, ${flv.swirlColorsHex[1]}, ${flv.swirlColorsHex[2]})`,
                      }}
                    />
                    <span className="font-medium">{flv.name[locale]}</span>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-5 flex items-center gap-4">
              <label
                htmlFor="split-range"
                className="font-mono-tech text-xs text-white/75 whitespace-nowrap"
              >
                {SHOWCASE_COPY.inspector.splitLabel[locale]} ·{" "}
                <span className="text-[#e7b866]">{splitPct}%</span>
              </label>
              <input
                id="split-range"
                type="range"
                min={0}
                max={100}
                value={splitPct}
                onChange={(e) => applySplitValue(Number(e.target.value), true)}
                className="crafo-slider w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-white/55 font-mono-tech">
          <span>
            {activeFlavor.name[locale]} — {activeFlavor.fillingArchitecture[locale]}
          </span>
          <span className="text-[#e7b866]">
            CALLEBAUT {activeFlavor.cocoaPct} · {activeFlavor.weight}
          </span>
        </div>
      </div>
    </section>
  );
};
