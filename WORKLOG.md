# WORKLOG — crafo-v2

Рабочий журнал проекта **CraftChoco / crafo-v2**. Все изменения кода, архитектурные решения, настройки производительности и каждый деплой фиксируются здесь и отправляются в GitHub.

## Паспорт проекта и защитные правила
- **Репозиторий GitHub:** `https://github.com/sos16101963-web/crafo-v2` (ветка `main`, автодеплой в Vercel при push)
- **Продакшн URL:** `https://crafo-v2.vercel.app` (отдельные 3D-маршруты: `/3d` и `/ru/3d`)
- **Стек:** Next.js 16.4.6 (Turbopack) + React 19 + TypeScript + Tailwind + Web Audio API + Lenis
- **Запрещено трогать:** `craftchoco-live`, `crafo-3d-intro`, репозиторий `sos16101963-web/craftchoco` и прод-проект `craft-choco` (`https://crafo.com.ua`)
- **Секреты:** никогда не записывать токены, PAT, ключи и пароли в `WORKLOG.md` или любые файлы репозитория.

---

## Журнал изменений и деплоев

### 2026-11-28 — Финальное ускорение мобильного PageSpeed в зелёную зону (90+): zero-reflow Faq/ChapterSpin, единый CSS и -100 КБ JS
- **Причины отставания (`lh.json` на коммите `5f10b5f`, TTFB всего 40–184 мс — проблема НЕ в домене):**
  - Вторичный render-blocking CSS (`1.4 КБ`) из неиспользуемых `next/font/google` (`Inter_Tight` и `JetBrains_Mono`).
  - `@radix-ui/react-accordion` в `Faq` (`getBoundingClientRect()` при монтировании) ломал пропуск секций `.cv-auto` и вызывал `1 848 мс` Style & Layout + `83 мс` forced reflow.
  - Бесконечный 60fps idle `rAF`-цикл и `initRaf` (`resize()` + `onScroll()`) в `ChapterSpin.tsx` до первого жеста + 4 скрытых `backdrop-blur-md` оверлея.
  - Избыточный стартовый клиентский JS на `/` (`getDict`, `@/lib/products`, `sonner`, `@radix-ui/react-dialog`, ранний маунт `CartSheetLazy` / `LazyToaster` / `LeadMagnet`).
- **Что сделано:**
  - `src/components/site/layout-base.tsx`: удалены неиспользуемые `Inter_Tight` и `JetBrains_Mono` (шрифты `Playfair Display` и `Manrope` подключены локально в `globals.css`) — в `<head>` остаётся только 1 CSS-файл.
  - `src/components/site/lazy-toaster.tsx` и `src/components/site/cart-sheet-lazy.tsx`: `Toaster` и `CartSheet` монтируются строго по действию (жест/`crafo:toast` или открытие корзины).
  - `src/components/site/faq.tsx`: переведён на нативный `<details name="faq">` без `@radix-ui/react-accordion` и без клиентского JS (0 forced reflow, `.cv-auto` работает на 100%).
  - `src/components/showcase/ChapterSpin.tsx`, `ShowcaseChaptersRest.tsx`, `BonbonShowcase3D.tsx`: старт Web/Canvas-движка отложен до первого жеста или `scrollY > 4`, чтение геометрии вынесено до записи размеров canvas, `rAF` засыпает при отсутствии кадров, скрытые `backdrop-blur-md` оверлеи рендерятся по порогу видимости; в `ShowcaseChaptersRest` убрана двойная вложенность `dynamic()` (исправлен точный скролл по правому рельсу к `#inspector`).
  - `src/components/site/header.tsx` + `header-mobile-menu.tsx`: убран `getDict`, заменён синхронный `useScrolled()`, мобильный `Sheet` загружается только по клику на меню.
  - `src/components/site/product-card.tsx` + `product-card-dialog.tsx` + `catalog.tsx` + `catalog-page.tsx`: вынесены `Dialog` (по клику «Детальніше»), `sonner` (динамический `import("sonner")` в обработчиках), `getDict` и `@/lib/products` (подгружается по требованию при поиске/фильтрации/сортировке или клике «Показати весь каталог»).
  - `src/components/site/corporate.tsx`, `contact.tsx`, `contact-form.tsx`, `tracked-link.tsx`, `lead-magnet.tsx`, `lead-magnet-lazy.tsx`, `site-shell.tsx`: `Corporate` и контактная колонка `ContactCta` переведены в 100% серверные компоненты; `LeadMagnetLazy` отложен на `12 с`; ниже первого экрана добавлена гранулярная изоляция `.cv-auto`.
