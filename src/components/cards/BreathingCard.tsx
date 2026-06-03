import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, ChevronDown, Pause, Play, BellOff, X } from 'lucide-react';
import useBreathingCycle from '../../hooks/useBreathingCycle';
import BreathCircle from '../breathing/BreathCircle';
import { useBreathingStore } from '../../store/breathingStore';
import { useAchievementStore } from '../../store/achievementStore';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useHydrationStore } from '../../store/hydrationStore';

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

function summaryText(isRunning: boolean, isComplete: boolean, completedCount: number): string {
  if (isRunning) return '呼吸引导中…';
  if (isComplete) return '刚刚完成了一次呼吸';
  if (completedCount > 0) return `今天完成了 ${completedCount} 次`;
  return '一分钟的放松陪伴';
}

export default function BreathingCard() {
  const {
    phase,
    stepIndex,
    isRunning,
    isComplete,
    totalProgress,
    start,
    stop,
  } = useBreathingCycle();

  const completedCount = useBreathingStore((s) => s.todayCount);
  const incrementBreathing = useBreathingStore((s) => s.incrementCount);
  const triggerAchievement = useAchievementStore((s) => s.trigger);
  const haptic = useHapticFeedback();

  // 勿扰模式相关
  const quietHoursEnabled = usePreferenceStore((s) => s.quietHoursEnabled);
  const quietHoursStart = usePreferenceStore((s) => s.quietHoursStart);
  const quietHoursEnd = usePreferenceStore((s) => s.quietHoursEnd);
  const setQuietHours = usePreferenceStore((s) => s.setQuietHours);
  const setHydrationConfig = useHydrationStore((s) => s.setConfig);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);

  const [collapsed, setCollapsed] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pulseGlow, setPulseGlow] = useState(false);
  const longPressRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-expand when breathing starts
  useEffect(() => {
    if (isRunning) setCollapsed(false);
  }, [isRunning]);

  // Detect completion
  useEffect(() => {
    if (isComplete) {
      incrementBreathing();
      triggerAchievement('breathing');
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 1500);
      setFeedback('今晚可以慢一点，今晚不需要再用力。');
      const t = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(t);
    }
  }, [isComplete]);

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
    setFeedback(null);
    start(5);
  }, [start, quietHoursEnabled, quietHoursStart, quietHoursEnd]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  // Long-press to start (mobile touch enhancement) + #54 haptic
  const handleTouchStart = useCallback(() => {
    if (isRunning) return;
    longPressRef.current = setTimeout(() => {
      haptic.longPress();
      handleStart();
    }, 400);
  }, [isRunning, handleStart, haptic]);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = undefined;
    }
  }, []);

  return (
    <>
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 dark:bg-[#101915]/98 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.6)] transition-colors duration-500  ${pulseGlow ? 'animate-card-pulse-glow' : ''}`}
    >
      <div className="relative z-10 flex flex-col">
        {/* ── Collapsed summary row ── */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <motion.span
              className="text-gentle-500 dark:text-gentle-100"
              animate={isRunning ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Moon size={20} strokeWidth={1.5} aria-hidden="true" />
            </motion.span>
            <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
              睡前呼吸
            </span>
            <span className="text-xs text-gentle-700/78 dark:text-gentle-300">
              · {summaryText(isRunning, isComplete, completedCount)}
            </span>
            {(isRunning || isComplete) && (
              <span
                className={`flex-none w-2 h-2 rounded-full animate-bar-breathe ${
                  isComplete ? 'bg-gentle-400' : 'bg-gentle-400'
                }`}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <span className="text-xs text-gentle-700/60 dark:text-gentle-300">
                {completedCount}次
              </span>
            )}
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-gentle-600/70 dark:text-gentle-300"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.span>
          </div>
        </button>

        {/* ── Expanded content ── */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center gap-5 pt-5">
                {/* Breath circle */}
                <BreathCircle
                  phase={phase}
                  stepIndex={stepIndex}
                  totalProgress={totalProgress}
                  isComplete={isComplete}
                />

                {/* Feedback toast */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-gentle-100/70 dark:bg-[#1c2421]/94 rounded-xl px-4 py-3 max-w-xs"
                    >
                      <p className="text-sm text-gentle-800 dark:text-gentle-50 leading-relaxed text-center">
                        {feedback}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Control button */}
                <motion.button
                  ref={buttonRef}
                  type="button"
                  onClick={isRunning ? handleStop : handleStart}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  whileHover={
                    !isRunning
                      ? { boxShadow: '0 0 24px rgba(78,163,135,0.18)' }
                      : {}
                  }
                  whileTap={{ scale: 0.96 }}
                  className={`btn-glow flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98] select-none ${
                    isRunning
                      ? 'bg-gentle-400/20 dark:bg-gentle-400/12 hover:bg-gentle-400/30 dark:hover:bg-gentle-400/20 text-gentle-700 dark:text-gentle-50'
                      : 'bg-gentle-400/25 dark:bg-gentle-400/12 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/22 text-gentle-800 dark:text-gentle-50 shadow-[0_0_0px_rgba(78,163,135,0)]'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause size={15} strokeWidth={1.5} />
                      停下
                    </>
                  ) : (
                    <>
                      <Play size={15} strokeWidth={1.5} />
                      陪我呼吸 1 分钟
                    </>
                  )}
                </motion.button>

                {/* Tip / hint text */}
                {!isRunning && !isComplete && !feedback && (
                  <p className="text-xs text-gentle-600/55 dark:text-gentle-400 text-center leading-relaxed">
                    吸气 4 秒 · 停留 2 秒 · 呼气 6 秒
                    <br />
                    跟着圆环的节奏，让它带着你慢慢放松
                  </p>
                )}

                {/* Post-complete hint */}
                {isComplete && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gentle-600/50 dark:text-gentle-400 text-center"
                  >
                    长按按钮可以直接开始下一次
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
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
                  在这段时间里，呼吸引导会安静地暂停。
                  <br />
                  你可以关闭勿扰模式，或者稍后再来呼吸。
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
