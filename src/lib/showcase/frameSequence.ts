import { DESKTOP_COUNTS, MOBILE_COUNTS, SequenceId } from './sequenceManifest';

interface SequenceStore {
  frames: (HTMLImageElement | null)[];
  loadedCount: number;
  hasAnyFrame: boolean;
  total: number;
  queued: boolean;
  resolution: 'desktop' | 'mobile';
}

interface QueueTask {
  id: SequenceId;
  index: number;
  priority: number;
  resolution: 'desktop' | 'mobile';
}

const stores = new Map<SequenceId, SequenceStore>();
const listeners = new Map<SequenceId, Set<() => void>>();

let useMobileGlobal = false;
let streamingActivated = false;
let activeId: SequenceId | null = null;
const pendingQueue: QueueTask[] = [];
const queuedKeys = new Set<string>();
let activeWorkers = 0;
const MAX_CONCURRENCY = 6;

export function setSequenceResolution(useMobile: boolean): void {
  useMobileGlobal = useMobile;
}

export function getSequenceCount(id: SequenceId): number {
  return useMobileGlobal ? MOBILE_COUNTS[id] : DESKTOP_COUNTS[id];
}

export function isStreamingActive(): boolean {
  return streamingActivated;
}

/**
 * Unlocks network frame streaming strictly after first user interaction
 * (wheel / touch / pointer / scroll > 20px) so initial page load & LCP stay minimal for Google.
 */
export function activateStreaming(): void {
  if (streamingActivated) return;
  streamingActivated = true;
  if (activeId) {
    requestChapterSequence(activeId);
  }
  pumpQueue();
}

function getStore(id: SequenceId): SequenceStore {
  const res: 'desktop' | 'mobile' = useMobileGlobal ? 'mobile' : 'desktop';
  let s = stores.get(id);
  if (!s) {
    const total = res === 'mobile' ? MOBILE_COUNTS[id] : DESKTOP_COUNTS[id];
    s = {
      frames: new Array<HTMLImageElement | null>(total).fill(null),
      loadedCount: 0,
      hasAnyFrame: false,
      total,
      queued: false,
      resolution: res,
    };
    stores.set(id, s);
  }
  return s;
}

function notify(id: SequenceId): void {
  listeners.get(id)?.forEach((cb) => cb());
}

export function subscribeSequence(id: SequenceId, cb: () => void): () => void {
  let set = listeners.get(id);
  if (!set) {
    set = new Set();
    listeners.set(id, set);
  }
  set.add(cb);
  return () => {
    set?.delete(cb);
  };
}

function frameUrl(id: SequenceId, index: number, resolution: 'desktop' | 'mobile'): string {
  const padded = String(index).padStart(4, '0');
  return `/frames/${resolution}/${id}/frame_${padded}.webp`;
}

