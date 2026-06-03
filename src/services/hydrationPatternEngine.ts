import type { HydrationRecord } from '../types/health';

export interface PeakWindow {
  hour: number;       // 0-23, peak hour
  weight: number;     // 0-1, relative frequency
}

const PEAK_THRESHOLD = 0.15;   // hour must have >= 15% of total drinks to be a peak
const MAX_PEAKS = 5;
const WINDOW_MINUTES = 15;     // remind within ±15 min of peak hour

/** Analyze 7-day hydration records → peak drinking hour windows */
export function analyzePatterns(records: HydrationRecord[]): PeakWindow[] {
  if (records.length < 5) return []; // not enough data

  const hourBuckets = new Array<number>(24).fill(0);
  for (const r of records) {
    const h = new Date(r.timestamp).getHours();
    hourBuckets[h]++;
  }

  const total = records.length;
  const peaks: PeakWindow[] = [];

  for (let h = 0; h < 24; h++) {
    const weight = hourBuckets[h] / total;
    if (weight >= PEAK_THRESHOLD) {
      peaks.push({ hour: h, weight: Math.round(weight * 100) / 100 });
    }
  }

  // Sort by weight descending, take top N
  peaks.sort((a, b) => b.weight - a.weight);
  return peaks.slice(0, MAX_PEAKS);
}

/** Check if current time falls within a peak window (±WINDOW_MINUTES) */
export function isNearPeak(now: Date, peaks: PeakWindow[]): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (const p of peaks) {
    const peakMinutes = p.hour * 60;
    const diff = Math.abs(currentMinutes - peakMinutes);
    if (diff <= WINDOW_MINUTES) return true;
  }
  return false;
}

/** Suggest a shorter interval (in minutes) when near a peak hour */
export function smartInterval(
  baseIntervalMinutes: number,
  isNearPeak: boolean,
): number {
  return isNearPeak
    ? Math.max(15, Math.round(baseIntervalMinutes * 0.4))
    : baseIntervalMinutes;
}
