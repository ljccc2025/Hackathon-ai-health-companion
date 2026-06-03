/**
 * Offline network detection service.
 * When offline, AI calls are automatically disabled and local templates are used.
 */

interface OfflineState {
  isOnline: boolean;
  /** Whether AI features should be disabled (offline or user preference) */
  aiDisabled: boolean;
}

let listeners: Array<(state: OfflineState) => void> = [];

function getState(): OfflineState {
  return {
    isOnline: navigator.onLine,
    aiDisabled: !navigator.onLine,
  };
}

function notify(): void {
  const state = getState();
  for (const fn of listeners) fn(state);
}

export function subscribeOffline(fn: (state: OfflineState) => void): () => void {
  listeners.push(fn);
  fn(getState());
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function isOnline(): boolean {
  return navigator.onLine;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
}