- **Проверка:** `npx.cmd tsc --noEmit` (0 ошибок), `npm.cmd run build` (125/125 страниц), пуш в `origin/main` и живой замер Lighthouse + браузера.

### 2026-11-28 — Встроенный 5.8 КБ мобильный LCP-постер, снятие forced reflow в `Header` и отложенные главы 2–9 на главной
- **Что сделано:**
  - `src/lib/showcase/heroPosterInline.ts` + `ChapterSpin.tsx` + `site-shell.tsx`: мобильный LCP-постер сжат в `480×270` WebP (`5 798` байт, `data:image/webp;base64,...` встроен в HTML — 0 сетевой задержки для LCP на 4G). Для `ChapterCrunch` добавлен `<source media="(max-width: 767px)" srcSet="/frames/mobile/crunch/frame_0000.webp" />`.
  - `src/components/site/header.tsx` и `BonbonShowcase3D.tsx`: убран синхронный `useInDarkShowcase()` (`getBoundingClientRect()` при гидратации) — состояние тёмного хедера синхронизируется через `window.scrollY < 400` и событие `crafo:showcase-visibility`.
  - `src/components/showcase/ShowcaseChaptersRest.tsx` и `BonbonShowcase3D.tsx`: главы 2–9 на главной `/` вынесены в отложенный клиентский чанк (`ssr: false`, включаются по первому взаимодействию/скроллу), при этом на `/3d`, `/ru/3d` и всех 18 SEO-маршрутах `/3d/[chapter]` сохраняется 100% SSR HTML. Навигационная рельса с 9 `<a href="/3d/...">` остаётся в SSR главной для Googlebot.
  - `src/components/site/photo-marquee-lazy.tsx` + `site-shell.tsx`: карусель `PhotoMarquee` (`24` фото) переведена на отложенную клиентскую загрузку с фиксированным плейсхолдером `228px` (`CLS = 0`).
  - `src/app/globals.css`: удалены неиспользуемые классы `.film-grain`, `.film-intro` и `.journey-goldflow`.
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build`, деплой и замер Lighthouse / браузера.

### 2026-11-28 (`57543a7`) — Снятие preload шрифтов с первого экрана (FCP/LCP на медленном 4G)
- **Что сделано:** в `src/components/site/layout-base.tsx` для `Inter_Tight` отключён `preload` (`preload: false`, `display: "swap"`, `adjustFontFallback: true`). По водопаду Lighthouse два шрифта (`44 КБ` + `17 КБ`) стартовали вместе с блокирующим CSS (`21 КБ`) и LCP-постером `frame_0000.webp` и делили с ними канал; текст теперь рисуется запасным шрифтом без сдвига макета.
- **Контекст:** PSI mobile после предыдущих правок: `86` (TBT `40 мс`, CLS `0`, FCP `2.2 с`, LCP `3.8 с`).
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build`, пуш и замер.

