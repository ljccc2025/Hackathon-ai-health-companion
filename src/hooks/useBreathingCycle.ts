import { useState, useCallback, useRef, useEffect } from 'react';

export type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathStep {
  phase: BreathPhase;
  label: string;
  color: string;
  darkColor: string;
}

export const BREATH_STEPS: BreathStep[] = [
  { phase: 'inhale', label: '慢慢吸气', color: 'border-gentle-400', darkColor: 'dark:border-gentle-400/60' },
  { phase: 'hold', label: '轻轻停留', color: 'border-warm-300', darkColor: 'dark:border-warm-300/50' },
  { phase: 'exhale', label: '缓缓呼出', color: 'border-gentle-300', darkColor: 'dark:border-gentle-300/50' },
  { phase: 'rest', label: '自然停顿', color: 'border-gentle-200', darkColor: 'dark:border-gentle-500/30' },
];

const CYCLE_SEQUENCE: { phase: BreathPhase; duration: number }[] = [
  { phase: 'inhale', duration: 4 },
  { phase: 'hold', duration: 2 },
  { phase: 'exhale', duration: 6 },
  { phase: 'rest', duration: 1 },
];

const TOTAL_DURATION = CYCLE_SEQUENCE.reduce((s, c) => s + c.duration, 0);

interface UseBreathingCycleReturn {
  phase: BreathPhase;
  stepIndex: number;
  stepSeconds: number;
  stepDuration: number;
  stepProgress: number;
  cycleCount: number;
  totalCycles: number;
  totalProgress: number;
  elapsedTotal: number;
  isRunning: boolean;
  isComplete: boolean;
  start: (cycles?: number) => void;
  stop: () => void;
}

export default function useBreathingCycle(): UseBreathingCycleReturn {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [stepSeconds, setStepSeconds] = useState(0);
  const [stepDuration, setStepDuration] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const localRef = useRef({ ci: 0, si: 0, ss: 0, tg: 0, cc: 0 });

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsComplete(false);
    setPhase('idle');
    setStepIndex(0);
    setStepSeconds(0);
    setStepDuration(0);
    setStepProgress(0);
    setCycleCount(0);
    setTotalProgress(0);
    setElapsedTotal(0);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const start = useCallback(
    (cycles?: number) => {
      clearTimer();
      const cyclesTarget = cycles ?? 5;
      setTotalCycles(cyclesTarget);
      setCycleCount(0);
      setElapsedTotal(0);
      setTotalProgress(0);
      setIsComplete(false);

      const local = localRef.current;
      local.ci = 0;
      local.si = 0;
      local.ss = 0;
      local.tg = cyclesTarget;
      local.cc = 0;

      const step = CYCLE_SEQUENCE[0];
      setPhase(step.phase);
      setStepIndex(0);
      setStepSeconds(0);
      setStepDuration(step.duration);
      setStepProgress(0);
      setIsRunning(true);

      timerRef.current = setInterval(() => {
        local.ss += 0.05;
        const { duration } = CYCLE_SEQUENCE[local.si];

        if (local.ss >= duration) {
          local.ss = 0;
          local.si += 1;

          if (local.si >= CYCLE_SEQUENCE.length) {
            local.si = 0;
            local.ci += 1;
            local.cc += 1;
            setCycleCount(local.cc);

            if (local.ci >= local.tg) {
              clearTimer();
              timerRef.current = undefined;
              setPhase('idle');
              setStepIndex(0);
              setStepSeconds(0);
              setStepDuration(0);
              setStepProgress(0);
              setTotalProgress(1);
              setElapsedTotal(local.ci * TOTAL_DURATION);
              setIsRunning(false);
              setIsComplete(true);
              return;
            }
          }
        }

        const newStep = CYCLE_SEQUENCE[local.si];
        const segProgress = local.si / CYCLE_SEQUENCE.length + local.ss / TOTAL_DURATION;
        const overall = (local.ci + segProgress) / local.tg;

        setPhase(newStep.phase);
        setStepIndex(local.si);
        setStepSeconds(local.ss);
        setStepDuration(newStep.duration);
        setStepProgress(local.ss / newStep.duration);
        setTotalProgress(Math.min(overall, 1));
        setElapsedTotal(local.ci * TOTAL_DURATION + local.si * (CYCLE_SEQUENCE[local.si]?.duration ?? 0) + local.ss);
      }, 50);
    },
    [clearTimer],
  );

  return {
    phase,
    stepIndex,
    stepSeconds,
    stepDuration,
    stepProgress,
    cycleCount,
    totalCycles,
    totalProgress,
    elapsedTotal,
    isRunning,
    isComplete,
    start,
    stop,
  };
}
