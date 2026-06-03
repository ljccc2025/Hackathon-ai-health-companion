import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronDown, Play, RotateCcw, CheckCircle2, Moon, BellOff, X } from 'lucide-react';
import { pickExercise, getLabel, getHint, getBodyParts } from '../../services/exerciseRuleEngine';
import { useAchievementStore } from '../../store/achievementStore';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useHydrationStore } from '../../store/hydrationStore';
import type { BodyPart, MicroExercise } from '../../types/health';

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

/* ── Countdown ring ── */

const RING_R = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function CountdownRing({ elapsed, total }: { elapsed: number; total: number }) {
  const progress = Math.min(elapsed / total, 1);
  const dashoffset = RING_CIRCUMFERENCE * (1 - progress);
  const remaining = Math.max(total - elapsed, 0);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="flex-none -rotate-90" aria-hidden="true">
        <circle
          cx="44" cy="44" r={RING_R}
          fill="none"
          strokeWidth="3"
          className="text-gentle-200/60 dark:text-gentle-700/30"
        />
        <motion.circle
          cx="44" cy="44" r={RING_R}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          className="text-gentle-500 dark:text-gentle-400"
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-xl font-light text-gentle-700 dark:text-gentle-100 tabular-nums">
        {remaining}
      </span>
    </div>
  );
}

