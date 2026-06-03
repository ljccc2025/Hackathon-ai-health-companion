// #48: Weather-linked decorative particles

import SakuraPetals from './SakuraPetals';

const leafPaths = [
  'M16 2 Q3 16 16 36 Q29 16 16 2Z',
  'M14 5 Q2 18 14 34 Q26 18 14 5Z',
  'M18 3 Q4 17 18 38 Q32 17 18 3Z',
];

const leafConfigs = [
  { top: '8%', left: '3%', size: 28, delay: '0s', path: 0, rotate: -15 },
  { top: '55%', left: '4%', size: 30, delay: '5.0s', path: 0, rotate: -25 },
  { bottom: '15%', left: '3%', size: 32, delay: '3.2s', path: 1, rotate: -20 },
  { top: '6%', right: '4%', size: 34, delay: '1.2s', path: 1, rotate: 12 },
  { top: '65%', right: '2%', size: 26, delay: '2.0s', path: 1, rotate: 14 },
];

const dropConfigs = [
  { left: '3%', delay: '0s', size: 9 },
  { left: '7%', delay: '1.4s', size: 10 },
  { left: '5%', delay: '2.8s', size: 8 },
  { left: '10%', delay: '4.2s', size: 9 },
  { left: '94%', delay: '0.3s', size: 12 },
  { left: '90%', delay: '1.7s', size: 10 },
  { left: '96%', delay: '3.1s', size: 8 },
  { left: '92%', delay: '4.5s', size: 11 },
];

const starConfigs = [
  { top: '10%', left: '5%', size: 3, delay: '0s' },
  { top: '45%', left: '3%', size: 4, delay: '0.9s' },
  { top: '15%', right: '6%', size: 4, delay: '1.2s' },
  { top: '60%', right: '7%', size: 3, delay: '4.5s' },
];

function isRainCode(code: number): boolean {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
}

function isSnowCode(code: number): boolean {
  return code >= 71 && code <= 77;
}

function isClearCode(code: number): boolean {
  return code === 0;
}

function isFogCode(code: number): boolean {
  return code >= 45 && code <= 48;
}

interface Props {
  weatherCode?: number | null;
}

// #48: Weather-responsive particle configurations — generated once at module level
function generateRainDrops(): { left: string; delay: string; size: number }[] {
  const configs: { left: string; delay: string; size: number }[] = [];
  for (let i = 0; i < 10; i++) {
    configs.push({
      left: `${Math.random() * 96}%`,
      delay: `${(Math.random() * 2.5).toFixed(1)}s`,
      size: 6 + Math.random() * 8,
    });
  }
  return configs;
}

function generateSnowflakes(): { left: string; delay: string; size: number }[] {
  const configs: { left: string; delay: string; size: number }[] = [];
  for (let i = 0; i < 8; i++) {
    configs.push({
      left: `${Math.random() * 96}%`,
      delay: `${(Math.random() * 6).toFixed(1)}s`,
      size: 4 + Math.random() * 6,
    });
  }
  return configs;
}

function generateSparkles(): { top: string; left: string; delay: string; size: number; dur: number }[] {
  const configs: { top: string; left: string; delay: string; size: number; dur: number }[] = [];
  for (let i = 0; i < 6; i++) {
    configs.push({
      top: `${5 + Math.random() * 85}%`,
      left: `${Math.random() * 94}%`,
      delay: `${(Math.random() * 3).toFixed(1)}s`,
      size: 3 + Math.random() * 5,
      dur: 2 + Math.random() * 2,
    });
  }
  return configs;
}

// Pre-generate weather particle configs at module level (one-time, not during render)
const _rainDropConfigs = generateRainDrops();
const _snowConfigs = generateSnowflakes();
const _sunSparkleConfigs = generateSparkles();

