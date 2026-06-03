import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Droplets } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STORAGE_KEY = 'light-nurture-onboarding-done';

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
  accent: string;
}

const steps: Step[] = [
  {
    icon: Heart,
    title: '选一个喜欢的语气',
    body: '朋友式、安静式、鼓励式、诗意式、陪伴式……选一个让你觉得舒服的语气，我会用这种方式来陪你。',
    accent: 'text-gentle-500 dark:text-gentle-100',
  },
  {
    icon: Sparkles,
    title: '看一眼今天的问候',
    body: '每次打开页面，都会有一句只属于此刻的温柔问候。不是催促，不是命令，只是轻轻提醒你可以照顾一下自己。',
    accent: 'text-blossom-500 dark:text-blossom-300',
  },
  {
    icon: Droplets,
    title: '试着做一个小动作',
    body: '点一下「我刚喝了」，或者站起来伸个懒腰。不需要完美，不需要连续，每一次小照顾都算数。',
    accent: 'text-gentle-500 dark:text-gentle-100',
  },
];

export function isOnboardingDone(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export default function OnboardingGuide() {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const current = steps[stepIndex];
  const Icon = current.icon;
  const isLast = stepIndex === steps.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [isLast]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-end justify-center pb-32 sm:items-center sm:pb-0 bg-gentle-900/20 dark:bg-black/45 "
        aria-label="首次访问引导"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative mx-4 w-full max-w-sm rounded-2xl border border-ink-200/50 dark:border-ink-700/40 bg-gradient-to-br from-gentle-100/95 via-white/90 to-gentle-50/85 px-7 py-8 shadow-[0_28px_72px_-28px_rgba(28,58,44,0.38)] backdrop-blur-2xl dark:border-ink-700/25 dark:from-gentle-800/90 dark:via-[#17211d]/90 dark:to-gentle-900/85 dark:shadow-[0_28px_72px_-28px_rgba(0,0,0,0.55)]"
        >
          <div className="flex flex-col items-center gap-5 text-center">
            {/* Icon */}
            <motion.span
              key={stepIndex}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              className={current.accent}
            >
              <Icon size={40} strokeWidth={1.2} aria-hidden="true" />
            </motion.span>

            {/* Content */}
            <motion.div
              key={`content-${stepIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="flex flex-col gap-2"
            >
              <h3 className="text-lg font-medium text-gentle-800 dark:text-gentle-100">
                {current.title}
              </h3>
              <p className="text-sm leading-relaxed text-gentle-600/85 dark:text-gentle-100/90">
                {current.body}
              </p>
            </motion.div>

            {/* Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {steps.map((_step, i) => {
                return (
                <span
                  key={i}
                  className={`block rounded-full transition-all duration-300 ${
                    i === stepIndex
                      ? 'h-1.5 w-5 bg-gentle-400 dark:bg-gentle-500'
                      : i < stepIndex
                        ? 'h-1.5 w-1.5 bg-gentle-300/60 dark:bg-gentle-600/50'
                        : 'h-1.5 w-1.5 bg-gentle-200/70 dark:bg-gentle-700/40'
                  }`}
                />
                );
              })}
            </div>

            {/* Button */}
            <motion.button
              type="button"
              onClick={next}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-gentle-300/50 bg-gentle-200/70 px-6 py-2.5 text-sm font-medium text-gentle-700 transition-colors duration-300 hover:bg-gentle-300/60 hover:text-gentle-800 dark:border-gentle-600/40 dark:bg-gentle-700/40 dark:text-gentle-50 dark:hover:bg-gentle-600/40 dark:hover:text-gentle-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gentle-50 dark:focus-visible:ring-offset-gentle-900"
            >
              {isLast ? '开始照顾自己' : '下一步'}
            </motion.button>

            {/* Skip */}
            {!isLast && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(STORAGE_KEY, '1');
                  setVisible(false);
                }}
                className="text-xs text-gentle-400/70 dark:text-gentle-100/90 hover:text-gentle-500 dark:hover:text-gentle-400 transition-colors cursor-pointer"
              >
                跳过引导
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
