import type { MedicineNote } from '../types/health';
import { usePreferenceStore } from '../store/preferenceStore';
import { showMedicineToast } from '../utils/toast';

/* ── Gentle reminder messages ── */

const REMINDER_MESSAGES = [
  '到小纸条上的时间了，可以看一眼医生写好的用药说明。',
  '你之前记下的小纸条在轻轻提醒——看一眼就好，不用急。',
  '小纸条轻轻摇了摇，该看一眼用药说明了。',
  '医生给你写好的小纸条，现在可以看一眼。',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Time helpers ── */

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Check if a medicine note is due for reminder right now (±2 minute window to tolerate timer drift) */
export function isDue(note: MedicineNote): boolean {
  if (!note.enabled) return false;
  const targetMinutes = parseTimeToMinutes(note.remindAt);
  const currentMinutes = getCurrentMinutes();
  const diff = currentMinutes - targetMinutes;
  // Symmetric window: allow 1 min early (timer skew) and 2 min late
  const result = diff >= -1 && diff <= 2;
  if (!result && diff >= -5 && diff <= 5) {
    console.log(`[MedicineReminder] ${note.medicineName} @ ${note.remindAt} — ${diff > 0 ? `${diff}分钟前已过` : `${-diff}分钟后到`}`);
  }
  return result;
}

/** Find all notes due for reminder */
export function findDueNotes(notes: MedicineNote[]): MedicineNote[] {
  return notes.filter(isDue);
}

/* ── Notification dispatch ── */

const notifiedNotes = new Map<string, number>();
// Don't re-notify the same note within 5 minutes
const NOTE_COOLDOWN_MS = 5 * 60 * 1000;

function isInQuietHours(): boolean {
  const state = usePreferenceStore.getState();
  if (!state.quietHoursEnabled) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = state.quietHoursStart.split(':').map(Number);
  const [eh, em] = state.quietHoursEnd.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function notifyMedicineReminder(note: MedicineNote): void {
  if (!('Notification' in window)) return;

  if (Notification.permission !== 'granted') {
    console.log('[MedicineReminder] 通知权限未授权 (状态:', Notification.permission, ')，请点击药品卡片里的「开启提醒」');
    return;
  }

  // Quiet hours check
  if (isInQuietHours()) return;

  // Per-note cooldown check
  const lastTime = notifiedNotes.get(note.id);
  if (lastTime && Date.now() - lastTime < NOTE_COOLDOWN_MS) return;

  notifiedNotes.set(note.id, Date.now());

  const title = pick(REMINDER_MESSAGES);
  const body = `${note.medicineName} · ${note.dosageText}`;

  // In-app toast — always shows regardless of OS notification settings
  showMedicineToast(title, body);

  try {
    const n = new Notification(title, {
      body,
      tag: `medicine-${note.id}`,
      icon: '/favicon.svg',
    });

    n.onclick = () => {
      n.close();
      window.focus();
    };

    // Auto-dismiss after 30 seconds
    setTimeout(() => n.close(), 30000);
  } catch {
    // Notification failed silently — not critical
  }
}

/* ── Reminder polling engine ── */

let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL_MS = 30_000; // Check every 30s

export function startMedicineReminderPoll(
  getNotes: () => MedicineNote[],
): void {
  if (pollTimer) return;

  let tickCount = 0;
  pollTimer = setInterval(() => {
    tickCount++;
    const notes = getNotes();
    const dueNotes = findDueNotes(notes);
    for (const note of dueNotes) {
      notifyMedicineReminder(note);
    }
  }, POLL_INTERVAL_MS);
}

export function stopMedicineReminderPoll(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
