"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { productPath } from "@/lib/slugs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import type { CategoryId, ProductGalleryItem, ProductVariant } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { trackIntent } from "@/lib/analytics";
import { Stars } from "./stars";

const ProductCardDialog = dynamic(
  () => import("./product-card-dialog").then((m) => m.ProductCardDialog),
  { ssr: false },
);

const CARD_COPY = {
  uk: {
    inCart: "В корзину",
    added: "Додано в корзину",
    details: "Детальніше",
    aboutProduct: (name: string) => `Детальніше про товар: ${name}`,
    addToCart: (name: string) => `В корзину: ${name}`,
    cocoa: "Какао",
    hit: "Хіт продажів",
    isNew: "Новинка",
    cutAlt: "Розріз: соковитий ганаш усередині",
    cutHover: "Наведіть — розріз начинки",
  },
  ru: {
    inCart: "В корзину",
    added: "Добавлено в корзину",
    details: "Подробнее",
    aboutProduct: (name: string) => `Подробнее о товаре: ${name}`,
    addToCart: (name: string) => `В корзину: ${name}`,
    cocoa: "Какао",
    hit: "Хит продаж",
    isNew: "Новинка",
    cutAlt: "Разрез: сочный ганаш внутри",
    cutHover: "Наведите — разрез начинки",
  },
} as const;

export interface CardProduct {
  id: string;
  name: string;
  category?: CategoryId;
  categoryLabel: string;
  price: number;
  priceFrom?: boolean;
  weight: string;
  cocoa?: number;
  rating: number;
  reviews: number;
  badges: ("hit" | "new")[];
  short?: string;
  character: string;
  contents: string[];
  description: string;
  ingredients: string;
  storage: string;
  image: string;
  cutImage?: string;
  gallery?: ProductGalleryItem[];
  variants?: ProductVariant[];
  alt: string;
}

function formatCardPrice(price: number, priceFrom: boolean | undefined, locale: Locale) {
  const formatted = `${price.toLocaleString(locale === "uk" ? "uk-UA" : "ru-RU")} ₴`;
  return priceFrom ? `${locale === "uk" ? "від" : "от"} ${formatted}` : formatted;
}

