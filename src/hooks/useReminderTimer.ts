import { useState, useEffect, useCallback, useRef } from 'react';
import { useHydrationStore } from '../store/hydrationStore';
import { useCompanionStore } from '../store/companionStore';
import useTone from './useTone';
import { db } from '../store/db';
import { getHydrationFallback } from '../services/templateFallback';
import { isNearPeak, smartInterval, type PeakWindow } from '../services/hydrationPatternEngine';
import type { HydrationRecord } from '../types/health';

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

interface UseReminderTimerReturn {
  minutesSinceLastDrink: number;
  shouldRemind: boolean;
  reminderMessage: string | null;
  recordDrink: (amount: HydrationRecord['amountLevel']) => Promise<void>;
  dismissReminder: () => void;
}

export default function useReminderTimer(peaks?: PeakWindow[]): UseReminderTimerReturn {
  const config = useHydrationStore((s) => s.config);
  const lastDrinkAt = useHydrationStore((s) => s.lastDrinkAt);
  const storeRecord = useHydrationStore((s) => s.recordDrink);
  const customPhrase = useCompanionStore((s) => s.hydrationPhrase);
  const tone = useTone();

  const [minutesSince, setMinutesSince] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const calcMinutes = useCallback(() => {
    if (!lastDrinkAt) return 0;
    return Math.floor((Date.now() - lastDrinkAt) / 60000);
  }, [lastDrinkAt]);

  useEffect(() => {
    setMinutesSince(calcMinutes());
    timerRef.current = setInterval(() => {
      setMinutesSince(calcMinutes());
    }, 30000);
    return () => clearInterval(timerRef.current);
  }, [calcMinutes]);

  const recordDrink = useCallback(
    async (amount: HydrationRecord['amountLevel']) => {
      const now = Date.now();
      const record: HydrationRecord = {
        id: crypto.randomUUID(),
        timestamp: now,
        amountLevel: amount,
        source: 'manual',
      };
      await db.hydration.add(record);
      storeRecord(now);
      setDismissed(false);
      setMinutesSince(0);
    },
    [storeRecord],
  );

  const shouldRemind = (() => {
    if (dismissed) return false;
    if (!lastDrinkAt) return false;
    if (config.quietHoursEnabled && isInQuietHours(config.quietHoursStart, config.quietHoursEnd)) {
      return false;
    }
    // #S25: Smart interval — shorter near peak drinking hours
    const effectiveInterval = peaks && peaks.length > 0
      ? smartInterval(config.intervalMinutes, isNearPeak(new Date(), peaks))
      : config.intervalMinutes;
    return minutesSince >= effectiveInterval;
  })();

  const reminderMessage = shouldRemind
    ? (() => {
        if (customPhrase.trim()) return customPhrase.trim();
        const fb = getHydrationFallback(tone);
        return `${fb.message} ${fb.microAction}`;
      })()
    : null;

  const dismissReminder = useCallback(() => setDismissed(true), []);

  return {
    minutesSinceLastDrink: minutesSince,
    shouldRemind,
    reminderMessage,
    recordDrink,
    dismissReminder,
  };
}
