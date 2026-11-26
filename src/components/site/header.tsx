"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Phone, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { site } from "@/lib/site";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { YouTubeIcon, TikTokIcon } from "@/components/site/icons";
import { BackButton } from "@/components/site/back-button";

export function Logo({ light = false, locale = "uk" }: { light?: boolean; locale?: Locale }) {
  return (
    <Link
      href={locale === "uk" ? "/" : "/ru"}
      className="flex shrink-0 items-center gap-2 sm:gap-2.5 group"
      aria-label={getDict(locale).header.logoAria}
    >
      <span
        className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
          light ? "border-gold-400/40 bg-choco-900" : "border-gold-500/50 bg-choco-900"
        }`}
      >
        <svg className="h-4 w-4 sm:h-[22px] sm:w-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="7" ry="10" stroke="#d6b169" strokeWidth="1.6" transform="rotate(28 12 12)" />
          <path d="M8.5 3.8c3 3.4 4 12.6 1.4 16.6" stroke="#d6b169" strokeWidth="1.3" strokeLinecap="round" transform="rotate(28 12 12)" />
        </svg>
      </span>
      <span className={`font-display text-sm sm:text-lg leading-none tracking-wide whitespace-nowrap ${light ? "text-cream" : "text-choco-900"}`}>
        CRAFTCHOCO
        <span className="block text-[9px] sm:text-[10px] font-sans font-semibold tracking-[0.24em] sm:tracking-[0.32em] text-gold-500">KHARKIV</span>
      </span>
    </Link>
  );
}

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function useScrolled(threshold = 24) {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("scroll", cb, { passive: true });
    return () => window.removeEventListener("scroll", cb);
  }, []);
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function useInDarkShowcase() {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("scroll", cb, { passive: true });
    window.addEventListener("resize", cb, { passive: true });
    return () => {
      window.removeEventListener("scroll", cb);
      window.removeEventListener("resize", cb);
    };
  }, []);
  const getSnapshot = useCallback(() => {
    const el = document.getElementById("showcase-3d-root");
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top <= 80 && rect.bottom > 80;
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Переключатель языка: UKR ⇄ RU (hreflang-парные пути).
 *  switchPair — явная пара (uk-href, ru-href) текущей страницы;
 *  без неё — обратно совместимый дом/ru. */
function LangSwitch({
  locale,
  lightText,
  switchPair,
}: {
  locale: Locale;
  lightText: boolean;
  switchPair?: { uk: string; ru: string };
}) {
  const ukHref = switchPair?.uk ?? "/";
  const ruHref = switchPair?.ru ?? "/ru";
  return (
    <nav aria-label="Мова сайту / Язык сайта" className="flex shrink-0 items-center overflow-hidden rounded-full border text-[11px] sm:text-xs font-bold">
      <a
        href={ukHref}
        hrefLang="uk"
        aria-current={locale === "uk" ? "page" : undefined}
        className={`px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors ${
          locale === "uk"
            ? "bg-gold-500 text-choco-950"
            : lightText
              ? "text-cream/70 hover:text-gold-300"
              : "text-choco-600 hover:text-choco-900"
        }`}
      >
        UKR
      </a>
      <a
        href={ruHref}
        hrefLang="ru"
        aria-current={locale === "ru" ? "page" : undefined}
        className={`px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors ${
          locale === "ru"
            ? "bg-gold-500 text-choco-950"
            : lightText
              ? "text-cream/70 hover:text-gold-300"
              : "text-choco-600 hover:text-choco-900"
        }`}
      >
        RU
      </a>
    </nav>
  );
}

export function Header({
  locale,
  switchPair,
  solidHeader = false,
}: {
  locale: Locale;
  switchPair?: { uk: string; ru: string };
  solidHeader?: boolean;
}) {
  const t = getDict(locale).header;
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const mounted = useMounted();
  const scrolled = useScrolled();
  const inDarkShowcase = useInDarkShowcase();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [has3D, setHas3D] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    setHas3D(Boolean(document.getElementById("showcase-3d-root")));
    const onSoundState = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setSoundOn(Boolean(custom.detail));
    };
    window.addEventListener("crafo:sound-state", onSoundState);
    return () => window.removeEventListener("crafo:sound-state", onSoundState);
  }, []);

  const solid = solidHeader || scrolled;
  const lightText = (!solid || inDarkShowcase) && !solidHeader;
  const totalQty = mounted ? items.reduce((acc, i) => acc + i.qty, 0) : 0;
  const showcaseHref = locale === "uk" ? "/3d" : "/ru/3d";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        !solid
          ? "bg-transparent"
          : inDarkShowcase && !solidHeader
            ? "border-b border-white/10 bg-black/75 backdrop-blur-xl"
            : "bg-cream/92 shadow-[0_8px_32px_-12px_rgba(42,26,14,0.18),inset_0_-1px_0_0_rgba(228,215,195,0.6),inset_0_1px_0_0_rgba(255,255,255,0.85)] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8">
        <div className={lightText ? "flex shrink-0 items-center gap-2 text-cream" : "flex shrink-0 items-center gap-2"}>
          <BackButton locale={locale} variant="header" lightText={lightText} />
          <Logo light={lightText} locale={locale} />
        </div>

        <nav className="hidden items-center gap-0.5 xl:gap-1 lg:flex" aria-label={locale === "uk" ? "Основна навігація" : "Основная навигация"}>
          <Link
            href={showcaseHref}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
              lightText
                ? "border border-[#e7b866]/45 bg-[#e7b866]/15 text-[#fff3ce] hover:bg-[#e7b866]/25"
                : "border border-gold-500/45 bg-gold-500/15 text-choco-900 hover:bg-gold-500/25"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            3D
          </Link>
          {t.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-full px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-medium whitespace-nowrap transition-colors ${
                lightText ? "text-cream/90 hover:bg-white/10 hover:text-cream" : "text-choco-800 hover:bg-cream-200"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {has3D && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("crafo:sound-toggle"))}
              aria-label={locale === "uk" ? "Увімкнути/вимкнути музику та звук 3D" : "Включить/выключить музыку и звук 3D"}
              title={locale === "uk" ? "Увімкнути/вимкнути музику та звук 3D" : "Включить/выключить музыку и звук 3D"}
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
                soundOn
                  ? "border-[#e7b866]/70 bg-[#e7b866]/20 text-[#fff3ce]"
                  : lightText
                    ? "border-white/25 bg-white/10 text-cream/85 backdrop-blur hover:bg-white/20"
                    : "border-choco-700/20 bg-white/70 text-choco-900 hover:bg-white"
              }`}
            >
              {soundOn ? <Volume2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" /> : <VolumeX className="h-4 w-4 sm:h-4.5 sm:w-4.5" />}
              {!soundOn && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e7b866] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e7b866]" />
                </span>
              )}
            </button>
          )}
          {/* Быстрые ссылки на видео процесса (YouTube & TikTok) */}
          <div className="hidden items-center gap-1.5 sm:flex shrink-0">
            <a
              href={site.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube craft.choco.kharkiv"
              title="YouTube: craft.choco.kharkiv"
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all ${
                !lightText
                  ? "border-choco-700/20 bg-white/70 text-red-600 hover:border-red-400 hover:bg-red-50 hover:scale-105"
                  : "border-white/25 bg-white/10 text-red-400 backdrop-blur hover:bg-white/20 hover:text-red-300 hover:scale-105"
              }`}
            >
              <YouTubeIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </a>
            <a
              href={site.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok aleksandr_mag_"
              title="TikTok: @aleksandr_mag_"
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all ${
                !lightText
                  ? "border-choco-700/20 bg-white/70 text-choco-900 hover:border-choco-500 hover:bg-zinc-100 hover:scale-105"
                  : "border-white/25 bg-white/10 text-cream backdrop-blur hover:bg-white/20 hover:text-gold-300 hover:scale-105"
              }`}
            >
              <TikTokIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </a>
          </div>

          <LangSwitch locale={locale} lightText={lightText} switchPair={switchPair} />

          <a
            href={site.phoneHref}
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors 2xl:flex ${
              !lightText ? "text-choco-800 hover:text-choco-600" : "text-cream/90 hover:text-gold-300"
            }`}
            aria-label={t.call(site.phone)}
          >
            <Phone className="h-4 w-4 shrink-0" />
            {site.phone}
          </a>

          <Button
            onClick={openCart}
            variant="outline"
            size="icon"
            aria-label={t.openCart(totalQty)}
            className={`relative shrink-0 rounded-full h-9 w-9 sm:h-11 sm:w-11 border ${
              !lightText
                ? "border-choco-700/20 bg-white/70 text-choco-900 hover:bg-white"
                : "border-white/25 bg-white/10 text-cream backdrop-blur hover:bg-white/20"
            }`}
          >
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            {mounted && totalQty > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] sm:text-[11px] font-bold text-choco-950">
                {totalQty}
              </span>
            )}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={t.openMenu}
                className={`h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-full border lg:hidden ${
                  !lightText
                    ? "border-choco-700/20 bg-white/70 text-choco-900 hover:bg-white"
                    : "border-white/25 bg-white/10 text-cream backdrop-blur hover:bg-white/20"
                }`}
              >
                {mobileOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-choco-950 border-choco-800 text-cream">
              <SheetHeader>
                <SheetTitle className="text-left font-display text-xl text-cream">{t.menu}</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4" aria-label={locale === "uk" ? "Мобільна навігація" : "Мобильная навигация"}>
                <a
                  href={showcaseHref}
                  onClick={() => setMobileOpen(false)}
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
                  onClick={() => setMobileOpen(false)}
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
                {t.nav.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-medium text-cream/85 transition-colors hover:bg-choco-800 hover:text-gold-300"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 flex items-center gap-2 px-4">
                  <span className="text-xs text-cream/50">UKR</span>
                  <a href="/" hrefLang="uk" className={`text-sm font-bold ${locale === "uk" ? "text-gold-300" : "text-cream/70"}`}>Ukrainian</a>
                  <span className="text-xs text-cream/50">·</span>
                  <a href="/ru" hrefLang="ru" className={`text-sm font-bold ${locale === "ru" ? "text-gold-300" : "text-cream/70"}`}>Русский</a>
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
                    <span>YouTube <span className="block text-[11px] text-cream/60">@craft.choco.kharkiv</span></span>
                  </a>
                  <a
                    href={site.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-choco-900/90 border border-white/10 px-3 py-2.5 text-sm font-medium text-cream hover:border-gold-400/50 hover:text-gold-300 transition-colors"
                  >
                    <TikTokIcon className="h-5 w-5 text-[#25f4ee] shrink-0" />
                    <span>TikTok <span className="block text-[11px] text-cream/60">@aleksandr_mag_</span></span>
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
        </div>
      </div>
    </header>
  );
}
