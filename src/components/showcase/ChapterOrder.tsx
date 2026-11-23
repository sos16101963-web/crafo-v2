"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, CheckCircle2, ArrowDownRight, Clock, ShoppingBag } from "lucide-react";
import { formatPrice, type Locale } from "@/lib/i18n";
import { catalogFor } from "@/lib/products";
import { FEATURED_SET_IDS, SHOWCASE_COPY } from "@/lib/showcase/content";
import { soundEngine } from "@/lib/showcase/soundEngine";
import { useCart } from "@/store/cart";

export const ChapterOrder: React.FC<{
  locale: Locale;
  standalone3d?: boolean;
}> = ({ locale, standalone3d = false }) => {
  const addItem = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);

  const featuredSets = useMemo(() => {
    const all = catalogFor(locale);
    return FEATURED_SET_IDS.map((id) => all.find((p) => p.id === id)).filter(
      (p): p is NonNullable<typeof p> => Boolean(p),
    );
  }, [locale]);

  const [quantities, setQuantities] = useState<Record<string, number>>({
    "set-sixteen": 1,
    "set-twelve": 0,
    "set-nine": 0,
    "set-six": 0,
  });
  const [addedFeedback, setAddedFeedback] = useState<{ count: number; total: number } | null>(
    null,
  );
  const [secondsLeft, setSecondsLeft] = useState(2 * 3600 + 14 * 60 + 38);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 2 * 3600 + 15 * 60));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const adjustQty = (id: string, delta: number) => {
    soundEngine.playTick();
    setAddedFeedback(null);
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(20, (prev[id] ?? 0) + delta)),
    }));
  };

  const totalUAH = featuredSets.reduce(
    (acc, item) => acc + item.price * (quantities[item.id] ?? 0),
    0,
  );
  const totalCount = featuredSets.reduce((acc, item) => acc + (quantities[item.id] ?? 0), 0);

  const handleAddToCart = () => {
    if (totalCount === 0) return;
    soundEngine.playTick();
    for (const item of featuredSets) {
      const q = quantities[item.id] ?? 0;
      if (q > 0) {
        addItem(item.id, q);
      }
    }
    setAddedFeedback({ count: totalCount, total: totalUAH });
    openCart();
  };

  const fullCatalogHref = standalone3d
    ? locale === "uk"
      ? "/katalog"
      : "/ru/katalog"
    : "#catalog";

  return (
    <section
      id="order"
      className="relative bg-black py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-white/10"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono-tech text-[11px] tracking-[0.26em] text-[#e7b866]/85 uppercase mb-3">
            {SHOWCASE_COPY.order.kicker[locale]}
          </p>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight gold-gradient-text leading-[1.04]">
            {SHOWCASE_COPY.order.heading[locale]}
          </h2>
          <p className="text-sm sm:text-base text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            {SHOWCASE_COPY.order.sub[locale]}
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/12">
            <div className="flex items-center gap-2.5 text-white/75 text-sm">
              <Clock className="w-4 h-4 text-[#e7b866]" />
              <span>{SHOWCASE_COPY.order.countdownLabel[locale]}</span>
            </div>
            <div className="font-mono-tech text-2xl sm:text-3xl font-semibold gold-gradient-text">
              {hh}:{mm}:{ss}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {featuredSets.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#e7b866]/35 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="w-16 h-16 rounded-xl object-cover border border-white/15 shrink-0"
                    />
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-white/55 mt-0.5">{item.weight}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="font-mono-tech text-lg font-semibold text-[#f3d28e]">
                      {item.priceFrom
                        ? `${locale === "uk" ? "від " : "от "}${formatPrice(item.price, locale)}`
                        : formatPrice(item.price, locale)}
                    </div>

                    <div className="flex items-center gap-2 bg-black/70 rounded-full p-1 border border-white/15">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => adjustQty(item.id, -1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white/75 hover:bg-white/10 cursor-pointer border-0 bg-transparent"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono-tech text-sm w-6 text-center text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name}`}
                        onClick={() => adjustQty(item.id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white/75 hover:bg-white/10 cursor-pointer border-0 bg-transparent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/12">
            <div>
              <div className="font-mono-tech text-[10px] uppercase tracking-wider text-white/45">
                {SHOWCASE_COPY.order.totalLabel[locale]}
              </div>
              <div className="font-mono-tech text-3xl sm:text-4xl font-bold text-white mt-0.5">
                {formatPrice(totalUAH, locale)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={totalCount === 0}
                onClick={handleAddToCart}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-[#e7b866] to-[#fff3ce] text-black hover:brightness-110 disabled:opacity-40 cursor-pointer border-0 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                {SHOWCASE_COPY.order.addToCartBtn[locale]}
              </button>
              <a
                href={fullCatalogHref}
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-full text-sm font-medium text-white/85 border border-white/20 hover:border-[#e7b866]/60 hover:text-[#fff3ce] transition-all no-underline"
              >
                {SHOWCASE_COPY.order.fullCatalogBtn[locale]}
                <ArrowDownRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {addedFeedback && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/12 border border-emerald-400/35 text-emerald-200 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">
                  {locale === "uk"
                    ? "Додано до кошика — оформлення відкрито."
                    : "Добавлено в корзину — оформление открыто."}
                </div>
                <div className="text-xs text-emerald-200/75 mt-1 font-mono-tech">
                  {addedFeedback.count} · {formatPrice(addedFeedback.total, locale)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
