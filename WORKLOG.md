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

### 2026-11-27 — Снятие конкуренции шрифтов и ленивый `SommelierLazy` на главной
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
