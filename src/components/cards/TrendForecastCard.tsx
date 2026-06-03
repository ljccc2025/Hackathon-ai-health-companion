import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { db } from '../../store/db';

interface ForecastPoint {
  dayLabel: string;
  hydration: number;
  emotion: number;
  standup: number;
  isForecast: boolean;
}

const W = 280; const H = 100;
const PAD_L = 24; const PAD_B = 18; const PAD_T = 8;

function sma3(values: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const slice = values.slice(Math.max(0, i - 2), i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

function forecastNext(values: number[], count: number): number[] {
  if (values.length < 3) return Array(count).fill(values[values.length - 1] ?? 0);
  const smoothed = sma3(values);
  const last = smoothed[smoothed.length - 1];
  const prev = smoothed[smoothed.length - 2] ?? last;
  const trend = last - prev;
  return Array.from({ length: count }, (_, i) => Math.max(0, Math.round(last + trend * (i + 1))));
}

export default function TrendForecastCard() {
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const now = new Date();
    const days: { date: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('zh-CN', { weekday: 'short' }).replace('周', ''),
      });
    }

    Promise.all(
      days.map(async (d) => {
        const dStart = new Date(d.date + 'T00:00:00').getTime();
        const dEnd = new Date(d.date + 'T23:59:59').getTime();
        const [hydRows, emoRows, stdRows] = await Promise.all([
          db.hydration.where('timestamp').between(dStart, dEnd, true, true).count(),
          db.moodTreeHole.where('createdAt').between(dStart, dEnd, true, true).count(),
          db.standup.where('startedAt').between(dStart, dEnd, true, true).count(),
        ]);
        return { dayLabel: d.label, hydration: hydRows, emotion: emoRows, standup: stdRows };
      }),
    ).then((historical) => {
      const hydVals = historical.map((h) => h.hydration);
      const emoVals = historical.map((h) => h.emotion);
      const stdVals = historical.map((h) => h.standup);

      const hydForecast = forecastNext(hydVals, 3);
      const emoForecast = forecastNext(emoVals, 3);
      const stdForecast = forecastNext(stdVals, 3);

      const forecastLabels = ['明', '后', '大后'];

      const result: ForecastPoint[] = [
        ...historical.map((h) => ({ ...h, isForecast: false })),
        ...forecastLabels.map((l, i) => ({
          dayLabel: l,
          hydration: hydForecast[i],
          emotion: emoForecast[i],
          standup: stdForecast[i],
          isForecast: true,
        })),
      ];

      setPoints(result);
      setHasData(historical.some((h) => h.hydration > 0 || h.emotion > 0 || h.standup > 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const visiblePoints = points;
  const maxHyd = Math.max(...visiblePoints.map((p) => p.hydration), 1);

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-white/75 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:bg-[#0e1a17]/98 card-paper"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <TrendingUp size={20} strokeWidth={1.5} className="text-gentle-500 dark:text-gentle-300" />
        <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">未来趋势</span>
        <span className="text-[10px] text-gentle-400/50 dark:text-gentle-400">· 仅供参考</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-gentle-300 border-t-gentle-500 rounded-full animate-spin" />
        </div>
      ) : !hasData ? (
        <p className="text-xs text-center text-gentle-400/60 dark:text-gentle-400 py-6">数据还不够，再记录几天就能看到趋势了 🌱</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto" role="img" aria-label="趋势预测图">
            {/* Grid line at center */}
            <line x1={PAD_L} y1={H - PAD_B - 30} x2={W - 8} y2={H - PAD_B - 30} stroke="rgba(28,58,44,0.06)" strokeWidth="0.5" strokeDasharray="2 3" />

            {/* Historical line */}
            <polyline
              points={visiblePoints
                .filter((p) => !p.isForecast)
                .map((p, idx) => {
                  const x = PAD_L + (idx / 6) * (W - PAD_L - 12);
                  const y = H - PAD_B - (p.hydration / maxHyd) * (H - PAD_T - PAD_B);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="rgba(73,130,104,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Forecast dashed line */}
            {visiblePoints.filter((p) => p.isForecast).length > 0 && (
              <polyline
                points={visiblePoints
                  .filter((p) => p.isForecast)
                  .map((p, idx) => {
                    const x = PAD_L + ((idx + 7) / 9) * (W - PAD_L - 12);
                    const y = H - PAD_B - (p.hydration / maxHyd) * (H - PAD_T - PAD_B);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="rgba(73,130,104,0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
            )}

            {/* Dots */}
            {visiblePoints.map((p, idx) => {
              const x = PAD_L + (idx / 9) * (W - PAD_L - 12);
              const y = H - PAD_B - (p.hydration / maxHyd) * (H - PAD_T - PAD_B);
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r={p.isForecast ? 2.5 : 3.5} fill={p.isForecast ? 'rgba(73,130,104,0.25)' : 'rgba(73,130,104,0.7)'} />
                  <text x={x} y={H - 3} textAnchor="middle" className="fill-ink-400/50 dark:fill-ink-500/50 text-[8px]">{p.dayLabel}</text>
                </g>
              );
            })}
          </svg>

          <p className="mt-3 text-[10px] text-center text-gentle-400/50 dark:text-gentle-400 leading-relaxed">
            如果按现在的节奏，未来几天的喝水趋势<span className="text-gentle-500/70">可能</span>会这样。
            虚线只是温柔的参考，不是目标。
          </p>
        </>
      )}
    </motion.section>
  );
}
