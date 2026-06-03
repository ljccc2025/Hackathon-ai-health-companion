import type { DayPeriod, GreetingMessage, ReminderTone } from '../types/health';

function getDayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

type GreetingEntry = { greeting: string; microAction: string };
type GreetingModule = { default: Record<ReminderTone, GreetingEntry[]> };

const cache: Partial<Record<DayPeriod, Record<ReminderTone, GreetingEntry[]>>> = {};

const loaders: Record<DayPeriod, () => Promise<GreetingModule>> = {
  morning: () => import('../data/greetings/morning'),
  noon: () => import('../data/greetings/noon'),
  afternoon: () => import('../data/greetings/afternoon'),
  evening: () => import('../data/greetings/evening'),
  night: () => import('../data/greetings/night'),
};

async function loadPeriod(period: DayPeriod): Promise<Record<ReminderTone, GreetingEntry[]>> {
  if (cache[period]) return cache[period]!;
  const mod = await loaders[period]();
  cache[period] = mod.default;
  return mod.default;
}

function pickFrom(arr: GreetingEntry[]): GreetingEntry {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Synchronous fallback — returns a minimal greeting while lazy chunk loads */
export function getTodayGreeting(
  nickname?: string,
  tone?: ReminderTone,
): GreetingMessage {
  const hour = new Date().getHours();
  const period = getDayPeriod(hour);
  const name = nickname ?? '你';

  const fallbacks: Record<DayPeriod, GreetingEntry> = {
    morning: { greeting: `${name}，早上好。`, microAction: '喝一杯温水，让身体慢慢醒过来。' },
    noon: { greeting: `${name}，中午好。`, microAction: '好好吃一顿午饭，别在屏幕前对付。' },
    afternoon: { greeting: `${name}，下午好。`, microAction: '站起来活动一下，让身体换个姿势。' },
    evening: { greeting: `${name}，晚上好。`, microAction: '放慢节奏，今天已经够了。' },
    night: { greeting: `${name}，夜深了。`, microAction: '放下手机，跟着呼吸慢慢沉下去。' },
  };

  return {
    greeting: fallbacks[period].greeting,
    microAction: fallbacks[period].microAction,
    period,
  };
}

/* Async version — loads the full tone-specific pool, then picks a random entry */
export async function getTodayGreetingAsync(
  nickname?: string,
  tone?: ReminderTone,
): Promise<GreetingMessage> {
  const hour = new Date().getHours();
  const period = getDayPeriod(hour);
  const pool = await loadPeriod(period);
  const tonePool = pool[tone ?? 'friend'] ?? pool.friend;
  const { greeting, microAction } = pickFrom(tonePool);

  const name = nickname ?? '你';
  return {
    greeting: greeting.replace('你', name),
    microAction,
    period,
  };
}

export function getPeriodEmoji(period: DayPeriod): string {
  const map: Record<DayPeriod, string> = {
    morning: 'sunrise', noon: 'sun', afternoon: 'coffee', evening: 'sunset', night: 'moon',
  };
  return map[period];
}

export function getPeriodLabel(period: DayPeriod): string {
  const map: Record<DayPeriod, string> = {
    morning: '上午', noon: '中午', afternoon: '下午', evening: '傍晚', night: '深夜',
  };
  return map[period];
}
