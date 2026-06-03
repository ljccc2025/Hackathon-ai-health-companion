import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { NotebookPen, Check } from 'lucide-react';
import { useCompanionStore } from '../../store/companionStore';

export default function DailyDiaryCard() {
  const diaryText = useCompanionStore((s) => s.diaryText);
  const setDiaryText = useCompanionStore((s) => s.setDiaryText);
  const resetDiaryIfNewDay = useCompanionStore((s) => s.resetDiaryIfNewDay);

  const [draft, setDraft] = useState(diaryText);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    resetDiaryIfNewDay();
  }, [resetDiaryIfNewDay]);

  useEffect(() => {
    setDraft(diaryText);
  }, []);

  const handleChange = (value: string) => {
    setDraft(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDiaryText(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 600);
  };

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-[#0e1f1b]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-50">
            <NotebookPen size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100/90">
            每日一句话日记
          </span>
          {saved && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-[11px] text-gentle-500/80 dark:text-gentle-400/80"
            >
              <Check size={12} strokeWidth={2} />
              已存
            </motion.span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-gentle-500/80 dark:text-gentle-100/84">
          今天最想记住的瞬间是……
        </p>

        <textarea
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="今天最想记住的瞬间是____"
          maxLength={280}
          rows={3}
          className="w-full resize-none rounded-xl border border-gentle-200/60 bg-paper-50/60 px-4 py-3 text-sm leading-relaxed text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
        />

        <p className="text-[10px] text-gentle-400/60 dark:text-gentle-500/60 text-right">
          {draft.length}/280 · 自动保存 · 仅本地
        </p>
      </div>
    </motion.section>
  );
}