function pumpQueue(): void {
  if (!streamingActivated) return;
  while (activeWorkers < MAX_CONCURRENCY && pendingQueue.length > 0) {
    let bestIdx = 0;
    let bestScore = -1;
    for (let i = 0; i < pendingQueue.length; i++) {
      const t = pendingQueue[i];
      const score = t.priority + (t.id === activeId ? 500 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    const task = pendingQueue.splice(bestIdx, 1)[0];
    const store = getStore(task.id);
    if (store.frames[task.index]) continue;

    activeWorkers += 1;
    const img = new Image();
    img.decoding = 'async';

    const finish = (ok: boolean) => {
      if (ok) {
        const wasEmpty = !store.hasAnyFrame;
        store.hasAnyFrame = true;
        store.loadedCount += 1;
        if (wasEmpty || task.index === 0 || task.index % 5 === 0 || store.loadedCount === store.total) {
          notify(task.id);
        }
      }
      activeWorkers -= 1;
      pumpQueue();
    };

    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    store.frames[task.index] = img;
    img.src = frameUrl(task.id, task.index, task.resolution);
  }
}

function enqueueTask(
  id: SequenceId,
  index: number,
  priority: number,
  resolution: 'desktop' | 'mobile'
): void {
  const key = `${resolution}:${id}:${index}`;
  if (queuedKeys.has(key)) return;
  queuedKeys.add(key);
  pendingQueue.push({ id, index, priority, resolution });
}

/**
 * 1-step-ahead progressive chapter loader:
 * Only queues frames for a specific sequence when explicitly requested by scroll proximity.
 */
export function requestChapterSequence(id: SequenceId): void {
  const store = getStore(id);
  activeId = id;
  if (!streamingActivated) return;

  if (!store.queued) {
    store.queued = true;
    const total = store.total;
    const res = store.resolution;

    // Coarse stride keyframes first so scrubbing works almost immediately
    enqueueTask(id, 0, 260, res);
    if (total > 1) enqueueTask(id, Math.floor(total * 0.5), 250, res);
    for (let i = 8; i < total; i += 8) {
      enqueueTask(id, i, 210, res);
    }
    if (total > 1) enqueueTask(id, total - 1, 205, res);

    // Intermediate frames stream cleanly right after keyframes
    for (let i = 1; i < total; i++) {
      enqueueTask(id, i, 60, res);
    }
  }

  pumpQueue();
}

export function prioritizeSequence(id: SequenceId): void {
  activeId = id;
  requestChapterSequence(id);
}

/**
 * Sliding-window RAM eviction for older smartphones:
 * Drops decoded HTMLImageElement references from chapters > 2 steps away
 * while keeping frame 0 for zero-flash fallback (browser HTTP disk cache retains WebPs).
 */
export function evictDistantSequences(keepIds: SequenceId[]): void {
  const keepSet = new Set(keepIds);
  for (const [id, store] of stores.entries()) {
    if (keepSet.has(id) || !store.queued) continue;
    let freed = false;
    for (let i = 1; i < store.frames.length; i++) {
      if (store.frames[i] !== null) {
        store.frames[i] = null;
        queuedKeys.delete(`${store.resolution}:${id}:${i}`);
        freed = true;
      }
    }
    if (freed) {
      store.queued = false;
      store.loadedCount = store.frames[0] ? 1 : 0;
      // Remove any pending tasks for evicted sequence
      for (let i = pendingQueue.length - 1; i >= 0; i--) {
        if (pendingQueue[i].id === id) {
          pendingQueue.splice(i, 1);
        }
      }
    }
  }
}

export function getBestFrame(id: SequenceId, rawIndex: number): HTMLImageElement | null {
  const store = getStore(id);
  const total = store.total;
  if (total === 0) return null;

  const idx = Math.max(0, Math.min(total - 1, Math.round(rawIndex)));
  const exact = store.frames[idx];
  if (exact && exact.complete && exact.naturalWidth > 0) {
    return exact;
  }

  for (let delta = 1; delta < total; delta++) {
    const left = idx - delta;
    if (left >= 0) {
      const imL = store.frames[left];
      if (imL && imL.complete && imL.naturalWidth > 0) return imL;
    }
    const right = idx + delta;
    if (right < total) {
      const imR = store.frames[right];
      if (imR && imR.complete && imR.naturalWidth > 0) return imR;
    }
  }
  return null;
}

export interface DrawFrameOpts {
  mode?: 'contain' | 'cover';
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  featherVoid?: boolean;
}

export function drawSequenceFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  w: number,
  h: number,
  opts: DrawFrameOpts = {}
): void {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const {
    mode = 'contain',
    scale = 1,
    offsetX = 0,
    offsetY = 0,
    featherVoid = false,
  } = opts;

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const viewAspect = w / Math.max(1, h);

  let baseW: number;
  let baseH: number;

  if (mode === 'cover') {
    if (viewAspect > imgAspect) {
      baseW = w;
      baseH = w / imgAspect;
    } else {
      baseH = h;
      baseW = h * imgAspect;
    }
  } else {
    if (viewAspect > imgAspect) {
      baseH = h;
      baseW = h * imgAspect;
    } else {
      baseW = w;
      baseH = w / imgAspect;
    }
  }

  const drawW = baseW * scale;
  const drawH = baseH * scale;
  const dx = (w - drawW) * 0.5 + offsetX * w;
  const dy = (h - drawH) * 0.5 + offsetY * h;

  ctx.drawImage(img, dx, dy, drawW, drawH);

  if (featherVoid) {
    const cx = dx + drawW * 0.5;
    const cy = dy + drawH * 0.5;
    const innerR = Math.min(drawW, drawH) * 0.34;
    const outerR = Math.max(drawW, drawH) * 0.56;
    const vig = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.75, 'rgba(0,0,0,0.35)');
    vig.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }
}
