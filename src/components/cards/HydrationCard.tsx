import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, ChevronDown, Bell, BellOff } from 'lucide-react';
import useReminderTimer from '../../hooks/useReminderTimer';
import { useHydrationPatterns } from '../../hooks/useHydrationPatterns';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useDailyHydrationTarget } from '../../hooks/useDailyHydrationTarget';
import useNotificationPermission from '../../hooks/useNotificationPermission';
import { useHydrationStore } from '../../store/hydrationStore';
import { useAchievementStore } from '../../store/achievementStore';
import { maybeMirrorCompanion } from './CompanionPresenceCard';
import WaterCup from '../breathing/WaterCup';
import useWeather from '../../hooks/useWeather';
import type { HydrationRecord } from '../../types/health';

const amountOptions: {
  value: HydrationRecord['amountLevel'];
  label: string;
  dropletW: string;
  dropletH: string;
}[] = [
  { value: 'sip', label: '抿一口', dropletW: 'w-1.5', dropletH: 'h-2.5' },
  { value: 'halfCup', label: '半杯', dropletW: 'w-2', dropletH: 'h-3.5' },
  { value: 'cup', label: '一杯', dropletW: 'w-2.5', dropletH: 'h-4.5' },
];

function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 5) return `${hours} 小时${mins > 0 ? `${mins} 分钟` : ''}前`;
  return '很久';
}

function summaryText(minutes: number, _count: number, hasReminder: boolean): string {
  if (hasReminder) return '可以顺手喝两口水了';
  if (minutes <= 0) return '今天还没喝水呢';
  return `上次 ${formatTimeAgo(minutes)}`;
}

/* ── SVG 进度环 ── */
const PROGRESS_R = 18;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_R;

function ProgressRing({ count, target }: { count: number; target: number }) {
  const progress = Math.min(count / target, 1);
  const dashoffset = PROGRESS_CIRCUMFERENCE * (1 - progress);
  const isFull = progress >= 1;

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      className="flex-none -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="22" cy="22" r={PROGRESS_R}
        fill="none"
        strokeWidth="2.5"
        className="text-ink-200/50 dark:text-ink-700/25"
      />
      <motion.circle
        cx="22" cy="22" r={PROGRESS_R}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={PROGRESS_CIRCUMFERENCE}
        className={isFull ? 'text-ink-500 dark:text-ink-400' : 'text-ink-400 dark:text-ink-500'}
        animate={{ strokeDashoffset: dashoffset }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <AnimatePresence mode="wait">
        <motion.text
          key={count}
          x="22" y="22"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-ink-700 dark:fill-ink-100 text-[9px] font-medium"
          style={{ transform: 'rotate(90deg)', transformOrigin: '22px 22px' }}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {count}
        </motion.text>
      </AnimatePresence>
    </svg>
  );
}