### 2026-11-27 (`26e4fa2`) — Устранение двойного эффекта `SSR_SAFE_PROFILE` и forced reflow в главах 3–7
- **Что сделано:**
  - `src/components/showcase/BonbonShowcase3D.tsx`: `SSR_SAFE_PROFILE` приведён к `dprCap: 1, useMobileFrames: true` (совпадает с мобильным профилем — нет двойного пересоздания `useEffect` во всех 7 главах на старте).
  - `ChapterLamination.tsx`, `ChapterGanache.tsx`, `ChapterTempering.tsx`, `ChapterScanner.tsx`, `ChapterInspector360.tsx`: стартовые `resize()` и `onScroll()` перенесены в `IntersectionObserver` (убран синхронный forced reflow на маунте).
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build`, пуш и проверка в Lighthouse.

### 2026-11-27 (`23852fc`) — Сжатие DOM/HTML главной (`initialLimit=6` в каталоге, компактный `JsonLd`, ленивый цикл `ChapterCrunch`)
- **Что сделано:**
  - `src/components/site/catalog.tsx` и `src/components/site/site-shell.tsx`: на главной `/` изначально выводятся первые 6 наборов (включая `cheese-gran`) и кнопка «Показати весь каталог» (на `/katalog` и при поиске/фильтрации — все 21). Это вдвое сокращает стартовый HTML и количество DOM-узлов.
  - `src/components/site/json-ld.tsx`: `ItemList` на главной ограничивается топ-6 позициями (~35 КБ экономии HTML; полные `Product` схемы остаются на страницах товаров).
  - `src/components/showcase/ChapterCrunch.tsx`: отложены `resize()`, `onScroll()` и `requestAnimationFrame` до попадания главы в зону видимости (`IntersectionObserver`).
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build`, пуш и замер Lighthouse.

### 2026-11-27 (`50da31b`) — `content-visibility: auto` для секций ниже 1-го экрана и снятие forced reflow на маунте
- **Что сделано:**
  - По данным Lighthouse JSON (`styleLayout = 3.36 с`, `elementRenderDelay = 1.02 с` для `frame_0000.webp`) добавлен класс `.cv-auto` (`content-visibility: auto; contain-intrinsic-size: 1px 700px;`) в `src/app/globals.css` и `src/components/site/site-shell.tsx` для всех секций ниже 3D-шоукейса и футера.
  - В `ChapterSpin.tsx` начальные `resize()` и `onScroll()` вынесены в `requestAnimationFrame`, чтобы не вызывать принудительную компоновку (forced reflow) при старте.
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build`, пуш и замер в Lighthouse.

### 2026-11-27 (`5dbd34d`) — Снятие конкуренции шрифтов и ленивый `SommelierLazy` на главной
- **Что сделано:**
  - `src/components/site/layout-base.tsx`: сокращены веса `Inter_Tight` (`400, 600, 700`) и отключён preload второстепенного `JetBrains_Mono` (`preload: false`), чтобы не перебивать `frame_0000.webp` в `<head>`.
  - `src/components/site/sommelier-lazy.tsx` + `src/components/site/site-shell.tsx`: интерактивный квиз `ChocolateSommelier` на главной вынесен в клиентский lazy-чанк (`ssr: false`, SEO-версия индексируется на `/sommelier` и `/ru/sommelier`), что уменьшает HTML и RSC payload главной.
  - `src/components/showcase/ChapterSpin.tsx`: убрана CSS `transition-opacity` на стартовом постере для мгновенной фиксации LCP.
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build` и пуш в `origin/main`.

### 2026-11-27 (`e347270`) — Откат `inlineCss` (раздувал HTML до 1 МБ) и снятие лишнего preload `Playfair`
- **Что сделано:**
  - `next.config.ts`: убран `experimental.inlineCss: true`, так как он раздувал HTML до `1.02 МБ` и задерживал FCP (`2.3 с` вместо `1.2 с`); сохранены `dynamic`-чанки `Catalog` / `ChocolateSommelier` / `LeadMagnet`, `8.4 КБ` мобильный постер и `12 с` таймер аналитики (который дал `TBT = 60 мс` и `22 КиБ` unused JS).
  - `src/components/site/layout-base.tsx`: убран `FontPreloads` для `playfair-*.woff2` (`43 КБ`) из `<head>`, чтобы канал на старте был свободен для мобильного LCP-постера.
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build`, пуш в `origin/main` и замер размера HTML.

### 2026-11-27 (`315f408`) — Доводка мобильного PageSpeed в зелёную зону (90+)
- **Что сделано:**
  - `next.config.ts`: включён `experimental.inlineCss: true` (Next.js инлайнит критичный CSS прямо в HTML и убирает 430 мс render-blocking CSS).
  - `src/components/showcase/ChapterSpin.tsx` и `src/components/site/site-shell.tsx`: для мобильных (`< 768px`) подключён `<picture>` + `ReactDOM.preload` с лёгким постером `/frames/mobile/spin/frame_0000.webp` (`8.4 КБ` вместо `22.5 КБ`), а тяжёлые клиентские секции `Catalog`, `ChocolateSommelier` и `LeadMagnet` вынесены в отдельные чанки через `next/dynamic`.
  - `src/components/site/analytics.tsx`: фолбэк-таймер увеличен до `12 000 мс` (при любом жесте аналитика по-прежнему стартует мгновенно).
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build` и пуш в `origin/main`.

