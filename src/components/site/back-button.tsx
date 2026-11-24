"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function BackButton({
  locale,
  variant = "header",
  lightText = false,
}: {
  locale: Locale;
  variant?: "header" | "dock";
  lightText?: boolean;
}) {
  const router = useRouter();
  const label = locale === "uk" ? "Назад" : "Назад";
  const ariaLabel = locale === "uk" ? "Повернутися назад" : "Вернуться назад";

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(locale === "uk" ? "/" : "/ru");
    }
  };

  if (variant === "dock") {
    return (
      <button
        type="button"
        onClick={handleBack}
        aria-label={ariaLabel}
        className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-medium text-cream/85 hover:bg-white/10 active:scale-95 transition-all cursor-pointer border-0 bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 text-[#e7b866]" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`hidden sm:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
        lightText
          ? "border-white/25 bg-white/10 text-cream/90 backdrop-blur hover:bg-white/20 hover:text-white"
          : "border-choco-700/20 bg-white/75 text-choco-900 hover:bg-white"
      }`}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
