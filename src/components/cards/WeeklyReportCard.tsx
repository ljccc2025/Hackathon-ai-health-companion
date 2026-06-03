import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Share2, RefreshCw, Check } from 'lucide-react';
import { db } from '../../store/db';
import { getWeeklyReport } from '../../services/aiClient';

interface WeeklyData {
  hydrationCount: number;
  standupCount: number;
  emotionCount: number;
  topEmotion: string;
  bestDay: string;
  breathingCount: number;
}

function getDayLabel(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('zh-CN', { weekday: 'long' });
  } catch {
    return isoDate;
  }
}

async function fetchWeeklyData(): Promise<WeeklyData> {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }

  const ranges = keys.map((key) => {
    const start = new Date(key).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    return { key, start, end };
  });

  let hydrationCount = 0;
  let standupCount = 0;
  let emotionCount = 0;
  let breathingCount = 0;
  const emotionTags: string[] = [];
  const dayCounts: { date: string; count: number }[] = [];

  for (const range of ranges) {
    const [hRows, sRows, eRows] = await Promise.all([
      db.hydration.where('timestamp').between(range.start, range.end, true, true).count(),
      db.standup.where('startedAt').between(range.start, range.end, true, true).count(),
      db.moodTreeHole.where('createdAt').between(range.start, range.end, true, true).toArray(),
    ]);

    hydrationCount += hRows;
    standupCount += sRows;
    emotionCount += eRows.length;
    breathingCount += 0; // breathing is tracked in-memory via Zustand store, not IndexedDB

    for (const row of eRows) {
      if (row.emotionTags && row.emotionTags.length > 0) {
        emotionTags.push(...row.emotionTags);
      }
    }

    dayCounts.push({ date: range.key, count: hRows + sRows + eRows.length });
  }

  // Find top emotion
  const tagFreq = new Map<string, number>();
  for (const tag of emotionTags) {
    tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
  }
  let topEmotion = '';
  let topFreq = 0;
  for (const [tag, freq] of tagFreq) {
    if (freq > topFreq) {
      topFreq = freq;
      topEmotion = tag;
    }
  }
  const emotionLabelMap: Record<string, string> = {
    tired: '疲惫',
    anxious: '焦虑',
    bored: '无聊',
    sad: '低落',
    stressed: '紧张',
    hungry: '饿',
  };

  // Find best day
  dayCounts.sort((a, b) => b.count - a.count);
  const bestDay = dayCounts.length > 0 && dayCounts[0].count > 0
    ? getDayLabel(dayCounts[0].date)
    : '';

  return {
    hydrationCount,
    standupCount,
    emotionCount,
    topEmotion: emotionLabelMap[topEmotion] || topEmotion,
    bestDay,
    breathingCount,
  };
}

function fallbackReport(data: WeeklyData): string {
  const lines: string[] = [];
  if (data.hydrationCount > 0 || data.standupCount > 0) {
    lines.push('这一周，你用自己的方式照顾着自己。');
  }
  if (data.hydrationCount > 0) {
    lines.push(`你一共喝了 ${data.hydrationCount} 次水，身体一定感受到了这份温柔的补给。`);
  }
  if (data.standupCount > 0) {
    lines.push(`你起身活动了 ${data.standupCount} 次，让身体从久坐里轻轻出来。`);
  }
  if (data.emotionCount > 0) {
    lines.push(`你记录了 ${data.emotionCount} 次心情，接住了自己的感受。`);
  }
  if (data.bestDay) {
    lines.push(`${data.bestDay} 是你照顾自己最多的一天。`);
  }
  lines.push('下周不必更好，这样就很好。');
  return lines.join('\n');
}

export default function WeeklyReportCard() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const dataRef = useRef<WeeklyData | null>(null);
  const loadedRef = useRef(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchWeeklyData();
      dataRef.current = data;

      try {
        const aiRes = await getWeeklyReport(data);
        if (aiRes.source === 'ai' && aiRes.rawText) {
          setReport(aiRes.rawText.trim());
        } else {
          setReport(fallbackReport(data));
        }
      } catch {
        setReport(fallbackReport(data));
      }
    } catch {
      setError(true);
      if (dataRef.current) {
        setReport(fallbackReport(dataRef.current));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      generate();
    }
  }, [generate]);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore
    }
  }, [report]);

  const handleShare = useCallback(async () => {
    if (!report) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的第7日轻养周报',
          text: report,
        });
      } catch {
        // User cancelled or share failed — silently ignore
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  }, [report, handleCopy]);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/90 via-gentle-100/88 to-blossom-100/70 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:from-[#10211d] dark:via-[#0d1e19] dark:to-[#1a1520] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.62)] "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gentle-300/70 text-gentle-700 dark:bg-gentle-600/45 dark:text-gentle-100">
            <FileText size={18} strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gentle-900 dark:text-gentle-50">第7日轻养周报</h3>
            <p className="text-xs text-gentle-600/80 dark:text-gentle-300">过去一周的温柔回顾</p>
          </div>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gentle-300/60 bg-paper-50/40 text-gentle-600 hover:bg-gentle-200/60 transition-colors disabled:opacity-40 dark:border-gentle-600/30 dark:bg-gentle-800/40 dark:text-gentle-100/80"
          aria-label="重新生成周报"
        >
          <RefreshCw size={14} strokeWidth={1.8} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Report content */}
      <div className="relative rounded-2xl border border-gentle-200/50 bg-paper-50/45 p-4 sm:p-5 min-h-[120px]  dark:border-gentle-700/30 dark:bg-[#0a1411]/70">
        {loading && !report ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-3 w-full rounded-full bg-gentle-300/60 dark:bg-gentle-700/40" />
            <div className="h-3 w-4/5 rounded-full bg-gentle-300/50 dark:bg-gentle-700/30" />
            <div className="h-3 w-3/5 rounded-full bg-gentle-300/40 dark:bg-gentle-700/25" />
          </div>
        ) : (
          <div className="text-sm leading-7 text-gentle-800 dark:text-gentle-200 whitespace-pre-line">
            {report}
          </div>
        )}
        {error && (
          <p className="mt-2 text-xs text-warm-600/80 dark:text-warm-300">
            AI 生成未能完成，以上为本地模板生成的周报。
          </p>
        )}
      </div>

      {/* Actions */}
      {report && !loading && (
        <div className="mt-3 flex items-center gap-2 justify-end">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full border border-gentle-300/60 bg-paper-50/50 px-3.5 py-1.5 text-xs font-medium text-gentle-700 hover:bg-gentle-200/60 transition-colors dark:border-gentle-600/30 dark:bg-gentle-800/45 dark:text-gentle-200 dark:hover:bg-gentle-700/50"
          >
            {copied ? <Check size={13} strokeWidth={1.8} /> : <Copy size={13} strokeWidth={1.8} />}
            {copied ? '已复制' : '复制'}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-gentle-300/60 bg-paper-50/50 px-3.5 py-1.5 text-xs font-medium text-gentle-700 hover:bg-gentle-200/60 transition-colors dark:border-gentle-600/30 dark:bg-gentle-800/45 dark:text-gentle-200 dark:hover:bg-gentle-700/50"
          >
            <Share2 size={13} strokeWidth={1.8} />
            分享
          </motion.button>
        </div>
      )}
    </motion.section>
  );
}
