import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { InnerShell } from "@/components/site/inner-shell";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProductCard } from "@/components/site/product-card";
import { switchPairFor } from "@/lib/pages";
import { catalogFor } from "@/lib/products";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { productPath } from "@/lib/slugs";

const SETS_IDS = ["cheese-gran", "set-sixteen", "set-combo", "set-six", "set-four", "envelope-gift"];

/** Гео-лендинг №2: «Цукерки ручної роботи в Харкові» */
export function GeoTsukerkyPage({ locale, path }: { locale: Locale; path: string }) {
  const uk = locale === "uk";
  const all = catalogFor(locale);
  const products = all.filter((p) => SETS_IDS.includes(p.id) || p.category === "sets").slice(0, 6);
  const t = getDict(locale);

  const seo = uk
    ? {
        kicker: "Цукерки · Харків",
        h1: "Цукерки ручної роботи в Харкові — купити набори з Callebaut від 130 ₴",
        p1: "Шоколадні цукерки ручної роботи — це не про «солодке», це про те, що ви скажете без слів. У нашій харківській майстерні кожна цукерка проходить шлях руками майстра: бельгійський Callebaut темперуємо до 45°C і кришталевого глянцю, начінюємо фруктовими ганашами й карамеллю, розписуємо какао-маслом. Ніяких конвеєрів, ні «кондитерської глазурі».",
        p2: "У каталозі — подарункові набори від 130 ₴: для коханих, мам, колег і «просто так». Кожен їде у святковій коробці зі стрічкою та листівкою з вашим посланням — безкоштовно. Кур'єрська доставка всіма районами Харкова в день замовлення, Україною — Новою поштою за 1–2 дні.",
        p3: "Не знаєте, який смак вибрати? Додайте набір у корзину — а всі деталі (смаки ганашів, напис на листівці, дата) узгодимо в Viber або Telegram перед відправкою. І так, перед відправкою надішлемо фото вашої коробки — щоб сюрприз був і для нас.",
        h2: "Набори цукерок, які беруть у Харкові",
        guaranteeH: "Чому цукерки доїдуть ідеальними",
        guarantee: "Кожне замовлення пакуємо в термосумку з охолодженням: у спеку до +30°C цукерки зберігають форму, глянець і малюнок. Якщо щось піде не так — замінимо за наш рахунок. Це не акція, це стандарт майстерні для кожної коробки.",
        guideTitle: "Як обрати набір цукерок ручної роботи за приводом і бюджетом?",
        guideCapsule:
          "Для легкого компліменту підійдуть набори від 130 ₴ (4 сфери), для гурманів — сирні піраміди «Грань насолоди» (295–585 ₴), для мами чи на ювілей — «Свято без приводу» (450 ₴, 16 цукерок), а для вау-ефекту — шоколадні квіти (від 330 ₴). У вартість кожного набору вже включено святкову коробку, стрічку та листівку.",
        guideCols: ["Привід / кому", "Рекомендований набір", "Вага і формат", "Ціна"],
        guideRows: [
          { occasion: "Символічний комплімент колезі або собі", id: "set-four", name: "«Чотири настрої»", spec: "36 г · 4 сфери Callebaut", price: "130 ₴" },
          { occasion: "Для гурманів та поціновувачів сиру", id: "cheese-gran", name: "«Грань насолоди»", spec: "60–120 г · 6 / 9 / 12 пірамід", price: "295 – 585 ₴" },
          { occasion: "Коханій людині або на побачення", id: "set-twelve", name: "«Мелодія кохання»", spec: "120 г · 12 цукерок", price: "від 350 ₴" },
          { occasion: "Мамі, бабусі або на ювілей", id: "set-sixteen", name: "«Свято без приводу»", spec: "130 г · 16 цукерок, 4 ганаші", price: "від 450 ₴" },
          { occasion: "Чоловіку під каву чи віскі", id: "bars-fruit", name: "«Відпочинок після роботи»", spec: "300 г · 10 брусків по 30 г", price: "500 ₴" },
        ],
        guideSommelier: "Пройти тест «Шоколадний сомельє» зі знижкою -10% (SOMELIER10) →",
      }
    : {
        kicker: "Конфеты · Харьков",
        h1: "Конфеты ручной работы в Харькове — купить наборы из Callebaut от 130 ₴",
        p1: "Шоколадные конфеты ручной работы — это не про «сладкое», это про то, что вы скажете без слов. В нашей харьковской мастерской каждая конфета проходит путь руками мастера: бельгийский Callebaut темперируем до 45°C и кристального глянца, начиняем фруктовыми ганашами и карамелью, расписываем какао-маслом. Никаких конвейеров и никакой «кондитерской глазури».",
        p2: "В каталоге — подарочные наборы от 130 ₴: для любимых, мам, коллег и «просто так». Каждый едет в праздничной коробке с лентой и открыткой с вашим посланием — бесплатно. Курьерская доставка всеми районами Харькова в день заказа, Украиной — Новой почтой за 1–2 дня.",
        p3: "Не знаете, какой вкус выбрать? Добавьте набор в корзину — а все детали (вкусы ганашей, надпись на открытке, дата) согласуем в Viber или Telegram перед отправкой. И да, перед отправкой пришлём фото вашей коробки — чтобы сюрприз был и для нас.",
        h2: "Наборы конфет, которые берут в Харькове",
        guaranteeH: "Почему конфеты доедут идеальными",
        guarantee: "Каждый заказ пакуем в термосумку с охлаждением: в жару до +30°C конфеты сохраняют форму, глянец и рисунок. Если что-то пойдёт не так — заменим за наш счёт. Это не акция, это стандарт мастерской для каждой коробки.",
        guideTitle: "Как выбрать набор конфет ручной работы по поводу и бюджету?",
        guideCapsule:
          "Для лёгкого комплимента подойдут наборы от 130 ₴ (4 сферы), для гурманов — сырные пирамиды «Грань наслаждения» (295–585 ₴), для мамы или на юбилей — «Праздник без повода» (450 ₴, 16 конфет), а для вау-эффекта — шоколадные цветы (от 330 ₴). В стоимость каждого набора уже входят подарочная коробка, лента и открытка.",
        guideCols: ["Повод / кому", "Рекомендуемый набор", "Вес и формат", "Цена"],
        guideRows: [
          { occasion: "Символичный комплимент коллеге или себе", id: "set-four", name: "«Четыре настроения»", spec: "36 г · 4 сферы Callebaut", price: "130 ₴" },
          { occasion: "Для гурманов и ценителей сыра", id: "cheese-gran", name: "«Грань наслаждения»", spec: "60–120 г · 6 / 9 / 12 пирамид", price: "295 – 585 ₴" },
          { occasion: "Любимому человеку или на свидание", id: "set-twelve", name: "«Мелодия любви»", spec: "120 г · 12 конфет", price: "от 350 ₴" },
          { occasion: "Маме, бабушке или на юбилей", id: "set-sixteen", name: "«Праздник без повода»", spec: "130 г · 16 конфет, 4 ганаша", price: "от 450 ₴" },
          { occasion: "Мужчине к кофе или виски", id: "bars-fruit", name: "«Отдых после работы»", spec: "300 г · 10 брусков по 30 г", price: "500 ₴" },
        ],
        guideSommelier: "Пройти тест «Шоколадный сомелье» со скидкой -10% (SOMELIER10) →",
      };

  return (
    <InnerShell locale={locale} switchPair={switchPairFor(path)}>
      <section className="bg-choco-950 pb-14 pt-32 text-cream sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.3em] text-gold-400">{seo.kicker}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">{seo.h1}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ name: uk ? "Цукерки ручної роботи з ганашем Харків" : "Конфеты ручной работы с ганашем Харьков", path }]}
          locale={locale}
        />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-4 text-[16.5px] leading-relaxed text-choco-700">
          <p>{seo.p1}</p>
          <p>{seo.p2}</p>
          <p>{seo.p3}</p>
        </div>

        <div className="mt-10 rounded-3xl border border-gold-500/30 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-choco-900 sm:text-3xl">{seo.guideTitle}</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-choco-700">{seo.guideCapsule}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-choco-900">
                  {seo.guideCols.map((col) => (
                    <th key={col} className="py-3 pr-4 font-bold last:pr-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {seo.guideRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 pr-4 font-medium text-choco-900">{row.occasion}</td>
                    <td className="py-3 pr-4">
                      <Link href={productPath(row.id, locale)} className="font-bold text-gold-700 hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-choco-700">{row.spec}</td>
                    <td className="py-3 font-bold text-choco-900">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap gap-5">
            <Link href={uk ? "/sommelier" : "/ru/sommelier"} className="text-sm font-bold text-gold-700 hover:underline">
              {seo.guideSommelier}
            </Link>
            <Link href={uk ? "/3d" : "/ru/3d"} className="text-sm font-semibold text-choco-700 hover:text-gold-700 hover:underline">
              {uk ? "3D-тур BONBON PRO →" : "3D-тур BONBON PRO →"}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream-100/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-choco-900">{seo.h2}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as never} locale={locale} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={uk ? "/katalog" : "/ru/katalog"} className="inline-flex h-13 items-center rounded-full bg-choco-900 px-9 py-3.5 font-bold text-cream transition-colors hover:bg-gold-600">
              {uk ? "Дивитися весь каталог" : "Смотреть весь каталог"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl bg-choco-950 p-7 text-cream">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-gold-400" aria-hidden="true" />
            {seo.guaranteeH}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-cream/85">{seo.guarantee}</p>
          <p className="mt-4 text-sm font-semibold text-gold-300">
            {site.phoneShort} · {site.hours}
          </p>
        </div>
      </section>
    </InnerShell>
  );
}
