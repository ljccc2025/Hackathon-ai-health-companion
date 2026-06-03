import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, X } from 'lucide-react';

interface ToastData {
  id: number;
  title: string;
  body: string;
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, title, body } = (e as CustomEvent).detail;
      setToasts((prev) => [...prev, { id, title, body }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 8000);
    };
    window.addEventListener('medicine-toast', handler);
    return () => window.removeEventListener('medicine-toast', handler);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="pointer-events-auto flex items-start gap-3 w-80 max-w-full rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-paper-50/90 dark:bg-[#1a221f]/95  px-4 py-3.5 shadow-[0_12px_40px_-16px_rgba(28,58,44,0.35)] dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)]"
          >
            <span className="flex-none flex h-8 w-8 items-center justify-center rounded-full bg-gentle-200/70 dark:bg-gentle-700/50">
              <Pill size={15} strokeWidth={1.6} className="text-gentle-600 dark:text-gentle-300" />
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-medium text-gentle-800 dark:text-gentle-100 leading-snug">
                {toast.title}
              </p>
              <p className="mt-0.5 text-xs text-gentle-600/80 dark:text-gentle-200/80 leading-snug">
                {toast.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="flex-none p-1 rounded-full text-gentle-400 hover:text-gentle-600 dark:hover:text-gentle-300 transition-colors cursor-pointer"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
