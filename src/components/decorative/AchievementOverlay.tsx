import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, StretchHorizontal, Sparkles, Moon, Pill, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAchievementStore, STICKER_CONFIG } from '../../store/achievementStore';
import type { AchievementScene } from '../../store/achievementStore';
import { playChime } from '../../utils/chime';

export interface MilestoneData {
  daysUsed: number;
  firstHydration: string;
  firstEmotion: string;
  totalActions: number;
}

const CONFIG: Record<
  AchievementScene,
  { icon: LucideIcon; accent: string; bg: string }
> = {
  hydration: {
    icon: Droplets,
    accent: 'text-gentle-500 dark:text-gentle-100',
    bg: 'from-gentle-200/90 via-gentle-100/80 to-white/60 dark:from-gentle-800/80 dark:via-gentle-900/60 dark:to-[#111815]/80',
  },
  standup: {
    icon: StretchHorizontal,
    accent: 'text-warm-500 dark:text-warm-300',
    bg: 'from-warm-200/90 via-warm-100/80 to-white/60 dark:from-warm-900/60 dark:via-warm-900/50 dark:to-[#111815]/80',
  },
  emotion: {
    icon: Sparkles,
    accent: 'text-blossom-500 dark:text-blossom-300',
    bg: 'from-blossom-200/90 via-blossom-100/80 to-white/60 dark:from-blossom-900/60 dark:via-blossom-900/50 dark:to-[#111815]/80',
  },
  breathing: {
    icon: Moon,
    accent: 'text-gentle-400 dark:text-gentle-100',
    bg: 'from-gentle-200/90 via-gentle-100/80 to-white/60 dark:from-gentle-900/60 dark:via-gentle-800/60 dark:to-[#111815]/80',
  },
  medicine: {
    icon: Pill,
    accent: 'text-gentle-600 dark:text-gentle-200',
    bg: 'from-gentle-200/90 via-warm-100/70 to-white/60 dark:from-gentle-900/60 dark:via-gentle-800/50 dark:to-[#111815]/80',
  },
  exercise: {
    icon: Activity,
    accent: 'text-warm-500 dark:text-warm-300',
    bg: 'from-warm-200/90 via-gentle-100/70 to-white/60 dark:from-warm-900/60 dark:via-warm-900/45 dark:to-[#111815]/80',
  },
};

export default function AchievementOverlay({ milestone }: { milestone?: MilestoneData | null }) {
  const scene = useAchievementStore((s) => s.scene);
  const triggeredAt = useAchievementStore((s) => s.triggeredAt);
  const clear = useAchievementStore((s) => s.clear);
  const [visible, setVisible] = useState(false);
  const [showMilestone, setShowMilestone] = useState(!!milestone);

  useEffect(() => {
    if (scene) {
      playChime();
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(clear, 400);
      }, 1800);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [scene, triggeredAt, clear]);

  const cfg = scene ? CONFIG[scene] : null;
  const stickerCfg = scene ? STICKER_CONFIG[scene] : null;
  const Icon = cfg?.icon ?? Droplets;

  return (
    <>
    <AnimatePresence>
      {visible && cfg && stickerCfg && (
        <motion.div
          key="achievement-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gentle-900/15 dark:bg-black/35 "
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, x: 60, y: 60, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 30, y: 30, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.9 }}
            className={`flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br ${cfg.bg} px-10 py-9 shadow-[0_28px_60px_-28px_rgba(28,58,44,0.35)] dark:shadow-[0_28px_60px_-28px_rgba(0,0,0,0.55)] backdrop-blur-2xl border border-ink-200/50 dark:border-ink-700/40 dark:border-ink-700/25`}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 20,
                delay: 0.08,
              }}
              className={`${cfg.accent}`}
            >
              <Icon size={48} strokeWidth={1.2} aria-hidden="true" />
            </motion.span>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-lg font-light tracking-wide text-gentle-800 dark:text-gentle-100 text-center leading-relaxed"
            >
              {stickerCfg.text}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="text-xs text-gentle-500/70 dark:text-gentle-100/90 tracking-wider"
            >
              你已经照顾了自己一次
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* S78: Milestone time capsule overlay */}
    <AnimatePresence>
      {showMilestone && milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-gentle-900/25 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMilestone(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="mx-6 max-w-sm rounded-2xl bg-gradient-to-br from-paper-50/98 via-gentle-50/96 to-blossom-50/94 p-8 text-center shadow-[0_30px_70px_-30px_rgba(28,58,44,0.45)] dark:from-[#14111d]/98 dark:via-[#181422]/96 dark:to-[#1a1220]/94 dark:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] border border-gentle-200/50 dark:border-gentle-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl mb-4">🕰️</p>
            <p className="font-display text-xl text-gentle-800 dark:text-gentle-100 leading-relaxed">
              你已经轻轻照顾了自己
            </p>
            <p className="mt-2 font-display text-3xl text-ink-600 dark:text-ink-300">
              {milestone.daysUsed} 天
            </p>
            <div className="mt-4 w-16 h-px mx-auto bg-gradient-to-r from-transparent via-ink-300/40 to-transparent" />
            <p className="mt-4 text-sm text-gentle-600/80 dark:text-gentle-300/80 leading-relaxed">
              从第一天到现在，你一共记录了 {milestone.totalActions} 次照顾自己的小动作。
            </p>
            {milestone.firstHydration && (
              <p className="mt-2 text-xs text-gentle-500/50 dark:text-gentle-500/50">
                还记得第一次喝水是 {milestone.firstHydration}
              </p>
            )}
            <p className="mt-6 text-xs text-gentle-400/40 dark:text-gentle-500/40">
              点击任意处关闭
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
