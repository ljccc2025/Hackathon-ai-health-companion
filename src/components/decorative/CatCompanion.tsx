import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHydrationStore } from '../../store/hydrationStore';
import { useStandupStore } from '../../store/standupStore';

type CatMood = 'idle' | 'happy' | 'worried' | 'sleepy';

const VIDEO_MAP: Record<Exclude<CatMood, 'idle'>, string> = {
  happy: '/cat/喝了水.mp4',
  worried: '/cat/小猫催喝水.mp4',
  sleepy: '/cat/小猫睡觉.mp4',
};

export default function CatCompanion() {
  const hydrationCount = useHydrationStore((s) => s.todayCount);
  const standupPhase = useStandupStore((s) => s.phase);
  const focusStartedAt = useStandupStore((s) => s.focusStartedAt);

  const [mood, setMood] = useState<CatMood>('idle');
  const [bubble, setBubble] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const prevHydration = useRef(hydrationCount);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hour = new Date().getHours();
  const isEvening = hour >= 19 || hour < 6;
  const showVideo = mood !== 'idle';

  const clearMoodTimer = useCallback(() => {
    if (moodTimer.current) {
      clearTimeout(moodTimer.current);
      moodTimer.current = null;
    }
  }, []);

  const revertToBase = useCallback(() => {
    clearMoodTimer();
    setMood(isEvening ? 'sleepy' : 'idle');
    setBubble(null);
  }, [clearMoodTimer, isEvening]);

  const setReactiveMood = useCallback(
    (newMood: CatMood, text: string, duration = 5000) => {
      clearMoodTimer();
      setMood(newMood);
      setBubble(text);
      // Play video from start
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      moodTimer.current = setTimeout(() => {
        revertToBase();
      }, duration);
    },
    [clearMoodTimer, revertToBase],
  );

  // Detect hydration
  useEffect(() => {
    if (hydrationCount > prevHydration.current) {
      setReactiveMood('happy', 'Nice!');
    }
    prevHydration.current = hydrationCount;
  }, [hydrationCount, setReactiveMood]);

  // Detect standup reminder
  useEffect(() => {
    if (standupPhase === 'reminding') {
      setReactiveMood('worried', '该起身啦~');
    }
  }, [standupPhase, setReactiveMood]);

  // Poll for sitting > 1 hour
  useEffect(() => {
    if (!focusStartedAt) return;
    const interval = setInterval(() => {
      if (Date.now() - focusStartedAt > 60 * 60 * 1000) {
        setReactiveMood('worried', '该起身啦~');
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [focusStartedAt, setReactiveMood]);

  // Evening mode
  useEffect(() => {
    if (isEvening && mood === 'idle') {
      setMood('sleepy');
    } else if (!isEvening && mood === 'sleepy') {
      setMood('idle');
    }
  }, [isEvening, mood]);

  // Blink timer (only when SVG is showing)
  useEffect(() => {
    if (showVideo) return;
    const schedule = () => {
      const delay = 2000 + Math.random() * 4000;
      blinkTimer.current = setTimeout(() => {
        if (!mounted.current) return;
        setBlink(true);
        blinkTimer.current = setTimeout(() => {
          if (!mounted.current) return;
          setBlink(false);
          schedule();
        }, 150);
      }, delay);
    };
    schedule();
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, [showVideo]);

  // Cleanup
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearMoodTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When mood changes to reactive, play the video
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [mood, showVideo]);

  // Video ended — revert to base (for happy/worried)
  const handleVideoEnded = useCallback(() => {
    if (mood === 'happy' || mood === 'worried') {
      revertToBase();
    }
    // Sleepy keeps playing
  }, [mood, revertToBase]);

  const isWorried = mood === 'worried';
  const isHappy = mood === 'happy';

  // SVG cat (idle fallback) — shown when no video is playing
  const svgCat = !showVideo && (
    <motion.svg
      width={72}
      height={72}
      viewBox="0 0 80 80"
      fill="none"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx={40} cy={54} rx={22} ry={18} fill="#f7e3c0" stroke="#d4b896" strokeWidth={1} />
      <path d="M58 58 Q70 48 66 38 Q63 30 58 34" stroke="#d4b896" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
      <circle cx={40} cy={30} r={17} fill="#f7e3c0" stroke="#d4b896" strokeWidth={1} />
      <path d="M27 20 L22 5 L35 16Z" fill="#f0d9b0" stroke="#d4b896" strokeWidth={1} strokeLinejoin="round" />
      <path d="M28 19 L24 9 L33 17Z" fill="rgba(232,180,150,0.5)" />
      <path d="M53 20 L58 5 L45 16Z" fill="#f0d9b0" stroke="#d4b896" strokeWidth={1} strokeLinejoin="round" />
      <path d="M52 19 L56 9 L47 17Z" fill="rgba(232,180,150,0.5)" />
      {blink ? (
        <>
          <line x1={30} y1={30} x2={36} y2={30} stroke="#5a4030" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={44} y1={30} x2={50} y2={30} stroke="#5a4030" strokeWidth={1.8} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={33} cy={29} r={3.2} fill="#3a2820" />
          <circle cx={34} cy={28} r={1} fill="white" />
          <circle cx={47} cy={29} r={3.2} fill="#3a2820" />
          <circle cx={48} cy={28} r={1} fill="white" />
        </>
      )}
      <path d="M39 34 L41 34 L40 36Z" fill="#e8a0a0" />
      <path d="M37 37 Q38.5 36 40 37" stroke="#5a4030" strokeWidth={1} strokeLinecap="round" fill="none" />
      <path d="M40 37 Q41.5 36 43 37" stroke="#5a4030" strokeWidth={1} strokeLinecap="round" fill="none" />
      <line x1={16} y1={30} x2={26} y2={32} stroke="#c4a882" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={15} y1={34} x2={25} y2={34} stroke="#c4a882" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={16} y1={38} x2={26} y2={36} stroke="#c4a882" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={64} y1={30} x2={54} y2={32} stroke="#c4a882" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={65} y1={34} x2={55} y2={34} stroke="#c4a882" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={64} y1={38} x2={54} y2={36} stroke="#c4a882" strokeWidth={0.7} strokeLinecap="round" />
      <ellipse cx={32} cy={65} rx={7} ry={5} fill="#f5dbb8" stroke="#d4b896" strokeWidth={0.8} />
      <ellipse cx={48} cy={65} rx={7} ry={5} fill="#f5dbb8" stroke="#d4b896" strokeWidth={0.8} />
      {[29,32,35,45,48,51].map((x) => (
        <line key={x} x1={x} y1={67} x2={x} y2={69} stroke="#d4b896" strokeWidth={0.5} strokeLinecap="round" />
      ))}
    </motion.svg>
  );

  return (
    <div
      className="hidden lg:block fixed pointer-events-none select-none"
      style={{ left: 'calc(50% - 24rem - 86px)', top: '14%', zIndex: 5 }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-medium shadow-sm"
            style={{
              background: 'rgba(255,255,255,0.85)',
              color: '#2e705a',
              border: '1px solid rgba(207,233,221,0.5)',
            }}
          >
            {bubble}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5"
              style={{
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid rgba(255,255,255,0.85)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat display — SVG idle or AI video */}
      <AnimatePresence mode="wait">
        {showVideo ? (
          <motion.div
            key="video"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-2xl"
            style={{ width: 80, height: 80 }}
          >
            <video
              ref={videoRef}
              src={VIDEO_MAP[mood]}
              autoPlay
              muted
              playsInline
              loop={mood === 'sleepy'}
              onEnded={handleVideoEnded}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="svg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isWorried
                ? { opacity: 1, x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 } }
                : isHappy
                  ? { opacity: 1, scale: [1, 1.08, 1], transition: { duration: 0.4, ease: 'easeOut' } }
                  : { opacity: 1 }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {svgCat}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
