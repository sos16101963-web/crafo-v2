"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

const PhotoMarquee = dynamic(() => import("./photo-marquee").then((m) => m.PhotoMarquee), {
  ssr: false,
  loading: () => (
    <div
      className="h-[228px] border-y border-gold-400/15 bg-choco-950"
      aria-hidden="true"
    />
  ),
});

export function PhotoMarqueeLazy({ locale }: { locale: Locale }) {
  return <PhotoMarquee locale={locale} />;
}
