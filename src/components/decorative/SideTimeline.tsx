import { useEffect, useState } from 'react';
import { Droplets, StretchHorizontal } from 'lucide-react';
import { db } from '../../store/db';
import { useHydrationStore } from '../../store/hydrationStore';
import { useStandupStore } from '../../store/standupStore';

interface TimelineEntry {
  type: 'hydration' | 'standup';
  time: number;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getTodayRange(): [number, number] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return [start, end];
}

export default function SideTimeline() {
  const hydrationCount = useHydrationStore((s) => s.todayCount);
  const standupCount = useStandupStore((s) => s.todayCount);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    const [dayStart, dayEnd] = getTodayRange();
    Promise.all([
      db.hydration.where('timestamp').between(dayStart, dayEnd, true, false).toArray(),
      db.standup.where('startedAt').between(dayStart, dayEnd, true, false).toArray(),
    ]).then(([hydrations, standups]) => {
      const merged: TimelineEntry[] = [
        ...hydrations.map((h) => ({ type: 'hydration' as const, time: h.timestamp })),
        ...standups.map((s) => ({ type: 'standup' as const, time: s.completedAt })),
      ].sort((a, b) => a.time - b.time);
      setEntries(merged);
    });
  }, [hydrationCount, standupCount]);

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block fixed top-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: 'calc(50% - 24rem - 88px)', zIndex: 5 }}
    >
      {entries.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-1 select-none">
          <div
            className="w-px h-10 rounded-full"
            style={{ background: 'rgba(166,214,195,0.2)' }}
          />
          <div
            className="w-[5px] h-[5px] rounded-full"
            style={{ background: 'rgba(166,214,195,0.3)', boxShadow: '0 0 8px rgba(166,214,195,0.18)' }}
          />
          <div
            className="w-px h-10 rounded-full"
            style={{ background: 'rgba(166,214,195,0.2)' }}
          />
          <span className="text-[10px] mt-1 tracking-[0.1em]" style={{ color: 'rgba(46,112,90,0.4)' }}>
            等待开始
          </span>
        </div>
      ) : (
        /* Active timeline — show at most 6 most recent entries */
        (() => {
          const MAX_VISIBLE = 6;
          const hasMore = entries.length > MAX_VISIBLE;
          const visible = entries.slice(-MAX_VISIBLE);

          return (
            <div className="flex flex-col items-center">
              {/* #1 overflow indicator — older entries hidden */}
              {hasMore && (
                <span
                  className="text-[10px] tracking-[0.15em] select-none pb-0.5"
                  style={{ color: 'rgba(46,112,90,0.35)' }}
                >
                  ···
                </span>
              )}

              {visible.map((entry, i) => {
                const isHydration = entry.type === 'hydration';
                const isLast = i === visible.length - 1;
                const Icon = isHydration ? Droplets : StretchHorizontal;
                const dotColor = isHydration ? '#4ea387' : '#f5973b';
                const glowColor = isHydration
                  ? 'rgba(78,163,135,0.3)'
                  : 'rgba(245,151,59,0.3)';

                return (
                  <div key={`${entry.type}-${entry.time}`} className="flex flex-col items-center">
                    {/* Row: time label → dot */}
                    <div className="flex items-center gap-2 py-1">
                      <span
                        className="text-[10px] font-medium tracking-tight w-[34px] text-right select-none leading-none"
                        style={{ color: 'rgba(46,112,90,0.6)' }}
                      >
                        {formatTime(entry.time)}
                      </span>

                      {/* Dot with glow */}
                      <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
                        <div
                          className="absolute rounded-full blur-[4px]"
                          style={{ width: 18, height: 18, background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
                        />
                        <Icon
                          size={11}
                          strokeWidth={2}
                          style={{ color: dotColor, position: 'relative' }}
                        />
                      </div>
                    </div>

                    {/* Connecting line between dots */}
                    {!isLast && (
                      <div
                        className="w-px rounded-full"
                        style={{
                          height: 20,
                          background: 'linear-gradient(rgba(166,214,195,0.35), rgba(166,214,195,0.12))',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()
      )}
    </div>
  );
}
