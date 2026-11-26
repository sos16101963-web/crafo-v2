---
name: scroll-3d-showcase-performance
description: >-
  Build photorealistic scroll-driven 3D product showcases from video/frame sequences
  that score high on Core Web Vitals (LCP) and stay smooth on older smartphones.
  Use when creating, optimizing, or debugging scroll-scrubbed 3D canvas showcases,
  dual desktop/mobile WebP frame streaming, RAM eviction, mobile overlay layouts,
  or lazy Web Audio sound/music for 3D scenes.
---

# Scroll-Driven 3D Showcase Performance Runbook

Proven production architecture from `crafo-v2` (`BONBON PRO` 9-chapter 3D showcase): keeps initial Google/LCP load near-instant (only 1 lightweight hero poster image fetched), streams smooth scroll-scrubbed 3D frames after interaction, and prevents RAM crashes on older phones.

## 1. Media Extraction Pipeline (Video -> Dual WebP + Instant Posters)
1. Store two pre-rendered WebP frame resolutions per chapter sequence in `public/frames/`:
   - `desktop/<sequenceId>/frame_XXXX.webp` (`1280x720`, ~86-100 frames)
   - `mobile/<sequenceId>/frame_XXXX.webp` (`640x360`, ~57-65 frames)
   - Declared explicitly in `src/lib/showcase/sequenceManifest.ts` (`DESKTOP_COUNTS`, `MOBILE_COUNTS`).
2. Store one static poster per chapter (`public/frames/posters/<id>.webp`) plus static split plates (`public/plates/*.png`) for `instant` / zero-motion fallback.
3. Configure 1-year immutable HTTP caching in `next.config.ts` (`headers()`):
   - `/frames/:path*`, `/plates/:path*`, `/audio/:path*`, `/images/:path*`, `/fonts/:path*` -> `public, max-age=31536000, immutable`.

## 2. Poster-First LCP & Interaction-Gated Streaming (Fast Google Load)
1. Render Chapter 1's hero poster immediately in HTML (`<img src="/frames/posters/spin.webp" fetchPriority="high">`) with `<canvas>` faded in only once a decoded frame is ready.
2. Keep `streamingActivated = false` in `src/lib/showcase/frameSequence.ts` until the first real user gesture (`wheel`, `touchstart`, `pointerdown`, `keydown`, or `window.scrollY > 18`).
3. Keep all `/audio/*` files lazy-loaded on sound toggle click. Result: initial load / Googlebot downloads `0` animation frames and `0` audio files.

## 3. Three-Tier Runtime Device Profiling (`deviceTier.ts`)
Select behavior in `detectDeviceProfile()`:
- **`instant`**: `prefers-reduced-motion: reduce`, `navigator.connection.saveData`, or `slow-2g`/`2g`/`3g` -> show static crisp posters/plates only (`<500 KB`), skip `<canvas>` RAF loop and Lenis.
- **`lite`**: viewport `< 768px`, `deviceMemory <= 4 GB`, or `hardwareConcurrency <= 4` -> use `640x360` mobile frames, cap `dprCap = 1`, disable Lenis (use native momentum scrolling).
- **`high`**: modern desktop -> use `1280x720` desktop frames, `dprCap = 2`, enable `Lenis` smooth scroll (always call `lenis.stop()` when drawers/modals like `CartSheet` open, and `lenis.start()` when closed).

## 4. Coarse-to-Fine Priority Queue & Nearest-Frame Fallback (`frameSequence.ts`)
1. Cap concurrent network image fetches (`MAX_CONCURRENCY = 6`) and boost the active chapter's score (`+500`).
2. Enqueue keyframes FIRST per sequence so scrubbing works immediately even on slower Wi-Fi:
   - Frame `0` (priority `260`), midpoint `0.5` (`250`), every `8th` frame (`210`), last frame (`205`), then intermediate frames (`60`).
3. Never render a black flash: `getBestFrame(id, rawIndex)` searches outward (`+-delta`) for the closest already-loaded frame until the exact frame finishes decoding.
4. Trigger loading only 1 chapter ahead via `IntersectionObserver` (`rootMargin: "500px 0px"`).

## 5. Sliding-Window RAM Eviction (`evictDistantSequences`)
Older phones crash if 800+ decoded bitmaps stay in JS memory at once:
1. Track the active chapter and pass `[active - 1, active, active + 1]` sequence IDs to `evictDistantSequences(keepIds)`.
2. Clear `store.frames[1..N-1] = null` and remove queued keys/pending tasks for chapters more than 1 step away, keeping `frames[0]` as an instant fallback.
3. Because `/frames/*` has immutable browser cache headers, scrolling back reloads WebPs from local HTTP disk cache without hitting the network.

## 6. Canvas & Mobile Layout Pitfalls Avoided
- **Stable observer dependencies:** Never pass inline arrow functions directly into a canvas `useEffect` dependency array (`ChapterScanner` regression!). Memoize chapter handlers (`useMemo`) and store `onActive` in `onActiveRef.current`.
- **No HUD overlap on phones:** Use `h-[100dvh] pt-20 pb-24` on sticky scroll stages, scale canvas cleanly, push compact 2-column telemetry cards to the bottom, and render inspector filling tags cleanly below the stage on `< sm` viewports.

## 7. Lazy Web Audio (Real SFX + Seamless Ambient Music)
1. **Trim leading silence on SFX:** Inspect uploaded `.mp3`/`.wav` with `ffmpeg -af silencedetect` and trim leading silence (preserving ~8 ms pre-roll + 2 ms fade-in) before encoding to `public/audio/bonbon-crack.mp3` so cracks hit instantaneously with zero lag.
2. **Seamless ambient loop:** Wrap harmonic cycles and convolve reverb circularly (tile `[dry, dry]`, convolve via `fftconvolve`, slice `[N:2N]`) so loop boundaries have zero click (`discontinuity < 0.01`) in `public/audio/atelier-ambient.mp3`.
3. **Browser autoplay & vitals discipline:** Start `enabled = false`. Only call `fetch` + `ctx.decodeAudioData()` after user clicks Enable Sound.
4. **Clean context lifecycle:** Fade out music & mute chapter drones when scrolling out of `#showcase-3d-root` (`setShowcaseActive(false)`) or on `document.visibilitychange` (`hidden`), smoothly fade back in on return, and softly duck background music (~52% gain) during crisp crack transients (`duckMusic`).

## 8. Verification Checklist
- [ ] Initial load before user gesture: **0** `/frames/*` requests and **0** `/audio/*` requests.
- [ ] Sound toggle triggers `HTTP 200` for `/audio/bonbon-crack.mp3` & `/audio/atelier-ambient.mp3` with **0** `decodeAudioData` errors.
- [ ] Mobile (`390x844`): `document.documentElement.scrollWidth <= 390`, hero & telemetry cards clear header/bottom bar with zero overlap on 3D object.
- [ ] Desktop (`1440x900`): All 9 chapters (including X-Ray/FLIR lens and 360° Inspector split slider) animate smoothly with **0** console errors.
