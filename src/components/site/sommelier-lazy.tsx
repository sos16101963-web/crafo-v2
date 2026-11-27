"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

const ChocolateSommelier = dynamic(
  () => import("./chocolate-sommelier").then((m) => m.ChocolateSommelier),
  { ssr: false },
);

export function SommelierLazy({ locale }: { locale: Locale }) {
  return <ChocolateSommelier locale={locale} />;
}
