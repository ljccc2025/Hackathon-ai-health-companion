import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { useShakeEncouragementStore } from '../../store/shakeEncouragementStore';

export default function ShakeToggle() {
  const enabled = useShakeEncouragementStore((s) => s.enabled);
  const toggle = useShakeEncouragementStore((s) => s.toggle);

  return (
    <section className="mt-3" aria-label="摇一摇鼓励开关">
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111815] ${
          enabled
            ? 'border-gentle-300/60 bg-gentle-200/70 text-gentle-700 shadow-[0_4px_16px_-10px_rgba(28,58,44,0.18)] dark:border-gentle-600/40 dark:bg-gentle-700/50 dark:text-gentle-100'
            : 'border-gentle-200/50 bg-paper-50/60 text-gentle-500/80 shadow-[0_4px_16px_-10px_rgba(28,58,44,0.18)] hover:bg-gentle-100/60 hover:text-gentle-600 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300/70 dark:hover:bg-paper-50/5 dark:hover:text-gentle-300'
        }`}
        aria-pressed={enabled}
        aria-label={enabled ? '关闭摇一摇鼓励' : '开启摇一摇鼓励'}
      >
        <Smartphone size={14} strokeWidth={1.6} aria-hidden="true" />
        <span>摇一摇鼓励</span>
        <span className={`ml-1 text-[10px] ${enabled ? 'text-gentle-500 dark:text-gentle-400' : 'text-gentle-400/60 dark:text-gentle-500/50'}`}>
          {enabled ? '已开启' : '已关闭'}
        </span>
      </motion.button>
    </section>
  );
}
