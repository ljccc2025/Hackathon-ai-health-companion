import { create } from 'zustand';
import { db } from './db';
import type { MoodTreeHoleRecord } from '../types/health';

interface MoodState {
  records: MoodTreeHoleRecord[];
  todayCount: number;
  loaded: boolean;

  load: () => Promise<void>;
  add: (record: Omit<MoodTreeHoleRecord, 'id' | 'createdAt'>) => Promise<MoodTreeHoleRecord>;
  resetToday: () => void;
}

export const useMoodStore = create<MoodState>()((set) => ({
  records: [],
  todayCount: 0,
  loaded: false,

  load: async () => {
    const records = await db.moodTreeHole.orderBy('createdAt').reverse().toArray();
    // Count today's records
    const today = new Date().toDateString();
    const todayCount = records.filter(
      (r) => new Date(r.createdAt).toDateString() === today,
    ).length;
    set({ records, todayCount, loaded: true });
  },

  add: async (input) => {
    const record: MoodTreeHoleRecord = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: Date.now(),
    };
    await db.moodTreeHole.add(record);
    set((s) => ({
      records: [record, ...s.records],
      todayCount: s.todayCount + 1,
    }));
    return record;
  },

  resetToday: () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('mood-reset-date');
    if (stored !== today) {
      localStorage.setItem('mood-reset-date', today);
      set({ todayCount: 0 });
    }
  },
}));
