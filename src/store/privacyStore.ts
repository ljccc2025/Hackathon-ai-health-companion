import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataCategory } from '../utils/privacy';

/** Per-category overrides set by user. undefined = use default policy. */
export type AiUploadOverrides = Partial<Record<DataCategory, boolean>>;

interface PrivacyState {
  overrides: AiUploadOverrides;
  /** Whether the user has seen the privacy-first notice this session */
  privacyNoticeSeen: boolean;

  setOverride: (category: DataCategory, allowed: boolean) => void;
  resetOverride: (category: DataCategory) => void;
  resetAllOverrides: () => void;
  markPrivacyNoticeSeen: () => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      overrides: {},
      privacyNoticeSeen: false,

      setOverride: (category, allowed) =>
        set((s) => ({
          overrides: { ...s.overrides, [category]: allowed },
        })),

      resetOverride: (category) =>
        set((s) => {
          const next = { ...s.overrides };
          delete next[category];
          return { overrides: next };
        }),

      resetAllOverrides: () => set({ overrides: {} }),

      markPrivacyNoticeSeen: () => set({ privacyNoticeSeen: true }),
    }),
    { name: 'light-nurture-privacy' },
  ),
);
