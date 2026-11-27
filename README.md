# CraftChoco / crafo-v2 — Паспорт дубля магазина (`crafo-v2.vercel.app`)

**`crafo-v2`** — это новое поколение интернет-магазина **CraftChoco (Харьков)**, объединяющее витрину `crafo.com.ua` с 9-главным интерактивным 3D-шоукейсом **BONBON PRO**.

- **Живой сайт (дубль):** https://crafo-v2.vercel.app (отдельный 3D-тур: `/3d` и `/ru/3d`)
- **Оригинальный сайт:** https://crafo.com.ua (репозиторий/папка `craftchoco-live`, **запрещено изменять без прямой команды**)
- **Репозиторий GitHub:** `https://github.com/sos16101963-web/crafo-v2` (ветка `main`, автодеплой на Vercel при `git push`)
- **Стек:** Next.js 16.4.6 (Turbopack) + React 19 + TypeScript + Tailwind CSS + Web Audio API + Lenis
- **Журнал изменений:** [WORKLOG.md](./WORKLOG.md)

---

## 1. Архитектура 3D для Google (9 SEO-страниц → 1 бесшовный тур для клиента)

Для клиента весь 3D-шоукейс — это **единая непрерывная страница** (`/3d`, `/ru/3d` или верх главной `/` и `/ru`), по которой можно плавно скроллить сверху вниз.

Для поисковых систем Google каждая из 9 глав имеет **собственный статический URL** (18 страниц: 9 `uk` + 9 `ru`) со своим `<title>`, `<meta description>`, `canonical`, `hreflang` (`uk-UA` / `ru-UA` / `x-default`), `og:image`, `BreadcrumbList` + `WebPage` JSON-LD и включена в `sitemap.xml`. При переходе по любой из 9 ссылок клиент мгновенно попадает прямо в нужную главу внутри того же 9-главного тура.

| Глава | UK URL (`/3d/...`) | RU URL (`/ru/3d/...`) | Якорь на странице |
| :--- | :--- | :--- | :--- |
| **01 · Силует** | `/3d/bonbon-pro-3d` | `/ru/3d/bonbon-pro-3d` | `#spin` |
| **02 · Хруст Form V** | `/3d/khrust-korpusu-form-v` | `/ru/3d/khrust-korpusa-form-v` | `#crunch` |
| **03 · 7 шарів смаку** | `/3d/sim-shariv-smaku` | `/ru/3d/sem-sloev-vkusa` | `#lamination` |
| **04 · Шовковий ганаш** | `/3d/shovkovyi-hanash-callebaut` | `/ru/3d/shelkovyi-ganash-callebaut` | `#ganache` |
| **05 · Темперування Form V** | `/3d/temperuvannia-shokoladu-form-v` | `/ru/3d/temperirovanie-shokolada-form-v` | `#tempering` |
| **06 · Рентген і Тепловізор** | `/3d/renthen-i-teplovizor-tsukerky` | `/ru/3d/rentgen-i-teplovizor-konfety` | `#scanner` |
| **07 · Інспектор 360°** | `/3d/ohliad-360-i-rozriz-nachynky` | `/ru/3d/obzor-360-i-razrez-nachinki` | `#inspector` |
| **08 · Лінійка 4 смаків** | `/3d/liniika-smakiv-craftchoco` | `/ru/3d/lineika-vkusov-craftchoco` | `#lineup` |
| **09 · Замовлення партії** | `/3d/zamovyty-svizhu-partiiu-kharkiv` | `/ru/3d/zakazat-svezhuyu-partiyu-kharkov` | `#order` |

Конфигурация глав: [src/lib/showcase/seoChapters.ts](./src/lib/showcase/seoChapters.ts).

---

## 2. Ключевые особенности дубля `crafo-v2` (что уже внедрено)

- **Быстрая загрузка для Google и старых телефонов:**
  - Архитектура **Poster-First LCP** (сначала грузится 1 лёгкий постер `spin.webp`; кадры анимации стартуют только после первого жеста пользователя).
  - Двойные WebP-секвенции (`desktop 1280×720` и `mobile 640×360`) + 3-уровневый профилировщик (`deviceTier.ts`: `instant` / `lite` / `high`).
  - Очистка RAM для далёких глав (`evictDistantSequences`) и кэш `Cache-Control: immutable` на 1 год.
- **Звук и фоновая музыка 3D (`soundEngine.ts`):**
  - Ленивая загрузка только после клика пользователя по кнопке звука.
  - Реальный звук разлома шоколада (`public/audio/bonbon-crack.mp3`) + бесшовная 32-секундная фоновая музыка (`public/audio/atelier-ambient.mp3`) с затуханием при выходе из 3D или сворачивании вкладки.
- **Улучшенный UX магазина:**
  - Универсальная кнопка «Назад» на всех страницах (в шапке и мобильной панели).
  - Активные ссылки на наборы прямо из 3D-раздела.
  - Широкая корзина (`540px`), пауза `Lenis` при открытой корзине, простой плейсхолдер `Телефон` и кнопка «Очистити кошик» / «Очистить корзину».

---

## 3. Синхронизация с `crafo.com.ua` (перенесено из `craftchoco-live`)

Обновления с рабочего `crafo.com.ua` (коммиты от `2026-11-23` по `2026-11-26`), перенесённые в `crafo-v2`:
- [x] Новая категория **«Сырный шоколад»** и набор-пирамидка **«Грань Насолоди» (`cheese-gran`)** с выбором `6 / 9 / 12` шт. + 8 фото (`cheese-gran-*`).
- [x] Обновлённые цены и вес: `mediants-four` (`227 ₴ / 135 г`), `flowers-four` (`580 ₴ / 385 г`).
- [x] Мгновенный поиск и сортировка в каталоге, мобильная липкая панель покупки, поле для текста открытки к подарку и CSS-переходы `@view-transition` + `interpolate-size`.
- [x] SEO-доработки с `crafo.com.ua`: расширенные хлебные крошки, статья блога о сырном шоколаде, чистка текстов/сомелье от ИИ-клише.
- [x] Аналитика и футер: **Meta Pixel dataset ID** и ссылка на **CrafoHab** в футере.

---

## 4. Команды разработки и проверки (Windows PowerShell)

```powershell
# Проверка TypeScript и сборка продакшна
npx.cmd tsc --noEmit
npm.cmd run build

# Локальный запуск продакшн-сборки
npx.cmd next start -H 127.0.0.1 -p 3005
```

> **Защитное правило:** `craftchoco-live`, `crafo-3d-intro`, `sos16101963-web/craftchoco` и `crafo.com.ua` изменять запрещено. Все изменения в `crafo-v2` обязательно фиксируются в [WORKLOG.md](./WORKLOG.md) и отправляются в GitHub (`main`).
