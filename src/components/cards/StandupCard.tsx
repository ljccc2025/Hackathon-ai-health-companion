import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronDown, Pause, Play, CheckCircle2, Moon, BellOff, X } from 'lucide-react';
import useStandupTimer from '../../hooks/useStandupTimer';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useAchievementStore } from '../../store/achievementStore';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useHydrationStore } from '../../store/hydrationStore';
import { useStandupStore } from '../../store/standupStore';
import { maybeMirrorCompanion } from './CompanionPresenceCard';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function summaryText(
  phase: string,
  elapsedSeconds: number,
  totalSeconds: number,
  count: number,
): string {
  switch (phase) {
    case 'idle':
      return '未开始';
    case 'focusing':
      return `已坐 ${formatTime(elapsedSeconds)}`;
    case 'paused':
      return `已暂停 · 剩余 ${formatTime(totalSeconds - elapsedSeconds)}`;
    case 'reminding':
      return '可以起来活动了';
    case 'done':
      return count > 0 ? `今天 ${count} 次` : '未开始';
    default:
      return '';
  }
}

export default function StandupCard() {
  const {
    phase,
    elapsedSeconds,
    remainingSeconds,
    totalSeconds,
    reminderMessage,
    todayCount,
    startFocus,
    pauseFocus,
    resumeFocus,
    completeStandup,
    resetPhase,
    dismissReminder,
  } = useStandupTimer();

  const triggerAchievement = useAchievementStore((s) => s.trigger);
  const haptic = useHapticFeedback();
  const setQuietHours = usePreferenceStore((s) => s.setQuietHours);
  const setHydrationConfig = useHydrationStore((s) => s.setConfig);
  const [collapsed, setCollapsed] = useState(true);
  const [pulseGlow, setPulseGlow] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);

  // #42: particle burst state
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number; color: string }[]>([]);
  const completeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-expand when reminder fires
  useEffect(() => {
    if (phase === 'reminding') setCollapsed(false);
  }, [phase]);

  const handleStartFocus = useCallback(() => {
    const success = startFocus();
    if (!success) {
      setShowQuietHoursModal(true);
    }
  }, [startFocus]);

  const handleDisableQuietHours = useCallback(() => {
    setQuietHours(false);
    setHydrationConfig({ quietHoursEnabled: false });
    // 同时更新久坐专用的勿扰配置
    useStandupStore.getState().setConfig({ quietHoursEnabled: false });
    setShowQuietHoursModal(false);
  }, [setQuietHours, setHydrationConfig]);

  const handleComplete = useCallback(async () => {
    // #42: spawn particles from the complete button
    const btn = completeBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: cx,
        y: cy,
        angle: (i / 6) * 360 + Math.random() * 30,
        color: i % 2 === 0 ? 'rgba(245,151,59,0.7)' : 'rgba(248,180,107,0.6)',
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 600);
    }

    await completeStandup();
    triggerAchievement('standup');
    maybeMirrorCompanion('standup');
    haptic.success();
    setPulseGlow(true);
    setTimeout(() => setPulseGlow(false), 1500);
    setTimeout(() => resetPhase(), 2500);
  }, [completeStandup, resetPhase, triggerAchievement]);

  const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;

  return (
    <>
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 dark:bg-[#0b1411]/100 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.72)] transition-colors duration-500  ${pulseGlow ? 'animate-card-pulse-glow' : ''}`}
    >
      <div className="relative z-10 flex flex-col">
        {/* === Collapsed summary row === */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-50">
              <Timer size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-900 dark:text-gentle-100">
              久坐
            </span>
            <span className="text-xs text-gentle-800 dark:text-gentle-300">
              · {summaryText(phase, elapsedSeconds, totalSeconds, todayCount)}
            </span>
            {phase === 'reminding' && (
              <span className="flex-none w-2 h-2 rounded-full bg-warm-400 animate-bar-breathe" aria-hidden="true" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {todayCount > 0 && (
              <span className="text-xs text-gentle-700/60 dark:text-gentle-300">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={todayCount}
                    className="inline-block"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    {todayCount}
                  </motion.span>
                </AnimatePresence>
                次
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

        {/* === Expanded content === */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 26, mass: 0.8 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-4">
                {/* Progress ring + timer display */}
                <div className="flex flex-col items-center gap-3">
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-gentle-200/50 dark:bg-[#21302a]/88 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gentle-600 dark:bg-gentle-200"
                      animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Timer text */}
                  <p className="text-3xl font-semibold tracking-wider text-gentle-950 dark:text-white tabular-nums">
                    {phase === 'focusing' || phase === 'paused'
                      ? formatTime(remainingSeconds)
                      : phase === 'reminding'
                        ? '00:00'
                        : formatTime(totalSeconds)}
                  </p>
                  <p className="text-xs text-gentle-800 dark:text-gentle-300 -mt-2">
                    {phase === 'idle' && '设定专注 50 分钟后提醒起身'}
                    {phase === 'focusing' && '正在专注中…'}
                    {phase === 'paused' && '已暂停'}
                    {phase === 'reminding' && '时间到！'}
                    {phase === 'done' && '已完成'}
                  </p>
                </div>

                {/* Reminder banner */}
                <AnimatePresence>
                  {phase === 'reminding' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-3 bg-warm-100/60 dark:bg-[#150f0a]/100 rounded-xl px-4 py-3"
                    >
                      <span className="mt-1 flex-none w-1.5 h-1.5 rounded-full bg-warm-400 animate-bar-breathe" aria-hidden="true" />
                      <div className="flex-1">
                        <p className="text-sm text-warm-950 dark:text-white leading-relaxed">
                          {reminderMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={dismissReminder}
                        className="flex-none text-xs text-warm-700/82 dark:text-warm-200 hover:text-warm-800 dark:hover:text-warm-100 transition-colors cursor-pointer"
                      >
                        知道了
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Done feedback */}
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <p className="text-sm text-gentle-700 dark:text-gentle-200 bg-gentle-100/60 dark:bg-[#1a2723]/88 rounded-xl px-4 py-2.5 text-center">
                        离开椅子的这几秒，也算数。
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Control buttons */}
                <div className="flex gap-2">
                  {phase === 'idle' && (
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        type="button"
                        onClick={handleStartFocus}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/12 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/22 text-gentle-800 dark:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                      >
                        <Play size={16} strokeWidth={1.5} />
                        开始专注
                      </button>
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="btn-glow flex items-center justify-center gap-1.5 py-2 text-xs text-gentle-500/70 dark:text-gentle-100/82 hover:text-gentle-600 dark:hover:text-gentle-100 transition-colors cursor-pointer"
                      >
                        直接记录一次起身
                      </button>
                    </div>
                  )}

                  {phase === 'focusing' && (
                    <button
                      type="button"
                      onClick={pauseFocus}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/10 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/20 text-gentle-700 dark:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                    >
                      <Pause size={16} strokeWidth={1.5} />
                      暂停
                    </button>
                  )}

                  {phase === 'paused' && (
                    <>
                      <button
                        type="button"
                        onClick={resumeFocus}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/12 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/22 text-gentle-800 dark:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                      >
                        <Play size={16} strokeWidth={1.5} />
                        继续
                      </button>
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-gentle-500/70 dark:text-gentle-200 hover:text-gentle-600 dark:hover:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                      >
                        站过了
                      </button>
                    </>
                  )}

                  {phase === 'reminding' && (
                    <button
                      ref={completeBtnRef}
                      type="button"
                      onClick={handleComplete}
                      className="relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-warm-400/25 dark:bg-warm-400/15 hover:bg-warm-400/35 dark:hover:bg-warm-400/25 text-warm-700 dark:text-warm-300 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                    >
                      {/* #42: Particle burst dots */}
                      {particles.map((p) => (
                        <span
                          key={p.id}
                          className="particle-dot"
                          style={{
                            left: p.x - 3,
                            top: p.y - 3,
                            '--px': `${Math.cos(p.angle * Math.PI / 180) * 45}px`,
                            '--py': `${Math.sin(p.angle * Math.PI / 180) * 45}px`,
                            backgroundColor: p.color,
                          } as React.CSSProperties}
                          aria-hidden="true"
                        />
                      ))}
                      <CheckCircle2 size={16} strokeWidth={1.5} />
                      我起来了
                    </button>
                  )}
                </div>
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
                  22:30 - 8:30
                </p>
                <p className="text-xs text-center text-warm-500 dark:text-warm-400/80 leading-relaxed mb-6">
                  在这段时间里，专注计时器会安静地暂停。
                  <br />
                  你可以关闭勿扰模式，或者直接记录一次起身。
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
