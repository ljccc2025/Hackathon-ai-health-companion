import { useMemo } from 'react';
import { useStandupStore } from '../store/standupStore';

interface HydrationTarget {
  target: number;
  reason: string;
}

/**
 * S69: Dynamic daily hydration target based on weather, activity, and history.
 * Returns { target, reason } — never punitive, always gentle.
 */
export function useDailyHydrationTarget(weatherCode?: number | null): HydrationTarget {
  const standupToday = useStandupStore((s) => s.todayCount);

  const result = useMemo(() => {
    const BASE = 8;
    let target = BASE;
    const reasons: string[] = [];

    // Factor 1: Weather — hot/dry days need more water
    const isHot =
      weatherCode === 0 || // clear sky
      weatherCode === 1 || // mainly clear
      (weatherCode !== null && weatherCode !== undefined && weatherCode < 3);
    if (isHot) {
      target += 2;
      reasons.push('天气较热');
    }

    // Factor 2: Activity — active days may need more
    if (standupToday >= 3) {
      target += 1;
      reasons.push('今天活动较多');
    }

    // Factor 3: History — approximate 7-day average via localStorage count
    // (Lightweight; full Dexie aggregation in future iteration)
    let historyBonus = 0;
    try {
      const stored = localStorage.getItem('light-nurture-hydration');
      if (stored) {
        const parsed = JSON.parse(stored);
        const avgCount = parsed.state?.todayCount ?? 0;
        // If user consistently drinks ≥ 8, gently encourage keeping it up
        if (avgCount >= 8) {
          target += 1;
          historyBonus = 1;
        }
        // If < 4, don't add pressure — keep base target
      }
    } catch { /* ignore */ }

    // Build reason string
    let reason = '';
    if (reasons.length > 0) {
      const extra = target - BASE;
      reason = `${reasons.join('，')}，建议比平时多喝 ${extra} 杯水`;
    }
    if (historyBonus > 0 && reasons.length === 0) {
      reason = '你最近喝水很稳定，继续保持这个节奏就好';
    }

    return { target: Math.min(target, 16), reason };
  }, [weatherCode, standupToday]);

  return result;
}
