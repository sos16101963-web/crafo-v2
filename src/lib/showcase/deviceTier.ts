export type DeviceTier = 'high' | 'lite' | 'instant';

export interface DeviceProfile {
  tier: DeviceTier;
  useMobileFrames: boolean;
  dprCap: number;
  enableLenis: boolean;
}

/**
 * 2026 adaptive runtime profiler:
 * - 'instant': reduced-motion, Save-Data, or 2G/3G network -> crisp poster + static split plates (<500 KB)
 * - 'lite': mobile viewport or <=4 GB RAM / <=4 cores -> 640x360 mobile frames, DPR=1, native scroll, RAM eviction
 * - 'high': modern desktop / flagship device -> 1280x720 frames, DPR<=2, Lenis smooth scroll
 */
export function detectDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return { tier: 'high', useMobileFrames: false, dprCap: 2, enableLenis: true };
  }

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const saveData = Boolean(nav.connection?.saveData);
  const netType = nav.connection?.effectiveType ?? '4g';
  const slowNet = netType === 'slow-2g' || netType === '2g' || netType === '3g';

  if (reduced || saveData || slowNet) {
    return { tier: 'instant', useMobileFrames: true, dprCap: 1, enableLenis: false };
  }

  const isMobileViewport = window.innerWidth < 768;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const lowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;

  if (isMobileViewport || lowMemory || lowCores) {
    return {
      tier: 'lite',
      useMobileFrames: true,
      dprCap: 1,
      enableLenis: false,
    };
  }

  return {
    tier: 'high',
    useMobileFrames: false,
    dprCap: 2,
    enableLenis: true,
  };
}
