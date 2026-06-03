import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { db } from '../../store/db';
import type { SleepQuality, SleepRecord } from '../../types/health';

const OPTIONS: { quality: SleepQuality; emoji: string; label: string }[] = [
  { quality: 'good', emoji: '😴', label: '睡得不错' },
  { quality: 'ok', emoji: '🥱', label: '一般' },
  { quality: 'bad', emoji: '😵', label: '没睡好' },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SleepRecordCard() {
  const [todayRecord, setTodayRecord] = useState<SleepRecord | null>(null);
  const [animId, setAnimId] = useState<string | null>(null);

  useEffect(() => {
    db.sleep.where('date').equals(todayKey()).first().then((r) => {
      setTodayRecord(r ?? null);
    });
  }, []);

  const handleRecord = useCallback(async (quality: SleepQuality) => {
    const today = todayKey();
    // Remove existing today record if any
    if (todayRecord) await db.sleep.delete(todayRecord.id);
    const record: SleepRecord = {
      id: crypto.randomUUID(),
      quality,
      date: today,
      createdAt: Date.now(),
    };
    await db.sleep.add(record);
    setTodayRecord(record);
    setAnimId(record.id);
    setTimeout(() => setAnimId(null), 500);
  }, [todayRecord]);

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-indigo-100/60 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:bg-[#14111d]/98 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] card-paper"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <Moon size={20} strokeWidth={1.5} className="text-gentle-500 dark:text-gentle-300" />
        <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100/90">昨晚睡得怎么样？</span>
      </div>

      <div className="flex items-center gap-3">
        {OPTIONS.map((opt) => {
          const isActive = todayRecord?.quality === opt.quality;
          const isAnim = animId && todayRecord?.id === animId;
          return (
            <motion.button
              key={opt.quality}
              type="button"
              whileTap={{ scale: 0.9 }}
              animate={isAnim ? { scale: [1, 1.3, 1] } : {}}
              onClick={() => handleRecord(opt.quality)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gentle-200/60 dark:bg-gentle-700/50 ring-2 ring-gentle-400/30'
                  : 'bg-paper-50/40 dark:bg-gentle-800/30 hover:bg-gentle-100/50 dark:hover:bg-gentle-700/30'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[11px] font-medium text-gentle-600 dark:text-gentle-300">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>

      {todayRecord && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-center text-gentle-500/60 dark:text-gentle-400/60"
        >
          {todayRecord.quality === 'good' && '好好休息，今天精力会更好 ✨'}
          {todayRecord.quality === 'ok' && '普普通通的一晚，也值得被记录 🌙'}
          {todayRecord.quality === 'bad' && '没睡好也没关系，今天多疼自己一点 🫂'}
        </motion.p>
      )}
    </motion.section>
  );
}
