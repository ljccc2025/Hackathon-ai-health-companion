import { useCallback, useRef } from 'react';
import { usePreferenceStore } from '../store/preferenceStore';

const VIBRATE_PRESETS = {
  lightTap: 10,
  confirm: 15,
  success: [10, 50, 10] as number | number[],
  longPress: 20,
};

/**
 * #54: Haptic feedback hook.
 * Provides vibration feedback on mobile devices for user actions.
 * Respects the user's muted preference.
 */
export function useHapticFeedback() {
  const muted = usePreferenceStore((s) => s.muted);

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (muted) return;
      if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently ignore — device may not support vibration
      }
    },
    [muted],
  );

  const lightTap = useCallback(() => vibrate(VIBRATE_PRESETS.lightTap), [vibrate]);
  const confirm = useCallback(() => vibrate(VIBRATE_PRESETS.confirm), [vibrate]);
  const success = useCallback(() => vibrate(VIBRATE_PRESETS.success), [vibrate]);
  const longPress = useCallback(() => vibrate(VIBRATE_PRESETS.longPress), [vibrate]);

  return { vibrate, lightTap, confirm, success, longPress };
}

/**
 * #54: Long-press detection hook.
 * Detects pointer/touch holds >= thresholdMs and fires callback + haptic.
 */
export function useLongPress(
  onLongPress: () => void,
  thresholdMs = 500,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const haptic = useHapticFeedback();

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    () => {
      triggeredRef.current = false;
      timerRef.current = setTimeout(() => {
        triggeredRef.current = true;
        haptic.longPress();
        onLongPress();
      }, thresholdMs);
    },
    [onLongPress, thresholdMs, haptic],
  );

  const onPointerUp = useCallback(
    () => {
      clear();
    },
    [clear],
  );

  const onPointerLeave = useCallback(
    () => {
      clear();
    },
    [clear],
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    /** Whether the long-press was triggered (so caller can skip normal click) */
    wasLongPress: () => triggeredRef.current,
  };
}
