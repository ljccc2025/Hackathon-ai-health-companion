import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StandupConfig {
  focusMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

type TimerPhase = 'idle' | 'focusing' | 'paused' | 'reminding' | 'done';

interface StandupState {
  config: StandupConfig;
  phase: TimerPhase;
  focusStartedAt: number | null;
  pausedRemaining: number | null;
  todayCount: number;

  setConfig: (partial: Partial<StandupConfig>) => void;
  startFocus: (now: number) => void;
  pauseFocus: (remainingMs: number) => void;
  resumeFocus: (now: number) => void;
  triggerReminder: () => void;
  completeStandup: (now: number) => void;
  resetPhase: () => void;
  resetToday: () => void;
}

export const useStandupStore = create<StandupState>()(
  persist(
    (set) => ({
      config: {
        focusMinutes: 50,
        quietHoursEnabled: true,
        quietHoursStart: '22:30',
        quietHoursEnd: '08:30',
      },
      phase: 'idle',
      focusStartedAt: null,
      pausedRemaining: null,
      todayCount: 0,

      setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

      startFocus: (now) =>
        set({ phase: 'focusing', focusStartedAt: now, pausedRemaining: null }),

      pauseFocus: (remainingMs) =>
        set({ phase: 'paused', pausedRemaining: remainingMs }),

      resumeFocus: (now) =>
        set({
          phase: 'focusing',
          focusStartedAt: now,
          pausedRemaining: null,
        }),

      triggerReminder: () => set({ phase: 'reminding' }),

      completeStandup: (_now) =>
        set((s) => ({
          phase: 'done',
          todayCount: s.todayCount + 1,
          focusStartedAt: null,
          pausedRemaining: null,
        })),

      resetPhase: () =>
        set({ phase: 'idle', focusStartedAt: null, pausedRemaining: null }),

      resetToday: () => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('standup-reset-date');
        if (stored !== today) {
          localStorage.setItem('standup-reset-date', today);
          set({ todayCount: 0, phase: 'idle', focusStartedAt: null, pausedRemaining: null });
        }
      },
    }),
    {
      name: 'light-nurture-standup',
      partialize: (state) => ({
        config: state.config,
        todayCount: state.todayCount,
      }),
    },
  ),
);
