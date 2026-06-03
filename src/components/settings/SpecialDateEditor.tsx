import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, X } from 'lucide-react';
import { db } from '../../store/db';
import type { SpecialDate } from '../../types/health';

export default function SpecialDateEditor() {
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    db.specialDate.orderBy('date').toArray().then((rows) => {
      setDates(rows);
    });
  }, []);

  const handleAdd = async () => {
    const trimmed = label.trim();
    if (!trimmed || !date) return;
    const record: SpecialDate = {
      id: crypto.randomUUID(),
      date,
      label: trimmed,
      createdAt: Date.now(),
    };
    await db.specialDate.add(record);
    setDates((prev) => [...prev, record].sort((a, b) => a.date.localeCompare(b.date)));
    setLabel('');
    setDate('');
  };

  const handleRemove = async (id: string) => {
    await db.specialDate.delete(id);
    setDates((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="mt-4 rounded-xl border border-gentle-200/40 dark:border-gentle-700/25 bg-gentle-100/60 dark:bg-gentle-800/50 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} strokeWidth={1.6} className="text-gentle-500 dark:text-gentle-400" />
        <span className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
          特殊日期
        </span>
      </div>

      {dates.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dates.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 rounded-full bg-blossom-100/60 dark:bg-blossom-900/30 px-2.5 py-1 text-[11px] font-medium text-blossom-700 dark:text-blossom-300 border border-blossom-200/50 dark:border-blossom-700/30"
            >
              {d.date.slice(5)} {d.label}
              <button type="button" onClick={() => handleRemove(d.id)} className="hover:opacity-70 cursor-pointer">
                <X size={10} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded-lg bg-paper-50/60 dark:bg-gentle-900/50 border border-gentle-200/50 dark:border-gentle-700/30 text-xs text-gentle-700 dark:text-gentle-100 outline-none focus:border-gentle-400/50"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="标签（如：生日）"
          maxLength={8}
          className="w-24 px-2 py-1.5 rounded-lg bg-paper-50/60 dark:bg-gentle-900/50 border border-gentle-200/50 dark:border-gentle-700/30 text-xs text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 outline-none focus:border-gentle-400/50"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handleAdd}
          disabled={!date || !label.trim()}
          className="flex items-center gap-1 rounded-lg bg-blossom-400/25 dark:bg-blossom-400/15 px-2.5 py-1.5 text-xs font-medium text-blossom-600 dark:text-blossom-300 disabled:opacity-30 cursor-pointer"
        >
          <Plus size={12} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
