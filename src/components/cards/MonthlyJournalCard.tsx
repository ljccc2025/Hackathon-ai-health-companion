import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Droplets, StretchHorizontal, Sparkles } from 'lucide-react';
import { useMonthlyData, type DayCell } from '../../hooks/useMonthlyData';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const COLS = 7;

function dotClass(count: number, base: string): string {
  if (count <= 0) return 'hidden';
  if (count <= 2) return `w-1.5 h-1.5 rounded-full ${base}`;
  if (count <= 5) return `w-2 h-2 rounded-full ${base}`;
  return `w-2.5 h-2.5 rounded-full ${base}`;
}

function daySummary(cell: DayCell): string {
  const parts: string[] = [];
  if (cell.hydrationCount > 0) parts.push(`喝水 ${cell.hydrationCount} 次`);
  if (cell.standupCount > 0) parts.push(`起身 ${cell.standupCount} 次`);
  if (cell.emotionCount > 0) parts.push(`记录情绪 ${cell.emotionCount} 次`);
  if (parts.length === 0) return '这天还没有记录';
  return parts.join(' · ');
}

export default function MonthlyJournalCard() {
  const { cells, loading, monthLabel } = useMonthlyData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedCell = selectedDate
    ? cells.find((c) => c.date === selectedDate) ?? null
    : null;

  const handleDayClick = useCallback((cell: DayCell) => {
    if (!cell.isCurrentMonth) return;
    setSelectedDate((prev) => (prev === cell.date ? null : cell.date));
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const totalHydration = cells.reduce((s, c) => s + c.hydrationCount, 0);
  const totalStandup = cells.reduce((s, c) => s + c.standupCount, 0);
  const totalEmotion = cells.reduce((s, c) => s + c.emotionCount, 0);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-blossom-100/70 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:from-[#10211d] dark:via-[#0d1e19] dark:to-[#1a1520] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gentle-300/70 text-gentle-700 dark:bg-gentle-600/45 dark:text-gentle-100">
            <Calendar size={18} strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gentle-900 dark:text-gentle-50">
              月度健康手帐
            </h3>
            <p className="text-xs text-gentle-600/80 dark:text-gentle-300">{monthLabel}</p>
          </div>
        </div>
        {/* Totals */}
        <div className="flex items-center gap-3 text-xs text-gentle-600/70 dark:text-gentle-300/80">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gentle-400/60" />
            {totalHydration}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warm-400/60" />
            {totalStandup}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blossom-400/60" />
            {totalEmotion}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-gentle-300 border-t-gentle-500 rounded-full animate-spin dark:border-gentle-700 dark:border-t-gentle-400" />
        </div>
      ) : (
        <>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1.5">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[10px] font-medium tracking-wider text-gentle-400/80 dark:text-gentle-400/70 py-1"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1.5 gap-x-0.5">
            {cells.map((cell, i) => {
              const isToday = cell.date === today;
              const isSelected = cell.date === selectedDate;
              const isEmpty = !cell.isCurrentMonth;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isEmpty}
                  onClick={() => handleDayClick(cell)}
                  className={`relative flex flex-col items-center rounded-xl py-1.5 transition-all duration-200 cursor-pointer
                    ${isEmpty ? 'cursor-default' : 'hover:bg-gentle-200/40 dark:hover:bg-gentle-700/30'}
                    ${isSelected ? 'bg-gentle-200/60 dark:bg-gentle-700/50 ring-1 ring-gentle-300/60 dark:ring-gentle-500/30' : ''}
                  `}
                >
                  {/* Day number */}
                  <span
                    className={`text-xs font-medium leading-none mb-1
                      ${isEmpty ? 'text-transparent' : 'text-gentle-700 dark:text-gentle-200'}
                      ${isToday && !isSelected ? 'w-6 h-6 flex items-center justify-center rounded-full bg-gentle-400/20 dark:bg-gentle-500/25' : ''}
                    `}
                  >
                    {cell.day || ''}
                  </span>

                  {/* Behavior dots */}
                  {!isEmpty && (
                    <div className="flex items-center gap-0.5 justify-center min-h-[10px]">
                      <span className={dotClass(cell.hydrationCount, 'bg-gentle-400/70 dark:bg-gentle-400/60')} />
                      <span className={dotClass(cell.standupCount, 'bg-warm-400/70 dark:bg-warm-400/60')} />
                      <span className={dotClass(cell.emotionCount, 'bg-blossom-400/70 dark:bg-blossom-400/60')} />
                      {cell.hydrationCount === 0 && cell.standupCount === 0 && cell.emotionCount === 0 && (
                        <span className="w-1 h-1 rounded-full bg-gentle-200/40 dark:bg-gentle-700/30" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gentle-200/50 dark:border-gentle-700/30">
            <span className="flex items-center gap-1 text-[10px] text-gentle-500/70 dark:text-gentle-400/70">
              <Droplets size={10} strokeWidth={1.5} /> 喝水
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gentle-500/70 dark:text-gentle-400/70">
              <StretchHorizontal size={10} strokeWidth={1.5} /> 起身
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gentle-500/70 dark:text-gentle-400/70">
              <Sparkles size={10} strokeWidth={1.5} /> 情绪
            </span>
          </div>

          {/* Selected day summary */}
          <AnimatePresence>
            {selectedCell && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-2xl border border-gentle-200/50 bg-paper-50/45 dark:bg-[#0a1411]/70 dark:border-gentle-700/30 p-4 ">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
                      {selectedCell.date === today ? '今天' : `${new Date(selectedCell.date).getDate()}日`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-gentle-400/70 dark:text-gentle-400/60 hover:text-gentle-600 dark:hover:text-gentle-300 transition-colors"
                    >
                      收起
                    </button>
                  </div>
                  <p className="text-sm leading-7 text-gentle-700 dark:text-gentle-200">
                    {daySummary(selectedCell)}
                  </p>
                  {selectedCell.hydrationCount === 0 && selectedCell.standupCount === 0 && selectedCell.emotionCount === 0 && (
                    <p className="text-xs text-gentle-400/60 dark:text-gentle-400 mt-1">
                      空白的一天也是被允许的。
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
}