### 2026-11-27 (`b4d5a66`) — Мобильная оптимизация PageSpeed (LCP, FCP, TBT, Forced Reflow)
- **Что сделано:**
  - `src/components/site/analytics.tsx`: отложена загрузка GA4, Meta Pixel и Clarity до первого жеста пользователя (`pointerdown`/`touchstart`/`keydown`/`scroll`) или 6.5 с в простое — убрано ~178 KiB неиспользуемого JS и блокировка основного потока на старте.
  - `src/components/site/site-shell.tsx` и `src/components/showcase/ChapterSpin.tsx`: добавлен `ReactDOM.preload("/frames/posters/spin.webp", { as: "image", fetchPriority: "high" })`, явные `width={1280} height={720}` и `decoding="sync"` на LCP-постере; `CartSheet` заменён на `CartSheetLazy`.
  - `src/components/showcase/BonbonShowcase3D.tsx`: главы 2–9 переведены на `next/dynamic` (отдельные чанки, сохраняя SSR для Googlebot); `Lenis` переведён на ленивый `import("lenis")` только на мощных ПК; убран синхронный `updateActive()` на маунте и добавлен `rAF`-троттлинг скролла (устранён forced reflow).
  - `src/components/site/photo-marquee.tsx`: добавлен `loading="lazy"` на 24 фото карусели ниже первого экрана.
  - `src/components/site/layout-base.tsx`: убран агрессивный `prerender` из `SpeculationRules` на мобильном 4G (оставлен `prefetch` с `eagerness: "conservative"`).
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build` и пуш в `origin/main`.

### 2026-11-27 (`a450811`) — Полная синхронизация с `crafo.com.ua` (сырный шоколад, поиск, открытка, 2026–2027 CSS)
- **Что сделано:**
  - Перенесены все 10 свежих коммитов с `craftchoco-live` (`7a0cacc..37581b1`) без потери 3D-функционала и улучшений `crafo-v2`:
    - Категория **«Сырная коллекция · Гурмэ»** (`cheese`) и набор **«Грань насолоди» (`cheese-gran`)** с выбором формата `6 / 9 / 12` шт., 8 фото `public/images/cheese-gran-*`, поддержкой вариантов в корзине (`resolveCartProduct`) и мобильной липкой панелью (`product-hero-interactive.tsx`).
    - Обновлённые цены и вес: `mediants-four` (`227 ₴ / 135 г`), `flowers-four` (`580 ₴ / 385 г`).
    - Мгновенный поиск по вкусу/поводу и сортировка по цене в `src/components/site/catalog.tsx`.
    - Поле для текста открытки/комментария к заказу (`cart-note` в `cart-sheet.tsx` и `/api/checkout/route.ts`) при сохранении ширины корзины `540px`, плейсхолдера `Телефон` и кнопки очистки корзины.
    - Хлебные крошки с ключевыми словами на всех страницах, новая статья блога про сырный шоколад (`syrni-shokoladni-tsukerky-kharkiv`), чистка текстов от ИИ-клише, **Meta Pixel dataset ID** в `analytics.tsx`, ссылка на **CrafoHab** в `footer.tsx`, а также нативные CSS-переходы `@view-transition` и `interpolate-size: allow-keywords` в `globals.css`.
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build` и проверка живого сайта `https://crafo-v2.vercel.app`.

