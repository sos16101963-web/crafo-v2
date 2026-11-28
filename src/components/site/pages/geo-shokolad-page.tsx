import Link from "next/link";
import { MapPin } from "lucide-react";
import { InnerShell } from "@/components/site/inner-shell";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ThermoBanner } from "@/components/site/thermo-banner";
import { ProductCard } from "@/components/site/product-card";
import { switchPairFor } from "@/lib/pages";
import { catalogFor } from "@/lib/products";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

const HIT_IDS = ["cheese-gran", "set-sixteen", "roses-marble", "flowers-six", "bars-fruit", "set-combo"];

/** Гео-лендинг №1: «Шоколад ручної роботи в Харкові» */
export function GeoShokoladPage({ locale, path }: { locale: Locale; path: string }) {
  const uk = locale === "uk";
  const products = catalogFor(locale).filter((p) => HIT_IDS.includes(p.id));
  const t = getDict(locale);

  const seo = uk
    ? {
        kicker: "Харків · ручна робота",
        h1: "Шоколад ручної роботи в Харкові — на замовлення з Callebaut",
        p1: "Шукаєте шоколад, якому довіряєте? Майстерня CraftChocoKharkiv робить цукерки, плитки та шоколадні букети вручну — з бельгійського шоколаду Callebaut, без замін і «кондитерської глазурі». Кожна цукерка відливається, начінюється ганашем і розписується какао-маслом у нашому харківському цеху.",
        p2: "Ми живемо в Харкові і знаємо, чого боїться подарунок: спеки, заторових доріг і «просто чергових цукерок». Тому возимо кур'єром у день замовлення у термосумці з охолодженням, а свіжість підтверджуємо фото перед відправкою. Понад 2 000 родин міста вже дарують наші набори — і в офісах їх знають як «людину з найкращими подарунками».",
        p3: "Обирайте готовий набір із каталогу нижче або замовте індивідуальний: скажемо, що вміємо, за 10 хвилин у Viber або Telegram. Від 3 000 ₴ доставимо безкоштовно — і по всіх дев'яти районах Харкова, і Новою поштою по Україні.",
        h2: "Хіти, які харків'яни беруть найчастіше",
        districtsH: "Доставляємо сьогодні:",
        districts: "Шевченківський · Київський · Салтівський · Слобідський · Немишлянський · Індустріальний · Основ'янський · Холодногірський · Новобаварський",
        geoTitle: "Чим крафтовий шоколад CraftChoco (Callebaut Form V) відрізняється від фабричного?",
        geoCapsule:
          "Майстерня CraftChoco у Харкові працює виключно на 100% натуральному бельгійському какао-маслі Barry Callebaut із ручним темперуванням Form V (корпус 0.8 мм) і свіжими вершками без консервантів. Масові цукерки із супермаркету зазвичай містять пальмові жири, ароматизатори та зберігаються 6–12 місяців.",
        colParam: "Параметр",
        colCraft: "CraftChoco (Харків)",
        colMass: "Масмаркет",
        rows: [
          ["Сировина", "100% бельгійський Callebaut (70.5% / 33.6% / 28%)", "Замінники какао-масла, пальмова олія"],
          ["Темперування", "Ручне Form V (45° → 27.2° → 31.2 °C), стінка 0.8 мм", "Потокова глазур із товстим шаром"],
          ["Начинки", "Натуральне фруктове пюре, праліне, благородні сири", "Помадка, рослинний жир, ароматизатори"],
          ["Термін зберігання", "14 діб для ганашів (+16…+18 °C), без консервантів", "6–12 місяців із консервантами"],
          ["Доставка у спеку", "Безкоштовний термобокс до +30 °C, фото перед відправкою", "Звичайна коробка без контролю температури"],
          ["Ціна набору", "Від 130 ₴ (святкова коробка та листівка — 0 ₴)", "Додаткові витрати на подарункову упаковку"],
        ],
        cta3d: "Дивитись інтерактивну 3D-анатомію цукерки (BONBON PRO) →",
      }
    : {
        kicker: "Харьков · ручная работа",
        h1: "Шоколад ручной работы в Харькове — на заказ из Callebaut",
        p1: "Ищете шоколад, которому доверяете? Мастерская CraftChocoKharkiv делает конфеты, плитки и шоколадные букеты вручную — из бельгийского шоколада Callebaut, без замен и «кондитерской глазури». Каждая конфета отливается, начиняется ганашем и расписывается какао-маслом в нашем харьковском цехе.",
        p2: "Мы живём в Харькове и знаем, чего боится подарок: жары, пробок и «просто очередных конфет». Поэтому возим курьером в день заказа в термосумке с охлаждением, а свежесть подтверждаем фото перед отправкой. Более 2 000 семей города уже дарят наши наборы — и в офисах их знают как «человека с лучшими подарками».",
        p3: "Выбирайте готовый набор из каталога ниже или закажите индивидуальный: расскажем, что умеем, за 10 минут в Viber или Telegram. От 3 000 ₴ доставим бесплатно — и по всем девяти районам Харькова, и Новой почтой по Украине.",
        h2: "Хиты, которые харьковчане берут чаще всего",
        districtsH: "Доставляем сегодня:",
        districts: "Шевченковский · Киевский · Салтовский · Слободской · Немышлянский · Индустриальный · Основянский · Холодногорский · Новобаварский",
        geoTitle: "Чем крафтовый шоколад CraftChoco (Callebaut Form V) отличается от фабричного?",
        geoCapsule:
          "Мастерская CraftChoco в Харькове работает исключительно на 100% натуральном бельгийском какао-масле Barry Callebaut с ручным темперированием Form V (корпус 0.8 мм) и свежими сливками без консервантов. Массовые конфеты из супермаркета обычно содержат пальмовые жиры, ароматизаторы и хранятся 6–12 месяцев.",
        colParam: "Параметр",
        colCraft: "CraftChoco (Харьков)",
        colMass: "Массмаркет",
        rows: [
          ["Сырьё", "100% бельгийский Callebaut (70.5% / 33.6% / 28%)", "Заменители какао-масла, пальмовый жир"],
          ["Темперирование", "Ручное Form V (45° → 27.2° → 31.2 °C), стенка 0.8 мм", "Поточная глазурь с толстым слоем"],
          ["Начинки", "Натуральное фруктовое пюре, пралине, благородные сыры", "Помадка, растительный жир, ароматизаторы"],
          ["Срок хранения", "14 суток для ганашей (+16…+18 °C), без консервантов", "6–12 месяцев с консервантами"],
          ["Доставка в жару", "Бесплатный термобокс до +30 °C, фото перед отправкой", "Обычная коробка без термозащиты"],
          ["Цена набора", "От 130 ₴ (праздничная коробка и открытка — 0 ₴)", "Отдельная доплата за подарочную упаковку"],
        ],
        cta3d: "Смотреть интерактивную 3D-анатомию конфеты (BONBON PRO) →",
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
          items={[{ name: uk ? "Купити крафтовий шоколад у Харкові" : "Купить крафтовый шоколад в Харькове", path }]}
          locale={locale}
        />
      </div>

      <ThermoBanner locale={locale} />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-4 text-[16.5px] leading-relaxed text-choco-700">
          <p>{seo.p1}</p>
          <p>{seo.p2}</p>
          <p>{seo.p3}</p>
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/5 px-5 py-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-choco-800">
            <strong className="font-bold">{seo.districtsH}</strong> {seo.districts}. {uk ? "Кур'єр — 100 ₴, від 3 000 ₴ безкоштовно." : "Курьер — 100 ₴, от 3 000 ₴ бесплатно."} {site.hours}.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-gold-500/30 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-choco-900 sm:text-3xl">{seo.geoTitle}</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-choco-700">{seo.geoCapsule}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-choco-900">
                  <th className="py-3 pr-4 font-bold">{seo.colParam}</th>
                  <th className="py-3 pr-4 font-bold text-gold-700">{seo.colCraft}</th>
                  <th className="py-3 font-semibold text-choco-500">{seo.colMass}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {seo.rows.map(([param, craft, mass]) => (
                  <tr key={param}>
                    <td className="py-3 pr-4 font-semibold text-choco-900">{param}</td>
                    <td className="py-3 pr-4 text-choco-800">{craft}</td>
                    <td className="py-3 text-choco-500">{mass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <Link href={uk ? "/3d" : "/ru/3d"} className="text-sm font-bold text-gold-700 hover:underline">
              {seo.cta3d}
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
              {t.common.details} — {uk ? "увесь каталог" : "весь каталог"}
            </Link>
          </div>
        </div>
      </section>
    </InnerShell>
  );
}
