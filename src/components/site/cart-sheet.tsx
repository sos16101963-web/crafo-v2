"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { trackEvent, trackFb } from "@/lib/analytics";
import { formatPrice, formatProductPrice, catalogFor } from "@/lib/products";
import { productPath } from "@/lib/slugs";
import { site } from "@/lib/site";
import { toast } from "sonner";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function CartSheet({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const catalog = catalogFor(locale);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const add = useCart((s) => s.add);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [sending, setSending] = useState(false);

  const lines = useMemo(
    () =>
      items
        .map((i) => ({ ...i, product: catalog.find((p) => p.id === i.id)! }))
        .filter((l) => Boolean(l.product)),
    [items]
  );

  // Якщо в кошику є інші товари, для набору set-four («Чотири настрої») діє спец-знижка 30% (100 ₴ замість 130 ₴)
  const hasOtherItems = lines.some((l) => l.id !== "set-four");
  const getItemPrice = (id: string, regularPrice: number) => {
    if (id === "set-four" && hasOtherItems) return 100;
    return regularPrice;
  };

  const total = lines.reduce((acc, l) => acc + getItemPrice(l.id, l.product.price) * l.qty, 0);
  const freeFrom = site.freeShippingFrom;
  const progress = Math.min(100, Math.round((total / freeFrom) * 100));
  const remaining = Math.max(0, freeFrom - total);

  // Подсказки «добрать до бесплатной доставки»: сначала то, что влезает в остаток (крупное первым),
  // иначе — самый доступный набор, чтобы приблизиться к порогу.
  const suggestions = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.id));
    const fits = catalog.filter((p) => !inCart.has(p.id) && p.price <= remaining).sort((a, b) => b.price - a.price);
    if (fits.length > 0) return fits.slice(0, 2);
    return catalog.filter((p) => !inCart.has(p.id)).sort((a, b) => a.price - b.price).slice(0, 2);
  }, [lines, remaining]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return void toast.error(d.cart.errName);
    if (!/^[+0-9\s()\-]{10,18}$/.test(phone.trim())) return void toast.error(d.cart.errPhone);
    setSending(true);
    trackEvent("begin_checkout", { currency: "UAH", value: total, num_items: lines.length });
    trackFb("InitiateCheckout", { currency: "UAH", value: total, num_items: lines.length });

    try {
      let source = "Прямий перехід на сайт";
      try {
        const stored = sessionStorage.getItem("crafo_traffic_source");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.source) source = parsed.source;
        }
      } catch {}

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          items: lines.map((l) => ({
            id: l.product.id,
            name:
              l.id === "set-four" && hasOtherItems
                ? `${l.product.name} (спец-знижка 30% для себе)`
                : l.product.name,
            qty: l.qty,
            price: getItemPrice(l.id, l.product.price),
          })),
          total,
          locale,
          source,
        }),
      });

      if (!res.ok) {
        throw new Error("Checkout request failed");
      }

      setSending(false);
      setOrderDone(true);
      clear();
      trackEvent("purchase", {
        currency: "UAH",
        value: total,
        num_items: lines.length,
        transaction_id: `web-${Date.now()}`,
      });
      trackFb("Purchase", { currency: "UAH", value: total, num_items: lines.length });
      toast.success(d.cart.accepted, { description: d.cart.acceptedText });
    } catch (err) {
      console.error("Order submission error:", err);
      setSending(false);
      toast.error(
        locale === "ru"
          ? "Ошибка связи. Попробуйте ещё раз или позвоните нам."
          : "Помилка зв'язку. Спробуйте ще раз або зателефонуйте нам."
      );
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      if (orderDone) setOrderDone(false);
      close();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        data-lenis-prevent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex w-full flex-col bg-cream p-0 sm:max-w-[540px] pointer-events-auto [&_[data-slot=sheet-close]]:text-cream"
      >
        <SheetHeader className="shrink-0 border-b border-border bg-choco-950 px-5 sm:px-6 py-4 text-left">
          <SheetTitle className="flex items-center gap-2.5 font-display text-xl text-cream">
            <ShoppingBag className="h-5 w-5 text-gold-400" aria-hidden="true" />
            {d.cart.title}
            {mounted && lines.length > 0 && (
              <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-choco-950">
                {lines.reduce((a, l) => a + l.qty, 0)}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {!mounted ? (
          <div className="flex flex-1 items-center justify-center text-choco-500">{d.cart.loading}</div>
        ) : orderDone ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-gold-500" aria-hidden="true" />
            <h3 className="font-display text-2xl font-bold text-choco-900">{d.cart.accepted}</h3>
            <p className="leading-relaxed text-choco-600">
              {d.cart.acceptedText}
            </p>
            <Button
              onClick={() => {
                setOrderDone(false);
                close();
              }}
              className="mt-2 rounded-full bg-choco-900 px-8 font-bold text-cream hover:bg-choco-800"
            >
              {d.cart.keepShopping}
            </Button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag className="h-16 w-16 text-choco-400/40" aria-hidden="true" />
            <h3 className="font-display text-2xl font-bold text-choco-900">{d.cart.empty}</h3>
            <p className="text-choco-600">{d.cart.emptyText}</p>
            <a href="#catalog" onClick={close}>
              <Button className="mt-2 rounded-full bg-choco-900 px-8 font-bold text-cream hover:bg-choco-800">
                {d.cart.toCatalog}
              </Button>
            </a>
          </div>
        ) : (
          <>
            {/* Единая прокручиваемая область: прогресс доставки + товары + спец-предложение — ничего не сжимается на невысоких экранах */}
            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin">
              <div className="border-b border-border px-5 sm:px-6 py-3.5">
                {total >= freeFrom ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
                    <Truck className="h-4.5 w-4.5" aria-hidden="true" />
                    {d.cart.freeShippingReached}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-choco-800">
                      {d.cart.freeShippingLeft(formatPrice(remaining, locale))}{" "}
                      <span className="whitespace-nowrap font-normal text-choco-500">
                        {d.cart.freeShippingGain(formatPrice(site.courierPrice, locale))}
                      </span>
                    </p>
                    <Progress value={progress} className="mt-2 h-2 bg-cream-200 [&>div]:bg-gold-500" aria-label="Прогресс до бесплатной доставки" />
                    {suggestions.length > 0 && (
                      <div className="mt-2.5">
                        <p className="text-xs font-semibold text-choco-500">{d.cart.suggest}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {suggestions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                add(p.id);
                                toast.success(d.cart.addedToast(p.name), {
                                  description: d.cart.suggestToast(formatPrice(Math.max(0, freeFrom - (total + p.price)), locale)),
                                });
                              }}
                              className="rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-choco-800 transition-colors hover:border-gold-500 hover:bg-gold-500/20 cursor-pointer"
                            >
                              + {p.name} · {formatProductPrice(p, locale)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between px-5 sm:px-6 pt-3 pb-1">
                <span className="text-xs font-medium text-choco-500">
                  {locale === "uk"
                    ? `Обрано позицій: ${lines.length}`
                    : `Выбрано позиций: ${lines.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    toast.success(locale === "uk" ? "Кошик очищено" : "Корзина очищена");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-choco-500 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {locale === "uk" ? "Очистити кошик" : "Очистить корзину"}
                </button>
              </div>

              <ul className="space-y-3.5 px-5 sm:px-6 pt-2 pb-4" aria-label="Товары в корзине">
                {lines.map((l) => {
                  const href = productPath(l.product.id, locale);
                  return (
                    <li key={l.id} className="flex gap-4 rounded-2xl border border-border bg-white/90 p-3.5 sm:p-4 shadow-xs">
                      <Link
                        href={href}
                        onClick={close}
                        className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-border/60"
                      >
                        <Image src={l.product.image} alt={l.product.alt} fill sizes="96px" className="object-cover transition-transform duration-300 hover:scale-105" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={href}
                            onClick={close}
                            className="text-sm sm:text-[15px] font-bold leading-snug text-choco-900 hover:text-gold-700 transition-colors inline-flex items-start gap-1"
                          >
                            <span>{l.product.name}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gold-600" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(l.id)}
                            aria-label={d.cart.remove(l.product.name)}
                            className="shrink-0 text-choco-400 transition-colors hover:text-red-800 cursor-pointer p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-choco-500">
                          {l.product.weight}
                          {l.product.cocoa ? d.cart.cocoa(l.product.cocoa) : ""}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
                          <div className="flex items-center gap-1.5" role="group" aria-label={d.cart.qtyGroup(l.product.name)}>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setQty(l.id, l.qty - 1)}
                              aria-label={d.cart.qtyDec}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-7 text-center text-sm font-bold text-choco-900">{l.qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setQty(l.id, l.qty + 1)}
                              aria-label={d.cart.qtyInc}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="text-right whitespace-nowrap shrink-0">
                            {l.id === "set-four" && hasOtherItems && (
                              <span className="block text-[11px] font-medium text-choco-400 line-through">
                                {formatPrice(l.product.price * l.qty, locale)}
                              </span>
                            )}
                            <p className="font-display text-lg font-bold text-choco-900 whitespace-nowrap">
                              {formatPrice(getItemPrice(l.id, l.product.price) * l.qty, locale)}
                            </p>
                            {l.id === "set-four" && hasOtherItems && (
                              <span className="inline-block rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-bold text-choco-900">
                                -30% спецціна
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Спец-пропозиція допродажу (Upsell) «Чотири настрої» зі знижкою 30% */}
              {lines.length > 0 && !lines.some((l) => l.id === "set-four") && (
                <div className="mx-5 sm:mx-6 mb-4 shrink-0 rounded-2xl border-2 border-dashed border-gold-500/60 bg-gradient-to-r from-gold-500/10 via-cream-100 to-gold-500/15 p-3.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gold-500/30 shadow-xs">
                      <Image
                        src="/images/set-four.webp"
                        alt={locale === "uk" ? "Набір «Чотири настрої»" : "Набор «Четыре настроения»"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-black uppercase text-choco-950">
                          {locale === "uk" ? "-30% для себе" : "-30% для себя"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold leading-tight text-choco-900 truncate">
                        {locale === "uk" ? "🎁 «Чотири настрої» (4 цукерки)" : "🎁 «Четыре настроения» (4 конфеты)"}
                      </p>
                      <p className="text-[11px] text-choco-600 truncate">
                        {locale === "uk" ? "Солодкий комплімент до ранкової кави" : "Сладкий комплимент к утреннему кофе"}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                          <span className="font-display text-sm font-bold text-choco-950">100 ₴</span>
                          <span className="text-xs text-choco-400 line-through">130 ₴</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            add("set-four");
                            toast.success(
                              locale === "uk" ? "Набір «Чотири настрої» додано!" : "Набор «Четыре настроения» добавлен!",
                              {
                                description: locale === "uk" ? "Знижка 30% застосована автоматично" : "Скидка 30% применена автоматически",
                              }
                            );
                          }}
                          className="h-8 rounded-lg bg-choco-900 px-3 text-xs font-bold text-gold-300 hover:bg-choco-800 shrink-0"
                        >
                          {locale === "uk" ? "+ Додати за 100 ₴" : "+ Добавить за 100 ₴"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-white/80 px-5 sm:px-6 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-choco-600">{d.cart.total}</span>
                <span className="font-display text-2xl font-bold text-choco-900">{formatPrice(total, locale)}</span>
              </div>
              <Separator className="my-3" />
              <form onSubmit={handleCheckout} className="space-y-2.5" aria-label="Оформление заказа">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="cart-name" className="sr-only">
                      {d.cart.name}
                    </Label>
                    <Input
                      id="cart-name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={d.cart.namePlaceholder}
                      maxLength={50}
                      className="relative z-10 h-11 rounded-xl bg-white text-choco-950 cursor-text pointer-events-auto"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cart-phone" className="sr-only">
                      {d.cart.phone}
                    </Label>
                    <Input
                      id="cart-phone"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={locale === "uk" ? "Телефон" : "Телефон"}
                      maxLength={18}
                      className="relative z-10 h-11 rounded-xl bg-white text-choco-950 cursor-text pointer-events-auto"
                    />
                  </div>
                </div>
                {/* Четкая гарантия прямо перед кнопкой заказа */}
                <div className="rounded-xl border border-gold-500/35 bg-gold-500/15 px-3 py-2 text-center text-[11px] font-semibold text-choco-950 leading-snug">
                  🛡️ {locale === "uk"
                    ? "Оплата при отриманні кур'єру або карткою/IBAN після підтвердження замовлення з майстром"
                    : "Оплата при получении курьеру или картой/IBAN после подтверждения заказа с мастером"}
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="h-11 w-full rounded-full bg-gold-500 text-base font-bold text-choco-950 hover:bg-gold-400 disabled:opacity-60 cursor-pointer"
                >
                  {sending ? d.cart.checking : d.cart.checkout(formatPrice(total, locale))}
                </Button>
                <p className="text-center text-[11px] text-choco-500">
                  {d.cart.checkoutNote}
                </p>
              </form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
