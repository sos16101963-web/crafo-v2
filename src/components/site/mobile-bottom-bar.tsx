"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Box, Grid2X2, Sparkles, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import type { Locale } from "@/lib/i18n";

const emptySub = () => () => {};

export function MobileBottomBar({
  locale,
  isHome = false,
}: {
  locale: Locale;
  isHome?: boolean;
}) {
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const mounted = useSyncExternalStore(emptySub, () => true, () => false);
  const totalQty = mounted ? items.reduce((acc, i) => acc + i.qty, 0) : 0;

  const catalogHref = isHome ? "#catalog" : locale === "uk" ? "/katalog" : "/ru/katalog";
  const sommelierHref = locale === "uk" ? "/sommelier" : "/ru/sommelier";
  const showcaseHref = isHome ? "#spin" : locale === "uk" ? "/3d" : "/ru/3d";

  return (
    <nav
      aria-label={locale === "uk" ? "Швидка панель" : "Быстрая панель"}
      className="fixed inset-x-3 bottom-3 z-40 lg:hidden pb-[env(safe-area-inset-bottom)] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 gap-1 rounded-2xl border border-[#e7b866]/35 bg-[#120c08]/92 p-1.5 text-cream shadow-[0_14px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <a
          href={showcaseHref}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium text-cream/85 hover:bg-white/10 active:scale-95 transition-all"
        >
          <Box className="h-4 w-4 text-[#e7b866]" />
          <span>3D</span>
        </a>

        <a
          href={catalogHref}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium text-cream/85 hover:bg-white/10 active:scale-95 transition-all"
        >
          <Grid2X2 className="h-4 w-4 text-[#e7b866]" />
          <span>{locale === "uk" ? "Каталог" : "Каталог"}</span>
        </a>

        <Link
          href={sommelierHref}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium text-[#fff3ce] hover:bg-white/10 active:scale-95 transition-all"
        >
          <Sparkles className="h-4 w-4 text-[#e7b866]" />
          <span>{locale === "uk" ? "Сомельє" : "Сомелье"}</span>
        </Link>

        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl bg-gradient-to-r from-[#e7b866] to-[#f3d28e] py-2 text-[11px] font-bold text-black active:scale-95 transition-all cursor-pointer border-0"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{locale === "uk" ? "Кошик" : "Корзина"}</span>
          {mounted && totalQty > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-choco-950 px-1 text-[10px] font-bold text-[#f3d28e] ring-2 ring-[#e7b866]">
              {totalQty}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