export default function HydrationCard() {
  const { peaks } = useHydrationPatterns();
  const { code: weatherCode } = useWeather();
  const { target: DAILY_TARGET, reason: targetReason } = useDailyHydrationTarget(weatherCode);
  const {
    minutesSinceLastDrink,
    shouldRemind,
    reminderMessage,
    recordDrink,
    dismissReminder,
  } = useReminderTimer(peaks);

  const { status: notifStatus, request: requestNotif } =
    useNotificationPermission();
  const todayCount = useHydrationStore((s) => s.todayCount);
  const triggerAchievement = useAchievementStore((s) => s.trigger);
  const haptic = useHapticFeedback();

  const [collapsed, setCollapsed] = useState(true);
  const [showAmounts, setShowAmounts] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [splashKey, setSplashKey] = useState(0);

  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const drinkBtnRef = useRef<HTMLButtonElement>(null);

  const [pulseGlow, setPulseGlow] = useState(false);

  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number; color: string }[]>([]);

  useEffect(() => {
    if (shouldRemind) {
      setCollapsed(false);
    }
  }, [shouldRemind]);

  const handleDrink = useCallback(
    async (amount: HydrationRecord['amountLevel'], e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setRipple(null), 600);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: cx,
        y: cy,
        angle: (i / 6) * 360 + Math.random() * 30,
        color: i % 2 === 0 ? 'rgba(73,130,104,0.65)' : 'rgba(155,187,168,0.55)',
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 600);

      setShowAmounts(false);
      await recordDrink(amount);
      const labels: Record<string, string> = {
        sip: '抿了一口，身体收到了一点滋润。',
        halfCup: '半杯水下肚，身体轻轻舒了一口气。',
        cup: '一整杯喝完，你已经照顾了自己一次。',
      };
      setFeedback(labels[amount]);
      triggerAchievement('hydration');
      maybeMirrorCompanion('hydration');
      haptic.success();
      setSplashKey((k) => k + 1);
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 1500);
      setTimeout(() => setFeedback(null), 2500);
    },
    [recordDrink, triggerAchievement],
  );

  const handleEnableNotify = async () => {
    if (notifStatus === 'prompt') await requestNotif();
  };

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-100/80 via-paper-50/70 to-warm-100/50 dark:from-[#0e1814] dark:via-[#0c1511] dark:to-[#11140f] p-5 sm:p-6 mt-4 card-paper ${pulseGlow ? 'animate-card-pulse-glow' : ''}`}
    >
      <div className="relative z-10 flex flex-col">
        {/* Collapsed summary row */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-ink-500 dark:text-ink-200">
              <Droplets size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-ink-700 dark:text-ink-100/80">
              喝水
            </span>
            <span className="text-xs text-ink-500/70 dark:text-ink-100/70">
              · {summaryText(minutesSinceLastDrink, todayCount, shouldRemind)}
            </span>
            {shouldRemind && (
              <motion.span
                className="flex-none w-2 h-2 rounded-full bg-warm-400 animate-bar-breathe"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <ProgressRing count={todayCount} target={DAILY_TARGET} />
            {targetReason && (
              <span className="hidden sm:inline text-[10px] text-ink-400/60 dark:text-ink-400/50 max-w-[180px] text-right leading-tight">
                {targetReason}
              </span>
            )}
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-ink-500/70 dark:text-ink-100/70"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.span>
          </div>
        </button>

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
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <p className="text-sm text-ink-600 dark:text-ink-100/80 bg-ink-100/60 dark:bg-ink-800/50 rounded-xl px-4 py-2.5 text-center">
                        {feedback}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {shouldRemind && reminderMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-3 bg-warm-100/60 dark:bg-warm-900/20 rounded-xl px-4 py-3"
                    >
                      <span className="mt-1 flex-none w-1.5 h-1.5 rounded-full bg-warm-400 animate-bar-breathe" aria-hidden="true" />
                      <div className="flex-1">
                        <p className="text-sm text-warm-700 dark:text-warm-300/90 leading-relaxed">
                          {reminderMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={dismissReminder}
                        className="flex-none text-xs text-warm-500/60 dark:text-warm-400/70 hover:text-warm-600 dark:hover:text-warm-300 transition-colors cursor-pointer"
                      >
                        知道了
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <WaterCup count={todayCount} target={DAILY_TARGET} splashKey={splashKey} />

                <div>
                  <button
                    ref={drinkBtnRef}
                    type="button"
                    onClick={() => setShowAmounts(!showAmounts)}
                    className="btn-glow relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-ink-200/25 dark:bg-ink-400/10 hover:bg-ink-200/40 dark:hover:bg-ink-400/20 text-ink-700 dark:text-ink-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.97] active:translate-y-[1px]"
                  >
                    {ripple && (
                      <span
                        className="absolute rounded-full bg-ink-400/20 dark:bg-ink-300/15 animate-ripple"
                        style={{ left: ripple.x - 4, top: ripple.y - 4, width: 8, height: 8 }}
                        aria-hidden="true"
                      />
                    )}
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
                    <Droplets size={18} strokeWidth={1.5} />
                    我刚喝了
                    <motion.span
                      animate={{ rotate: showAmounts ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} strokeWidth={1.5} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showAmounts && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="flex gap-2">
                          {amountOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={(e) => handleDrink(opt.value, e)}
                              className="flex-1 flex flex-col items-center gap-2.5 py-3 px-2 rounded-xl bg-ink-100/70 dark:bg-ink-800/50 hover:bg-ink-200/70 dark:hover:bg-ink-700/40 text-ink-700 dark:text-ink-100 text-xs font-medium transition-all duration-200 cursor-pointer border border-ink-200/50 dark:border-ink-700/25 active:scale-[0.97] active:translate-y-[1px]"
                            >
                              <span className={`${opt.dropletW} ${opt.dropletH} rounded-full bg-ink-400/50 dark:bg-ink-300/45`} aria-hidden="true" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-center">
                  {notifStatus === 'prompt' && (
                    <button
                      type="button"
                      onClick={handleEnableNotify}
                      className="flex items-center gap-1.5 text-xs text-ink-500/70 dark:text-ink-100/70 hover:text-ink-500 dark:hover:text-ink-300 transition-colors cursor-pointer"
                    >
                      <Bell size={12} strokeWidth={1.5} />
                      开启温柔提醒，不会打扰你的
                    </button>
                  )}
                  {notifStatus === 'denied' && (
                    <span className="flex items-center gap-1.5 text-xs text-ink-300/50 dark:text-ink-100/70">
                      <BellOff size={12} strokeWidth={1.5} />
                      通知已关闭，卡片内提醒同样温柔
                    </span>
                  )}
                  {notifStatus === 'granted' && (
                    <span className="flex items-center gap-1.5 text-xs text-ink-500/60 dark:text-ink-100/70">
                      <Bell size={12} strokeWidth={1.5} />
                      温柔提醒已就绪
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
