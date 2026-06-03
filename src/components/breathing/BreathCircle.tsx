import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Star } from 'lucide-react';
import type { BreathPhase } from '../../hooks/useBreathingCycle';
import { BREATH_STEPS } from '../../hooks/useBreathingCycle';

/* ───── 自然呼吸曲线 ───── */
// 吸气：开始柔和、中间加速、末尾放缓（模拟真实吸气）
const INHALE_EASE: [number, number, number, number] = [0.35, 0, 0.25, 1];
// 呼气：先快后慢（模拟真实呼气）
const EXHALE_EASE: [number, number, number, number] = [0.55, 0, 0.4, 1];

const PHASE_SUBTEXT: Record<Exclude<BreathPhase, 'idle'>, string> = {
  inhale: '让空气慢慢填满身体',
  hold: '感受这一刻的安静',
  exhale: '把紧绷一起呼出去',
  rest: '不急着开始下一次',
};

/* ───── 阶段颜色映射 ───── */
function phaseBorderColor(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale':
      return 'border-gentle-400 dark:border-gentle-400/55';
    case 'hold':
      return 'border-warm-300 dark:border-warm-300/45';
    case 'exhale':
      return 'border-gentle-300 dark:border-gentle-400/40';
    case 'rest':
      return 'border-gentle-200 dark:border-gentle-500/25';
    default:
      return 'border-gentle-300/35 dark:border-gentle-400/25';
  }
}

function phaseGlowColor(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale':
      return 'shadow-[0_0_30px_rgba(78,163,135,0.3)] dark:shadow-[0_0_30px_rgba(166,214,195,0.2)]';
    case 'hold':
      return 'shadow-[0_0_30px_rgba(245,151,59,0.25)] dark:shadow-[0_0_30px_rgba(245,151,59,0.15)]';
    case 'exhale':
      return 'shadow-[0_0_30px_rgba(116,189,163,0.25)] dark:shadow-[0_0_30px_rgba(166,214,195,0.15)]';
    case 'rest':
      return 'shadow-[0_0_30px_rgba(166,214,198,0.15)] dark:shadow-[0_0_20px_rgba(166,214,195,0.08)]';
    default:
      return '';
  }
}

function ringScale(phase: BreathPhase): number {
  switch (phase) {
    case 'inhale':
      return 1;
    case 'hold':
      return 1;
    case 'exhale':
      return 0.52;
    case 'rest':
      return 0.52;
    default:
      return 0.72;
  }
}

function ringDuration(phase: BreathPhase): number {
  switch (phase) {
    case 'inhale':
      return 4;
    case 'hold':
      return 2;
    case 'exhale':
      return 6;
    case 'rest':
      return 1;
    default:
      return 0.5;
  }
}

/* ───── SVG 进度环 ───── */
const PROGRESS_R = 108;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_R;

interface BreathCircleProps {
  phase: BreathPhase;
  stepIndex: number;
  totalProgress: number;
  isComplete: boolean;
}

