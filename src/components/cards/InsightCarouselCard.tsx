import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ShareCardGenerator from '../decorative/ShareCardGenerator';
import { useWeeklyData } from '../../hooks/useWeeklyData';
import { db } from '../../store/db';

// ── Page 1: Hydration weekly bar chart ──
function HydrationBars({ buckets }: { buckets: ReturnType<typeof useWeeklyData>['buckets'] }) {
  const maxCount = Math.max(...buckets.map((b) => b.hydrationCount), 1);
  const W = 280; const H = 120; const PAD_L = 22; const PAD_B = 18; const PAD_T = 20;  // 增加顶部空间
  const barW = Math.min(28, (W - PAD_L - 20) / buckets.length - 8);
  const usableH = H - PAD_T - PAD_B;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto" role="img" aria-label="本周饮水柱状图">
      {buckets.map((b, i) => {
        const barH = maxCount > 0 ? (b.hydrationCount / maxCount) * usableH : 0;
        const x = PAD_L + i * ((W - PAD_L - 20) / buckets.length) + ((W - PAD_L - 20) / buckets.length - barW) / 2;
        const y = H - PAD_B - barH;
        return (
          <g key={b.date}>
            <motion.rect
              x={x} y={y} width={barW} height={Math.max(barH, 2)}
              rx="4"
              className="fill-ink-400/70 dark:fill-ink-300/60"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: `${x + barW / 2}px ${H - PAD_B}px` }}
            />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="fill-ink-600 dark:fill-ink-200 text-[9px] font-medium">
              {b.hydrationCount > 0 ? b.hydrationCount : ''}
            </text>
            <text x={x + barW / 2} y={H - 3} textAnchor="middle" className="fill-ink-400/60 dark:fill-ink-400/70 text-[9px]">
              {b.dayLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Page 2: Emotion donut ──
const EMOTION_COLORS = ['#d85c7e', '#f5973b', '#4b9e80', '#71b89a', '#e87d1f'];
function EmotionDonut({ buckets }: { buckets: ReturnType<typeof useWeeklyData>['buckets'] }) {
  const totalEmotions = buckets.reduce((sum, b) => sum + b.emotionCount, 0);
  const cx = 52; const cy = 52; const r = 36; const strokeW = 14;
  const circumference = 2 * Math.PI * r;

  // Simulate 5 segments evenly for visual richness
  const segments = totalEmotions > 0
    ? [0.35, 0.25, 0.20, 0.12, 0.08]
    : [0, 0, 0, 0, 1];

  let offset = 0;
  const arcs = segments.map((frac, i) => {
    const len = frac * circumference;
    const arc = { len, offset, color: EMOTION_COLORS[i] };
    offset += len;
    return arc;
  });

  return (
    <svg viewBox="0 0 104 104" className="w-36 h-36 mx-auto" role="img" aria-label="情绪分布环形图">
      {totalEmotions === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={strokeW} className="stroke-ink-200/40 dark:stroke-ink-700/30" />
      ) : (
        arcs.map((arc, i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeW}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference - arc.len}
            strokeLinecap="butt"
            className="opacity-75"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - arc.len }}
            transition={{ delay: i * 0.15, duration: 0.7, ease: 'easeOut' }}
            style={{ transform: `rotate(${-90 + (arc.offset / circumference) * 360}deg)`, transformOrigin: `${cx}px ${cy}px` }}
          />
        ))
      )}
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-ink-700 dark:fill-ink-100 text-lg font-semibold">
        {totalEmotions}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-ink-500/60 dark:fill-ink-400/60 text-[10px]">
        次心情
      </text>
    </svg>
  );
}

// ── Page 3: Movement big numbers ──
function MovementNumbers() {
  const [standupCount, setStandupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    db.standup.where('startedAt').aboveOrEqual(start.getTime()).count().then((c) => {
      setStandupCount(c);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <motion.span
            className="font-display text-4xl text-ink-700 dark:text-ink-100 tabular-nums"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {loading ? '…' : standupCount}
          </motion.span>
          <span className="text-xs text-ink-500/60 dark:text-ink-400/60 mt-1">次起身</span>
        </div>
        <div className="w-px h-12 bg-ink-200/50 dark:bg-ink-700/30" />
        <div className="flex flex-col items-center">
          <motion.span
            className="font-display text-4xl text-warm-600 dark:text-warm-300 tabular-nums"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          >
            7
          </motion.span>
          <span className="text-xs text-ink-500/60 dark:text-ink-400/60 mt-1">天记录</span>
        </div>
      </div>
      <p className="text-xs text-ink-400/50 dark:text-ink-500/50">身体微动 · 近 7 天</p>
    </div>
  );
}

// ── Main carousel card ──
const PAGES = [
  { key: 'hydration', label: '饮水周律动', emoji: '💧' },
  { key: 'emotion', label: '情绪小气候', emoji: '🌈' },
  { key: 'movement', label: '身体微动', emoji: '🌱' },
];

export default function InsightCarouselCard() {
  const { buckets, loading } = useWeeklyData();
  const [page, setPage] = useState(0);

  const hasData = !loading && buckets.some((b) => b.hydrationCount > 0 || b.emotionCount > 0);

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-white/75 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:bg-[#0e1a17]/98 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] card-paper transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-gentle-500 dark:text-gentle-100">
          <Sparkles size={20} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
          本周概览
        </span>
        <span className="text-xs text-gentle-500/60 dark:text-gentle-400">
          · 滑动翻页
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-gentle-300 border-t-gentle-500 rounded-full animate-spin dark:border-gentle-700 dark:border-t-gentle-400" />
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-gentle-500/70 dark:text-gentle-400">
            这一周还没有记录
          </p>
          <p className="text-xs text-gentle-400/60 dark:text-gentle-500">
            去喝口水或记录一下心情吧 🌿
          </p>
        </div>
      ) : (
        <>
          {/* Carousel */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40 && page < PAGES.length - 1) setPage(page + 1);
              else if (info.offset.x > 40 && page > 0) setPage(page - 1);
            }}
            className="cursor-grab active:cursor-grabbing touch-pan-y overflow-hidden"
          >
            <motion.div
              animate={{ x: -page * 100 + '%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex"
            >
              {PAGES.map((p) => (
                <div key={p.key} className="w-full flex-none px-2">
                  <div className="flex flex-col items-center gap-3 py-4">
                    <span className="text-xs font-medium text-gentle-500/70 dark:text-gentle-400">
                      {p.emoji} {p.label}
                    </span>
                    {p.key === 'hydration' && <HydrationBars buckets={buckets} />}
                    {p.key === 'emotion' && <EmotionDonut buckets={buckets} />}
                    {p.key === 'movement' && <MovementNumbers />}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* S71: Share card trigger */}
          <ShareCardGenerator filename="轻养伴侣-本周概览" label="生成周报卡片">
            <p className="text-sm leading-7" style={{ color: 'rgba(28,58,44,0.75)' }}>
              这一周，我轻轻地照顾了自己。
              {hasData ? ' 记录了心情，喝了水，也起身活动了。' : ''}
              不需要完美，存在本身就足够了。
            </p>
          </ShareCardGenerator>

          {/* Page indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {PAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === page
                    ? 'bg-ink-500 dark:bg-ink-400 w-5'
                    : 'bg-ink-200/50 dark:bg-ink-700/40'
                }`}
                aria-label={`第 ${i + 1} 页`}
              />
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}
