import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Droplets, StretchHorizontal, Sparkles, Moon, Leaf } from 'lucide-react';
import { useHydrationStore } from '../../store/hydrationStore';
import { useStandupStore } from '../../store/standupStore';
import { useEmotionStore } from '../../store/emotionStore';
import { useBreathingStore } from '../../store/breathingStore';
import { logPositiveText } from '../../utils/copy';

interface MetricItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  colorClass: string;
  colorDark: string;
  bgClass: string;
  bgDark: string;
  positiveText: string;
}

const metricTemplate: Omit<MetricItem, 'count' | 'positiveText'>[] = [
  {
    id: 'hydration',
    label: '喝水补给',
    icon: Droplets,
    colorClass: 'text-gentle-500',
    colorDark: 'dark:text-gentle-100',
    bgClass: 'bg-gentle-100/70',
    bgDark: 'dark:bg-gentle-800/65',
  },
  {
    id: 'standup',
    label: '起身活动',
    icon: StretchHorizontal,
    colorClass: 'text-warm-500',
    colorDark: 'dark:text-warm-300',
    bgClass: 'bg-warm-100/60',
    bgDark: 'dark:bg-warm-900/20',
  },
  {
    id: 'emotion',
    label: '情绪停顿',
    icon: Sparkles,
    colorClass: 'text-blossom-500',
    colorDark: 'dark:text-blossom-300',
    bgClass: 'bg-blossom-100/60',
    bgDark: 'dark:bg-blossom-900/20',
  },
  {
    id: 'breathing',
    label: '呼吸放松',
    icon: Moon,
    colorClass: 'text-gentle-500',
    colorDark: 'dark:text-gentle-100',
    bgClass: 'bg-gentle-100/70',
    bgDark: 'dark:bg-gentle-800/65',
  },
];

export default function TodayLogCard() {
  const hydrationCount = useHydrationStore((s) => s.todayCount);
  const standupCount = useStandupStore((s) => s.todayCount);
  const emotionCount = useEmotionStore((s) => s.todayCount);
  const breathingCount = useBreathingStore((s) => s.todayCount);

  const metrics: MetricItem[] = useMemo(
    () =>
      metricTemplate.map((t) => {
        const counts: Record<string, number> = {
          hydration: hydrationCount,
          standup: standupCount,
          emotion: emotionCount,
          breathing: breathingCount,
        };
        const count = counts[t.id] ?? 0;
        return {
          ...t,
          count,
          positiveText: logPositiveText(t.id, count),
        };
      }),
    [hydrationCount, standupCount, emotionCount, breathingCount],
  );

  const total = useMemo(
    () => hydrationCount + standupCount + emotionCount + breathingCount,
    [hydrationCount, standupCount, emotionCount, breathingCount],
  );

  const isEmpty = total === 0;

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-[#0e1f1b]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-50">
            <Leaf size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
            今日微习惯
          </span>
          {!isEmpty && (
            <span className="text-xs text-gentle-600/60 dark:text-gentle-300">
              · 今天已经照顾自己 {total} 次
            </span>
          )}
        </div>

        {/* Empty state */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4 py-6 text-center"
          >
            {/* Seed SVG illustration */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
              className="text-gentle-400/60 dark:text-gentle-50/92"
            >
              {/* Soil */}
              <ellipse cx="24" cy="40" rx="16" ry="4" fill="currentColor" opacity="0.25" />
              {/* Stem */}
              <path
                d="M24 38 Q24 26 20 16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Left leaf */}
              <path
                d="M20 24 Q14 22 12 18 Q16 20 20 24Z"
                fill="currentColor"
                opacity="0.55"
              />
              {/* Right leaf */}
              <path
                d="M22 20 Q28 16 30 12 Q26 14 22 20Z"
                fill="currentColor"
                opacity="0.55"
              />
              {/* Tiny water drop */}
              <circle cx="24" cy="38" r="1.5" fill="currentColor" opacity="0.4" />
            </svg>
            <div>
              <p className="text-sm text-gentle-600/70 dark:text-gentle-300 leading-relaxed max-w-xs">
                今天刚开始，每一个小动作都值得被记住。
              </p>
              <p className="mt-2 text-xs text-gentle-500/50 dark:text-gentle-400">
                喝一口水、站一下、停一停、慢慢呼吸 —— 都会在这里留下痕迹
              </p>
            </div>
          </motion.div>
        )}

        {/* Metric grid */}
        {!isEmpty && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={
                  m.count === 1
                    ? { opacity: 1, y: 0, scale: [1, 1.06, 1] }
                    : { opacity: 1, y: 0 }
                }
                transition={
                  m.count === 1
                    ? { delay: 0.15 + i * 0.1, duration: 0.6, ease: 'easeOut' }
                    : { delay: 0.15 + i * 0.1, duration: 0.4 }
                }
                drag="x"
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  // #45: gentle spring-back on swipe, no destructive action
                }}
                whileDrag={{ scale: 1.02, transition: { duration: 0.1 } }}
                className={`flex flex-col gap-2 rounded-2xl border border-ink-200/35 dark:border-ink-700/25 ${m.bgClass} ${m.bgDark} p-4  dark:border-ink-700/25 hover:scale-[1.03] hover:shadow-[0_8px_24px_-12px_rgba(28,58,44,0.22)] dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-grab active:cursor-grabbing card-paper`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`${m.colorClass} ${m.colorDark}`}>
                      <m.icon size={15} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="text-xs text-gentle-600/80 dark:text-gentle-300">
                      {m.label}
                    </span>
                  </div>
                  {/* #9: Mini SVG progress ring */}
                  <svg width="28" height="28" viewBox="0 0 28 28" className="flex-none -rotate-90" aria-hidden="true">
                    <circle cx="14" cy="14" r="11" fill="none" strokeWidth="2" className="text-gentle-200/60 dark:text-gentle-700/40" />
                    <motion.circle
                      cx="14" cy="14" r="11" fill="none" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 11}
                      className={m.id === 'hydration' ? 'text-gentle-400' : m.id === 'standup' ? 'text-warm-400' : m.id === 'emotion' ? 'text-blossom-400' : 'text-gentle-400'}
                      animate={{ strokeDashoffset: 2 * Math.PI * 11 * (1 - Math.min(m.count / 8, 1)) }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium tracking-wide text-gentle-800 dark:text-gentle-100 tabular-nums">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={m.count}
                      className="inline-block"
                      initial={{ scale: 1.4, opacity: 0, y: -8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.6, opacity: 0, y: 8 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    >
                      {m.count}
                    </motion.span>
                  </AnimatePresence>
                  <span className="ml-1 text-xs text-gentle-500/70 dark:text-gentle-400 font-normal">
                    次
                  </span>
                </p>
                <p className="text-[11px] leading-relaxed text-gentle-600/65 dark:text-gentle-400">
                  {m.positiveText}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
