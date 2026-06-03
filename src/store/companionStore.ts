import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WalkTimerPhase = 'idle' | 'preparing' | 'walking' | 'completed';
type CompanionActionType = 'hydration' | 'standup' | 'breathing' | 'walk' | null;

const COMPANION_NAMES = [
  '一颗安静的星星',
  '远方的橡树',
  '山谷里的风',
  '午夜的萤火虫',
  '不说话的云',
  '路过的蒲公英',
  '海边的小石头',
  '月亮背面的人',
  '慢半拍的猫',
  '清晨的薄雾',
  '窗台上的薄荷',
  '第二十层楼的灯',
];

function randomName(): string {
  return COMPANION_NAMES[Math.floor(Math.random() * COMPANION_NAMES.length)];
}

interface CompanionState {
  /** #60 Custom reminder phrases */
  hydrationPhrase: string;
  standupPhrase: string;
  /** #62 Daily one-sentence diary */
  diaryDate: string;
  diaryText: string;
  /** #63 Walk timer */
  walkPhase: WalkTimerPhase;
  walkMinutes: number;
  walkStartedAt: number | null;
  walkCount: number;
  /** #70 Anonymous companion */
  companionName: string;
  companionAction: CompanionActionType;
  companionActionAt: number;

  setHydrationPhrase: (phrase: string) => void;
  setStandupPhrase: (phrase: string) => void;
  setDiaryText: (text: string) => void;
  resetDiaryIfNewDay: () => void;
  startWalk: (minutes: number, now: number) => void;
  completeWalk: (now: number) => void;
  cancelWalk: () => void;
  resetWalkToday: () => void;
  mirrorAction: (action: CompanionActionType) => void;
  clearCompanionAction: () => void;
}

export const useCompanionStore = create<CompanionState>()(
  persist(
    (set, get) => ({
      hydrationPhrase: '',
      standupPhrase: '',
      diaryDate: '',
      diaryText: '',
      walkPhase: 'idle',
      walkMinutes: 10,
      walkStartedAt: null,
      walkCount: 0,
      companionName: randomName(),
      companionAction: null,
      companionActionAt: 0,

      setHydrationPhrase: (phrase) => set({ hydrationPhrase: phrase }),
      setStandupPhrase: (phrase) => set({ standupPhrase: phrase }),

      setDiaryText: (text) => {
        const today = new Date().toDateString();
        set({ diaryText: text, diaryDate: today });
      },

      resetDiaryIfNewDay: () => {
        const today = new Date().toDateString();
        const { diaryDate } = get();
        if (diaryDate !== today) {
          set({ diaryDate: today, diaryText: '' });
        }
      },

      startWalk: (minutes, now) =>
        set({ walkPhase: 'preparing', walkMinutes: minutes, walkStartedAt: now }),

      completeWalk: (_now) =>
        set((s) => ({
          walkPhase: 'completed',
          walkCount: s.walkCount + 1,
          walkStartedAt: null,
        })),

      cancelWalk: () =>
        set({ walkPhase: 'idle', walkStartedAt: null }),

      resetWalkToday: () => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('companion-walk-reset-date');
        if (stored !== today) {
          localStorage.setItem('companion-walk-reset-date', today);
          set({ walkCount: 0, walkPhase: 'idle', walkStartedAt: null });
        }
      },

      mirrorAction: (action) => {
        const setAt = Date.now();
        set({ companionAction: action, companionActionAt: setAt });
        setTimeout(() => {
          if (get().companionActionAt === setAt) {
            set({ companionAction: null, companionActionAt: 0 });
          }
        }, 15000);
      },

      clearCompanionAction: () => set({ companionAction: null, companionActionAt: 0 }),
    }),
    {
      name: 'light-nurture-companion',
      partialize: (state) => ({
        hydrationPhrase: state.hydrationPhrase,
        standupPhrase: state.standupPhrase,
        diaryDate: state.diaryDate,
        diaryText: state.diaryText,
        walkMinutes: state.walkMinutes,
        walkCount: state.walkCount,
        companionName: state.companionName,
      }),
    },
  ),
);
