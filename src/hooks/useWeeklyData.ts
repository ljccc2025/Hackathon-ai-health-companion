import { useState, useEffect } from 'react';
import { db } from '../store/db';

interface DayBucket {
  date: string;
  dayLabel: string;
  hydrationCount: number;
  emotionIntensityAvg: number;
  emotionCount: number;
}

function dayLabels(): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(
      d.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', ''),
    );
  }
  return labels;
}

function dateKeys(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export function useWeeklyData() {
  const [buckets, setBuckets] = useState<DayBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const keys = dateKeys();
        const labels = dayLabels();
        const now = new Date();

        const dayStart = (daysBack: number) => {
          const d = new Date(now);
          d.setDate(d.getDate() - daysBack);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        };
        const dayEnd = (daysBack: number) => {
          const d = new Date(now);
          d.setDate(d.getDate() - daysBack);
          d.setHours(23, 59, 59, 999);
          return d.getTime();
        };

        const result: DayBucket[] = [];

        for (let i = 6; i >= 0; i--) {
          const start = dayStart(i);
          const end = dayEnd(i);

          const [hydrationRows, emotionRows] = await Promise.all([
            db.hydration.where('timestamp').between(start, end, true, true).toArray(),
            db.moodTreeHole.where('createdAt').between(start, end, true, true).toArray(),
          ]);

          const hydrationCount = hydrationRows.length;
          const emotionIntensities = emotionRows.map((r) => r.intensityLevel ?? 3);
          const emotionCount = emotionRows.length;
          const emotionIntensityAvg =
            emotionCount > 0
              ? emotionIntensities.reduce((a, b) => a + b, 0) / emotionCount
              : 0;

          result.push({
            date: keys[6 - i],
            dayLabel: labels[6 - i],
            hydrationCount,
            emotionIntensityAvg: Math.round(emotionIntensityAvg * 10) / 10,
            emotionCount,
          });
        }

        if (!cancelled) {
          setBuckets(result);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  return { buckets, loading };
}