### 2026-11-27 (`07a43ba`) — 9 SEO-страниц для 3D-глав (1 тур для клиента) и паспорт `README.md`
- **Что сделано:**
  - Создан [README.md](./README.md) — паспорт дубля `crafo-v2.vercel.app` (архитектура 3D, таблица 9 SEO-страниц, отличия от `crafo.com.ua`, бэклог переноса свежих правок из `craftchoco-live`).
  - Добавлен конфиг 9 SEO-глав `src/lib/showcase/seoChapters.ts` и статические маршруты `src/app/(uk)/3d/[chapter]/page.tsx` и `src/app/(ru)/ru/3d/[chapter]/page.tsx` (18 страниц: 9 UK + 9 RU) с уникальными `title`, `description`, `og:image`, `canonical`, `hreflang`, `BreadcrumbList` + `WebPage` JSON-LD.
  - Обновлён `src/components/showcase/BonbonShowcase3D.tsx`: добавлен `initialChapter` (при заходе на любой из 9 URL клиент плавно/мгновенно оказывается на нужной главе внутри единого 9-главного 3D-тура), а точки навигации справа стали полноценными `<a href="/3d/...">` ссылками для краулинга Googlebot (клик прокручивает плавно без перезагрузки, обновляя URL через `history.replaceState`).
  - Обновлены `src/lib/pages.ts` (`switchPairFor` для `/3d/<slug>` и `/ru/3d/<slug>`) и `src/app/sitemap.ts` (все 18 URL добавлены в `sitemap.xml`).
- **Проверка:** `npx.cmd tsc --noEmit`, `npm.cmd run build` и проверка `3d`-маршрутов в браузере.

### 2026-11-26 (`0600645`) — Правила Antigravity, `WORKLOG.md` и переиспользуемые навыки
- **Что сделано:**
  - Создан `WORKLOG.md` в корне `crafo-v2` с полной историей сборок, деплоев и архитектурных решений.
  - Созданы правила [GEMINI.md](./GEMINI.md) (в репозитории) и глобальное правило в `~/.gemini/config/GEMINI.md`, обязывающие фиксировать каждое изменение и деплой в `WORKLOG.md` + GitHub.
  - Задокументированы 2 навыка (в `.agents/skills/` репозитория и глобально в `~/.gemini/config/skills/`):
    - [scroll-3d-showcase-performance](./.agents/skills/scroll-3d-showcase-performance/SKILL.md) — как устроен наш 3D без тормозов и без потери LCP (Poster-First, гейтинг по первому жесту, 3-уровневый профилировщик `deviceTier`, двойные WebP-последовательности `1280×720` / `640×360`, приоритетная загрузка ключевых кадров, очистка RAM `evictDistantSequences`, мобильные оверлеи, ленивый Web Audio).
    - [github-worklog-discipline](./.agents/skills/github-worklog-discipline/SKILL.md) — протокол ведения `WORKLOG.md` при каждом изменении и деплое.
- **Проверка:** `npx.cmd tsc --noEmit` (код `0`), push в `origin/main` и проверка доступности продакшна.

### 2026-11-26 (`e3e07bc`) — Живой звук разлома шоколада и фоновая музыка 3D
- **Что сделано:**
  - `public/audio/bonbon-crack.mp3` (`14 150 байт`, `0.653 с`): из пользовательского MP3 вырезана начальная тишина (`0.66 с`) для мгновенного отклика при разломе и выполнена нормализация до `-1.1 дБ`.
  - `public/audio/atelier-ambient.mp3` (`512 878 байт`, `32.0 с`): бесшовный зацикленный эмбиент-саундтрек в ре-миноре с круговой стерео-реверберацией (ошибка шва `0.000509`, громкость `-19.4 дБ`).
  - Обновлён `src/lib/showcase/soundEngine.ts`: ленивая загрузка обоих MP3 только после клика по кнопке звука (`0` запросов `/audio/*` до взаимодействия); реальный звук разлома с лёгким приглушением музыки (`duckMusic`); `setShowcaseActive()` для плавного затухания при уходе в каталог или сворачивании вкладки; гармонизация синтетических фонов глав 4–5 под ре-минор.
  - Обновлены `src/components/showcase/BonbonShowcase3D.tsx`, `src/lib/showcase/content.ts`, `src/components/site/header.tsx` (пульсирующая золотая точка на иконке звука) и `next.config.ts` (`Cache-Control: public, max-age=31536000, immutable` для `/audio/:path*`).
