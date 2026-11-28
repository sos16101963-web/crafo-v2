"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ShoppingBag, Menu, X, Phone, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { YouTubeIcon, TikTokIcon } from "@/components/site/icons";
import { BackButton } from "@/components/site/back-button";

const HeaderMobileMenu = dynamic(
  () => import("./header-mobile-menu").then((m) => m.HeaderMobileMenu),
  { ssr: false },
);

const HEADER_COPY = {
  uk: {
    nav: [
      { href: "/katalog", label: "Каталог" },
      { href: "/korporatyvni-podary", label: "Корпоративні" },
      { href: "/tsiny", label: "Ціни" },
      { href: "/dostavka", label: "Доставка" },
      { href: "/pro-nas", label: "Про майстерню" },
      { href: "/vidhuky", label: "Відгуки" },
      { href: "/blog", label: "Блог" },
      { href: "/kontakty", label: "Контакти" },
    ],
    menu: "Меню",
    openCart: (n: number) => `Відкрити корзину, товарів: ${n}`,
    openMenu: "Відкрити меню",
    call: (phone: string) => `Подзвонити: ${phone}`,
    logoAria: "CraftChocoKharkiv — шоколад ручної роботи в Харкові, на головну",
  },
  ru: {
    nav: [
      { href: "/ru/katalog", label: "Каталог" },
      { href: "/ru/korporativnye-podary", label: "Корпоративным" },
      { href: "/ru/tseny", label: "Цены" },
      { href: "/ru/dostavka", label: "Доставка" },
      { href: "/ru/o-nas", label: "О мастерской" },
      { href: "/ru/otzyvy", label: "Отзывы" },
      { href: "/ru/blog", label: "Блог" },
      { href: "/ru/kontakty", label: "Контакты" },
    ],
    menu: "Меню",
    openCart: (n: number) => `Открыть корзину, товаров: ${n}`,
    openMenu: "Открыть меню",
    call: (phone: string) => `Позвонить: ${phone}`,
    logoAria: "CraftChocoKharkiv — шоколад ручной работы в Харькове, на главную",
  },
} as const;

export function Logo({ light = false, locale = "uk" }: { light?: boolean; locale?: Locale }) {
  return (
    <Link
      href={locale === "uk" ? "/" : "/ru"}
      className="flex shrink-0 items-center gap-2 sm:gap-2.5 group"
      aria-label={HEADER_COPY[locale].logoAria}
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
  const t = HEADER_COPY[locale];
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const mounted = useMounted();
  const [scrolled, setScrolled] = useState(false);
  const [inDarkShowcase, setInDarkShowcase] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuLoaded, setMobileMenuLoaded] = useState(false);
  const [has3D, setHas3D] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const hasShowcase = Boolean(document.getElementById("showcase-3d-root"));
    setHas3D(hasShowcase);

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
    };

    const rafId = requestAnimationFrame(() => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setInDarkShowcase(hasShowcase && y < 400);
    });

    const onShowcaseVis = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setInDarkShowcase(Boolean(custom.detail));
    };
    const onSoundState = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setSoundOn(Boolean(custom.detail));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("crafo:showcase-visibility", onShowcaseVis);
    window.addEventListener("crafo:sound-state", onSoundState);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("crafo:showcase-visibility", onShowcaseVis);
      window.removeEventListener("crafo:sound-state", onSoundState);
    };
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

          <Button
            variant="outline"
            size="icon"
            aria-label={t.openMenu}
            onClick={() => {
              setMobileMenuLoaded(true);
              setMobileOpen((prev) => !prev);
            }}
            className={`h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-full border lg:hidden ${
              !lightText
                ? "border-choco-700/20 bg-white/70 text-choco-900 hover:bg-white"
                : "border-white/25 bg-white/10 text-cream backdrop-blur hover:bg-white/20"
            }`}
          >
            {mobileOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          {mobileMenuLoaded && (
            <HeaderMobileMenu
              open={mobileOpen}
              onOpenChange={setMobileOpen}
              locale={locale}
              showcaseHref={showcaseHref}
              nav={t.nav}
              menuTitle={t.menu}
            />
          )}
        </div>
      </div>
    </header>
  );
}
