import type { EmotionTag, EmotionFoodRecord } from '../types/health';

/* ── Data category classification ── */

export type DataCategory =
  | 'hydration'
  | 'standup'
  | 'emotion'
  | 'medicine'
  | 'moodTreeHole'
  | 'sticker'
  | 'nickname'
  | 'tonePreference'
  | 'health';

export interface DataPolicy {
  category: DataCategory;
  label: string;
  storageLocation: 'IndexedDB' | 'localStorage';
  aiUploadDefault: boolean;
  aiUploadUserOverride: boolean;
  strategy: string;
}

export const DATA_POLICIES: DataPolicy[] = [
  {
    category: 'hydration',
    label: '喝水时间',
    storageLocation: 'IndexedDB',
    aiUploadDefault: false,
    aiUploadUserOverride: false,
    strategy: '仅本地聚合',
  },
  {
    category: 'standup',
    label: '起身次数',
    storageLocation: 'IndexedDB',
    aiUploadDefault: false,
    aiUploadUserOverride: false,
    strategy: '仅本地聚合',
  },
  {
    category: 'emotion',
    label: '情绪标签',
    storageLocation: 'IndexedDB',
    aiUploadDefault: true,
    aiUploadUserOverride: true,
    strategy: '只上传标签，不上传自由文本',
  },
  {
    category: 'medicine',
    label: '药品小纸条',
    storageLocation: 'IndexedDB',
    aiUploadDefault: false,
    aiUploadUserOverride: false,
    strategy: '只做本地提醒，不上传药名与剂量',
  },
  {
    category: 'moodTreeHole',
    label: '情绪树洞文本',
    storageLocation: 'IndexedDB',
    aiUploadDefault: true,
    aiUploadUserOverride: true,
    strategy: '默认只上传脱敏后的标签和强度',
  },
  {
    category: 'sticker',
    label: '健康贴纸',
    storageLocation: 'IndexedDB',
    aiUploadDefault: false,
    aiUploadUserOverride: false,
    strategy: '仅本地成就反馈',
  },
  {
    category: 'nickname',
    label: '用户昵称',
    storageLocation: 'localStorage',
    aiUploadDefault: false,
    aiUploadUserOverride: true,
    strategy: '仅本地展示',
  },
  {
    category: 'tonePreference',
    label: '语气偏好',
    storageLocation: 'localStorage',
    aiUploadDefault: true,
    aiUploadUserOverride: false,
    strategy: '作为非敏感参数',
  },
  {
    category: 'health',
    label: '健康数据',
    storageLocation: 'localStorage',
    aiUploadDefault: true,
    aiUploadUserOverride: true,
    strategy: '身高体重等健康数据用于 AI 分析',
  },
];

/* ── Sanitization: strip sensitive fields before AI upload ── */

export interface SanitizedEmotionRecord {
  emotionTags: EmotionTag[];
  hungerLevel: 1 | 2 | 3 | 4 | 5;
}

/** Strip free-text fields from emotion record — only tags + level go to AI */
export function sanitizeEmotionForAi(
  record: EmotionFoodRecord,
): SanitizedEmotionRecord {
  return {
    emotionTags: record.emotionTags,
    hungerLevel: record.hungerLevel,
  };
}

/** Strip sensitive text from mood tree-hole input — keep only tags + intensity */
export function sanitizeMoodForAi(input: {
  moodText: string;
  emotionTags: string[];
  intensityLevel: 1 | 2 | 3 | 4 | 5;
}): { emotionTags: string[]; intensityLevel: 1 | 2 | 3 | 4 | 5 } {
  return {
    emotionTags: input.emotionTags,
    intensityLevel: input.intensityLevel,
  };
}

/** Build minimal AI context — only what category policy allows */
export function isAiUploadAllowed(category: DataCategory): boolean {
  const policy = DATA_POLICIES.find((p) => p.category === category);
  return policy?.aiUploadDefault ?? false;
}

/* ── Local data clearing ── */

const LOCAL_STORAGE_KEYS = [
  'light-nurture-preference',
  'light-nurture-hydration',
  'light-nurture-standup',
  'light-nurture-emotion',
  'light-nurture-breathing',
  'light-nurture-achievement',
  'light-nurture-privacy',
  'light-nurture-safety-seen',
  'hydration-reset-date',
  'standup-reset-date',
  'emotion-reset-date',
  'breathing-reset-date',
];

export function clearAllLocalData(): void {
  for (const key of LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  // Dexie database tables
  import('../store/db').then(({ db }) => {
    db.hydration.clear();
    db.standup.clear();
    db.emotionFood.clear();
  });
}

/** Estimate local storage usage */
export function estimateLocalStorageUsage(): { keyCount: number; estimatedBytes: number } {
  let estimatedBytes = 0;
  let keyCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keyCount++;
      estimatedBytes += key.length + (localStorage.getItem(key)?.length ?? 0);
    }
  }
  // Estimate as UTF-16
  estimatedBytes *= 2;
  return { keyCount, estimatedBytes };
}
