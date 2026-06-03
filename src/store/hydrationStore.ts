import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HydrationConfig {
  intervalMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface HydrationState {
  config: HydrationConfig;
  lastDrinkAt: number | null;
  todayCount: number;

  setConfig: (partial: Partial<HydrationConfig>) => void;
  recordDrink: (timestamp: number) => void;
  setTodayCount: (count: number) => void;
  resetToday: () => void;
}

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      config: {
        intervalMinutes: 90,
        quietHoursEnabled: true,
        quietHoursStart: '22:30',
        quietHoursEnd: '08:30',
      },
      lastDrinkAt: null,
      todayCount: 0,

      setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

      recordDrink: (timestamp) =>
        set((s) => ({ lastDrinkAt: timestamp, todayCount: s.todayCount + 1 })),

      setTodayCount: (count) => set({ todayCount: count }),

      resetToday: () => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('hydration-reset-date');
        if (stored !== today) {
          localStorage.setItem('hydration-reset-date', today);
          set({ todayCount: 0, lastDrinkAt: null });
        }
      },
    }),
    {
      name: 'light-nurture-hydration',
      partialize: (state) => ({
        config: state.config,
        lastDrinkAt: state.lastDrinkAt,
      }),
    },
  ),
);
