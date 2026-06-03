import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BMIRecord, BMIResult, BMICategory } from '../types/health';

interface BMIState {
  records: BMIRecord[];
  latestResult: BMIResult | null;
  latestSuggestion: string;

  addRecord: (record: BMIRecord) => void;
  deleteRecord: (id: string) => void;
  getLatest: () => BMIRecord | null;
  getAll: () => BMIRecord[];
  clearAll: () => void;
}

export const useBMIStore = create<BMIState>()(
  persist(
    (set, get) => ({
      records: [],
      latestResult: null,
      latestSuggestion: '',

      addRecord: (record) =>
        set((s) => ({
          records: [record, ...s.records].slice(0, 50), // Keep last 50 records
          latestResult: record.result,
          latestSuggestion: record.suggestion,
        })),

      deleteRecord: (id) =>
        set((s) => ({
          records: s.records.filter((r) => r.id !== id),
        })),

      getLatest: () => {
        const { records } = get();
        return records.length > 0 ? records[0] : null;
      },

      getAll: () => get().records,

      clearAll: () =>
        set({ records: [], latestResult: null, latestSuggestion: '' }),
    }),
    {
      name: 'light-nurture-bmi',
      partialize: (state) => ({
        records: state.records,
      }),
    },
  ),
);

// BMI calculation utilities
export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): BMIResult {
  if (bmi < 18.5) {
    return {
      bmi,
      category: 'underweight' as BMICategory,
      categoryLabel: '偏瘦',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      description: '体重偏低，建议适当增重',
      healthRisk: '免疫力低下、骨质疏松风险',
    };
  } else if (bmi < 24) {
    return {
      bmi,
      category: 'normal' as BMICategory,
      categoryLabel: '正常',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      description: '体重正常，请继续保持',
      healthRisk: '风险较低',
    };
  } else if (bmi < 28) {
    return {
      bmi,
      category: 'overweight' as BMICategory,
      categoryLabel: '超重',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      description: '体重偏高，建议控制饮食',
      healthRisk: '心血管疾病风险增加',
    };
  } else {
    return {
      bmi,
      category: 'obese' as BMICategory,
      categoryLabel: '肥胖',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      description: '体重过高，建议咨询医生',
      healthRisk: '多种慢性病风险',
    };
  }
}

export function getBMIPosition(bmi: number): number {
  // Map BMI to 0-100% position on the scale
  const minBMI = 14;
  const maxBMI = 35;
  const position = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
  return Math.max(0, Math.min(100, position));
}
