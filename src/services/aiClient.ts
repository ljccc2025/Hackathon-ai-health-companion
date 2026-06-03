import type { EmotionTag } from '../types/health';
import { applySafetyPipeline } from './safetyGuard';
import { usePrivacyStore } from '../store/privacyStore';
import { isAiUploadAllowed, type DataCategory } from '../utils/privacy';

export interface AiResponse {
  message: string;
  microAction: string;
  safetyLevel: 'safe' | 'filtered' | 'blocked';
  source: 'ai' | 'fallback';
  error?: string;
}

const FALLBACK_BLOCKED: AiResponse = {
  message: '',
  microAction: '',
  safetyLevel: 'blocked',
  source: 'fallback',
  error: 'privacy-blocked',
};

async function callApi(
  endpoint: string,
  body: unknown,
  privacyCategory?: DataCategory,
): Promise<AiResponse> {
  // Privacy gate: check if AI upload is allowed for this data category
  if (privacyCategory) {
    const defaultAllowed = isAiUploadAllowed(privacyCategory);
    const overrides = usePrivacyStore.getState().overrides;
    const userOverride = overrides[privacyCategory];
    const effective = userOverride !== undefined ? userOverride : defaultAllowed;
    if (!effective) return FALLBACK_BLOCKED;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as AiResponse;
    return applySafetyPipeline(json);
  } catch {
    return {
      message: '',
      microAction: '',
      safetyLevel: 'safe',
      source: 'fallback',
      error: 'unavailable',
    };
  }
}

export async function getEmotionFoodSuggestion(params: {
  emotionTags: EmotionTag[];
  hungerLevel: number;
  tone?: string;
}): Promise<AiResponse> {
  return callApi('/api/ai/emotion-food', params, 'emotion');
}

export async function getReminderSuggestion(params: {
  scene: string;
  context?: Record<string, unknown>;
}): Promise<AiResponse> {
  return callApi('/api/ai/reminder', params);
}

export async function getMoodTreeHoleSuggestion(params: {
  rawText: string;
  emotionTags: string[];
  intensityLevel: number;
  tone?: string;
  contextCategory?: string;
}): Promise<AiResponse> {
  return callApi('/api/ai/mood-tree-hole', params, 'moodTreeHole');
}

export async function getGreetingSuggestion(params: {
  period: string;
  tone?: string;
  nickname?: string;
  sleepQuality?: string;
}): Promise<AiResponse> {
  return callApi('/api/ai/greeting', params);
}

export async function getSnackBatchInsight(params: {
  items: { emoji: string; label: string }[];
}): Promise<{ insight: string }> {
  try {
    const res = await fetch('/api/ai/snack-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { insight: '' };
    return (await res.json()) as { insight: string };
  } catch {
    return { insight: '' };
  }
}

export async function getSnackInsight(params: {
  emoji: string;
  label: string;
}): Promise<{ insight: string }> {
  try {
    const res = await fetch('/api/ai/snack-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { insight: '' };
    return (await res.json()) as { insight: string };
  } catch {
    return { insight: '' };
  }
}

export async function getDietPatternInsight(params: {
  totalRecords: number;
  dayCount: number;
  topEmotion: string;
  topEmotionCount: number;
  topHour: number;
  topHourCount: number;
  avgHungerLevel: number;
  secondEmotion?: string;
}): Promise<{ insight: string; source: 'ai' | 'fallback'; reason?: string }> {
  try {
    const res = await fetch('/api/ai/diet-pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { insight: '', source: 'fallback' };
    return (await res.json()) as { insight: string; source: 'ai' | 'fallback'; reason?: string };
  } catch {
    return { insight: '', source: 'fallback' };
  }
}

export async function getDailyPoem(params: {
  weather: string;
  weekday: string;
  recentMoods: string;
}): Promise<{ poem: string; safetyLevel: 'safe' | 'filtered' | 'blocked'; source: 'ai' | 'fallback'; error?: string }> {
  try {
    const res = await fetch('/api/ai/daily-poem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { poem: '', safetyLevel: 'safe', source: 'fallback', error: 'unavailable' };
    return (await res.json()) as { poem: string; safetyLevel: 'safe' | 'filtered' | 'blocked'; source: 'ai' | 'fallback' };
  } catch {
    return { poem: '', safetyLevel: 'safe', source: 'fallback', error: 'unavailable' };
  }
}

export async function getWeeklyReport(params: {
  hydrationCount: number;
  standupCount: number;
  emotionCount: number;
  topEmotion: string;
  bestDay: string;
  breathingCount: number;
}): Promise<AiResponse & { rawText?: string }> {
  return callApi('/api/ai/weekly-report', params);
}

// S75: BMI health suggestion
export async function getBMISuggestion(params: {
  height: number;
  weight: number;
  bmi: number;
  category: string;
  age?: number;
  gender?: string;
  activityLevel?: string;
  sleepHours?: number;
  dietPreference?: string;
  specialConditions?: string;
}): Promise<AiResponse & { rawText?: string }> {
  return callApi('/api/ai/bmi', params, 'health');
}
