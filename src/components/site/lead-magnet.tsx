"use client";

import { useEffect, useState } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

const LS_KEY = "leadMagnetDismissedAt";
const SHOW_DELAY_MS = 2000;
const HIDE_DAYS = 3;

const LEAD_COPY = {
  uk: {
    title: "Не знаєте, що обрати до вашого свята?",
    text: "Напишіть у Telegram або Viber — майстер збере індивідуальний бокс за 5 хвилин.",
    telegram: "Telegram",
    viber: "Viber",
    close: "Приховати підказку",
    aria: "Допомога з вибором подарунка",
  },
  ru: {
    title: "Не знаете, что выбрать к вашему празднику?",
    text: "Напишите в Telegram или Viber — мастер соберёт индивидуальный бокс за 5 минут.",
    telegram: "Telegram",
    viber: "Viber",
    close: "Скрыть подсказку",
    aria: "Помощь с выбором подарка",
  },
} as const;

/**
 * Лид-магнит «первый контакт»: не знает, что выбрать → майстер соберёт
 * индивидуальный бокс. Плашка снизу справа, не перекрывает контент,
 * закрывается и не показывается 3 дня.
 */
export function LeadMagnet({ locale }: { locale: Locale }) {
  const t = LEAD_COPY[locale];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    try {
      const dismissed = localStorage.getItem(LS_KEY);
      if (dismissed && Date.now() - Number(dismissed) < HIDE_DAYS * 86400_000) return;
    } catch {}
    timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(LS_KEY, String(Date.now()));
    } catch {}
  };

  if (!visible) return null;

  return (
    <aside
      role="complementary"
      aria-label={t.aria}
      className="fixed bottom-24 lg:bottom-4 right-4 z-40 w-[min(92vw,360px)] animate-fade-up rounded-2xl border border-gold-500/40 bg-choco-950/95 p-5 text-cream shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
    >
      <button
        onClick={dismiss}
        aria-label={t.close}
        className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-cream/50 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <p className="font-display text-lg font-bold leading-snug">{t.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-cream/75">{t.text}</p>
      <div className="mt-4 flex gap-2.5">
        <a
          href={site.messengers[2].href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("contact_click", { channel: "telegram", source: "lead_magnet" })}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#197cae] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <Send className="h-4 w-4" aria-hidden="true" /> {t.telegram}
        </a>
        <a
          href={site.messengers[0].href}
          onClick={() => trackEvent("contact_click", { channel: "viber", source: "lead_magnet" })}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#6f5df1] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t.viber}
        </a>
      </div>
    </aside>
  );
}
