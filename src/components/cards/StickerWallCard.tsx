import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, StretchHorizontal, Sparkles, Moon, Pill, Activity, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAchievementStore, STICKER_CONFIG } from '../../store/achievementStore';
import type { StickerScene } from '../../types/health';

const STICKER_ICONS: Record<StickerScene, LucideIcon> = {
  hydration: Droplets,
  standup: StretchHorizontal,
  emotion: Sparkles,
  breathing: Moon,
  medicine: Pill,
  exercise: Activity,
};

const STICKER_COLORS: Record<StickerScene, string> = {
  hydration: 'bg-gentle-200/80 dark:bg-gentle-700/35 text-gentle-600 dark:text-gentle-300',
  standup: 'bg-warm-200/80 dark:bg-warm-700/30 text-warm-600 dark:text-warm-300',
  emotion: 'bg-blossom-200/80 dark:bg-blossom-700/30 text-blossom-600 dark:text-blossom-300',
  breathing: 'bg-gentle-200/80 dark:bg-gentle-700/30 text-gentle-500 dark:text-gentle-400',
  medicine: 'bg-gentle-300/80 dark:bg-gentle-700/35 text-gentle-700 dark:text-gentle-200',
  exercise: 'bg-warm-200/80 dark:bg-warm-700/30 text-warm-600 dark:text-warm-300',
};

export default function StickerWallCard() {
  const { todayStickers, loaded, loadToday } = useAchievementStore();

  useEffect(() => {
    if (!loaded) loadToday();
  }, [loaded, loadToday]);

  const count = todayStickers.length;

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-gentle-900/75 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.45)] transition-colors duration-500 "
    >
      {/* Glass highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px w-20 h-20 rounded-full bg-paper-50/30 dark:bg-paper-50/3 blur-xl transition-colors duration-500"
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-100">
              <Heart size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100/90">
              今日小成就贴纸
            </span>
          </div>
          {count > 0 && (
            <span className="text-xs text-gentle-500/80 dark:text-gentle-300/90">
              收集了 {count} 枚
            </span>
          )}
        </div>

        {/* Sticker wall */}
        {count > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <AnimatePresence>
              {todayStickers.map((sticker, i) => {
                const Icon = STICKER_ICONS[sticker.scene];
                const cfg = STICKER_CONFIG[sticker.scene];
                return (
                  <motion.div
                    key={sticker.id}
                    initial={{ opacity: 0, scale: 0.3, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.4, ease: 'easeOut' }}
                    className={`flex flex-col items-center gap-2 rounded-2xl ${STICKER_COLORS[sticker.scene]} px-3.5 py-4  border border-ink-200/35 dark:border-ink-700/25 dark:border-white/5`}
                  >
                    <motion.span
                      initial={{ rotate: -15, scale: 0.6 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.08 + 0.05, 0.45), duration: 0.3 }}
                    >
                      <Icon size={28} strokeWidth={1.3} aria-hidden="true" />
                    </motion.span>
                    <div className="text-center">
                      <p className="text-xs font-medium">
                        {cfg.label}
                      </p>
                      <p className="text-[0.62rem] leading-relaxed opacity-70 mt-0.5 line-clamp-2">
                        {cfg.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gentle-300/45 dark:border-gentle-700/20 bg-gentle-100/50 dark:bg-gentle-800/60 px-5 py-6 text-center">
            <p className="text-xs text-gentle-500/70 dark:text-gentle-300/80">
              今天还没有收集贴纸。
            </p>
            <p className="text-[0.65rem] text-gentle-400/50 dark:text-gentle-300/90 mt-1">
              去做点小照顾——喝水、起身、深呼吸，都会变成一张小贴纸。
            </p>
          </div>
        )}

        {/* Gentle note */}
        {count > 0 && (
          <p className="text-[0.65rem] leading-relaxed text-gentle-500/60 dark:text-gentle-300/90 text-center">
            这些是你今天照顾自己的瞬间。不多不少，刚刚好。
          </p>
        )}
      </div>
    </motion.section>
  );
}
