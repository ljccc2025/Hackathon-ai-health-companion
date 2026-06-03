import { create } from 'zustand';
import { db } from './db';
import type { StickerScene, HealthSticker } from '../types/health';

export type AchievementScene = StickerScene;

/* ── Sticker config (matching Module 15 spec) ── */

interface StickerConfig {
  label: string;
  text: string;
}

const STICKER_CONFIG: Record<StickerScene, StickerConfig> = {
  hydration: { label: '小水滴', text: '身体被轻轻浇了一下。' },
  standup: { label: '离开椅子', text: '你把自己从椅子上捞起来了。' },
  emotion: { label: '暂停键', text: '没有立刻责怪自己，已经很棒。' },
  breathing: { label: '小月亮', text: '今晚可以慢一点。' },
  medicine: { label: '小纸条', text: '记得看了一眼用药说明。' },
  exercise: { label: '舒展叶', text: '给了身体一个30秒的小舒展。' },
};

export { STICKER_CONFIG };

/* ── State ── */

interface AchievementState {
  /** Currently displayed popup scene (null = no popup) */
  scene: AchievementScene | null;
  triggeredAt: number;
  /** Today's earned stickers loaded from IndexedDB */
  todayStickers: HealthSticker[];
  loaded: boolean;

  /** Fire a sticker popup + persist to DB */
  trigger: (scene: AchievementScene) => Promise<void>;
  /** Dismiss the popup overlay */
  clear: () => void;
  /** Load today's stickers from DB */
  loadToday: () => Promise<void>;
}

export const useAchievementStore = create<AchievementState>()((set) => ({
  scene: null,
  triggeredAt: 0,
  todayStickers: [],
  loaded: false,

  trigger: async (scene) => {
    const cfg = STICKER_CONFIG[scene];
    const sticker: HealthSticker = {
      id: crypto.randomUUID(),
      scene,
      earnedAt: Date.now(),
      label: cfg.label,
    };
    await db.sticker.add(sticker);
    set((s) => ({
      scene,
      triggeredAt: Date.now(),
      todayStickers: [sticker, ...s.todayStickers],
    }));
  },

  clear: () => set({ scene: null, triggeredAt: 0 }),

  loadToday: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stickers = await db.sticker
      .where('earnedAt')
      .aboveOrEqual(today.getTime())
      .reverse()
      .sortBy('earnedAt');
    set({ todayStickers: stickers, loaded: true });
  },
}));
