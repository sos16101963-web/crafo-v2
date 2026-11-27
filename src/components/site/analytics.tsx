"use client";

import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-KN1ZWRMSWZ";
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "1847133093271781";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "yr31dmrb43";

type FbqStub = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

type ClarityStub = ((...args: unknown[]) => void) & { q?: unknown[] };

function recordTrafficSource() {
  try {
    if (sessionStorage.getItem("crafo_traffic_source")) return;
    const ref = document.referrer || "";
    const params = new URLSearchParams(window.location.search);
    const utm = (params.get("utm_source") || "").toLowerCase();
    const lowerRef = ref.toLowerCase();
    let source = "Прямий перехід на сайт";

    if (lowerRef.includes("youtube.com") || lowerRef.includes("youtu.be") || utm.includes("youtube")) {
      source = "YouTube";
    } else if (lowerRef.includes("tiktok.com") || utm.includes("tiktok")) {
      source = "TikTok";
    } else if (lowerRef.includes("instagram.com") || utm.includes("instagram")) {
      source = "Instagram";
    } else if (
      lowerRef.includes("facebook.com") ||
      lowerRef.includes("fb.com") ||
      utm.includes("facebook") ||
      params.has("fbclid")
    ) {
      source = "Facebook";
    } else if (lowerRef.includes("google.") || utm.includes("google")) {
      source = "Google (Пошук)";
    } else if (lowerRef.includes("t.me") || lowerRef.includes("telegram") || utm.includes("telegram")) {
      source = "Telegram";
    } else if (lowerRef && !lowerRef.includes(window.location.hostname)) {
      try {
        source = new URL(ref).hostname;
      } catch {
        source = ref;
      }
    }
    sessionStorage.setItem("crafo_traffic_source", JSON.stringify({ source, referrer: ref }));
  } catch {
    /* ignore storage errors */
  }
}

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/**
 * Отложенная загрузка сторонних скриптов аналитики (GA4, Meta Pixel, Clarity):
 * стартует после первого жеста пользователя или в простое (6.5 с),
 * чтобы не блокировать FCP/LCP/TBT на мобильном интернете.
 */
export function Analytics() {
  useEffect(() => {
    recordTrafficSource();

    let loaded = false;
    const w = window as unknown as {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      fbq?: FbqStub;
      _fbq?: unknown;
      clarity?: ClarityStub;
    };

    const loadThirdParty = () => {
      if (loaded) return;
      loaded = true;
      cleanup();

      if (GA_ID) {
        w.dataLayer = w.dataLayer || [];
        w.gtag = function gtag(...args: unknown[]) {
          w.dataLayer!.push(args);
        };
        w.gtag("js", new Date());
        w.gtag("config", GA_ID, { currency: "UAH" });
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      }

      if (FB_PIXEL_ID) {
        if (!w.fbq) {
          const n: FbqStub = function (...args: unknown[]) {
            if (n.callMethod) {
              n.callMethod(...args);
            } else {
              n.queue!.push(args);
            }
          };
          n.push = n;
          n.loaded = true;
          n.version = "2.0";
          n.queue = [];
          w.fbq = n;
          w._fbq = n;
        }
        w.fbq("init", FB_PIXEL_ID);
        w.fbq("track", "PageView");
        loadScript("https://connect.facebook.net/en_US/fbevents.js");
      }

      if (CLARITY_ID) {
        if (!w.clarity) {
          const c: ClarityStub = function (...args: unknown[]) {
            (c.q = c.q || []).push(args);
          };
          w.clarity = c;
        }
        loadScript(`https://www.clarity.ms/tag/${CLARITY_ID}`);
      }
    };

    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "scroll"];
    const cleanup = () => {
      events.forEach((ev) => window.removeEventListener(ev, loadThirdParty));
      window.clearTimeout(timer);
    };

    events.forEach((ev) => window.addEventListener(ev, loadThirdParty, { passive: true, once: true }));
    const timer = window.setTimeout(loadThirdParty, 12000);

    return cleanup;
  }, []);

  return null;
}
