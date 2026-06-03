import { useState, useEffect, useMemo } from 'react';
import { db } from '../store/db';
import { analyzePatterns, isNearPeak, smartInterval, type PeakWindow } from '../services/hydrationPatternEngine';

interface UseHydrationPatternsReturn {
  peaks: PeakWindow[];
  loading: boolean;
  hasData: boolean;
  getSmartInterval: (baseMinutes: number) => number;
}

export function useHydrationPatterns(): UseHydrationPatternsReturn {
  const [peaks, setPeaks] = useState<PeakWindow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const records = await db.hydration
          .where('timestamp')
          .between(sevenDaysAgo, now, true, true)
          .toArray();

        if (!cancelled) {
          setPeaks(analyzePatterns(records));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const getSmartInterval = useMemo(() => {
    return (baseMinutes: number) => {
      const near = isNearPeak(new Date(), peaks);
      return smartInterval(baseMinutes, near);
    };
  }, [peaks]);

  return { peaks, loading, hasData: peaks.length > 0, getSmartInterval };
}
