import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { db } from '../../store/db';
import type { CycleRecord, CyclePhase } from '../../types/health';

const PHASES: { key: CyclePhase; emoji: string; label: string; color: string }[] = [
  { key: 'period',       emoji: '🌸', label: '经期',   color: '#d85c7e' },
  { key: 'follicular',   emoji: '🌱', label: '卵泡期', color: '#4ea387' },
  { key: 'ovulation',    emoji: '🥚', label: '排卵期', color: '#f5973b' },
  { key: 'luteal',       emoji: '🌙', label: '黄体期', color: '#7c6fa0' },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CycleTrackerCard() {
  const [collapsed, setCollapsed] = useState(true);
  const [records, setRecords] = useState<CycleRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const all = await db.cycleRecord.orderBy('date').reverse().toArray();
    setRecords(all);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayKey();
  const todayRecord = records.find((r) => r.date === today);

  const handleRecord = useCallback(async (phase: CyclePhase) => {
    const existing = records.find((r) => r.date === today);
    if (existing) {
      await db.cycleRecord.delete(existing.id);
    }
    const record: CycleRecord = {
      id: crypto.randomUUID(),
      date: today,
      phase,
      createdAt: Date.now(),
    };
    await db.cycleRecord.add(record);
    await load();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [today, records, load]);

  // Recent 28 dots for visual timeline
  const recentDays: (CycleRecord | null)[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = records.find((r) => r.date === key) ?? null;
    recentDays.push(found);
  }

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-blossom-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:from-[#1a1520] dark:via-[#0d1e19] dark:to-[#10211d] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] "
    >
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌸</span>
          <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100/90">
            周期记录
          </span>
          <span className="text-xs text-gentle-500/70 dark:text-gentle-400/70">
            · 可选 · 仅本地
          </span>
        </div>
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          className="text-gentle-600/70 dark:text-gentle-100/90"
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 flex flex-col gap-4">
              {/* Today's phase selector */}
              <div>
                <p className="text-xs text-gentle-500/80 dark:text-gentle-400/80 mb-2.5">
                  今天感觉在哪个阶段？
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PHASES.map((p) => {
                    const isActive = todayRecord?.phase === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleRecord(p.key)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-xl border transition-all duration-200 cursor-pointer
                          ${isActive
                            ? 'border-blossom-300/80 bg-blossom-100/60 dark:border-blossom-500/40 dark:bg-blossom-800/30 shadow-sm'
                            : 'border-gentle-200/50 bg-paper-50/40 dark:border-gentle-700/30 dark:bg-gentle-800/30 hover:bg-gentle-200/40 dark:hover:bg-gentle-700/30'
                          }
                        `}
                      >
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-[10px] font-medium text-gentle-600 dark:text-gentle-300/90">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {saved && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-center text-gentle-500/70 dark:text-gentle-400/60"
                  >
                    已记录 ✓
                  </motion.p>
                )}
              </div>

              {/* Recent 28-day dot timeline */}
              {loaded && (
                <div>
                  <p className="text-xs text-gentle-500/80 dark:text-gentle-400/80 mb-2">
                    近 28 天
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recentDays.map((r, i) => {
                      const isToday = i === 27;
                      const phase = PHASES.find((p) => p.key === r?.phase);
                      return (
                        <span
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full border transition-colors duration-200
                            ${isToday ? 'ring-1 ring-gentle-400/40 ring-offset-1 dark:ring-offset-[#0d1e19]' : ''}
                          `}
                          style={{
                            backgroundColor: phase ? phase.color : 'transparent',
                            borderColor: phase ? phase.color : 'rgba(166,214,195,0.25)',
                            opacity: phase ? 0.85 : 0.3,
                          }}
                          title={r ? `${r.date} · ${PHASES.find((p) => p.key === r.phase)?.label}` : ''}
                        />
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                    {PHASES.map((p) => (
                      <span key={p.key} className="flex items-center gap-1 text-[10px] text-gentle-500/60 dark:text-gentle-400/60">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.emoji} {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy note */}
              <p className="text-[10px] leading-relaxed text-gentle-400/60 dark:text-gentle-500/50 italic">
                数据仅存储在本地浏览器，不做任何上传、分析和预测。随时可清除浏览器数据即永久删除。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
