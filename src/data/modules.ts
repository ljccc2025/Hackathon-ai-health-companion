import { Heart, Droplets, StretchHorizontal, Sparkles, NotebookText, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ModuleId = 'today' | 'hydration' | 'movement' | 'emotion' | 'review' | 'insight';

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
  summary: string;
  accent: string;
}

export const modules: ModuleConfig[] = [
  {
    id: 'today',
    label: '今日照顾',
    icon: Heart,
    title: '今天先照顾自己一点点',
    description: '把喝水、起身、情绪安放和今日回顾收进一个温柔入口。',
    summary: '总入口 · 最轻的一步',
    accent: 'from-paper-50/80 to-ink-100/45 dark:from-[#1a2822] dark:to-[#121d18]',
  },
  {
    id: 'hydration',
    label: '身体补给',
    icon: Droplets,
    title: '补一点水分，让状态慢慢回到这里',
    description: '围绕喝水、呼吸和小补给做成轻量照顾板块。',
    summary: '喝水提醒 · 轻补给',
    accent: 'from-ink-100/80 to-paper-50/45 dark:from-[#1a2e27] dark:to-[#101f19]',
  },
  {
    id: 'movement',
    label: '活动一下',
    icon: StretchHorizontal,
    title: '从久坐里轻轻出来，伸展 30 秒就够了',
    description: '把久坐起身、微运动和睡前呼吸放在同一个恢复板块。',
    summary: '久坐恢复 · 放松舒展',
    accent: 'from-ink-50/75 to-paper-50/40 dark:from-[#282218] dark:to-[#1c1810]',
  },
  {
    id: 'emotion',
    label: '情绪安放',
    icon: Sparkles,
    title: '先接住感受，再慢慢决定要不要行动',
    description: '情绪性进食、树洞陪伴、AI 温柔建议都在这里。',
    summary: '情绪照顾 · 温柔建议',
    accent: 'from-ink-50/75 to-paper-50/40 dark:from-[#281c22] dark:to-[#1c1418]',
  },
  {
    id: 'review',
    label: '今日回顾',
    icon: NotebookText,
    title: '把今天照顾自己的瞬间收起来',
    description: '今日日志、小成就贴纸和趋势回顾会在这里慢慢聚合。',
    summary: '日志记录 · 小成就',
    accent: 'from-paper-50/60 to-ink-100/35 dark:from-[#142420] dark:to-[#0e1a17]',
  },
  {
    id: 'insight',
    label: '数据洞察',
    icon: BarChart3,
    title: '看看这些天你照顾自己的痕迹',
    description: '喝水热力图、情绪趋势和健康快照，温柔地看见每一天。',
    summary: '趋势可视化 · 健康快照',
    accent: 'from-paper-50/60 to-ink-100/35 dark:from-[#131c23] dark:to-[#0e161b]',
  },
];

/** #S6: Seasonal color temperature micro-shift */
export function applySeasonalShift(rgba: string, month: number): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return rgba;
  let r = Number(match[1]);
  let g = Number(match[2]);
  let b = Number(match[3]);
  const a = Number(match[4]);

  const SHIFT = 0.08;

  if (month === 11 || month <= 1) {
    r = Math.min(255, Math.round(r * (1 + SHIFT)));
    b = Math.max(0, Math.round(b * (1 - SHIFT)));
  } else if (month >= 5 && month <= 7) {
    g = Math.min(255, Math.round(g * (1 + SHIFT)));
    r = Math.max(0, Math.round(r * (1 - SHIFT * 0.5)));
  }

  return `rgba(${r},${g},${b},${a})`;
}