export default function DecorativeElements({ weatherCode }: Props) {
  const weather = weatherCode ?? null;
  const showRain = weather !== null && isRainCode(weather);
  const showSnow = weather !== null && isSnowCode(weather);
  const showSunSpakle = weather !== null && isClearCode(weather);
  const isFog = weather !== null && isFogCode(weather);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Sakura petals — paper-ink style, always on */}
      <SakuraPetals />

      {/* Floating leaves */}
      {leafConfigs.map((cfg, i) => (
        <div
          key={`leaf-${i}`}
          className="absolute animate-float"
          style={{
            top: cfg.top,
            left: cfg.left,
            right: cfg.right,
            bottom: cfg.bottom,
            animationDelay: cfg.delay,
            animationDuration: isFog ? '8s' : undefined,
            opacity: isFog ? 0.55 : 0.35,
            transition: 'opacity 2s ease, animation-duration 2s ease',
          }}
        >
          <svg
            width={cfg.size}
            height={cfg.size * 1.4}
            viewBox="0 0 32 40"
            fill="none"
            style={{ transform: `rotate(${cfg.rotate}deg)` }}
          >
            <path
              d={leafPaths[cfg.path]}
              fill="currentColor"
              className="text-gentle-500 dark:text-gentle-100"
            />
            <path
              d={`M${14 + cfg.path * 2} ${4 + cfg.path}L${15 + cfg.path} ${34 - cfg.path * 2}`}
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-gentle-600/50 dark:text-gentle-100/90"
            />
          </svg>
        </div>
      ))}

      {/* Night stars */}
      {starConfigs.map((cfg, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-star-twinkle hidden dark:block"
          style={{
            top: cfg.top,
            left: cfg.left,
            right: cfg.right,
            animationDelay: cfg.delay,
            width: cfg.size,
            height: cfg.size,
          }}
        >
          <svg width={cfg.size} height={cfg.size} viewBox="0 0 10 10" fill="currentColor" className="text-gentle-100/30">
            <path d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88Z" />
          </svg>
        </div>
      ))}

      {/* #48: Rain drops — increased density + speed during rain weather */}
      {(showRain ? _rainDropConfigs : dropConfigs).map((cfg, i) => (
        <div
          key={`drop-${i}`}
          className="absolute"
          style={{
            left: cfg.left,
            top: '-30px',
            animationName: showRain ? 'rain-drop-heavy' : 'drop-fall',
            animationDuration: showRain ? '2s' : '4s',
            animationTimingFunction: 'ease-in',
            animationIterationCount: 'infinite',
            animationDelay: cfg.delay,
            opacity: 0,
          }}
        >
          <svg
            width={cfg.size}
            height={cfg.size * 1.6}
            viewBox="0 0 14 24"
            fill="currentColor"
            className={showRain ? 'text-gentle-500/80 dark:text-gentle-200/90' : 'text-gentle-400/60 dark:text-gentle-50/90'}
          >
            <path d="M7 0C7 6 1 12 1 17C1 21 4 24 7 24C10 24 13 21 13 17C13 12 7 6 7 0Z" />
          </svg>
        </div>
      ))}

      {/* #48: Snow particles — slower drift + rotation */}
      {showSnow &&
        _snowConfigs.map((cfg, i) => (
          <div
            key={`snow-${i}`}
            className="absolute"
            style={{
              left: cfg.left,
              top: '-20px',
              animationName: 'snow-drift',
              animationDuration: '7s',
              animationTimingFunction: 'ease-in',
              animationIterationCount: 'infinite',
              animationDelay: cfg.delay,
              opacity: 0,
            }}
          >
            <div
              className="rounded-full bg-paper-50/80 dark:bg-gentle-100/70"
              style={{
                width: cfg.size,
                height: cfg.size,
              }}
            />
          </div>
        ))}

      {/* #48: Sun sparkles for clear weather */}
      {showSunSpakle &&
        _sunSparkleConfigs.map((cfg, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              top: cfg.top,
              left: cfg.left,
              width: cfg.size,
              height: cfg.size,
              animationName: 'sun-sparkle',
              animationDuration: `${cfg.dur.toFixed(1)}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: cfg.delay,
            }}
          >
            <div
              className="rounded-full bg-warm-400/50 dark:bg-warm-300/35"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
    </div>
  );
}
