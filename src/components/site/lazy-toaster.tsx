"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/* Sonner выносится из стартового бандла: чанк грузится строго по первому
   взаимодействию (pointerdown/keydown) или событию crafo:toast — без фоновых таймеров. */
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const activate = () => setReady(true);
    window.addEventListener("pointerdown", activate, { once: true, passive: true });
    window.addEventListener("keydown", activate, { once: true, passive: true });
    window.addEventListener("crafo:toast", activate, { once: true });
    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("crafo:toast", activate);
    };
  }, [ready]);

  return ready ? <Toaster /> : null;
}
