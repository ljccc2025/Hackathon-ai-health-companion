import { usePreferenceStore } from '../store/preferenceStore';
import type { ReminderTone } from '../types/health';

export default function useTone(): ReminderTone {
  return usePreferenceStore((s) => s.tone);
}
