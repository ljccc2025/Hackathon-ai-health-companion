import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NoiseTrack = 'rain' | 'forest' | 'cafe';

interface WhiteNoiseState {
  active: boolean;
  volumes: Record<NoiseTrack, number>; // 0-1
  muteStates: Record<NoiseTrack, boolean>;

  toggle: () => void;
  setVolume: (track: NoiseTrack, vol: number) => void;
  setMute: (track: NoiseTrack, muted: boolean) => void;
}

export const useWhiteNoiseStore = create<WhiteNoiseState>()(
  persist(
    (set) => ({
      active: false,
      volumes: { rain: 0.5, forest: 0.4, cafe: 0.3 },
      muteStates: { rain: false, forest: false, cafe: false },

      toggle: () => set((s) => ({ active: !s.active })),
      setVolume: (track, vol) =>
        set((s) => ({ volumes: { ...s.volumes, [track]: Math.max(0, Math.min(1, vol)) } })),
      setMute: (track, muted) =>
        set((s) => ({ muteStates: { ...s.muteStates, [track]: muted } })),
    }),
    {
      name: 'light-nurture-white-noise',
      partialize: (state) => ({
        volumes: state.volumes,
        muteStates: state.muteStates,
      }),
    },
  ),
);
