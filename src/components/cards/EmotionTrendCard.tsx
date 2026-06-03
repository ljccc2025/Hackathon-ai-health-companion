import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useWeeklyData } from '../../hooks/useWeeklyData';

const CHART_W = 320;
const CHART_H = 120;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 14;
const PAD_B = 22;

export default function EmotionTrendCard() {
  const { buckets, loading } = useWeeklyData();

  const emotionData = buckets.filter((b) => b.emotionCount > 0);
  const hasData = emotionData.length > 0;

  function points() {
    if (!hasData) return '';
    const w = CHART_W - PAD_L - PAD_R;
    const h = CHART_H - PAD_T - PAD_B;
    return emotionData
      .map((b, i) => {
        const x = hasData > 1 ? PAD_L + (i / (emotionData.length - 1)) * w : PAD_L + w / 2;
        const y = PAD_T + h - ((b.emotionIntensityAvg - 1) / 4) * h;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  function smoothPath() {
    if (!hasData || emotionData.length < 2) return points();
    const w = CHART_W - PAD_L - PAD_R;
    const h = CHART_H - PAD_T - PAD_B;
    const pts = emotionData.map((b, i) => ({
      x: PAD_L + (i / (emotionData.length - 1)) * w,
      y: PAD_T + h - ((b.emotionIntensityAvg - 1) / 4) * h,
    }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 3;
      const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) / 3;
      d += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  }

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 dark:bg-[#15111a]/98 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.58)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-50">
            <Sparkles size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
            情绪趋势
          </span>
          {!loading && (
            <span className="text-xs text-gentle-600/70 dark:text-gentle-300">
              · 近 7 天情绪强度变化
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-gentle-300 border-t-gentle-500 rounded-full animate-spin dark:border-gentle-700 dark:border-t-gentle-400" />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-gentle-500/70 dark:text-gentle-300">
              还没有情绪记录
            </p>
            <p className="text-xs text-gentle-400/60 dark:text-gentle-400">
              去情绪树洞放下一些感受，这里会慢慢长出温柔的曲线
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="w-full min-w-[300px] max-w-lg mx-auto"
              role="img"
              aria-label="情绪趋势折线图"
            >
              {/* Grid lines */}
              {[1, 2, 3, 4, 5].map((level) => {
                const y = PAD_T + CHART_H - PAD_B - ((level - 1) / 4) * (CHART_H - PAD_T - PAD_B);
                return (
                  <line
                    key={`grid-${level}`}
                    x1={PAD_L}
                    y1={y}
                    x2={CHART_W - PAD_R}
                    y2={y}
                    className="stroke-gentle-200/50 dark:stroke-gentle-700/30"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Y axis labels */}
              <text x={PAD_L} y={PAD_T - 2} className="fill-gentle-400/70 dark:fill-gentle-400/80 text-[8px]">强 5</text>
              <text x={PAD_L} y={CHART_H - PAD_B + 2} className="fill-gentle-400/70 dark:fill-gentle-400/80 text-[8px]">弱 1</text>

              {/* Area fill */}
              {emotionData.length >= 2 && (
                <path
                  d={`${smoothPath()} L ${PAD_L + (CHART_W - PAD_L - PAD_R)} ${CHART_H - PAD_B} L ${PAD_L} ${CHART_H - PAD_B} Z`}
                  className="fill-blossom-200/25 dark:fill-blossom-400/8"
                />
              )}

              {/* Line */}
              <path
                d={smoothPath()}
                fill="none"
                className="stroke-blossom-400 dark:stroke-blossom-300/80"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points + day labels */}
              {emotionData.map((b, i) => {
                const w = CHART_W - PAD_L - PAD_R;
                const h = CHART_H - PAD_T - PAD_B;
                const x = emotionData.length > 1 ? PAD_L + (i / (emotionData.length - 1)) * w : PAD_L + w / 2;
                const y = PAD_T + h - ((b.emotionIntensityAvg - 1) / 4) * h;
                return (
                  <g key={`pt-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-white dark:fill-[#1a1218] stroke-blossom-400 dark:stroke-blossom-300/80"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={CHART_H - 4}
                      className="fill-gentle-500/70 dark:fill-gentle-300/80 text-[9px]"
                      textAnchor="middle"
                    >
                      {b.dayLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </motion.section>
  );
}
