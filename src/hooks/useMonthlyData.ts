import { useState, useEffect } from 'react';
import { db } from '../store/db';

export interface DayCell {
  date: string;       // 'YYYY-MM-DD'
  day: number;        // 1-31
  weekday: number;    // 0=Sun, 6=Sat
  isCurrentMonth: boolean;
  hydrationCount: number;
  standupCount: number;
  emotionCount: number;
  breathingCount: number;
}

function getMonthRange(): { year: number; month: number; start: Date; end: Date; days: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const days = new Date(year, month + 1, 0).getDate();
  return { year, month, start, end, days };
}

export function useMonthlyData() {
  const [cells, setCells] = useState<DayCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthLabel, setMonthLabel] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      const { year, month, start, end, days } = getMonthRange();
      const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun

      const dayStarts: { date: string; startTs: number; endTs: number }[] = [];
      for (let d = 1; d <= days; d++) {
        const ds = new Date(year, month, d);
        const dateStr = ds.toISOString().slice(0, 10);
        dayStarts.push({
          date: dateStr,
          startTs: ds.getTime(),
          endTs: new Date(year, month, d, 23, 59, 59, 999).getTime(),
        });
      }

      const result: DayCell[] = [];

      // Leading empty cells from previous month
      for (let i = 0; i < firstWeekday; i++) {
        result.push({
          date: '', day: 0, weekday: i, isCurrentMonth: false,
          hydrationCount: 0, standupCount: 0, emotionCount: 0, breathingCount: 0,
        });
      }

      // Current month days
      for (const ds of dayStarts) {
        const [hCount, sCount, eCount] = await Promise.all([
          db.hydration.where('timestamp').between(ds.startTs, ds.endTs, true, true).count(),
          db.standup.where('startedAt').between(ds.startTs, ds.endTs, true, true).count(),
          db.moodTreeHole.where('createdAt').between(ds.startTs, ds.endTs, true, true).count(),
        ]);
        const d = new Date(ds.date);
        result.push({
          date: ds.date,
          day: d.getDate(),
          weekday: d.getDay(),
          isCurrentMonth: true,
          hydrationCount: hCount,
          standupCount: sCount,
          emotionCount: eCount,
          breathingCount: 0,
        });
      }

      if (!cancelled) {
        setCells(result);
        setMonthLabel(`${year}年${month + 1}月`);
        setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { cells, loading, monthLabel };
}
