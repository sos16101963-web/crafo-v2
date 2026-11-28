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
    const timer = window.setTimeout(() => setReady(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? <LeadMagnet locale={locale} /> : null;
}
