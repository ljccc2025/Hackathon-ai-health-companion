import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { db } from '../../store/db';
import { getDietPatternInsight } from '../../services/aiClient';
import type { EmotionFoodRecord } from '../../types/health';

interface AggregatedStats {
  totalRecords: number;
  dayCount: number;
  topEmotion: string;
  topEmotionCount: number;
  topHour: number;
  topHourCount: number;
  avgHungerLevel: number;
  secondEmotion?: string;
}

function aggregateData(records: EmotionFoodRecord[]): AggregatedStats {
  const daySet = new Set<string>();
  const emotionCounts = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  let totalHunger = 0;

  for (const r of records) {
    const date = new Date(r.createdAt).toDateString();
    daySet.add(date);

    for (const tag of r.emotionTags) {
      emotionCounts.set(tag, (emotionCounts.get(tag) || 0) + 1);
    }

    const hour = new Date(r.createdAt).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);

    totalHunger += r.hungerLevel;
  }

  const sortedEmotions = [...emotionCounts.entries()].sort((a, b) => b[1] - a[1]);
  const sortedHours = [...hourCounts.entries()].sort((a, b) => b[1] - a[1]);

  return {
    totalRecords: records.length,
    dayCount: daySet.size,
    topEmotion: sortedEmotions[0]?.[0] ?? 'unknown',
    topEmotionCount: sortedEmotions[0]?.[1] ?? 0,
    secondEmotion: sortedEmotions[1]?.[0],
    topHour: sortedHours[0]?.[0] ?? 12,
    topHourCount: sortedHours[0]?.[1] ?? 0,
    avgHungerLevel: records.length > 0 ? totalHunger / records.length : 0,
  };
}

export default function DietPatternInsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    db.emotionFood
      .where('createdAt')
      .above(fourteenDaysAgo)
      .toArray()
      .then((records) => {
        if (cancelled) return;
        const stats = aggregateData(records);

        // Only call AI if we have 14+ days and meaningful data
        if (stats.dayCount < 14 || stats.totalRecords < 3) {
          setLoading(false);
          return;
        }

        return getDietPatternInsight(stats).then((res) => {
          if (!cancelled && res.source === 'ai' && res.insight) {
            setInsight(res.insight);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Don't render if no insight available
  if (loading || !insight) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 dark:bg-gentle-900/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.45)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles size={18} strokeWidth={1.5} className="text-gentle-500 dark:text-gentle-100" aria-hidden="true" />
          <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
            饮食与情绪的小观察
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gentle-700 dark:text-gentle-200">
          {insight}
        </p>
      </div>
    </motion.section>
  );
}
