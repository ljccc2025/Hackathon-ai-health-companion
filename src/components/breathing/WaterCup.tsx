import { motion, AnimatePresence } from 'framer-motion';

/* ── #S1: Water cup SVG — fills from bottom as hydration count rises ── */

const CUP_TOP = 12;
const CUP_BOTTOM = 88;
const WATER_MAX_Y = CUP_BOTTOM - 3;
const WATER_MIN_Y = CUP_TOP + 2;

// Glass path — slightly tapered, soft rounded bottom
const GLASS_OUTER = 'M14 14 C14 11 17 9 20 9 L60 9 C63 9 66 11 66 14 L66 78 C66 86 58 92 50 92 L30 92 C22 92 14 86 14 78 Z';
// Water interior — inset by 2px from glass
const WATER_CLIP = 'M17 14 L17 77 C17 84 23 89 30 89 L50 89 C57 89 63 84 63 77 L63 14 Z';

// Pre-generated sparkle configurations (module-level, one-time random)
function makeSparkles() {
  const list: { id: number; x: number; y: number; delay: number; repeatDelay: number; wx: number; wy: number }[] = [];
  for (let i = 0; i < 5; i++) {
    list.push({
      id: i,
      x: 25 + Math.random() * 30,
      y: CUP_TOP - 6 - Math.random() * 14,
      delay: Math.random() * 1.2,
      repeatDelay: 2 + Math.random() * 2.5,
      wx: (Math.random() - 0.5) * 22,
      wy: -(Math.random() * 24 + 6),
    });
  }
  return list;
}
const _sparkles = makeSparkles();

interface Props {
  count: number;
  target: number;
  /** Key that changes when a drink is just recorded, to trigger splash */
  splashKey?: number;
}

export default function WaterCup({ count, target, splashKey }: Props) {
  const progress = Math.min(count / target, 1);
  const isFull = progress >= 1;

  // Water level Y — rises from bottom (CUP_BOTTOM) to top (CUP_TOP)
  const waterY = WATER_MAX_Y - (WATER_MAX_Y - WATER_MIN_Y) * progress;

  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        className="overflow-visible"
      >
        <defs>
          {/* Water clip path — water stays inside glass */}
          <clipPath id="water-clip">
            <path d={WATER_CLIP} />
          </clipPath>

          {/* Water gradient — deeper green at bottom, lighter at surface */}
          <linearGradient id="water-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--color-gentle-500)" stopOpacity="0.75" />
            <stop offset="60%" stopColor="var(--color-gentle-400)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-gentle-300)" stopOpacity="0.4" />
          </linearGradient>

          {/* Glass highlight — left edge reflection */}
          <linearGradient id="glass-hl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="15%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* ── Glass body ── */}
        <path
          d={GLASS_OUTER}
          fill="url(#glass-hl)"
          stroke="var(--color-gentle-400)"
          strokeOpacity="0.35"
          strokeWidth="1.2"
          className="dark:[--color-gentle-400:var(--color-gentle-500)]"
        />

        {/* ── Water fill ── */}
        <g clipPath="url(#water-clip)">
          {/* Main water body */}
          <motion.rect
            x="16"
            y={waterY}
            width="48"
            height={WATER_MAX_Y - waterY + 6}
            fill="url(#water-grad)"
            animate={{ y: waterY, height: WATER_MAX_Y - waterY + 6 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, mass: 0.6 }}
          />

          {/* Water surface ellipse */}
          <motion.ellipse
            cx="40"
            cy={waterY}
            rx="23"
            ry="3.5"
            fill="var(--color-gentle-300)"
            fillOpacity="0.5"
            className="animate-water-surface dark:[--color-gentle-300:var(--color-gentle-400)]"
            animate={{ cy: waterY }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, mass: 0.6 }}
          />
        </g>

        {/* ── Glass rim highlight ── */}
        <ellipse
          cx="40"
          cy={CUP_TOP}
          rx="23"
          ry="3"
          fill="none"
          stroke="var(--color-gentle-300)"
          strokeOpacity="0.3"
          strokeWidth="0.8"
        />

        {/* ── Full-cup overflow sparkles ── */}
        <AnimatePresence>
          {isFull &&
            _sparkles.map((s) => (
              <motion.circle
                key={s.id}
                cx={s.x}
                cy={s.y}
                r="2"
                fill="var(--color-gentle-400)"
                fillOpacity="0.6"
                className="animate-water-drop-burst"
                style={{
                  '--wx': `${s.wx}px`,
                  '--wy': `${s.wy}px`,
                  animationDelay: `${s.delay}s`,
                } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.4, 1.2, 0.3] }}
                transition={{
                  duration: 1.5,
                  delay: s.delay,
                  repeat: Infinity,
                  repeatDelay: s.repeatDelay,
                }}
              />
            ))}
        </AnimatePresence>

        {/* ── Splash ripple on new drink (splashKey changes) ── */}
        <AnimatePresence>
          {splashKey !== undefined && (
            <motion.ellipse
              key={`splash-${splashKey}`}
              cx="40"
              cy={waterY}
              rx="8"
              ry="2"
              fill="none"
              stroke="var(--color-gentle-300)"
              strokeOpacity="0.5"
              strokeWidth="1"
              initial={{ rx: 6, ry: 1, opacity: 0.7 }}
              animate={{ rx: 28, ry: 5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* ── Glass stem / base hint ── */}
        <rect
          x="34"
          y="91"
          width="12"
          height="3"
          rx="1.5"
          fill="var(--color-gentle-400)"
          fillOpacity="0.2"
        />
      </svg>
    </div>
  );
}
