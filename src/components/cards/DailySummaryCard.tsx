import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ShareCardGenerator from '../decorative/ShareCardGenerator';
import { useHydrationStore } from '../../store/hydrationStore';
import { useStandupStore } from '../../store/standupStore';
import { useEmotionStore } from '../../store/emotionStore';
import { useBreathingStore } from '../../store/breathingStore';
import { useMedicineStore } from '../../store/medicineStore';
import { useMoodStore } from '../../store/moodStore';
import { useAchievementStore } from '../../store/achievementStore';

function generateSummary(counts: {
  hydration: number;
  standup: number;
  emotion: number;
  breathing: number;
  medicine: number;
  mood: number;
  stickers: number;
}): string {
  const total = counts.hydration + counts.standup + counts.emotion + counts.breathing + counts.medicine + counts.mood;

  if (total === 0) {
    return '今天还没有记录，没关系。任何时候开始照顾自己，都是最好的时候。';
  }

  const parts: string[] = [];
  if (counts.hydration > 0) parts.push(`喝了 ${counts.hydration} 次水`);
  if (counts.standup > 0) parts.push(`起身活动了 ${counts.standup} 次`);
  if (counts.emotion > 0) parts.push(`停顿感受了 ${counts.emotion} 次情绪`);
  if (counts.breathing > 0) parts.push(`做了 ${counts.breathing} 次呼吸放松`);
  if (counts.medicine > 0) parts.push(`查看了 ${counts.medicine} 次用药小纸条`);
  if (counts.mood > 0) parts.push(`在树洞放下了 ${counts.mood} 次心情`);

  const joined = parts.join('，');
  const stickerNote = counts.stickers > 0 ? ` 还收集了 ${counts.stickers} 枚小贴纸。` : '';

  const encouragements = [
    '这些都算数，每一个小动作都值得被看见。',
    '不必和别人比，今天的你已经好好照顾了自己。',
    '一点点加起来，就是温柔地对待了自己一整天。',
    '不需要满分，能做到这些已经很棒了。',
    '你在忙碌里给自己留了空隙，这本身就很重要。',
  ];

  const enc = encouragements[Math.min(total, encouragements.length) - 1] ?? encouragements[4];

  return `今天你${joined}。${stickerNote}${enc}`;
}

export default function DailySummaryCard() {
  const hydrationCount = useHydrationStore((s) => s.todayCount);
  const standupCount = useStandupStore((s) => s.todayCount);
  const emotionCount = useEmotionStore((s) => s.todayCount);
  const breathingCount = useBreathingStore((s) => s.todayCount);
  const medicineLoaded = useMedicineStore((s) => s.loaded);
  const medicineLoad = useMedicineStore((s) => s.load);
  const medicineCount = useMedicineStore((s) => s.notes.length);
  const moodLoaded = useMoodStore((s) => s.loaded);
  const moodLoad = useMoodStore((s) => s.load);
  const moodCount = useMoodStore((s) => s.todayCount);
  const stickerLoaded = useAchievementStore((s) => s.loaded);
  const stickerLoad = useAchievementStore((s) => s.loadToday);
  const stickerCount = useAchievementStore((s) => s.todayStickers.length);

  useEffect(() => {
    if (!medicineLoaded) medicineLoad();
    if (!moodLoaded) moodLoad();
    if (!stickerLoaded) stickerLoad();
  }, [medicineLoaded, medicineLoad, moodLoaded, moodLoad, stickerLoaded, stickerLoad]);

  const summary = useMemo(
    () =>
      generateSummary({
        hydration: hydrationCount,
        standup: standupCount,
        emotion: emotionCount,
        breathing: breathingCount,
        medicine: medicineCount,
        mood: moodCount,
        stickers: stickerCount,
      }),
    [hydrationCount, standupCount, emotionCount, breathingCount, medicineCount, moodCount, stickerCount],
  );

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-warm-200/70 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-gentle-900/75 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.45)] transition-colors duration-500 "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px w-20 h-20 rounded-full bg-paper-50/30 dark:bg-paper-50/3 blur-xl transition-colors duration-500"
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-100">
            <Sparkles size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
            今日温柔回顾
          </span>
        </div>

        <p className="text-sm leading-7 text-gentle-600/85 dark:text-gentle-300">
          {summary}
        </p>

        {/* S71: Share card trigger */}
        <ShareCardGenerator filename="轻养伴侣-今日回顾" label="生成今日卡片">
          <p className="text-sm leading-7" style={{ color: 'rgba(28,58,44,0.75)' }}>
            {summary}
          </p>
        </ShareCardGenerator>
      </div>
    </motion.section>
  );
}
