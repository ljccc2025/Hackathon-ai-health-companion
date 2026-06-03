import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, ChevronDown, Sparkles, Search } from 'lucide-react';
import { db } from '../../store/db';
import { getSnackBatchInsight } from '../../services/aiClient';
import type { SnackRecord } from '../../types/health';

const SNACKS: { emoji: string; label: string }[] = [
  { emoji: '🍎', label: '苹果' },
  { emoji: '🍌', label: '香蕉' },
  { emoji: '🍊', label: '橘子' },
  { emoji: '🍇', label: '葡萄' },
  { emoji: '🫐', label: '蓝莓' },
  { emoji: '🥝', label: '猕猴桃' },
  { emoji: '🍐', label: '梨' },
  { emoji: '🍑', label: '桃子' },
  { emoji: '🍓', label: '草莓' },
  { emoji: '🥕', label: '胡萝卜' },
  { emoji: '🥒', label: '黄瓜' },
  { emoji: '🥜', label: '坚果' },
  { emoji: '🥛', label: '牛奶' },
  { emoji: '🍵', label: '茶' },
  { emoji: '🥚', label: '鸡蛋' },
  { emoji: '🍞', label: '面包' },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SnackLoggerCard() {
  const [collapsed, setCollapsed] = useState(true);
  const [todaySnacks, setTodaySnacks] = useState<SnackRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [addedAnim, setAddedAnim] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadToday = useCallback(async () => {
    try {
      const today = todayKey();
      const rows = await db.snack.where('date').equals(today).toArray();
      setTodaySnacks(rows);
    } catch {
      // IndexedDB unavailable — silently ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const handleAdd = useCallback(async (emoji: string, label: string) => {
    const record: SnackRecord = {
      id: crypto.randomUUID(),
      emoji,
      label,
      createdAt: Date.now(),
      date: todayKey(),
    };
    try {
      await db.snack.add(record);
    } catch {
      // DB write failed — still update local state
    }
    setTodaySnacks((prev) => [...prev, record]);
    setAddedAnim(record.id);
    setTimeout(() => setAddedAnim(null), 500);
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    await db.snack.delete(id);
    setTodaySnacks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (todaySnacks.length === 0) return;
    setAnalyzing(true);
    try {
      // Deduplicate by label before sending to AI
      const seen = new Set<string>();
      const items: { emoji: string; label: string }[] = [];
      for (const s of todaySnacks) {
        if (!seen.has(s.label)) {
          seen.add(s.label);
          items.push({ emoji: s.emoji, label: s.label });
        }
      }
      const res = await getSnackBatchInsight({ items });
      if (res.insight) {
        setInsight(res.insight);
      }
    } catch {
      // AI unavailable — silently skip
    } finally {
      setAnalyzing(false);
    }
  }, [todaySnacks]);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-warm-200/90 via-gentle-100/88 to-white/75 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.18)] dark:from-[#1b1209] dark:via-[#0d1e19] dark:to-[#10211d] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] "
    >
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-100">
            <Apple size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100/90">
            零食/水果记
          </span>
          {loaded && todaySnacks.length > 0 && (
            <span className="text-xs text-gentle-500/70 dark:text-gentle-400/70">
              · 今天 {todaySnacks.length} 样
            </span>
          )}
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
              {/* Emoji grid */}
              <div>
                <p className="text-xs text-gentle-500/80 dark:text-gentle-400/80 mb-2.5">
                  点一下，记下今天吃了什么
                </p>
                <div className="grid grid-cols-8 sm:grid-cols-8 gap-1.5">
                  {SNACKS.map((s) => (
                    <motion.button
                      key={s.emoji}
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleAdd(s.emoji, s.label)}
                      className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-paper-50/40 dark:bg-gentle-800/30 hover:bg-warm-100/60 dark:hover:bg-warm-900/25 border border-gentle-200/40 dark:border-gentle-700/30 transition-colors cursor-pointer"
                      title={s.label}
                    >
                      <span className="text-lg leading-none">{s.emoji}</span>
                      <span className="text-[9px] text-gentle-500/70 dark:text-gentle-400/60 leading-none">
                        {s.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Today's basket */}
              {loaded && todaySnacks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gentle-500/80 dark:text-gentle-400/80">
                      今日果篮
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-gentle-400/15 dark:bg-gentle-400/10 hover:bg-gentle-400/25 dark:hover:bg-gentle-400/18 text-gentle-600 dark:text-gentle-300 text-[10px] font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 border border-gentle-300/40 dark:border-gentle-600/25"
                    >
                      {analyzing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-gentle-400 border-t-transparent rounded-full animate-spin" />
                          分析中
                        </>
                      ) : (
                        <>
                          <Search size={11} strokeWidth={1.8} />
                          分析
                        </>
                      )}
                    </motion.button>
                  </div>
                  <div className="rounded-2xl border border-warm-200/50 bg-paper-50/40 dark:bg-[#0a1411]/60 dark:border-warm-700/20 p-4">
                    <div className="relative flex justify-center">
                      <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
                        <path
                          d="M30 55 Q28 78 52 82 L128 82 Q152 78 150 55 Z"
                          fill="none"
                          stroke="var(--color-warm-400)"
                          strokeOpacity="0.35"
                          strokeWidth="1.5"
                        />
                        <line x1="45" y1="60" x2="45" y2="80" stroke="var(--color-warm-300)" strokeOpacity="0.2" strokeWidth="0.8" />
                        <line x1="65" y1="58" x2="65" y2="81" stroke="var(--color-warm-300)" strokeOpacity="0.2" strokeWidth="0.8" />
                        <line x1="90" y1="57" x2="90" y2="82" stroke="var(--color-warm-300)" strokeOpacity="0.2" strokeWidth="0.8" />
                        <line x1="115" y1="58" x2="115" y2="81" stroke="var(--color-warm-300)" strokeOpacity="0.2" strokeWidth="0.8" />
                        <line x1="135" y1="60" x2="135" y2="80" stroke="var(--color-warm-300)" strokeOpacity="0.2" strokeWidth="0.8" />
                        <ellipse cx="90" cy="54" rx="62" ry="8" fill="none" stroke="var(--color-warm-400)" strokeOpacity="0.3" strokeWidth="1.2" />
                        <path
                          d="M55 52 Q55 20 90 18 Q125 20 125 52"
                          fill="none"
                          stroke="var(--color-warm-400)"
                          strokeOpacity="0.25"
                          strokeWidth="1.2"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 px-8 pt-6 pb-2 pointer-events-none select-none">
                        {todaySnacks.map((s) => (
                          <motion.span
                            key={s.id}
                            initial={{ scale: 0, y: -10 }}
                            animate={
                              addedAnim === s.id
                                ? { scale: [0, 1.3, 1], y: 0 }
                                : { scale: 1, y: 0 }
                            }
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            className="text-lg cursor-pointer pointer-events-auto"
                            onClick={() => handleRemove(s.id)}
                            title={`点击移除 ${s.label}`}
                          >
                            {s.emoji}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-center text-gentle-400/50 dark:text-gentle-500/50 mt-1">
                      点击 emoji 可以移除
                    </p>
                  </div>

                </div>
              )}

              {loaded && todaySnacks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gentle-300/50 bg-paper-50/30 dark:bg-[#0a1411]/50 dark:border-gentle-700/30 p-4 text-center">
                  <p className="text-sm text-gentle-400/60 dark:text-gentle-500/50">
                    今天还没有记录呢，吃点好的吧 🧺
                  </p>
                </div>
              )}

              {/* AI insight result */}
              <AnimatePresence mode="wait">
                {insight && (
                  <motion.div
                    key={insight}
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-gentle-300/50 bg-gentle-100/60 dark:bg-gentle-800/50 dark:border-gentle-600/30 px-3.5 py-2.5 flex items-start gap-2">
                      <Sparkles size={14} strokeWidth={1.5} className="mt-0.5 flex-none text-warm-400 dark:text-warm-300/80" />
                      <div>
                        <p className="text-xs text-gentle-600/70 dark:text-gentle-400/70 mb-0.5">
                          饮食小洞察
                        </p>
                        <p className="text-xs leading-relaxed text-gentle-700 dark:text-gentle-100/90 italic">
                          {insight}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
