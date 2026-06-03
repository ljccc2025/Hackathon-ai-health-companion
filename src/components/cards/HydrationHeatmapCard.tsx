import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { useWeeklyData } from '../../hooks/useWeeklyData';

function intensityColor(count: number): { light: string; dark: string } {
  if (count === 0) return { light: 'fill-gentle-100/70', dark: 'dark:fill-gentle-800/50' };
  if (count <= 2) return { light: 'fill-gentle-300/80', dark: 'dark:fill-gentle-600/60' };
  if (count <= 4) return { light: 'fill-gentle-400/80', dark: 'dark:fill-gentle-500/70' };
  if (count <= 7) return { light: 'fill-gentle-500/85', dark: 'dark:fill-gentle-400/80' };
  return { light: 'fill-gentle-600/90', dark: 'dark:fill-gentle-300/90' };
}

const CELL = 32;
const GAP = 6;
const ROWS = 7;
const COLS = 7;
const LABEL_X = 24;  // weekday labels text-anchor="end" x
const GRID_LEFT = 34; // grid cells left edge
const GRID_TOP = 24;  // 增加顶部空间，避免内容被裁剪
const ROW_STEP = CELL + GAP; // 38
const GRID_W = COLS * ROW_STEP - GAP; // 260
const GRID_H = ROWS * ROW_STEP - GAP; // 260
const LEGEND_H = 26;
const SVG_W = GRID_LEFT + GRID_W + 32;  // 增加右侧空间显示喝水次数
const SVG_H = GRID_TOP + GRID_H + LEGEND_H;

export default function HydrationHeatmapCard() {
  const { buckets, loading } = useWeeklyData();
  const ready = !loading && buckets.length === 7;

  const maxCount = ready
    ? Math.max(1, ...buckets.map((b) => b.hydrationCount))
    : 1;

  const grid: { dayIdx: number; hourBucket: number; count: number }[] = [];
  if (ready) {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const d = buckets[dayIdx];
      for (let h = 0; h < COLS; h++) {
        grid.push({
          dayIdx,
          hourBucket: h,
          count: d.hydrationCount > 0 && h < Math.min(COLS, d.hydrationCount)
            ? Math.max(1, Math.ceil(d.hydrationCount / COLS))
            : 0,
        });
      }
    }
  }

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-gentle-200/70 dark:bg-[#0c1a16]/98 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.58)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-50">
            <Droplets size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
            喝水周热力图
          </span>
          {!loading && (
            <span className="text-xs text-gentle-600/70 dark:text-gentle-300">
              · 本周共 {buckets.reduce((s, b) => s + b.hydrationCount, 0)} 次
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-gentle-300 border-t-gentle-500 rounded-full animate-spin dark:border-gentle-700 dark:border-t-gentle-400" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full min-w-[300px] max-w-lg mx-auto"
              role="img"
              aria-label="喝水周热力图"
            >
              {/* Day labels — vertically centered within each row */}
              {buckets.map((b, i) => {
                const cellY = GRID_TOP + i * ROW_STEP;
                const labelY = cellY + CELL / 2 + 3.5; // baseline adjust for 10px text
                return (
                  <g key={`lbl-${i}`}>
                    <text
                      x={LABEL_X}
                      y={labelY}
                      className="fill-gentle-500/80 dark:fill-gentle-300/80 text-[10px]"
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {b.dayLabel}
                    </text>
                    {/* 显示每天喝水次数 */}
                    <text
                      x={GRID_LEFT + GRID_W + 8}
                      y={labelY}
                      className="fill-gentle-600/70 dark:fill-gentle-400/70 text-[9px]"
                      textAnchor="start"
                      dominantBaseline="middle"
                    >
                      {b.hydrationCount > 0 ? `${b.hydrationCount}` : ''}
                    </text>
                  </g>
                );
              })}

              {/* Cells */}
              {grid.map((cell, idx) => {
                const actualCount = buckets[cell.dayIdx]?.hydrationCount ?? 0;
                const cellFilled = actualCount > 0 && cell.hourBucket < Math.min(COLS, actualCount);
                const colors = intensityColor(cellFilled ? Math.max(1, Math.ceil(actualCount / COLS)) : 0);
                const x = GRID_LEFT + cell.hourBucket * ROW_STEP;
                const y = GRID_TOP + cell.dayIdx * ROW_STEP;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx={6}
                    className={`${colors.light} ${colors.dark} transition-colors duration-300`}
                  />
                );
              })}

              {/* Legend */}
              <text
                x={GRID_LEFT}
                y={GRID_TOP + GRID_H + 14}
                className="fill-gentle-400/70 dark:fill-gentle-400/80 text-[9px]"
              >
                少 → 多
              </text>
              {[0, 2, 4, 7, Math.max(8, maxCount)].map((v, i) => {
                const colors = intensityColor(v);
                return (
                  <rect
                    key={`leg-${i}`}
                    x={GRID_LEFT + 44 + i * (CELL / 2 + 4)}
                    y={GRID_TOP + GRID_H + 6}
                    width={CELL / 2}
                    height={CELL / 2}
                    rx={3}
                    className={`${colors.light} ${colors.dark}`}
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </motion.section>
  );
}
