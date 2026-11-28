"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type Lenis from "lenis";
import { Volume2, X, ArrowDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { detectDeviceProfile, type DeviceProfile } from "@/lib/showcase/deviceTier";
import {
  activateStreaming,
  evictDistantSequences,
  setSequenceResolution,
} from "@/lib/showcase/frameSequence";
import type { SequenceId } from "@/lib/showcase/sequenceManifest";
import { CHAPTER_NAV, SHOWCASE_COPY } from "@/lib/showcase/content";
import { chapterPath, type ShowcaseChapterId } from "@/lib/showcase/seoChapters";
import { soundEngine } from "@/lib/showcase/soundEngine";
import { useCart } from "@/store/cart";
import { ChapterSpin } from "./ChapterSpin";

const ShowcaseChaptersRestSSR = dynamic(() =>
  import("./ShowcaseChaptersRest").then((m) => m.ShowcaseChaptersRest),
);
const ShowcaseChaptersRestClient = dynamic(
  () => import("./ShowcaseChaptersRest").then((m) => m.ShowcaseChaptersRest),
  { ssr: false },
);

const CHAPTER_SEQUENCES: Record<string, SequenceId[]> = {
  spin: ["spin"],
  crunch: ["crunch"],
  lamination: ["layers"],
  ganache: ["ganache"],
  tempering: ["tempering"],
  scanner: [],
  inspector: ["spin", "crunch_passion", "crunch", "crunch_pistachio", "crunch_truffle"],
  lineup: [],
  order: [],
};

const SSR_SAFE_PROFILE: DeviceProfile = {
  tier: "lite",
  useMobileFrames: true,
  dprCap: 1,
  enableLenis: false,
};

export const BonbonShowcase3D: React.FC<{
  locale: Locale;
  standalone3d?: boolean;
  initialChapter?: ShowcaseChapterId;
}> = ({ locale, standalone3d = false, initialChapter }) => {
  const [profile, setProfile] = useState<DeviceProfile>(SSR_SAFE_PROFILE);
  const [activeSection, setActiveSection] = useState<string>(initialChapter ?? "spin");
  const [inShowcase, setInShowcase] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [soundBannerDismissed, setSoundBannerDismissed] = useState(false);
  const [restUnlocked, setRestUnlocked] = useState(standalone3d || Boolean(initialChapter));
  const cartOpen = useCart((s) => s.isOpen);

  const rootRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const inShowcaseRef = useRef(true);
  const initialJumpDoneRef = useRef(false);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (cartOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [cartOpen]);

  // 1. Detect device profile & wire Poster-First first-interaction streaming unlock
  useEffect(() => {
    const detected = detectDeviceProfile();
    setProfile(detected);
    setSequenceResolution(detected.useMobileFrames);

    const unlock = () => {
      setRestUnlocked(true);
      if (detected.tier !== "instant") {
        activateStreaming();
      }
      cleanupListeners();
    };

    const onScroll = () => {
      if (window.scrollY > 18) {
        unlock();
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("wheel", unlock, { passive: true, once: true });
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    window.addEventListener("pointerdown", unlock, { passive: true, once: true });
    window.addEventListener("keydown", unlock, { passive: true, once: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return cleanupListeners;
  }, []);

  // 2. Conditional Lenis smooth scroll ONLY on high-spec desktop devices (lazy-imported so phones never parse it)
  useEffect(() => {
    if (!profile.enableLenis) return;

    let cancelled = false;
    let rafId = 0;
    let instance: Lenis | null = null;

    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      const lenis = new LenisCtor({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      instance = lenis;
      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      instance?.destroy();
      lenisRef.current = null;
    };
  }, [profile.enableLenis]);

  // 3. Synchronize sound state across Header & floating sound banner
  useEffect(() => {
    const initial = soundEngine.isEnabled();
    setSoundOn(initial);
    window.dispatchEvent(new CustomEvent("crafo:sound-state", { detail: initial }));
    soundEngine.setShowcaseActive(true);

    const onHeaderToggle = () => {
      const next = soundEngine.toggle();
      setSoundOn(next);
      window.dispatchEvent(new CustomEvent("crafo:sound-state", { detail: next }));
    };
    window.addEventListener("crafo:sound-toggle", onHeaderToggle);
    return () => {
      window.removeEventListener("crafo:sound-toggle", onHeaderToggle);
      soundEngine.setShowcaseActive(false);
      soundEngine.muteAllDrones();
    };
  }, []);

  // 4. Active chapter tracker + sliding-window RAM eviction for older phones
  const runEvictionAround = useCallback((chapterId: string) => {
    const idx = CHAPTER_NAV.findIndex((c) => c.id === chapterId);
    if (idx === -1) return;
    const keepIds = new Set<SequenceId>();
    for (let d = -1; d <= 1; d++) {
      const neighbor = CHAPTER_NAV[idx + d];
      if (!neighbor) continue;
      for (const seq of CHAPTER_SEQUENCES[neighbor.id] ?? []) {
        keepIds.add(seq);
      }
    }
    evictDistantSequences(Array.from(keepIds));
  }, []);

  const chapterHandlers = useMemo(
    () => ({
      spin: () => runEvictionAround("spin"),
      crunch: () => runEvictionAround("crunch"),
      lamination: () => runEvictionAround("lamination"),
      ganache: () => runEvictionAround("ganache"),
      tempering: () => runEvictionAround("tempering"),
      scanner: () => runEvictionAround("scanner"),
      inspector: () => runEvictionAround("inspector"),
    }),
    [runEvictionAround],
  );

  useEffect(() => {
    const ids = CHAPTER_NAV.map((c) => c.id);
    let ticking = false;
    let scrollRaf = 0;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("crafo:showcase-visibility", { detail: window.scrollY < 400 }),
      );
    }

    const updateActive = () => {
      ticking = false;
      const rootEl = rootRef.current;
      if (rootEl) {
        const rr = rootEl.getBoundingClientRect();
        const visible = rr.top <= window.innerHeight * 0.65 && rr.bottom >= 140;
        if (visible !== inShowcaseRef.current) {
          inShowcaseRef.current = visible;
          setInShowcase(visible);
          soundEngine.setShowcaseActive(visible);
          window.dispatchEvent(new CustomEvent("crafo:showcase-visibility", { detail: visible }));
        }
      }

      const mid = window.innerHeight * 0.4;
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= 0) {
          setActiveSection((prev) => {
            if (prev !== ids[i]) {
              runEvictionAround(ids[i]);
            }
            return ids[i];
          });
          break;
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      scrollRaf = requestAnimationFrame(updateActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", onScroll);
      window.dispatchEvent(new CustomEvent("crafo:showcase-visibility", { detail: false }));
    };
  }, [runEvictionAround]);

  const handleEnableSound = () => {
    const next = soundEngine.enable();
    setSoundOn(next);
    setSoundBannerDismissed(true);
    window.dispatchEvent(new CustomEvent("crafo:sound-state", { detail: next }));
  };

  const handleJumpTo = (id: string) => {
    setRestUnlocked(true);
    activateStreaming();
    soundEngine.playTick();
    if (standalone3d && typeof window !== "undefined") {
      window.history.replaceState(null, "", chapterPath(id as ShowcaseChapterId, locale));
    }
    const scrollToTarget = (attempt = 0) => {
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          if (lenisRef.current) {
            lenisRef.current.resize();
            lenisRef.current.scrollTo(el, { offset: 0, duration: 1.1 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        });
        return;
      }
      if (attempt < 20) {
        window.setTimeout(() => scrollToTarget(attempt + 1), 50);
      }
    };
    scrollToTarget();
  };

  useEffect(() => {
    if (!initialChapter || initialChapter === "spin" || initialJumpDoneRef.current) return;
    initialJumpDoneRef.current = true;
    activateStreaming();
    runEvictionAround(initialChapter);
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(initialChapter);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [initialChapter, runEvictionAround]);

  return (
    <div id="showcase-3d-root" ref={rootRef} className="relative bg-black text-white overflow-x-clip">
      {/* Right-edge desktop chapter progress rail (only inside 3D showcase) */}
      {inShowcase && !cartOpen && (
        <nav
          aria-label={locale === "uk" ? "Навігація 3D-главами" : "Навигация по 3D-главам"}
          className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col gap-2.5 px-2.5 py-3 rounded-full glass-panel"
        >
          {CHAPTER_NAV.map((ch) => {
            const active = activeSection === ch.id;
            const href = chapterPath(ch.id as ShowcaseChapterId, locale);
            return (
              <a
                key={ch.id}
                href={href}
                title={ch.label[locale]}
                onClick={(e) => {
                  e.preventDefault();
                  handleJumpTo(ch.id);
                }}
                className="group relative flex items-center justify-center w-3 h-3 bg-transparent border-0 p-0 cursor-pointer"
              >
                <span
                  className={`block rounded-full transition-all duration-200 ${
                    active
                      ? "w-2.5 h-2.5 bg-[#e7b866] shadow-[0_0_10px_rgba(231,184,102,0.9)]"
                      : "w-1.5 h-1.5 bg-white/30 group-hover:bg-white/75"
                  }`}
                />
                <span className="pointer-events-none absolute right-6 px-2.5 py-1 rounded-md bg-black/90 border border-white/15 font-mono-tech text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {ch.label[locale]}
                </span>
              </a>
            );
          })}
        </nav>
      )}

      {/* 9-Chapter Photorealistic Scroll Showcase */}
      <ChapterSpin
        locale={locale}
        profile={profile}
        onActive={chapterHandlers.spin}
      />
      {standalone3d ? (
        <ShowcaseChaptersRestSSR
          locale={locale}
          profile={profile}
          standalone3d
          chapterHandlers={chapterHandlers}
        />
      ) : restUnlocked ? (
        <ShowcaseChaptersRestClient
          locale={locale}
          profile={profile}
          standalone3d={false}
          chapterHandlers={chapterHandlers}
        />
      ) : null}

      {/* Seamless Obsidian -> Warm Cream Bridge into full storefront catalog */}
      {!standalone3d && (
        <section
          aria-label={SHOWCASE_COPY.transition.heading[locale]}
          className="relative overflow-hidden bg-gradient-to-b from-black via-[#150c07] to-[#f8f2e9] px-6 py-24 text-center"
        >
          <div className="mx-auto max-w-3xl">
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.28em] text-[#e7b866]">
              {SHOWCASE_COPY.transition.kicker[locale]}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-[#fff3ce] sm:text-5xl">
              {SHOWCASE_COPY.transition.heading[locale]}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-cream/75 sm:text-base">
              {SHOWCASE_COPY.transition.sub[locale]}
            </p>
            <div className="mt-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e7b866]/50 bg-[#150c07]/70 text-[#e7b866] shadow-lg">
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </div>
          </div>
        </section>
      )}

      {/* Floating Audio Activation Prompt (desktop/tablet; mobile uses clean top-bar toggle) */}
      {inShowcase && !cartOpen && !soundOn && !soundBannerDismissed && (
        <div className="hidden md:flex fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 items-center gap-2 glass-panel rounded-full pl-3.5 pr-2 py-2 shadow-[0_12px_40px_rgba(231,184,102,0.18)] border border-[#e7b866]/45">
          <button
            type="button"
            onClick={handleEnableSound}
            className="flex items-center gap-2.5 text-left bg-transparent border-0 p-0 cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#b87d2e] via-[#e7b866] to-[#fff3ce] flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition-transform">
              <Volume2 className="w-3.5 h-3.5" />
            </span>
            <span className="flex flex-col pr-1">
              <span className="text-xs font-semibold text-[#fff3ce] leading-tight">
                {SHOWCASE_COPY.soundBanner.cta[locale]}
              </span>
              <span className="font-mono-tech text-[10px] text-white/55 leading-tight hidden sm:inline">
                {SHOWCASE_COPY.soundBanner.sub[locale]}
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Dismiss audio prompt"
            onClick={() => setSoundBannerDismissed(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white/45 hover:text-white hover:bg-white/10 bg-transparent border-0 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
