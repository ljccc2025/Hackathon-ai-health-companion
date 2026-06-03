import Dexie, { type EntityTable } from 'dexie';
import type { HydrationRecord, StandupRecord, EmotionFoodRecord, MedicineNote, MoodTreeHoleRecord, HealthSticker, GentleQuote, CycleRecord, SnackRecord, SpecialDate, SleepRecord } from '../types/health';

const db = new Dexie('LightNurtureDB') as Dexie & {
  hydration: EntityTable<HydrationRecord, 'id'>;
  standup: EntityTable<StandupRecord, 'id'>;
  emotionFood: EntityTable<EmotionFoodRecord, 'id'>;
  medicine: EntityTable<MedicineNote, 'id'>;
  moodTreeHole: EntityTable<MoodTreeHoleRecord, 'id'>;
  sticker: EntityTable<HealthSticker, 'id'>;
  gentleQuote: EntityTable<GentleQuote, 'id'>;
  cycleRecord: EntityTable<CycleRecord, 'id'>;
  snack: EntityTable<SnackRecord, 'id'>;
  specialDate: EntityTable<SpecialDate, 'id'>;
  sleep: EntityTable<SleepRecord, 'id'>;
};

db.version(1).stores({
  hydration: 'id, timestamp',
});

db.version(2).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
});

db.version(3).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
});

db.version(4).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
});

db.version(5).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
});

db.version(6).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
});

db.version(7).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
  gentleQuote: 'id, savedAt',
});

db.version(8).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
  gentleQuote: 'id, savedAt',
  cycleRecord: 'id, date',
});

db.version(9).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
  gentleQuote: 'id, savedAt',
  cycleRecord: 'id, date',
});

db.version(10).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
  gentleQuote: 'id, savedAt',
  cycleRecord: 'id, date',
  snack: 'id, date, createdAt',
});

// S73: Special dates
db.version(11).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
  gentleQuote: 'id, savedAt',
  cycleRecord: 'id, date',
  snack: 'id, date, createdAt',
  specialDate: 'id, date',
});

// S74: Sleep records
db.version(12).stores({
  hydration: 'id, timestamp',
  standup: 'id, startedAt',
  emotionFood: 'id, createdAt',
  medicine: 'id, remindAt, enabled',
  moodTreeHole: 'id, createdAt',
  sticker: 'id, scene, earnedAt',
  gentleQuote: 'id, savedAt',
  cycleRecord: 'id, date',
  snack: 'id, date, createdAt',
  specialDate: 'id, date',
  sleep: 'id, date',
});

export { db };