- **Проверка и деплой:** `tsc --noEmit` + `next build` (103 маршрута, код `0`), локальная проверка десктоп/мобильный, автодеплой на `https://crafo-v2.vercel.app`, проверка в браузере на `/ru/3d` (`HTTP 200` для обоих MP3 после клика, `0` ошибок в консоли).

### 2026-11-24 (`0b2b59d`) — Плейсхолдер телефона и очистка корзины
- **Что сделано:** в `CartSheet` упрощён плейсхолдер поля телефона на `Телефон` (чтобы курсор не упирался в маску) и добавлена кнопка очистки корзины (`Очистити кошик` / `Очистить корзину`).
- **Деплой:** коммит `0b2b59d` -> `https://crafo-v2.vercel.app`, проверено в браузере.

### 2026-11-24 (`41ee6d8`) — Кнопка «Назад», ссылки из 3D, широкая корзина `540px`
- **Что сделано:**
  - Добавлен универсальный `BackButton` (`src/components/site/back-button.tsx`) в шапке и мобильной нижней панели.
  - Ссылки на наборы в `ChapterLineup.tsx` и `ChapterOrder.tsx` сделаны кликабельными (`/podarunky/<slug>`).
  - Расширена корзина `CartSheet` до `sm:max-w-[540px]` с единой прокручиваемой областью и паузой `Lenis` (`lenis.stop()/start()`) при открытии корзины, исправлен ввод телефона.
- **Деплой:** коммит `41ee6d8` -> `https://crafo-v2.vercel.app`.

### 2026-11-23 (`74e5927`) — Живой X-Ray/FLIR сканер и мобильная вёрстка 3D
- **Что сделано:**
  - Устранено пропадание анимации в `ChapterScanner.tsx` (стабилизация `onActive` через `useMemo` + `onActiveRef` предотвратила пересоздание `useEffect` на каждом кадре скролла).
  - Перевёрстаны мобильные оверлеи глав 1–7 (`h-[100dvh] pt-20 pb-24`), чтобы текстовые карточки не перекрывали 3D-конфету и график Form V.
- **Деплой:** коммит `74e5927` -> `https://crafo-v2.vercel.app`.

### 2026-11-23 (`dabf830`) — Первичная сборка и деплой `crafo-v2`
- **Что сделано:**
  - Создан единый сайт `crafo-v2`: 9-главный 3D-шоукейс `BONBON PRO` (`ChapterSpin`, `ChapterCrunch`, `ChapterLamination`, `ChapterGanache`, `ChapterTempering`, `ChapterScanner`, `ChapterInspector360`, `ChapterLineup`, `ChapterOrder`) + витрина `crafo.com.ua` (`uk`/`ru`, 103 маршрута).
  - Реализована архитектура быстрой загрузки без тормозов на телефонах: Poster-First LCP, старт потоковой загрузки кадров только после первого жеста, двойные WebP-наборы (`desktop 1280×720` / `mobile 640×360`), 3-уровневый профилировщик `deviceTier.ts` (`instant` / `lite` / `high`), приоритетная загрузка ключевых кадров и выгрузка далёких сцен из RAM (`evictDistantSequences`).
- **Деплой:** коммит `dabf830` -> `https://crafo-v2.vercel.app`.

---

## Шаблон для новой записи
```markdown
### YYYY-MM-DD — Краткий заголовок
- **Что сделано:** ...
- **Решения и исправления:** ...
- **Проверка:** ...
- **Деплой:** коммит `<hash>` (`main`) -> `https://crafo-v2.vercel.app`
```