export default function BreathCircle({
  phase,
  stepIndex,
  totalProgress,
  isComplete,
}: BreathCircleProps) {
  const isIdle = phase === 'idle' && !isComplete;
  const showComplete = isComplete && phase === 'idle';
  const step = BREATH_STEPS[stepIndex];

  const label = showComplete ? '做完了' : isIdle ? '陪我呼吸' : step.label;
  const subtext = showComplete
    ? '可以安心睡了'
    : isIdle
      ? '一分钟的放松'
      : PHASE_SUBTEXT[phase as Exclude<BreathPhase, 'idle'>];

  const duration = ringDuration(phase);
  const ease: [number, number, number, number] =
    phase === 'inhale' ? INHALE_EASE : phase === 'exhale' ? EXHALE_EASE : [0.4, 0, 0.6, 1];

  const progressDashoffset = PROGRESS_CIRCUMFERENCE * (1 - totalProgress);

  return (
    <div className="relative flex items-center justify-center w-60 h-60 sm:w-64 sm:h-64 mx-auto">
      {/* ── #6: SVG 进度环 + 柔光尾迹 ── */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 240 240"
        aria-hidden="true"
      >
        {/* Glow trail — wider, blurred filter */}
        <defs>
          <filter id="progress-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>
        {!isIdle && !showComplete && (
          <motion.circle
            cx="120"
            cy="120"
            r={PROGRESS_R}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-gentle-300/30 dark:text-gentle-200/20"
            filter="url(#progress-glow)"
            strokeDasharray={PROGRESS_CIRCUMFERENCE}
            animate={{ strokeDashoffset: progressDashoffset }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        <motion.circle
          cx="120"
          cy="120"
          r={PROGRESS_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-gentle-300/25 dark:text-gentle-100/90"
          strokeDasharray={PROGRESS_CIRCUMFERENCE}
          animate={{ strokeDashoffset: progressDashoffset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </svg>

      {/* ── 背景光晕 ── */}
      <motion.div
        className="absolute inset-2 rounded-full bg-gentle-400/6 dark:bg-gentle-300/4 blur-2xl"
        animate={{
          scale: showComplete ? 0 : isIdle ? [0.88, 0.94, 0.88] : ringScale(phase),
          opacity: showComplete ? 0 : isIdle ? 0.25 : 0.45,
        }}
        transition={
          isIdle
            ? { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            : { duration, ease }
        }
      />

      {/* ── 外环 (optimization #2: 领先层) ── */}
      <motion.div
        className={`absolute inset-1 rounded-full border-2 ${phaseBorderColor(phase)} ${!isIdle && !showComplete ? phaseGlowColor(phase) : ''}`}
        animate={{
          scale: showComplete
            ? 0
            : isIdle
              ? [0.84, 0.92, 0.84]
              : ringScale(phase),
          opacity: showComplete ? 0 : 1,
        }}
        transition={
          isIdle
            ? { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0 }
            : { duration, ease, delay: 0 }
        }
        style={{ willChange: 'transform' }}
      />

      {/* ── 中环 (optimization #2: 延迟 120ms) ── */}
      <motion.div
        className={`absolute inset-4 rounded-full border ${phaseBorderColor(phase)} ${showComplete ? '' : phaseGlowColor(phase)}`}
        animate={{
          scale: showComplete
            ? 0
            : isIdle
              ? [0.86, 0.94, 0.86]
              : ringScale(phase) * 0.93,
          opacity: showComplete
            ? 0
            : isIdle
              ? [0.3, 0.5, 0.3]
              : phase === 'inhale'
                ? 0.55
                : phase === 'exhale'
                  ? 0.35
                  : 0.5,
        }}
        transition={
          isIdle
            ? { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
            : { duration, ease, delay: 0.12 }
        }
        style={{ willChange: 'transform' }}
      />

      {/* ── 内圆 (optimization #2: 延迟 240ms) ── */}
      <motion.div
        className="absolute inset-7 rounded-full bg-gentle-400/6 dark:bg-gentle-300/4"
        animate={{
          scale: showComplete
            ? 0
            : isIdle
              ? [0.88, 0.96, 0.88]
              : ringScale(phase) * 0.84,
          opacity: showComplete
            ? 0
            : isIdle
              ? [0.25, 0.45, 0.25]
              : phase === 'inhale'
                ? 0.6
                : phase === 'exhale'
                  ? 0.3
                  : 0.45,
        }}
        transition={
          isIdle
            ? { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }
            : { duration, ease, delay: 0.24 }
        }
        style={{ willChange: 'transform' }}
      />

      {/* ── 完成态：小月亮 + 星星 ── */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute z-10 flex flex-col items-center gap-1"
          >
            <Moon
              size={32}
              strokeWidth={1.2}
              className="text-gentle-500 dark:text-gentle-100"
            />
            <Star
              size={12}
              strokeWidth={1.2}
              className="text-warm-400/60 dark:text-warm-300/70 -mt-1"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 中心文字 ── */}
      <AnimatePresence mode="wait">
        {!showComplete && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col items-center gap-1 px-4"
          >
            <motion.span
              className="text-base sm:text-lg font-light tracking-wider text-gentle-700 dark:text-gentle-50 text-center"
              animate={{ opacity: isIdle ? 0.65 : 1 }}
              transition={{ duration: 0.5 }}
            >
              {label}
            </motion.span>
            <motion.span
              className="text-[11px] font-light tracking-wide text-gentle-500/65 dark:text-gentle-100/90 text-center"
              animate={{ opacity: isIdle ? 0.4 : 0.7 }}
              transition={{ duration: 0.5 }}
            >
              {subtext}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 完成文字 ── */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute z-10 flex flex-col items-center gap-1 -bottom-8"
          >
            <span className="text-[11px] font-light tracking-wide text-gentle-500/65 dark:text-gentle-100/90">
              可以安心睡了
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
