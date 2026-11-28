"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import { ProductCard, type CardProduct } from "./product-card";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SortMode = "default" | "price-asc" | "price-desc";
type CategoryFilter = "all" | "sets" | "tiles" | "flowers" | "cheese";

const CATALOG_COPY = {
  uk: {
    kicker: "Каталог",
    h2: "Оберіть свою емоцію",
    sub: "Цукерки з фруктовими ганашами, плитки та бруски з горіхами й сухофруктами, шоколадні троянди та квіти — кожна позиція зроблена руками в нашому харківському цеху з бельгійського шоколаду Callebaut і їде до вас свіжою.",
    filterAria: "Фільтр каталога за категоріями",
    categories: [
      { id: "all", label: "Всі солодощі" },
      { id: "sets", label: "Подарункові набори" },
      { id: "tiles", label: "Плитки та бруски" },
      { id: "flowers", label: "Квіти та фігури" },
      { id: "cheese", label: "Сирна колекція · Гурме" },
    ] as const,
    adviceTitle: "Порада майстра — виконуйте по порядку",
    advice1:
      "В офіс — беріть «Захоплення недоброзичливців». Коханій — «Обійми коханого». Мамі — «Букет, який не зів'яне». Начальнику — «Свято без приводу». Собі — «Відпочинок після роботи», без варіантів. Далі довіртеся майстру.",
    advice2:
      "І стандарт майстерні: замовлення від 3 000 ₴ доставляємо безкоштовно — і по Харкову, і Новою поштою. Чудово підходить для корпоративних замовлень, свят або подарунків усій родині.",
    lossAversion:
      "Свіжий шоколад виготовляється під замовлення: рекомендуємо замовляти за 1–2 дні до потрібної дати, щоб майстер встиг темперувати шоколад та стабілізувати начинку.",
  },
  ru: {
    kicker: "Каталог",
    h2: "Выберите свою эмоцию",
    sub: "Конфеты с фруктовыми ганашами, плитки и бруски с орехами и сухофруктами, шоколадные розы и цветы — каждая позиция сделана руками в нашем харьковском цехе из бельгийского шоколада Callebaut и едет к вам свежей.",
    filterAria: "Фильтр каталога по категориям",
    categories: [
      { id: "all", label: "Все сладости" },
      { id: "sets", label: "Подарочные наборы" },
      { id: "tiles", label: "Плитки и бруски" },
      { id: "flowers", label: "Цветы и фигуры" },
      { id: "cheese", label: "Сырная коллекция · Гурмэ" },
    ] as const,
    adviceTitle: "Совет мастера — выполняйте по порядку",
    advice1:
      "В офис — берите «Восхищение недоброжелателей». Любимой — «Объятия любимого». Маме — «Букет, который не завянет». Начальнику — «Праздник без повода». Себе — «Отдых после работы», без вариантов. Дальше доверьтесь мастеру.",
    advice2:
      "И стандарт мастерской: заказы от 3 000 ₴ доставляем бесплатно — и по Харькову, и Новой почтой. Отличный вариант для корпоративных заказов, свадеб или подарков всей семье.",
    lossAversion:
      "Свежий шоколад изготавливается под заказ: рекомендуем оформлять заказ за 1–2 дня до нужной даты, чтобы мастер успел темперировать шоколад и стабилизировать начинку.",
  },
} as const;

