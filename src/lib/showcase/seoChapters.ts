import type { Locale } from "@/lib/i18n";

export type ShowcaseChapterId =
  | "spin"
  | "crunch"
  | "lamination"
  | "ganache"
  | "tempering"
  | "scanner"
  | "inspector"
  | "lineup"
  | "order";

export interface ShowcaseChapterSeo {
  id: ShowcaseChapterId;
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  breadcrumbLabel: Record<Locale, string>;
  ogImage: string;
  priority: number;
}

export const SHOWCASE_SEO_CHAPTERS: ShowcaseChapterSeo[] = [
  {
    id: "spin",
    slug: { uk: "bonbon-pro-3d", ru: "bonbon-pro-3d" },
    title: {
      uk: "BONBON PRO 3D — Корпусні цукерки Callebaut 0.8 мм",
      ru: "BONBON PRO 3D — Корпусные конфеты Callebaut 0.8 мм",
    },
    description: {
      uk: "Інтерактивна 3D-презентація корпусних цукерок CraftChoco у Харкові: бельгійський шоколад Callebaut 70.5%, стінка 0.8 мм і ручний розпис какао-маслом.",
      ru: "Интерактивная 3D-презентация корпусных конфет CraftChoco в Харькове: бельгийский шоколад Callebaut 70.5%, стенка 0.8 мм и ручная роспись какао-маслом.",
    },
    breadcrumbLabel: {
      uk: "01 · Силует BONBON PRO 3D",
      ru: "01 · Силуэт BONBON PRO 3D",
    },
    ogImage: "/frames/posters/spin.webp",
    priority: 0.85,
  },
  {
    id: "crunch",
    slug: { uk: "khrust-korpusu-form-v", ru: "khrust-korpusa-form-v" },
    title: {
      uk: "Акустика хрусту 94 дБ — Корпус Form V Callebaut",
      ru: "Акустика хруста 94 дБ — Корпус Form V Callebaut",
    },
    description: {
      uk: "Як ламається ідеально темперований корпус Form V: 180 кристалів какао-масла, дзвінкий хрускіт 94 дБ та живий звук розлому в 3D.",
      ru: "Как ломается идеально темперированный корпус Form V: 180 кристаллов какао-масла, звонкий хруст 94 дБ и живой звук разлома в 3D.",
    },
    breadcrumbLabel: {
      uk: "02 · Хруст корпусу Form V",
      ru: "02 · Хруст корпуса Form V",
    },
    ogImage: "/frames/posters/crunch.webp",
    priority: 0.8,
  },
  {
    id: "lamination",
    slug: { uk: "sim-shariv-smaku", ru: "sem-sloev-vkusa" },
    title: {
      uk: "Сім шарів смаку — КТ-анатомія цукерки CraftChoco",
      ru: "Семь слоёв вкуса — КТ-анатомия конфеты CraftChoco",
    },
    description: {
      uk: "Пошаровий 3D-розбір начинки: розпис какао-маслом 0.05 мм, корпус 0.8 мм, тропічний конфі, ганаш 32 °C, хруст роялтин і біла вуаль.",
      ru: "Послойный 3D-разбор начинки: роспись какао-маслом 0.05 мм, корпус 0.8 мм, тропический конфи, ганаш 32 °C, хруст роялтин и белая вуаль.",
    },
    breadcrumbLabel: {
      uk: "03 · Сім шарів смаку",
      ru: "03 · Семь слоёв вкуса",
    },
    ogImage: "/frames/posters/layers.webp",
    priority: 0.8,
  },
  {
    id: "ganache",
    slug: { uk: "shovkovyi-hanash-callebaut", ru: "shelkovyi-ganash-callebaut" },
    title: {
      uk: "Шовковий ганаш 32 °C без пальмової олії — CraftChoco",
      ru: "Шёлковый ганаш 32 °C без пальмового масла — CraftChoco",
    },
    description: {
      uk: "Свіжі фермерські вершки, натуральне ягідне пюре та кувертюр Callebaut: точка плавлення 34 °C і 0% пальмових жирів.",
      ru: "Свежие фермерские сливки, натуральное ягодное пюре и кувертюр Callebaut: точка плавления 34 °C и 0% пальмовых жиров.",
    },
    breadcrumbLabel: {
      uk: "04 · Всередині ганашу",
      ru: "04 · Внутри ганаша",
    },
    ogImage: "/frames/posters/ganache.webp",
    priority: 0.8,
  },
  {
    id: "tempering",
    slug: { uk: "temperuvannia-shokoladu-form-v", ru: "temperirovanie-shokolada-form-v" },
    title: {
      uk: "Температурна крива Form V (45°→27.2°→31.2°C) — 3D",
      ru: "Температурная кривая Form V (45°→27.2°→31.2°C) — 3D",
    },
    description: {
      uk: "Інтерактивна телеметрія темперування шоколаду Callebaut: від гарячої маси 45 °C до дзеркального глянцю V-кристалів без глазурі.",
      ru: "Интерактивная телеметрия темперирования шоколада Callebaut: от горячей массы 45 °C до зеркального глянца V-кристаллов без глазури.",
    },
    breadcrumbLabel: {
      uk: "05 · Темперування Form V",
      ru: "05 · Темперирование Form V",
    },
    ogImage: "/frames/posters/tempering.webp",
    priority: 0.8,
  },
  {
    id: "scanner",
    slug: { uk: "renthen-i-teplovizor-tsukerky", ru: "rentgen-i-teplovizor-konfety" },
    title: {
      uk: "Рентген (X-Ray) та тепловізор FLIR цукерки в 3D",
      ru: "Рентген (X-Ray) и тепловизор FLIR конфеты в 3D",
    },
    description: {
      uk: "Погляд крізь корпус цукерки: інтерактивна лінза-сканер у режимах X-Ray, FLIR та 50/50 зі зчитуванням пікселів у реальному часі.",
      ru: "Взгляд сквозь корпус конфеты: интерактивная линза-сканер в режимах X-Ray, FLIR и 50/50 со считыванием пикселей в реальном времени.",
    },
    breadcrumbLabel: {
      uk: "06 · Сканер X-Ray / FLIR",
      ru: "06 · Сканер X-Ray / FLIR",
    },
    ogImage: "/plates/hero-xray.png",
    priority: 0.8,
  },
  {
    id: "inspector",
    slug: { uk: "ohliad-360-i-rozriz-nachynky", ru: "obzor-360-i-razrez-nachinki" },
    title: {
      uk: "Огляд 360° та живий розріз начинки 4 смаків — CraftChoco",
      ru: "Обзор 360° и живой разрез начинки 4 вкусов — CraftChoco",
    },
    description: {
      uk: "Обертайте цукерку на 360° та розколюйте її повзунком: маракуйя-лайм, малина-праліне, сицилійська фісташка й рубіновий трюфель.",
      ru: "Вращайте конфету на 360° и раскалывайте её ползунком: маракуйя-лайм, малина-пралине, сицилийская фисташка и рубиновый трюфель.",
    },
    breadcrumbLabel: {
      uk: "07 · Інспектор 360°",
      ru: "07 · Инспектор 360°",
    },
    ogImage: "/plates/split-passion.png",
    priority: 0.85,
  },
  {
    id: "lineup",
    slug: { uk: "liniika-smakiv-craftchoco", ru: "lineika-vkusov-craftchoco" },
    title: {
      uk: "4 авторські смаки цукерок CraftChoco — характеристики",
      ru: "4 авторских вкуса конфет CraftChoco — характеристики",
    },
    description: {
      uk: "Порівняння 4 фірмових смаків BONBON PRO: % какао Callebaut, товщина стінки 0.8 мм, кислотність, температура подачі та набори.",
      ru: "Сравнение 4 фирменных вкусов BONBON PRO: % какао Callebaut, толщина стенки 0.8 мм, кислотность, температура подачи и наборы.",
    },
    breadcrumbLabel: {
      uk: "08 · Лінійка смаків",
      ru: "08 · Линейка вкусов",
    },
    ogImage: "/plates/lineup-pistachio.png",
    priority: 0.85,
  },
  {
    id: "order",
    slug: { uk: "zamovyty-svizhu-partiiu-kharkiv", ru: "zakazat-svezhuyu-partiyu-kharkov" },
    title: {
      uk: "Замовити свіжу партію цукерок ручної роботи у Харкові",
      ru: "Заказать свежую партию конфет ручной работы в Харькове",
    },
    description: {
      uk: "Свіжа ранкова партія крафтових цукерок у Харкові (вул. Лебединська, 1): оберіть подарунковий набір на 6, 9, 12 або 16 цукерок у 1 клік.",
      ru: "Свежая утренняя партия крафтовых конфет в Харькове (ул. Лебединская, 1): выберите подарочный набор на 6, 9, 12 или 16 конфет в 1 клик.",
    },
    breadcrumbLabel: {
      uk: "09 · Свіжа партія і замовлення",
      ru: "09 · Свежая партия и заказ",
    },
    ogImage: "/plates/lineup-spin.png",
    priority: 0.9,
  },
];

export function findChapterBySlug(slug: string, locale: Locale): ShowcaseChapterSeo | undefined {
  return SHOWCASE_SEO_CHAPTERS.find((c) => c.slug[locale] === slug);
}

export function findChapterById(id: string): ShowcaseChapterSeo | undefined {
  return SHOWCASE_SEO_CHAPTERS.find((c) => c.id === id);
}

export function chapterPath(id: ShowcaseChapterId, locale: Locale): string {
  const ch = findChapterById(id);
  if (!ch) return locale === "uk" ? "/3d" : "/ru/3d";
  return locale === "uk" ? `/3d/${ch.slug.uk}` : `/ru/3d/${ch.slug.ru}`;
}

export function chapterSwitchPair(slug: string, locale: Locale): { uk: string; ru: string } | null {
  const ch = findChapterBySlug(slug, locale);
  if (!ch) return null;
  return {
    uk: `/3d/${ch.slug.uk}`,
    ru: `/ru/3d/${ch.slug.ru}`,
  };
}
