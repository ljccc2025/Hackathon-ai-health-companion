import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface PillModule {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface LiquidPillNavProps {
  modules: PillModule[];
  activeId: string;
  onChange: (id: string) => void;
}

function PillButton({
  mod,
  isActive,
  onClick,
}: {
  mod: PillModule;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = mod.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-300 ${
        isActive
          ? 'bg-ink-200/75 text-ink-900 shadow-[0_2px_8px_rgba(28,58,44,0.1)] dark:bg-ink-600/45 dark:text-ink-50'
          : 'bg-transparent text-ink-600/80 hover:bg-ink-100/60 hover:text-ink-800 dark:text-ink-100/80 dark:hover:bg-ink-700/35 dark:hover:text-ink-50'
      }`}
      aria-pressed={isActive}
    >
      <Icon
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      {mod.label}
    </motion.button>
  );
}

export default function LiquidPillNav({
  modules,
  activeId,
  onChange,
}: LiquidPillNavProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-ink-200/50 bg-paper-50/80 px-2.5 py-2.5 shadow-[0_2px_12px_rgba(28,58,44,0.06)] transition-colors duration-500 dark:border-ink-700/40 dark:bg-ink-900/60 dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
        {modules.map((mod) => (
          <PillButton
            key={mod.id}
            mod={mod}
            isActive={mod.id === activeId}
            onClick={() => onChange(mod.id)}
          />
        ))}
      </div>
    </div>
  );
}