export function Catalog({
  locale,
  initialLimit,
  initialProducts,
  categoryCounts,
}: {
  locale: Locale;
  initialLimit?: number;
  initialProducts?: CardProduct[];
  categoryCounts?: Record<string, number>;
}) {
  const c = CATALOG_COPY[locale];
  const uk = locale === "uk";
  const cat = c.categories;
  const [active, setActive] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [expanded, setExpanded] = useState(false);
  const [fullProducts, setFullProducts] = useState<CardProduct[] | null>(
    initialProducts && (!initialLimit || initialProducts.length > initialLimit)
      ? initialProducts
      : null,
  );
  const [loadingAll, setLoadingAll] = useState(false);

  const ensureFullCatalog = useCallback(async () => {
    if (fullProducts !== null) return;
    setLoadingAll(true);
    try {
      const { catalogFor } = await import("@/lib/products");
      setFullProducts(catalogFor(locale));
    } finally {
      setLoadingAll(false);
    }
  }, [fullProducts, locale]);

  useEffect(() => {
    if (!initialProducts) {
      void ensureFullCatalog();
    }
  }, [initialProducts, ensureFullCatalog]);

  const all = fullProducts ?? initialProducts ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter((p) => {
      if (active !== "all" && p.category !== active) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.short?.toLowerCase().includes(q) ?? false) ||
        p.character.toLowerCase().includes(q) ||
        p.ingredients.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    });
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [all, active, query, sort]);

  const handleCategoryChange = (id: CategoryFilter) => {
    setActive(id);
    if (id !== "all") {
      void ensureFullCatalog();
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.trim().length > 0) {
      void ensureFullCatalog();
    }
  };

  const cycleSort = () => {
    void ensureFullCatalog();
    setSort((prev) => (prev === "default" ? "price-asc" : prev === "price-asc" ? "price-desc" : "default"));
  };

  const handleExpandAll = async () => {
    setExpanded(true);
    await ensureFullCatalog();
  };

  const totalAllCount = fullProducts?.length ?? categoryCounts?.all ?? all.length;

  const sortLabel =
    sort === "default"
      ? uk
        ? "За популярністю"
        : "По популярности"
      : sort === "price-asc"
        ? uk
          ? "Спочатку дешевші"
          : "Сначала дешевле"
        : uk
          ? "Спочатку дорожчі"
          : "Сначала дороже";

  const showExpandBtn =
    Boolean(initialLimit) &&
    !expanded &&
    active === "all" &&
    !query.trim() &&
    sort === "default" &&
    totalAllCount > (initialLimit ?? 0);

  const displayedProducts =
    initialLimit && !expanded && active === "all" && !query.trim() && sort === "default"
      ? visible.slice(0, initialLimit)
      : visible;

  return (
    <section id="catalog" className="scroll-mt-20 stage-glow relative py-20 lg:py-28 overflow-hidden" aria-label={uk ? "Каталог шоколаду" : "Каталог шоколада"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="divider-gold text-[13px] font-semibold uppercase tracking-[0.3em] text-gold-700">{c.kicker}</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-choco-900 sm:text-5xl">{c.h2}</h2>
          <p className="mt-4 text-lg leading-relaxed text-choco-600">{c.sub}</p>
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-2.5" aria-label={c.filterAria}>
          {cat.map((item) => {
            const count =
              !fullProducts && categoryCounts && typeof categoryCounts[item.id] === "number"
                ? categoryCounts[item.id]
                : item.id === "all"
                  ? all.length
                  : all.filter((p) => p.category === item.id).length;
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryChange(item.id)}
                aria-pressed={active === item.id}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                  active === item.id
                    ? "btn-choco-luxe !text-gold-300 shadow-md"
                    : "glass-surface text-choco-700 hover:border-gold-500/50 hover:bg-white"
                )}
              >
                {item.label}
                <span className={cn("ml-2 text-xs", active === item.id ? "text-gold-400" : "text-choco-400")}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        <div
          className="glass-surface mx-auto mt-8 max-w-3xl rounded-2xl border-gold-500/50 p-6 shadow-md"
          aria-label={uk ? "Рекомендація майстра" : "Рекомендация мастера"}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-700">
            {c.adviceTitle}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-choco-700">{c.advice1}</p>
          <p className="mt-2.5 text-[15px] leading-relaxed text-choco-700">{c.advice2}</p>
        </div>

        {/* Страх потери: слоты на день ограничены — заказывайте сегодня */}
        <p className="glass-surface mx-auto mt-5 max-w-3xl rounded-xl border-gold-500/40 bg-gold-500/15 px-5 py-3 text-center text-sm font-bold text-choco-900 shadow-sm">
          {c.lossAversion}
        </p>

        {/* Быстрый переход к Шоколадному сомелье */}
        <div className="glass-surface mx-auto mt-4 max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border-gold-500/50 p-4 text-sm shadow-md">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="text-xl">✨</span>
            <span className="text-xs sm:text-sm font-medium text-choco-900">
              {uk
                ? "Важко визначитися зі смаком або приводом? Скористайтеся інтерактивним помічником:"
                : "Трудно определиться со вкусом или поводом? Воспользуйтесь интерактивным помощником:"}
            </span>
          </div>
          <a
            href="#sommelier"
            className="btn-choco-luxe inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
          >
            {uk ? "Шоколадний сомельє ⬇" : "Шоколадный сомелье ⬇"}
          </a>
        </div>

        {/* Мгновенный поиск по вкусу и сортировка по цене */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                uk
                  ? "Пошук за смаком чи приводом: манго, сир, троянди, мамі..."
                  : "Поиск по вкусу или поводу: манго, сыр, розы, маме..."
              }
              aria-label={uk ? "Пошук у каталозі" : "Поиск в каталоге"}
              className="h-11 w-full rounded-full border border-gold-500/35 bg-white/95 pl-11 pr-10 text-sm text-choco-900 placeholder:text-choco-400 shadow-xs transition-colors focus:border-gold-600 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={uk ? "Очистити пошук" : "Очистить поиск"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-choco-400 hover:bg-choco-100 hover:text-choco-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={cycleSort}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-gold-500/35 bg-white/95 px-5 text-xs font-bold text-choco-800 shadow-xs transition-colors hover:border-gold-500 hover:text-gold-700"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
            {sortLabel}
          </button>
        </div>

        {visible.length === 0 && !loadingAll ? (
          <div className="mt-10 rounded-3xl border border-gold-500/30 bg-white/85 p-10 text-center shadow-sm">
            <p className="font-display text-xl font-bold text-choco-900">
              {uk ? "За вашим запитом нічого не знайдено" : "По вашему запросу ничего не найдено"}
            </p>
            <p className="mt-2 text-sm text-choco-600">
              {uk
                ? "Спробуйте інше слово (наприклад, «сир», «ганаш», «троянди») або скиньте фільтри."
                : "Попробуйте другое слово (например, «сыр», «ганаш», «розы») или сбросьте фильтры."}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActive("all");
                setSort("default");
              }}
              className="btn-choco-luxe mt-5 rounded-full px-6 py-2.5 text-sm font-bold"
            >
              {uk ? "Показати весь каталог" : "Показать весь каталог"}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {displayedProducts.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
            {showExpandBtn && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => void handleExpandAll()}
                  disabled={loadingAll}
                  className="btn-choco-luxe inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-lg cursor-pointer disabled:opacity-70"
                >
                  {loadingAll
                    ? uk
                      ? "Завантажуємо каталог..."
                      : "Загружаем каталог..."
                    : uk
                      ? `Показати весь каталог (ще ${totalAllCount - (initialLimit ?? 0)} наборів)`
                      : `Показать весь каталог (ещё ${totalAllCount - (initialLimit ?? 0)} наборов)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
