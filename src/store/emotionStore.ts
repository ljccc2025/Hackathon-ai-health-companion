import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmotionState {
  todayCount: number;

  incrementCount: () => void;
  setTodayCount: (count: number) => void;
  resetToday: () => void;
}

export const useEmotionStore = create<EmotionState>()(
  persist(
    (set) => ({
      todayCount: 0,

      incrementCount: () => set((s) => ({ todayCount: s.todayCount + 1 })),

      setTodayCount: (count) => set({ todayCount: count }),

      resetToday: () => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('emotion-reset-date');
        if (stored !== today) {
          localStorage.setItem('emotion-reset-date', today);
          set({ todayCount: 0 });
        }
      },
    }),
    { name: 'light-nurture-emotion' },
  ),
);