export function ProductCard({ product, locale }: { product: CardProduct; locale: Locale }) {
  const c = CARD_COPY[locale];
  const [open, setOpen] = useState(false);
  const [dialogLoaded, setDialogLoaded] = useState(false);
  const add = useCart((s) => s.add);

  const variants = product.variants ?? [];
  const defaultVariant = variants.length > 0 ? variants[variants.length - 1] : undefined;
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(defaultVariant?.id);
  const [dialogImageSrc, setDialogImageSrc] = useState<string>(product.image);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) ?? defaultVariant;
  const activePrice = activeVariant?.price ?? product.price;
  const activeWeight = activeVariant?.weight ?? product.weight;
  const activePriceFrom = activeVariant ? false : product.priceFrom;
  const activeCartId = activeVariant ? `${product.id}::${activeVariant.id}` : product.id;
  const activeName = activeVariant ? `${product.name} (${activeVariant.label})` : product.name;

  const selectVariant = (v: ProductVariant, updateDialogImage = true) => {
    setSelectedVariantId(v.id);
    if (updateDialogImage) {
      setDialogImageSrc(v.image ?? product.image);
    }
  };

  const handleAdd = () => {
    add(activeCartId);
    const priceLabel = formatCardPrice(activePrice, activePriceFrom, locale);
    window.dispatchEvent(new Event("crafo:toast"));
    void import("sonner").then(({ toast }) => {
      toast.success(c.added, {
        description: `«${activeName}» — ${priceLabel}`,
      });
    });
  };

  const hoverImage = product.cutImage ?? product.gallery?.[0]?.src;
  const hoverAlt = product.cutImage ? c.cutAlt : (product.gallery?.[0]?.alt ?? product.alt);
  const hoverLabel = product.cutImage
    ? c.cutHover
    : (product.gallery?.[0]?.label ?? (locale === "uk" ? "У коробці" : "В коробке"));

  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-2xl">
      <div className="img-zoom relative aspect-square border-b border-gold-500/25 bg-gradient-to-b from-cream-100/30 to-cream-200/40 shadow-[inset_0_0_24px_rgba(34,20,9,0.06)]">
        {/* Основное фото */}
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-500 ${hoverImage ? "group-hover:opacity-0" : ""}`}
        />
        {/* Друге фото (розріз начинки або вигляд у коробці) при наведенні */}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={hoverAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges.includes("hit") && (
            <Badge className="w-fit rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-choco-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_2px_8px_rgba(196,154,74,0.35)] hover:bg-gold-500">
              {c.hit}
            </Badge>
          )}
          {product.badges.includes("new") && (
            <Badge className="w-fit rounded-full bg-choco-900 px-3 py-1 text-xs font-bold text-gold-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_8px_rgba(21,12,7,0.35)] hover:bg-choco-900">
              {c.isNew}
            </Badge>
          )}
        </div>
        {hoverImage && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-choco-950/75 px-3 py-1 text-[11px] font-semibold text-gold-300 opacity-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            {hoverLabel}
          </span>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setDialogLoaded(true);
            setOpen(true);
          }}
          className="glass-surface absolute bottom-3 right-3 translate-y-2 rounded-full px-4 font-semibold text-choco-900 opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:bg-white group-hover:translate-y-0 group-hover:opacity-100"
        >
          {c.details}
        </Button>
        {dialogLoaded && (
          <ProductCardDialog
            open={open}
            onOpenChange={setOpen}
            product={product}
            locale={locale}
            variants={variants}
            activeVariant={activeVariant}
            activePrice={activePrice}
            activeWeight={activeWeight}
            activePriceFrom={activePriceFrom}
            activeName={activeName}
            dialogImageSrc={dialogImageSrc}
            onSelectVariant={(v) => selectVariant(v, true)}
            onAddAndClose={() => {
              handleAdd();
              setOpen(false);
            }}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-700">{product.categoryLabel}</p>
        <h3 className="mt-1 font-display text-xl font-bold leading-snug text-choco-900">
          <Link
            href={productPath(product.id, locale)}
            aria-label={c.aboutProduct(product.name)}
            className="text-left transition-colors hover:text-choco-600"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm italic leading-relaxed text-choco-600">{product.character}</p>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-choco-500">
          <Stars rating={product.rating} locale={locale} />
          <span className="font-semibold text-choco-800">{product.rating}</span>
          <span aria-hidden="true">·</span>
          <span>
            {activeWeight}
            {product.cocoa ? ` · ${c.cocoa.toLowerCase()} ${product.cocoa}%` : ""}
          </span>
        </div>

        {variants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={locale === "uk" ? "Розмір коробки" : "Размер коробки"}>
            {variants.map((v) => {
              const isSelected = activeVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectVariant(v, true)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-gold-600 bg-choco-950 text-gold-300 shadow-xs"
                      : "border-gold-500/35 bg-white text-choco-700 hover:border-gold-500"
                  }`}
                >
                  {v.label} · {v.price} ₴
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 pt-1">
          <div>
            <span className="font-display text-2xl font-bold text-choco-900">
              {formatCardPrice(activePrice, activePriceFrom, locale)}
            </span>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            aria-label={c.addToCart(activeName)}
            className="btn-choco-luxe h-10 rounded-full px-5 font-bold"
          >
            <ShoppingBag className="mr-1.5 h-4 w-4" /> {c.inCart}
          </Button>
        </div>

        {/* Быстрый заказ с витрины каталога */}
        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs">
          <span className="text-[11px] font-medium text-choco-500">
            {locale === "uk" ? "Швидке замовлення:" : "Быстрый заказ:"}
          </span>
          <div className="flex items-center gap-1.5">
            <a
              href={site.messengers[0].href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackIntent("viber", activeName, activePrice)}
              aria-label={locale === "uk" ? `Замовити «${activeName}» у Viber` : `Заказать «${activeName}» в Viber`}
              title="Viber"
              className="rounded-lg bg-[#7360f2]/10 px-2.5 py-1 text-[11px] font-bold text-[#5c49d6] transition-colors hover:bg-[#7360f2] hover:text-white"
            >
              Viber
            </a>
            <a
              href={site.messengers[2].href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackIntent("telegram", activeName, activePrice)}
              aria-label={locale === "uk" ? `Замовити «${activeName}» в Telegram` : `Заказать «${activeName}» в Telegram`}
              title="Telegram"
              className="rounded-lg bg-[#229ed9]/10 px-2.5 py-1 text-[11px] font-bold text-[#0088cc] transition-colors hover:bg-[#229ed9] hover:text-white"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
