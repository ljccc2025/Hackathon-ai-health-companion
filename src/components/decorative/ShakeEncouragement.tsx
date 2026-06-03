import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShakeEncouragementStore } from '../../store/shakeEncouragementStore';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const SHAKE_THRESHOLD = 25; // m/s²
const COOLDOWN_MS = 5000;
const DISPLAY_MS = 3000;

const GENTLE_SENTENCES = [
  '你已经做得很好了。',
  '休息一下也没关系。',
  '今天你照顾自己的次数比昨天多了一次。',
  '不需要完美，存在本身就足够了。',
  '你感受到的那些，都值得被温柔对待。',
  '停下来感受这一刻，你已经很勇敢了。',
  '没有人能一直向前，偶尔停一下也很好。',
  '你不需要和任何人比较，你走的这条路是你自己的。',
  '那些你觉得做不好的事，其实你已经尽力了。',
  '生活中总有不完美，但那也是你的一部分。',
  '此刻的你，已经很完整了。',
  '深呼吸，你已经做到了今天最重要的事——照顾自己。',
  '无论今天发生了什么，你都值得被温柔对待。',
  '小小的进步也是进步，你看到了吗？',
  '就算今天什么都没做，休息也是一种照顾自己的方式。',
  '别对自己太苛刻，你已经很棒了。',
];

function pickSentence(usedIndices: number[]): { text: string; index: number } {
  const available = GENTLE_SENTENCES
    .map((_, i) => i)
    .filter((i) => !usedIndices.includes(i));

  if (available.length === 0) {
    // All used — pick random, reset tracking
    const idx = Math.floor(Math.random() * GENTLE_SENTENCES.length);
    return { text: GENTLE_SENTENCES[idx], index: idx };
  }

  const idx = available[Math.floor(Math.random() * available.length)];
  return { text: GENTLE_SENTENCES[idx], index: idx };
}

export default function ShakeEncouragement() {
  const enabled = useShakeEncouragementStore((s) => s.enabled);
  const usedIndices = useShakeEncouragementStore((s) => s.usedIndices);
  const markUsed = useShakeEncouragementStore((s) => s.markUsed);
  const resetUsed = useShakeEncouragementStore((s) => s.resetUsed);
  const haptic = useHapticFeedback();

  const [visible, setVisible] = useState(false);
  const [sentence, setSentence] = useState('');
  const lastShake = useRef(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const showSentence = useCallback(() => {
    const now = Date.now();
    if (now - lastShake.current < COOLDOWN_MS) return;
    lastShake.current = now;

    const { text, index } = pickSentence(usedIndices);
    setSentence(text);
    setVisible(true);
    markUsed(index);

    // If all sentences used, reset tracking
    if (usedIndices.length + 1 >= GENTLE_SENTENCES.length) {
      resetUsed();
    }

    haptic.success();

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_MS);
  }, [usedIndices, markUsed, resetUsed, haptic]);

  useEffect(() => {
    if (!enabled) return;

    let prevX = 0;
    let prevY = 0;
    let prevZ = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const deltaX = Math.abs(x - prevX);
      const deltaY = Math.abs(y - prevY);
      const deltaZ = Math.abs(z - prevZ);
      prevX = x;
      prevY = y;
      prevZ = z;

      const total = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
      if (total > SHAKE_THRESHOLD) {
        showSentence();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, showSentence]);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-warm-100/90 dark:bg-[#1a1410]/95 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mx-6 max-w-sm text-center"
          >
            <p className="font-display text-2xl leading-relaxed text-warm-800 dark:text-warm-200">
              {sentence}
            </p>
            <p className="mt-6 text-xs text-warm-500/60 dark:text-warm-400/50">
              轻养伴侣 · 摇一摇
            </p>
            <p className="mt-1 text-[10px] text-warm-400/40 dark:text-warm-500/40">
              点击任意处关闭
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
