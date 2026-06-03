import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShakeEncouragementState {
  enabled: boolean;
  usedIndices: number[];

  toggle: () => void;
  markUsed: (index: number) => void;
  resetUsed: () => void;
}

export const useShakeEncouragementStore = create<ShakeEncouragementState>()(
  persist(
    (set) => ({
      enabled: false,
      usedIndices: [],

      toggle: () => set((s) => ({ enabled: !s.enabled })),

      markUsed: (index) =>
        set((s) => ({
          usedIndices: [...s.usedIndices, index],
        })),

      resetUsed: () => set({ usedIndices: [] }),
    }),
    {
      name: 'light-nurture-shake',
      partialize: (state) => ({
        enabled: state.enabled,
      }),
    },
  ),
);
