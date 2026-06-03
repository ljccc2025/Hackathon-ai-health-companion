import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      type="button"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '轻拉一下，亮起来' : '轻拉一下，暗下来'}
      className="fixed right-4 sm:right-6 top-4 sm:top-6 z-50 flex flex-col items-center gap-0 cursor-pointer group"
    >
      {/* Pull chain hint */}
      <motion.span
        animate={{ y: isDark ? 2 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-gentle-400/50 dark:text-gentle-50/90"
      >
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="transition-transform duration-300 group-hover:translate-y-1"
        />
      </motion.span>

      {/* Wire line */}
      <div className="w-px h-3 bg-gentle-300/50 dark:bg-gentle-400/30" />

      {/* Lightbulb */}
      <motion.div
        whileTap={{ scale: 0.9, y: 8 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative"
      >
        {/* Glow ring */}
        <AnimatePresence>
          {!isDark && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-full blur-md"
              style={{
                background:
                  'radial-gradient(circle, rgba(245,151,59,0.35) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Bulb SVG */}
        <svg
          width="32"
          height="36"
          viewBox="0 0 32 36"
          fill="none"
          className="relative"
        >
          {/* Bulb glass */}
          <motion.path
            d="M10 14C10 9 13 4 16 4C19 4 22 9 22 14C22 18 20 21 19 23H13C12 21 10 18 10 14Z"
            fill="currentColor"
            animate={{
              fill: isDark ? '#4a5568' : '#f8b46b',
            }}
            transition={{ duration: 0.4 }}
          />
          {/* Bulb shine */}
          <motion.ellipse
            cx="14"
            cy="12"
            rx="3"
            ry="2.5"
            animate={{
              fill: isDark ? '#5a6a7a' : '#fde4c2',
            }}
            transition={{ duration: 0.4 }}
          />
          {/* Filament glow */}
          <motion.circle
            cx="16"
            cy="16"
            r="3"
            animate={{
              fill: isDark ? '#6b7d8e' : '#f5973b',
              opacity: isDark ? 0.3 : 0.8,
            }}
            transition={{ duration: 0.4 }}
          />
          {/* Base cap */}
          <rect
            x="13"
            y="23"
            width="6"
            height="3"
            rx="1"
            fill="currentColor"
            className="text-gentle-500 dark:text-gentle-100"
          />
          {/* Screw thread lines */}
          <line x1="13.8" y1="26" x2="18.2" y2="26" stroke="currentColor" strokeWidth="0.5" className="text-gentle-500/60 dark:text-gentle-100/90" />
          <line x1="13.8" y1="27.5" x2="18.2" y2="27.5" stroke="currentColor" strokeWidth="0.5" className="text-gentle-500/60 dark:text-gentle-100/90" />
          <line x1="13.8" y1="29" x2="18.2" y2="29" stroke="currentColor" strokeWidth="0.5" className="text-gentle-500/60 dark:text-gentle-100/90" />
        </svg>
      </motion.div>
    </button>
  );
}
