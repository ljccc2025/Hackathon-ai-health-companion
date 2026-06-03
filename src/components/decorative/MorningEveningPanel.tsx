import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Heart, X, Minus, Plus } from 'lucide-react';
import { useCompanionStore } from '../../store/companionStore';
import { useHydrationStore } from '../../store/hydrationStore';
import { useAchievementStore } from '../../store/achievementStore';
import { useWhiteNoiseStore } from '../../store/whiteNoiseStore';

type PanelType = 'morning' | 'evening' | null;

/** S55: Full-screen dawn/dusk gradient overlay — 3s transition */
const DAWN_GRADIENT =
  'radial-gradient(ellipse at 50% 120%, rgba(245,151,59,0.28) 0%, rgba(245,151,59,0.12) 30%, rgba(155,187,168,0.06) 60%, rgba(15,25,35,0.45) 100%)';
const DUSK_GRADIENT =
  'radial-gradient(ellipse at 50% 120%, rgba(245,151,59,0.32) 0%, rgba(216,92,126,0.18) 35%, rgba(73,130,104,0.10) 65%, rgba(15,18,20,0.50) 100%)';
const OFF_GRADIENT = 'transparent';

export default function MorningEveningPanel() {
  const [panel, setPanel] = useState<PanelType>(null);
  const [dismissed, setDismissed] = useState(false);
  const [waterGoal, setWaterGoal] = useState(5);
  const [eveningAnswer, setEveningAnswer] = useState<boolean | null>(null);
  const [overlayPhase, setOverlayPhase] = useState<'off' | 'rising' | 'on' | 'fading'>('off');
  const overlayTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastPanel = useRef<PanelType>(null); // S55: track last panel for correct fade-out gradient

  const recordDrink = useHydrationStore((s) => s.recordDrink);
  const triggerAchievement = useAchievementStore((s) => s.trigger);

  // Check time every 30s
  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      const today = new Date().toDateString();
      const lastDismissed = localStorage.getItem('panel-dismissed');
      const parsed = lastDismissed ? JSON.parse(lastDismissed) : {};
      if (parsed.date !== today) {
        setDismissed(false);
      }
      if (dismissed) return;

      if (hour >= 5 && hour < 12 && parsed.type !== 'morning') {
        setPanel('morning');
      } else if (hour >= 18 && hour < 23 && parsed.type !== 'evening') {
        setPanel('evening');
      } else {
        setPanel(null);
      }
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [dismissed]);

  // S55: Overlay phase lifecycle — dawn rising / dusk fading
  useEffect(() => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    if (panel) {
      lastPanel.current = panel;
      setOverlayPhase('rising');
      overlayTimer.current = setTimeout(() => {
        setOverlayPhase('on');
      }, 800);
    } else {
      setOverlayPhase('fading');
      overlayTimer.current = setTimeout(() => {
        setOverlayPhase('off');
        lastPanel.current = null;
      }, 3000);
    }
    return () => {
      if (overlayTimer.current) clearTimeout(overlayTimer.current);
    };
  }, [panel]);

  // S55: Auto-fade white noise on evening panel open
  useEffect(() => {
    if (panel === 'evening') {
      const store = useWhiteNoiseStore.getState();
      if (!store.active) {
        store.toggle();
      }
    }
  }, [panel]);

  const handleDismiss = useCallback(() => {
    const today = new Date().toDateString();
    localStorage.setItem('panel-dismissed', JSON.stringify({ date: today, type: panel }));
    setDismissed(true);
    setPanel(null);
    setEveningAnswer(null);
  }, [panel]);

  const handleMorningConfirm = useCallback(() => {
    const count = Math.min(waterGoal, 20);
    // Record initial sips based on goal to give a gentle start
    for (let i = 0; i < Math.min(count, 1); i++) {
      recordDrink(Date.now());
    }
    triggerAchievement('hydration');
    handleDismiss();
  }, [waterGoal, recordDrink, triggerAchievement, handleDismiss]);

  const activePanelType = panel ?? lastPanel.current;
  const overlayGradient =
    overlayPhase === 'off'
      ? OFF_GRADIENT
      : activePanelType === 'morning'
        ? DAWN_GRADIENT
        : DUSK_GRADIENT;

  return (
    <AnimatePresence>
      {/* S55: Full-screen dawn/dusk gradient overlay */}
      {(panel || overlayPhase !== 'off') && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: overlayGradient,
            opacity: overlayPhase === 'rising' ? 0 : overlayPhase === 'fading' ? 0 : overlayPhase === 'on' ? 1 : 0,
            transition: overlayPhase === 'rising'
              ? 'opacity 0.8s ease-out'
              : overlayPhase === 'fading'
                ? 'opacity 3s ease-in'
                : 'opacity 0.5s ease',
          }}
        />
      )}

      {panel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-end justify-center pb-10 sm:items-center sm:pb-0"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-ink-200/50 dark:border-ink-700/40 bg-gradient-to-br from-gentle-200/98 via-white/96 to-gentle-100/94 p-6 shadow-[0_30px_70px_-30px_rgba(28,58,44,0.42)] backdrop-blur-2xl dark:border-white/12 dark:from-[#10211d] dark:via-[#132720] dark:to-[#0e1c18] dark:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.52)]"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gentle-400/80 hover:text-gentle-600 hover:bg-gentle-200/60 dark:text-gentle-500/70 dark:hover:text-gentle-300 dark:hover:bg-gentle-700/50 transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {panel === 'morning' && (
              <div className="flex flex-col items-center gap-5 text-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="text-4xl"
                >
                  ☀️
                </motion.div>
                <div>
                  <h3 className="text-xl font-medium text-gentle-800 dark:text-gentle-50">
                    早安
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gentle-600/80 dark:text-gentle-100/90">
                    新的一天开始了。今天想喝几杯水？
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setWaterGoal((g) => Math.max(1, g - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gentle-200/60 bg-paper-50/60 text-gentle-600 hover:bg-gentle-200/70 dark:border-gentle-700/40 dark:bg-gentle-800/50 dark:text-gentle-100 dark:hover:bg-gentle-700/60 transition-colors"
                  >
                    <Minus size={18} strokeWidth={1.5} />
                  </motion.button>

                  <motion.span
                    key={waterGoal}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-light tabular-nums text-gentle-800 dark:text-gentle-50"
                  >
                    {waterGoal}
                  </motion.span>
                  <span className="text-sm text-gentle-500/70 dark:text-gentle-400/70">杯</span>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setWaterGoal((g) => Math.min(20, g + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gentle-200/60 bg-paper-50/60 text-gentle-600 hover:bg-gentle-200/70 dark:border-gentle-700/40 dark:bg-gentle-800/50 dark:text-gentle-100 dark:hover:bg-gentle-700/60 transition-colors"
                  >
                    <Plus size={18} strokeWidth={1.5} />
                  </motion.button>
                </div>

                <motion.button
                  type="button"
                  onClick={handleMorningConfirm}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gentle-500/90 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gentle-500 transition-colors dark:bg-gentle-400/85 dark:text-gentle-900 dark:hover:bg-gentle-400"
                >
                  <Coffee size={15} strokeWidth={1.5} />
                  好的，开始今天
                </motion.button>
              </div>
            )}

            {panel === 'evening' && (
              <div className="flex flex-col items-center gap-5 text-center">
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-4xl"
                >
                  🌙
                </motion.div>
                <div>
                  <h3 className="text-xl font-medium text-gentle-800 dark:text-gentle-50">
                    晚安
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gentle-600/80 dark:text-gentle-100/90">
                    今天对自己温柔了吗？
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setEveningAnswer(true);
                      setTimeout(handleDismiss, 1200);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                      eveningAnswer === true
                        ? 'bg-gentle-500/90 text-white dark:bg-gentle-400/85 dark:text-gentle-900'
                        : 'bg-gentle-200/80 text-gentle-700 hover:bg-gentle-300/80 dark:bg-gentle-700/60 dark:text-gentle-100 dark:hover:bg-gentle-600/60'
                    }`}
                  >
                    <Heart size={15} strokeWidth={1.5} />
                    嗯，有温柔
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setEveningAnswer(false);
                      setTimeout(handleDismiss, 1200);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                      eveningAnswer === false
                        ? 'bg-blossom-400/90 text-white dark:bg-blossom-500/80 dark:text-blossom-50'
                        : 'bg-blossom-100/70 text-blossom-600 hover:bg-blossom-200/70 dark:bg-blossom-800/50 dark:text-blossom-100 dark:hover:bg-blossom-700/50'
                    }`}
                  >
                    <Coffee size={15} strokeWidth={1.5} />
                    明天会更好
                  </motion.button>
                </div>

                {eveningAnswer !== null && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gentle-500/80 dark:text-gentle-400/80"
                  >
                    {eveningAnswer
                      ? '你做得很好，今晚安心休息吧。'
                      : '没关系，明天又是新的一天。今晚先好好睡。'}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