export default function MicroExerciseCard() {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [exercise, setExercise] = useState<MicroExercise | null>(null);
  const [phase, setPhase] = useState<'idle' | 'active' | 'done'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 勿扰模式相关
  const quietHoursEnabled = usePreferenceStore((s) => s.quietHoursEnabled);
  const quietHoursStart = usePreferenceStore((s) => s.quietHoursStart);
  const quietHoursEnd = usePreferenceStore((s) => s.quietHoursEnd);
  const setQuietHours = usePreferenceStore((s) => s.setQuietHours);
  const setHydrationConfig = useHydrationStore((s) => s.setConfig);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);

  const bodyParts = getBodyParts();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelect = useCallback((part: BodyPart) => {
    setSelectedPart(part);
    setExercise(pickExercise(part));
    setPhase('idle');
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleDisableQuietHours = useCallback(() => {
    setQuietHours(false);
    setHydrationConfig({ quietHoursEnabled: false });
    setShowQuietHoursModal(false);
  }, [setQuietHours, setHydrationConfig]);

  const handleStart = useCallback(() => {
    if (!exercise) return;

    // 检查勿扰模式
    if (quietHoursEnabled && isInQuietHours(quietHoursStart, quietHoursEnd)) {
      setShowQuietHoursModal(true);
      return;
    }

    setPhase('active');
    setElapsed(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= exercise.durationSeconds) {
          clearInterval(timerRef.current!);
          // Complete directly from the interval callback
          setPhase('done');
          setTodayCount((c) => c + 1);
          // Fire sticker (use getState for non-React callback context)
          useAchievementStore.getState().trigger('exercise');
          return exercise.durationSeconds;
        }
        return next;
      });
    }, 1000);
  }, [exercise, quietHoursEnabled, quietHoursStart, quietHoursEnd]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (selectedPart) {
      setExercise(pickExercise(selectedPart));
    }
    setPhase('idle');
    setElapsed(0);
  }, [selectedPart]);

  return (
    <>
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-warm-200/70 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-[#111b18]/98 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.6)] transition-colors duration-500 "
    >
      {/* Glass highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px w-20 h-20 rounded-full bg-paper-50/30 dark:bg-paper-50/3 blur-xl transition-colors duration-500"
      />

      <div className="relative z-10 flex flex-col">
        {/* === Collapsed summary row === */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-100">
              <Activity size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
              微运动处方卡
            </span>
            <span className="text-xs text-gentle-700/78 dark:text-gentle-300">
              {todayCount > 0
                ? `· 今天动了 ${todayCount} 次`
                : '· 30 秒，给身体一个小小的舒展'}
            </span>
            {todayCount > 0 && (
              <span className="flex-none w-2 h-2 rounded-full bg-warm-400 animate-bar-breathe" aria-hidden="true" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gentle-700/60 dark:text-gentle-300">
              {todayCount > 0 ? `${todayCount}` : ''}
            </span>
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-gentle-600/70 dark:text-gentle-300"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.span>
          </div>
        </button>

        {/* === Expanded content === */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-5 pt-5">
                {/* Body part selector */}
                <div>
                  <p className="text-xs text-gentle-700/82 dark:text-gentle-300 mb-3">
                    哪里不太舒服？选一个，给身体 30 秒的舒展。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bodyParts.map((part) => {
                      const active = part === selectedPart;
                      return (
                        <button
                          key={part}
                          type="button"
                          onClick={() => handleSelect(part)}
                          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
                            active
                              ? 'border-gentle-400/60 bg-gentle-200/80 text-gentle-800 shadow-[0_4px_14px_-6px_rgba(28,58,44,0.25)] ring-1 ring-gentle-300/40 dark:border-gentle-500/40 dark:bg-gentle-600/35 dark:text-gentle-100 dark:ring-gentle-400/12'
                              : 'border-gentle-300/55 bg-gentle-200/85 text-gentle-700 hover:border-gentle-300/75 hover:bg-gentle-300/55 dark:border-gentle-700/30 dark:bg-gentle-800/55 dark:text-gentle-200 dark:hover:border-gentle-600/35 dark:hover:bg-gentle-700/40'
                          }`}
                        >
                          {getLabel(part)}
                        </button>
                      );
                    })}
                  </div>
                  {selectedPart && (
                    <p className="mt-2 text-[0.68rem] text-gentle-700/78 dark:text-gentle-300">
                      {getHint(selectedPart)}
                    </p>
                  )}
                </div>

                {/* Exercise card */}
                <AnimatePresence mode="wait">
                  {exercise && (
                    <motion.div
                      key={exercise.id + phase}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl border border-gentle-300/55 bg-gentle-200/78 px-5 py-5 dark:border-gentle-700/25 dark:bg-gentle-800/65"
                    >
                      {/* Title + instruction */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gentle-800 dark:text-gentle-100">
                            {exercise.title}
                          </h4>
                          <p className="mt-1.5 text-sm leading-relaxed text-gentle-700/88 dark:text-gentle-50 leading-relaxed">
                            {exercise.instruction}
                          </p>
                        </div>

                        {/* Countdown or button */}
                        <div className="flex-none">
                          {phase === 'idle' && (
                            <button
                              type="button"
                              onClick={handleStart}
                              className="flex items-center justify-center w-16 h-16 rounded-full bg-gentle-400/25 dark:bg-gentle-400/15 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/25 text-gentle-600 dark:text-gentle-300 transition-all duration-200 cursor-pointer active:scale-[0.95]"
                            >
                              <Play size={24} strokeWidth={1.8} />
                            </button>
                          )}

                          {phase === 'active' && (
                            <CountdownRing elapsed={elapsed} total={exercise.durationSeconds} />
                          )}

                          {phase === 'done' && (
                            <div className="flex flex-col items-center gap-2">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center w-14 h-14 rounded-full bg-gentle-400/20 dark:bg-gentle-400/15"
                              >
                                <CheckCircle2 size={28} strokeWidth={1.6} className="text-gentle-500 dark:text-gentle-400" />
                              </motion.div>
                              <span className="text-[0.65rem] text-gentle-500/80 dark:text-gentle-300">
                                完成
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Done state actions */}
                      <AnimatePresence>
                        {phase === 'done' && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-3"
                          >
                            <p className="flex-1 text-xs text-gentle-700/82 dark:text-gentle-300">
                              照顾了自己一次。身体会记得这 30 秒。
                            </p>
                            <button
                              type="button"
                              onClick={handleReset}
                              className="flex items-center gap-1.5 rounded-full border border-gentle-300/55 bg-gentle-200/85 dark:bg-gentle-800/55 px-3 py-1.5 text-xs font-medium text-gentle-600 dark:text-gentle-300 transition-all duration-200 hover:bg-gentle-300/60 dark:hover:bg-gentle-700/35 cursor-pointer"
                            >
                              <RotateCcw size={12} strokeWidth={1.6} />
                              再来一次
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty prompt */}
                {!exercise && (
                  <div className="rounded-2xl border border-dashed border-gentle-300/45 dark:border-gentle-700/20 bg-gentle-100/50 dark:bg-gentle-800/60 px-5 py-6 text-center">
                    <p className="text-xs text-gentle-700/78 dark:text-gentle-300">
                      选择一个部位，给你一张专属的轻运动小处方。
                    </p>
                  </div>
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
                  在这段时间里，微运动会安静地暂停。
                  <br />
                  你可以关闭勿扰模式，或者稍后再来运动。
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
