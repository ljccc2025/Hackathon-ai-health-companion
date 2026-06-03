import { useState, useEffect, useCallback, useRef } from 'react';
import { useStandupStore } from '../store/standupStore';
import { useCompanionStore } from '../store/companionStore';
import useTone from './useTone';
import useNotificationPermission from './useNotificationPermission';
import { db } from '../store/db';
import { getStandupFallback } from '../services/templateFallback';
import type { StandupRecord } from '../types/health';

function isInQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

type StandupState = ReturnType<typeof useStandupStore.getState>;

interface UseStandupTimerReturn {
  phase: StandupState['phase'];
  elapsedSeconds: number;
  remainingSeconds: number;
  totalSeconds: number;
  reminderMessage: string;
  todayCount: number;
  startFocus: () => boolean; // Returns false if blocked by quiet hours
  pauseFocus: () => void;
  resumeFocus: () => void;
  completeStandup: () => Promise<void>;
  resetPhase: () => void;
  dismissReminder: () => void;
}

export default function useStandupTimer(): UseStandupTimerReturn {
  const phase = useStandupStore((s) => s.phase);
  const config = useStandupStore((s) => s.config);
  const focusStartedAt = useStandupStore((s) => s.focusStartedAt);
  const pausedRemaining = useStandupStore((s) => s.pausedRemaining);
  const todayCount = useStandupStore((s) => s.todayCount);
  const tone = useTone();
  const storeStartFocus = useStandupStore((s) => s.startFocus);
  const storePauseFocus = useStandupStore((s) => s.pauseFocus);
  const storeResumeFocus = useStandupStore((s) => s.resumeFocus);
  const storeTriggerReminder = useStandupStore((s) => s.triggerReminder);
  const storeCompleteStandup = useStandupStore((s) => s.completeStandup);
  const storeResetPhase = useStandupStore((s) => s.resetPhase);
  const customPhrase = useCompanionStore((s) => s.standupPhrase);

  const { send: sendNotify } = useNotificationPermission();
  const [tick, setTick] = useState(0);
  const [dismissedReminder, setDismissedReminder] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const reminderMessageRef = useRef(getStandupFallback());

  const totalSeconds = config.focusMinutes * 60;

  const elapsedSeconds = (() => {
    if (phase === 'idle' || phase === 'done') return 0;
    if (phase === 'paused' && pausedRemaining !== null) {
      return totalSeconds - pausedRemaining;
    }
    if (focusStartedAt) {
      return Math.floor((Date.now() - focusStartedAt) / 1000);
    }
    return 0;
  })();

  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  // Timer tick
  useEffect(() => {
    if (phase === 'focusing') {
      timerRef.current = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    clearInterval(timerRef.current);
  }, [phase, focusStartedAt]);

  // Check if timer expired
  useEffect(() => {
    if (
      phase === 'focusing' &&
      focusStartedAt &&
      Date.now() - focusStartedAt >= totalSeconds * 1000
    ) {
      storeTriggerReminder();
      setDismissedReminder(false);
      if (customPhrase.trim()) {
        reminderMessageRef.current = customPhrase.trim();
      } else {
        const fb = getStandupFallback(tone);
        reminderMessageRef.current = `${fb.message} ${fb.microAction}`;
      }
      sendNotify('该起来活动一下了', {
        body: reminderMessageRef.current,
      });
    }
  }, [phase, tick, focusStartedAt, totalSeconds, storeTriggerReminder, sendNotify]);

  const startFocus = useCallback((): boolean => {
    if (config.quietHoursEnabled && isInQuietHours(config.quietHoursStart, config.quietHoursEnd)) {
      return false; // Blocked by quiet hours
    }
    storeStartFocus(Date.now());
    setDismissedReminder(false);
    if (customPhrase.trim()) {
      reminderMessageRef.current = customPhrase.trim();
    } else {
      const fb = getStandupFallback(tone);
      reminderMessageRef.current = `${fb.message} ${fb.microAction}`;
    }
    return true; // Successfully started
  }, [config, storeStartFocus, tone, customPhrase]);

  const pauseFocus = useCallback(() => {
    storePauseFocus(remainingSeconds);
  }, [remainingSeconds, storePauseFocus]);

  const resumeFocus = useCallback(() => {
    storeResumeFocus(Date.now());
  }, [storeResumeFocus]);

  const completeStandup = useCallback(async () => {
    const now = Date.now();
    const record: StandupRecord = {
      id: crypto.randomUUID(),
      startedAt: focusStartedAt ?? now - totalSeconds * 1000,
      completedAt: now,
      durationSeconds: elapsedSeconds > 0 ? Math.min(elapsedSeconds, 60) : 30,
    };
    await db.standup.add(record);
    storeCompleteStandup(now);
    setDismissedReminder(true);
  }, [focusStartedAt, totalSeconds, elapsedSeconds, storeCompleteStandup]);

  const resetPhaseHandler = useCallback(() => {
    storeResetPhase();
    setDismissedReminder(false);
  }, [storeResetPhase]);

  const dismissReminder = useCallback(() => {
    setDismissedReminder(true);
  }, []);

  return {
    phase: phase === 'reminding' && dismissedReminder ? 'done' : phase,
    elapsedSeconds,
    remainingSeconds,
    totalSeconds,
    reminderMessage: phase === 'reminding' ? reminderMessageRef.current : '',
    todayCount,
    startFocus,
    pauseFocus,
    resumeFocus,
    completeStandup,
    resetPhase: resetPhaseHandler,
    dismissReminder,
  };
}
