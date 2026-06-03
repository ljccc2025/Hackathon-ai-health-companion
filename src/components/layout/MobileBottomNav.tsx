import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface NavModule {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  modules: NavModule[];
  activeId: string;
  onChange: (id: string) => void;
}

export default function MobileBottomNav({ modules, activeId, onChange }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
      aria-label="底部导航"
    >
      <div className="mx-3 mb-3 rounded-2xl border border-ink-200/50 bg-paper-50/90 px-1.5 py-1.5 shadow-[0_-4px_20px_rgba(28,58,44,0.08)] dark:border-ink-700/40 dark:bg-ink-900/85 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-around">
          {modules.map((mod) => {
            const isActive = mod.id === activeId;
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.id}
                type="button"
                onClick={() => onChange(mod.id)}
                whileTap={{ scale: 0.94 }}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium tracking-[0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-400 focus-visible:ring-offset-1 focus-visible:ring-offset-paper-50 dark:focus-visible:ring-offset-ink-900 ${
                  isActive
                    ? 'text-ink-800 dark:text-ink-50'
                    : 'text-ink-500/60 dark:text-ink-100/70 hover:text-ink-700 dark:hover:text-ink-200'
                }`}
                aria-pressed={isActive}
                aria-label={mod.label}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomNavIndicator"
                    className="absolute top-0.5 h-0.5 w-5 rounded-full bg-ink-400 dark:bg-ink-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                <span>{mod.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="h-[env(safe-area-inset-bottom,0px)] bg-transparent" />
    </nav>
  );
}
