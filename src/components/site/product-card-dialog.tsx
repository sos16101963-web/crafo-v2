"use client";

import Image from "next/image";
import { Check, ShoppingBag, MessageCircle, Send, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ProductVariant } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { trackIntent } from "@/lib/analytics";
import { Stars } from "./stars";
import type { CardProduct } from "./product-card";

const DIALOG_COPY = {
  uk: {
    reviewsWord: "відгуків",
    inSet: "У наборі",
    freeBadge: "безкоштовно",
    cocoa: "Какао",
    weight: "Вага",
    composition: "Склад",
    storage: "Зберігання",
    inCart: "В корзину",
    priceFromNote:
      "Ціна «від»: підсумок залежить від обраного смаку та наповнення — узгодимо у Viber або Telegram перед відправкою.",
    thermo: "❄ Гарантія цілісності: термобокс з охолодженням. Доїде ідеальним навіть за +30°C — або замінимо за наш рахунок",
    freeDeliveryLine: (from: string) => `Безкоштовна доставка по Харкову від ${from} ₴`,
  },
  ru: {
    reviewsWord: "отзывов",
    inSet: "В наборе",
    freeBadge: "бесплатно",
    cocoa: "Какао",
    weight: "Вес",
    composition: "Состав",
    storage: "Хранение",
    inCart: "В корзину",
    priceFromNote:
      "Цена «от»: итог зависит от выбранного вкуса и наполнения — согласуем в Viber или Telegram перед отправкой.",
    thermo: "❄ Гарантия целостности: термобокс с охлаждением. Доедет идеальным даже в +30°C — или заменим за наш счёт",
    freeDeliveryLine: (from: string) => `Бесплатная доставка по Харькову от ${from} ₴`,
  },
} as const;

function formatDialogPrice(price: number, priceFrom: boolean | undefined, locale: Locale) {
  const formatted = `${price.toLocaleString(locale === "uk" ? "uk-UA" : "ru-RU")} ₴`;
  return priceFrom ? `${locale === "uk" ? "від" : "от"} ${formatted}` : formatted;
}

export function ProductCardDialog({
  open,
  onOpenChange,
  product,
  locale,
  variants,
  activeVariant,
  activePrice,
  activeWeight,
  activePriceFrom,
  activeName,
  dialogImageSrc,
  onSelectVariant,
  onAddAndClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: CardProduct;
  locale: Locale;
  variants: ProductVariant[];
  activeVariant?: ProductVariant;
  activePrice: number;
  activeWeight: string;
  activePriceFrom?: boolean;
  activeName: string;
  dialogImageSrc: string;
  onSelectVariant: (v: ProductVariant) => void;
  onAddAndClose: () => void;
}) {
  const c = DIALOG_COPY[locale];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-cream sm:max-w-3xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={dialogImageSrc}
              alt={product.alt}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{product.categoryLabel}</p>
            <h3 className="mt-1.5 font-display text-2xl font-bold text-choco-900">{product.name}</h3>
            <p className="mt-1 text-sm italic leading-snug text-choco-500">{product.character}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-choco-600">
              <Stars rating={product.rating} locale={locale} />
              <span className="font-semibold text-choco-800">{product.rating}</span>
              <span aria-hidden="true">·</span>
              <span>
                {product.reviews} {c.reviewsWord}
              </span>
            </div>
            <div className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-choco-700">
              {product.description.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-cream-100 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">{c.inSet}</p>
              <ul className="mt-2.5 space-y-1.5 text-sm">
                {product.contents.map((item) => {
                  const isFree = item.includes(c.freeBadge);
                  return (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${isFree ? "text-gold-700" : "text-choco-400"}`}
                        aria-hidden="true"
                      />
                      {isFree ? (
                        <span className="font-semibold leading-snug text-choco-900">
                          {item.replace(` — ${c.freeBadge}`, "")}{" "}
                          <span className="ml-0.5 inline-block rounded-full bg-gold-500/20 px-2 py-px text-[10px] font-bold uppercase tracking-wide text-gold-700">
                            {c.freeBadge}
                          </span>
                        </span>
                      ) : (
                        <span className="leading-snug text-choco-800">{item}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-cream-100 p-4 text-sm">
              {product.cocoa && (
                <div>
                  <dt className="text-choco-500">{c.cocoa}</dt>
                  <dd className="font-bold text-choco-900">{product.cocoa}%</dd>
                </div>
              )}
              <div>
                <dt className="text-choco-500">{c.weight}</dt>
                <dd className="font-bold text-choco-900">{activeWeight}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-choco-500">{c.composition}</dt>
                <dd className="font-medium leading-snug text-choco-800">{product.ingredients}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-choco-500">{c.storage}</dt>
                <dd className="font-medium text-choco-800">{product.storage}</dd>
              </div>
            </dl>

            {variants.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">
                  {locale === "uk" ? "Оберіть розмір коробки:" : "Выберите размер коробки:"}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {variants.map((v) => {
                    const isSelected = activeVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelectVariant(v)}
                        className={`rounded-xl border px-2.5 py-2 text-center text-xs transition-all ${
                          isSelected
                            ? "border-gold-600 bg-choco-950 font-bold text-gold-300 shadow-sm"
                            : "border-gold-500/30 bg-white font-semibold text-choco-800 hover:border-gold-500"
                        }`}
                      >
                        <span className="block">{v.label}</span>
                        <span className={isSelected ? "text-cream" : "text-gold-700"}>{v.price} ₴</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-5">
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-choco-900">
                  {formatDialogPrice(activePrice, activePriceFrom, locale)}
                </span>
              </div>
              {activePriceFrom && (
                <p className="mb-3 text-xs leading-relaxed text-choco-500">{c.priceFromNote}</p>
              )}
              <p className="mb-3 rounded-xl bg-gold-500/10 px-3 py-2 text-xs font-semibold text-choco-800">
                {c.thermo}
              </p>
              <Button
                onClick={onAddAndClose}
                className="btn-choco-luxe h-12 w-full rounded-full text-base font-bold"
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> {c.inCart}
              </Button>

              <div className="mt-3.5 border-t border-choco-100 pt-3">
                <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-choco-600">
                  {locale === "uk" ? "Швидке замовлення в 1 клік:" : "Быстрый заказ в 1 клик:"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={site.messengers[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackIntent("viber", activeName, activePrice)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#7360f2]/30 bg-[#7360f2]/10 py-2.5 text-xs font-bold text-[#5c49d6] transition-colors hover:bg-[#7360f2] hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> Viber
                  </a>
                  <a
                    href={site.messengers[2].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackIntent("telegram", activeName, activePrice)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#229ed9]/30 bg-[#229ed9]/10 py-2.5 text-xs font-bold text-[#0088cc] transition-colors hover:bg-[#229ed9] hover:text-white"
                  >
                    <Send className="h-4 w-4" /> Telegram
                  </a>
                </div>
                <a
                  href={site.phoneHref}
                  onClick={() => trackIntent("phone", activeName, activePrice)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-choco-200 bg-white/90 py-2 text-xs font-bold text-choco-900 transition-colors hover:bg-gold-500 hover:text-choco-950"
                >
                  <Phone className="h-3.5 w-3.5 text-gold-600" />
                  {locale === "uk" ? "Або подзвонити: 096 253 56 10" : "Или позвонить: 096 253 56 10"}
                </a>
              </div>

              <p className="mt-2.5 text-center text-xs text-choco-500">
                {c.freeDeliveryLine(site.freeShippingFrom.toLocaleString(locale === "uk" ? "uk-UA" : "ru-RU"))}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
