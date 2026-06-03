import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Square, ChevronDown, Footprints, Check, Moon, BellOff, X } from 'lucide-react';
import { useCompanionStore } from '../../store/companionStore';
import { useStandupStore } from '../../store/standupStore';
import { useAchievementStore } from '../../store/achievementStore';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useHydrationStore } from '../../store/hydrationStore';

const PRESET_MINUTES = [5, 10, 15, 20, 30];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// 检查是否在勿扰时段
function isInQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export default function WalkTimerCard() {
  const walkPhase = useCompanionStore((s) => s.walkPhase);
  const walkMinutes = useCompanionStore((s) => s.walkMinutes);
  const walkCount = useCompanionStore((s) => s.walkCount);
  const startWalk = useCompanionStore((s) => s.startWalk);
  const completeWalk = useCompanionStore((s) => s.completeWalk);
  const cancelWalk = useCompanionStore((s) => s.cancelWalk);
  const resetWalkToday = useCompanionStore((s) => s.resetWalkToday);
  const completeStandup = useStandupStore((s) => s.completeStandup);
  const triggerAchievement = useAchievementStore((s) => s.trigger);

  // 勿扰模式相关
  const quietHoursEnabled = usePreferenceStore((s) => s.quietHoursEnabled);
  const quietHoursStart = usePreferenceStore((s) => s.quietHoursStart);
  const quietHoursEnd = usePreferenceStore((s) => s.quietHoursEnd);
  const setQuietHours = usePreferenceStore((s) => s.setQuietHours);
  const setHydrationConfig = useHydrationStore((s) => s.setConfig);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);

  const [selectedMinutes, setSelectedMinutes] = useState(walkMinutes);
  const [showPresets, setShowPresets] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    resetWalkToday();
  }, [resetWalkToday]);

  // Tick the timer when walking
  useEffect(() => {
    if (walkPhase !== 'walking') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [walkPhase]);

  const handleDisableQuietHours = useCallback(() => {
    setQuietHours(false);
    setHydrationConfig({ quietHoursEnabled: false });
    setShowQuietHoursModal(false);
  }, [setQuietHours, setHydrationConfig]);

  const handleStart = useCallback(() => {
    // 检查勿扰模式
    if (quietHoursEnabled && isInQuietHours(quietHoursStart, quietHoursEnd)) {
      setShowQuietHoursModal(true);
      return;
    }
    setElapsed(0);
    startWalk(selectedMinutes, Date.now());
    // Transition from preparing to walking after a short delay for the "preparing" animation
    setTimeout(() => {
      useCompanionStore.setState({ walkPhase: 'walking' });
    }, 600);
  }, [selectedMinutes, startWalk, quietHoursEnabled, quietHoursStart, quietHoursEnd]);

  const remaining = walkMinutes * 60 - elapsed;
  const progress = Math.min(elapsed / (walkMinutes * 60), 1);

  const handleComplete = useCallback(() => {
    const now = Date.now();
    completeWalk(now);
    // Record as standup activity
    completeStandup(now);
    triggerAchievement('standup');
    setElapsed(0);
  }, [completeWalk, completeStandup, triggerAchievement]);

  const handleCancel = useCallback(() => {
    cancelWalk();
    setElapsed(0);
  }, [cancelWalk]);

  return (
    <>
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-warm-200/95 via-warm-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:bg-[#1b1209]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-warm-500 dark:text-warm-300">
            <Footprints size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-warm-700 dark:text-warm-100">
            散步倒数计时器
          </span>
          {walkCount > 0 && (
            <span className="text-xs text-warm-500/70 dark:text-warm-300">
              · 今天走了 {walkCount} 次
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {walkPhase === 'idle' || walkPhase === 'completed' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              <p className="text-xs leading-relaxed text-warm-600/70 dark:text-warm-300">
                设定一个散步时长，出去走一走。回来后轻点完成，自动计入活动。
              </p>

              {/* Preset selector */}
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-full border border-warm-200/60 bg-paper-50/60 px-4 py-2 text-sm font-medium text-warm-700 dark:border-warm-700/40 dark:bg-[#12100b]/60 dark:text-warm-200"
                >
                  <Timer size={15} strokeWidth={1.5} />
                  去走 {selectedMinutes} 分钟
                  <ChevronDown size={14} strokeWidth={1.5} className={showPresets ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </motion.button>

                {showPresets && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-0 z-20 flex flex-wrap gap-2 rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-paper-50/90 p-2 shadow-lg  dark:border-gentle-700/40 dark:bg-[#111511]/94"
                  >
                    {PRESET_MINUTES.map((m) => (
                      <motion.button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMinutes(m);
                          setShowPresets(false);
                        }}
                        whileTap={{ scale: 0.96 }}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedMinutes === m
                            ? 'bg-warm-500/90 text-white'
                            : 'bg-gentle-100/80 text-gentle-700 hover:bg-gentle-200/80 dark:bg-gentle-800/60 dark:text-gentle-100 dark:hover:bg-gentle-700/60'
                        }`}
                      >
                        {m} 分钟
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.button
                type="button"
                onClick={handleStart}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 self-start rounded-full bg-warm-500/90 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-warm-500 transition-colors dark:bg-warm-400/85 dark:text-warm-900 dark:hover:bg-warm-400"
              >
                <Play size={14} strokeWidth={2.5} />
                开始散步
              </motion.button>
            </motion.div>
          ) : walkPhase === 'preparing' ? (
            <motion.div
              key="preparing"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-4xl"
              >
                🚶
              </motion.div>
              <p className="text-sm text-warm-700 dark:text-warm-200 animate-pulse">
                准备出发……
              </p>
            </motion.div>
          ) : walkPhase === 'walking' ? (
            <motion.div
              key="walking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-6 py-4"
            >
              {/* Countdown ring */}
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="4"
                    className="text-warm-200/60 dark:text-warm-800/50" />
                  <motion.circle
                    cx="50" cy="50" r="44" fill="none" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - progress) }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-warm-400 dark:text-warm-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-light tabular-nums tracking-wide text-warm-800 dark:text-warm-100">
                    {formatTime(Math.max(remaining, 0))}
                  </span>
                  <span className="text-xs text-warm-500/70 dark:text-warm-300">
                    剩余
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                {remaining <= 0 && (
                  <motion.button
                    type="button"
                    onClick={handleComplete}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 rounded-full bg-warm-500/90 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-warm-500 transition-colors dark:bg-warm-400/85 dark:text-warm-900"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    我回来了
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-warm-200/60 bg-paper-50/60 px-4 py-2 text-xs font-medium text-warm-600 hover:bg-warm-100/80 transition-colors dark:border-warm-700/40 dark:bg-[#12100b]/60 dark:text-warm-200 dark:hover:bg-warm-800/60"
                >
                  <Square size={12} strokeWidth={2} />
                  取消
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>

      {/* Quiet Hours Modal */}
      <AnimatePresence>
        {showQuietHoursModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowQuietHoursModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[360px] w-full bg-white dark:bg-[#1a2320] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-warm-100 via-warm-50 to-white dark:from-[#2a1f15] dark:via-[#1f1810] dark:to-[#1a2320] p-6 pb-8">
                <button
                  type="button"
                  onClick={() => setShowQuietHoursModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-white dark:hover:bg-white/20 transition-colors"
                >
                  <X size={16} strokeWidth={2} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-warm-200/60 dark:bg-warm-800/40 flex items-center justify-center mb-4">
                    <Moon size={28} strokeWidth={1.5} className="text-warm-500 dark:text-warm-300" />
                  </div>
                  <h3 className="text-lg font-medium text-warm-900 dark:text-warm-100">
                    勿扰模式已开启
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4">
                <p className="text-sm text-center text-warm-700 dark:text-warm-300 leading-relaxed mb-2">
                  当前处于勿扰时段
                </p>
                <p className="text-center text-warm-600 dark:text-warm-400 font-medium mb-4">
                  {quietHoursStart} - {quietHoursEnd}
                </p>
                <p className="text-xs text-center text-warm-500 dark:text-warm-400/80 leading-relaxed mb-6">
                  在这段时间里，散步计时器会安静地暂停。
                  <br />
                  你可以关闭勿扰模式，或者稍后再来散步。
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleDisableQuietHours}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-warm-500 hover:bg-warm-600 text-white font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    <BellOff size={16} strokeWidth={1.5} />
                    关闭勿扰模式
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuietHoursModal(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-warm-100 dark:bg-warm-800/30 hover:bg-warm-200 dark:hover:bg-warm-700/40 text-warm-700 dark:text-warm-300 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    知道了
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
