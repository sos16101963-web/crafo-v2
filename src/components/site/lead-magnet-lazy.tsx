"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

const LeadMagnet = dynamic(() => import("./lead-magnet").then((m) => m.LeadMagnet), {
  ssr: false,
});

export function LeadMagnetLazy({ locale }: { locale: Locale }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let innerTimer = 0;
    let mounted = false;

    const startAfterInteraction = () => {
      cleanup();
      if (mounted) return;
      innerTimer = window.setTimeout(() => {
        mounted = true;
        setReady(true);
      }, 12000);
    };

    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "scroll", "keydown"];
    const cleanup = () => {
      events.forEach((ev) => window.removeEventListener(ev, startAfterInteraction));
      window.clearTimeout(fallbackTimer);
    };

    events.forEach((ev) => window.addEventListener(ev, startAfterInteraction, { once: true, passive: true }));
    const fallbackTimer = window.setTimeout(() => {
      mounted = true;
      cleanup();
      setReady(true);
    }, 20000);

    return () => {
      cleanup();
      window.clearTimeout(innerTimer);
    };
  }, []);

  return ready ? <LeadMagnet locale={locale} /> : null;
}
