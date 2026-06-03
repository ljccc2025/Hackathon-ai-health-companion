export type ReminderTone = 'friend' | 'quiet' | 'encouraging' | 'poetic' | 'companion';

export type DayPeriod = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

export interface GreetingMessage {
  greeting: string;
  microAction: string;
  period: DayPeriod;
}

export interface HydrationRecord {
  id: string;
  timestamp: number;
  amountLevel: 'sip' | 'halfCup' | 'cup';
  source: 'manual' | 'notification';
}

export interface StandupRecord {
  id: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
}

export type EmotionTag = 'tired' | 'anxious' | 'bored' | 'sad' | 'stressed' | 'angry' | 'lonely' | 'lost' | 'guilty' | 'hungry';

export interface EmotionFoodRecord {
  id: string;
  createdAt: number;
  emotionTags: EmotionTag[];
  hungerLevel: 1 | 2 | 3 | 4 | 5;
  cravingText?: string;
  aiSuggestion?: string;
}

export type RepeatRule = 'once' | 'daily' | 'custom';

export interface MedicineNote {
  id: string;
  medicineName: string;
  dosageText: string;
  remindAt: string;
  repeatRule: RepeatRule;
  note?: string;
  enabled: boolean;
  createdAt: number;
}

export type BodyPart = 'neck' | 'eyes' | 'wrist' | 'back' | 'wholeBody';

export interface MicroExercise {
  id: string;
  bodyPart: BodyPart;
  title: string;
  instruction: string;
  durationSeconds: number;
}

export type MoodIntensity = 1 | 2 | 3 | 4 | 5;

export interface MoodTreeHoleRecord {
  id: string;
  createdAt: number;
  moodText: string;
  emotionTags: string[];
  intensityLevel: MoodIntensity;
  aiResponse?: string;
}

export type StickerScene = 'hydration' | 'standup' | 'emotion' | 'breathing' | 'medicine' | 'exercise';

export interface HealthSticker {
  id: string;
  scene: StickerScene;
  earnedAt: number;
  label: string;
}

export type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal';

export interface SnackRecord {
  id: string;
  emoji: string;
  label: string;
  createdAt: number;
  date: string;  // 'YYYY-MM-DD'
}

export interface CycleRecord {
  id: string;
  date: string;   // 'YYYY-MM-DD'
  phase: CyclePhase;
  createdAt: number;
}

export interface GentleQuote {
  id: string;
  text: string;
  source: 'ai-response' | 'tree-hole' | 'greeting' | 'manual';
  savedAt: number;
}

export interface UserPreference {
  nickname?: string;
  tone: ReminderTone;
}

// S73: Special dates
export interface SpecialDate {
  id: string;
  date: string;    // 'YYYY-MM-DD'
  label: string;
  createdAt: number;
}

// S74: Sleep quality record
export type SleepQuality = 'good' | 'ok' | 'bad';
export interface SleepRecord {
  id: string;
  quality: SleepQuality;
  date: string;     // 'YYYY-MM-DD'
  createdAt: number;
}

// S75: BMI health index
export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Gender = 'male' | 'female' | 'other';

export interface BMIFormData {
  height: number;      // cm
  weight: number;      // kg
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  sleepHours?: number;
  dietPreference?: string;
  specialConditions?: string;
}

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  color: string;
  bgColor: string;
  description: string;
  healthRisk: string;
}

export interface BMIRecord {
  id: string;
  formData: BMIFormData;
  result: BMIResult;
  suggestion: string;
  createdAt: number;
}
