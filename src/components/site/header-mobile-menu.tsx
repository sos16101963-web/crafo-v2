"use client";

import { Phone, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { YouTubeIcon, TikTokIcon } from "@/components/site/icons";

export interface HeaderNavLink {
  href: string;
  label: string;
}

export function HeaderMobileMenu({
  open,
  onOpenChange,
  locale,
  showcaseHref,
  nav,
  menuTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
  showcaseHref: string;
  nav: readonly HeaderNavLink[];
  menuTitle: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] bg-choco-950 border-choco-800 text-cream">
        <SheetHeader>
          <SheetTitle className="text-left font-display text-xl text-cream">{menuTitle}</SheetTitle>
        </SheetHeader>
        <nav
          className="mt-2 flex flex-col gap-1 px-4"
          aria-label={locale === "uk" ? "Мобільна навігація" : "Мобильная навигация"}
        >
          <a
            href={showcaseHref}
            onClick={() => onOpenChange(false)}
            className="mb-1 flex items-center justify-between rounded-xl border border-[#e7b866]/50 bg-black/80 px-4 py-3 text-base font-bold text-[#fff3ce] transition-colors hover:bg-black"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#e7b866]" />
              <span>3D BONBON PRO</span>
            </span>
            <span className="rounded-full bg-[#e7b866]/20 px-2 py-0.5 font-mono text-[10px] text-[#f3d28e]">
              9 ГЛАВ
            </span>
          </a>
          <a
            href={locale === "uk" ? "/sommelier" : "/ru/sommelier"}
            onClick={() => onOpenChange(false)}
            className="mb-1 flex items-center justify-between rounded-xl border border-gold-500/40 bg-gradient-to-r from-gold-500/20 to-gold-500/5 px-4 py-3 text-base font-bold text-gold-300 transition-colors hover:bg-gold-500/25"
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>{locale === "uk" ? "Шоколадний сомельє" : "Шоколадный сомелье"}</span>
            </span>
            <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-choco-950">
              -10%
            </span>
          </a>
          {nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-cream/85 transition-colors hover:bg-choco-800 hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-2 px-4">
            <span className="text-xs text-cream/50">UKR</span>
            <a href="/" hrefLang="uk" className={`text-sm font-bold ${locale === "uk" ? "text-gold-300" : "text-cream/70"}`}>
              Ukrainian
            </a>
            <span className="text-xs text-cream/50">·</span>
            <a href="/ru" hrefLang="ru" className={`text-sm font-bold ${locale === "ru" ? "text-gold-300" : "text-cream/70"}`}>
              Русский
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
              {locale === "uk" ? "Відео створення щодня:" : "Видео создания каждый день:"}
            </span>
            <a
              href={site.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-choco-900/90 border border-white/10 px-3 py-2.5 text-sm font-medium text-cream hover:border-red-500/50 hover:text-red-300 transition-colors"
            >
              <YouTubeIcon className="h-5 w-5 text-red-500 shrink-0" />
              <span>
                YouTube <span className="block text-[11px] text-cream/60">@craft.choco.kharkiv</span>
              </span>
            </a>
            <a
              href={site.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-choco-900/90 border border-white/10 px-3 py-2.5 text-sm font-medium text-cream hover:border-gold-400/50 hover:text-gold-300 transition-colors"
            >
              <TikTokIcon className="h-5 w-5 text-[#25f4ee] shrink-0" />
              <span>
                TikTok <span className="block text-[11px] text-cream/60">@aleksandr_mag_</span>
              </span>
            </a>
          </div>

          <a
            href={site.phoneHref}
            className="mt-3 flex items-center gap-2 rounded-xl bg-choco-800 px-4 py-3 text-base font-semibold text-gold-300"
          >
            <Phone className="h-4 w-4" /> {site.phone}
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
