"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/* Sonner выносится из стартового бандла: чанк грузится только после первого жеста
   или события crafo:toast, либо через 10 с в простое — 0 работы на первом экране. */
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const activate = () => setReady(true);
    const timer = window.setTimeout(activate, 10000);
    window.addEventListener("pointerdown", activate, { once: true, passive: true });
    window.addEventListener("keydown", activate, { once: true, passive: true });
    window.addEventListener("crafo:toast", activate, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("crafo:toast", activate);
    };
  }, [ready]);

  return ready ? <Toaster /> : null;
}
