/**
 * S73-S78 TDD Test Definitions
 * RED: TypeScript build fails until features implemented.
 */
// ── S73: Special dates ──
export const S73 = {
  'db specialDates table exists': 'db.specialDates entity table',
  'PrivacyPanel date editor renders': 'date input + label input + add button',
  'GreetingCard checks today specialDate': 'if match → append 祝福文案',
} as const;

// ── S74: Sleep record ──
export const S74 = {
  'db sleep table exists': 'db.sleep entity table',
  'SleepRecordCard 3 emoji buttons': '😴 🥱 😵 click to record',
  'aiClient getGreetingSuggestion accepts sleepQuality': 'parameter added',
  'greeting prompt includes sleep context': 'prompt builder extended',
} as const;

// ── S77: Trend forecast ──
export const S77 = {
  '7-day Dexie query → 3-day SMA forecast': 'moving average algorithm',
  'SVG dashed projection line': '虚线 + low opacity fill',
  '文案含 "可能"': 'uncertainty language',
} as const;

// ── S78: Milestone time capsule ──
export const S78 = {
  'Dexie earliest record → days used': 'first hydration/mood/sticker timestamp',
  'Milestone match [7,30,100,365]': 'milestone detection logic',
  'AchievementOverlay milestone variant': 'fullscreen card + 动画',
  'localStorage prevents re-trigger': 'milestone-shown key',
} as const;
