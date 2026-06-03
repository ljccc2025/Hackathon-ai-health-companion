import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReminderTone } from '../types/health';

interface PreferenceState {
  tone: ReminderTone;
  nickname?: string;
  aiEnabled: boolean;
  muted: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  customTags: { name: string; color: string }[];

  setTone: (tone: ReminderTone) => void;
  setCustomTags: (tags: { name: string; color: string }[]) => void;
  setNickname: (nickname: string) => void;
  setAiEnabled: (enabled: boolean) => void;
  setMuted: (muted: boolean) => void;
  setQuietHours: (enabled: boolean) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      tone: 'friend',
      nickname: undefined,
      aiEnabled: true,
      muted: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:30',
      quietHoursEnd: '08:30',
      customTags: [],

      setTone: (tone) => set({ tone }),
      setCustomTags: (tags) => set({ customTags: tags }),
      setNickname: (nickname) => set({ nickname }),
      setAiEnabled: (enabled) => set({ aiEnabled: enabled }),
      setMuted: (muted) => set({ muted }),
      setQuietHours: (enabled) => set({ quietHoursEnabled: enabled }),
    }),
    { name: 'light-nurture-preference' },
  ),
);
