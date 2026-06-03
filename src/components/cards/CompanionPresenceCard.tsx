import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Droplets, StretchHorizontal, Footprints, Moon, X } from 'lucide-react';
import { useCompanionStore, type CompanionActionType } from '../../store/companionStore';

const ACTION_MESSAGES: Record<Exclude<CompanionActionType, null>, { icon: typeof Users; message: string }> = {
  hydration: { icon: Droplets, message: '有一位同伴也在默默喝水' },
  standup: { icon: StretchHorizontal, message: '有一位同伴刚刚也起身活动了' },
  walking: { icon: Footprints, message: '有一位同伴也在散步中' },
  breathing: { icon: Moon, message: '有一位同伴也在慢慢呼吸' },
};

export default function CompanionPresenceCard() {
  const companionName = useCompanionStore((s) => s.companionName);
  const companionAction = useCompanionStore((s) => s.companionAction);
  const companionActionAt = useCompanionStore((s) => s.companionActionAt);
  const clearCompanionAction = useCompanionStore((s) => s.clearCompanionAction);

  // Auto-dismiss after 20 seconds
  useEffect(() => {
    if (!companionAction || !companionActionAt) return;
    const id = setTimeout(() => clearCompanionAction(), 20000);
    return () => clearTimeout(id);
  }, [companionAction, companionActionAt, clearCompanionAction]);

  const hasAction = companionAction && companionActionAt > 0;
  const actionInfo = hasAction ? ACTION_MESSAGES[companionAction] : null;

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-blossom-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:bg-[#15121d]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className="text-blossom-400 dark:text-blossom-300">
            <Users size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
            匿名陪伴
          </span>
        </div>

        {/* Idle state — companion is here but quiet */}
        {!hasAction && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-none w-10 h-10 rounded-full bg-blossom-100/70 dark:bg-blossom-900/30 flex items-center justify-center text-lg">
                🌱
              </div>
              <div>
                <p className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
                  {companionName}
                </p>
                <p className="text-xs text-gentle-500/70 dark:text-gentle-300">
                  正在与你一同照顾自己
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gentle-500/60 dark:text-gentle-400">
              你看不到 ta 的任何信息，ta 也看不到你的。只是在同一个时间里，有人和你一样，在轻轻照顾自己。
            </p>
          </div>
        )}

        {/* Active state — companion just did something */}
        <AnimatePresence>
          {hasAction && actionInfo && (
            <motion.div
              key={companionActionAt}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex-none w-10 h-10 rounded-full bg-blossom-200/80 dark:bg-blossom-800/40 flex items-center justify-center"
                  >
                    <actionInfo.icon size={18} strokeWidth={1.5} className="text-blossom-500 dark:text-blossom-300" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
                      {companionName}
                    </p>
                    <p className="text-xs text-blossom-500/80 dark:text-blossom-300 animate-pulse">
                      {actionInfo.message}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={clearCompanionAction}
                  className="flex-none p-1.5 rounded-full text-gentle-400/60 hover:text-gentle-500 hover:bg-gentle-200/60 dark:text-gentle-400 dark:hover:text-gentle-300 dark:hover:bg-gentle-700/40 transition-colors"
                >
                  <X size={14} strokeWidth={1.5} />
                </motion.button>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-px w-full bg-gradient-to-r from-blossom-300/40 via-blossom-200/30 to-transparent dark:from-blossom-600/30 dark:via-blossom-500/20"
                aria-hidden="true"
              />

              <p className="text-[10px] text-gentle-400/60 dark:text-gentle-400">
                刚刚 · 完全匿名 · 仅此一刻
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// Utility to trigger companion mirror from other cards
export function maybeMirrorCompanion(action: CompanionActionType) {
  if (!action) return;
  // ~30% chance
  if (Math.random() > 0.3) return;
  // Delay 2-6 seconds to feel organic
  const delay = 2000 + Math.random() * 4000;
  setTimeout(() => {
    useCompanionStore.getState().mirrorAction(action);
  }, delay);
}
