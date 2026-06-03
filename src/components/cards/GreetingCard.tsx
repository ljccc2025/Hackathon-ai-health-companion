import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Moon, Coffee } from 'lucide-react';
import { getTodayGreeting, getTodayGreetingAsync } from '../../utils/date';
import useTone from '../../hooks/useTone';
import useWeather from '../../hooks/useWeather';
import { getGreetingSuggestion, getDailyPoem } from '../../services/aiClient';
import { useMoodStore } from '../../store/moodStore';
import { db } from '../../store/db';
import type { DayPeriod } from '../../types/health';

interface PeriodStyle {
  icon: typeof Sun;
  bgClass: string;
  bgDark: string;
  accent: string;
  accentDark: string;
  label: string;
  iconClass: string;
  hint: string;
}

const periodConfig: Record<DayPeriod, PeriodStyle> = {
  morning: {
    icon: Sunrise,
    bgClass: 'from-ink-100/80 via-paper-50/70 to-warm-100/50',
    bgDark: 'dark:from-ink-800/80 dark:via-ink-900/70 dark:to-warm-900/20',
    accent: 'text-ink-500',
    accentDark: 'dark:text-ink-200',
    label: '上午好',
    iconClass: 'animate-float',
    hint: '今天从一口水开始就好',
  },
  noon: {
    icon: Sun,
    bgClass: 'from-warm-100/70 via-paper-50/60 to-ink-100/50',
    bgDark: 'dark:from-[#1e1a14] dark:via-[#181510] dark:to-[#131a15]',
    accent: 'text-warm-600',
    accentDark: 'dark:text-warm-300',
    label: '中午好',
    iconClass: 'animate-float',
    hint: '停下来好好吃顿饭，也是一件重要的事',
  },
  afternoon: {
    icon: Coffee,
    bgClass: 'from-ink-100/80 via-paper-50/70 to-blossom-100/50',
    bgDark: 'dark:from-[#161c18] dark:via-[#121914] dark:to-[#1c1618]',
    accent: 'text-ink-500',
    accentDark: 'dark:text-ink-200',
    label: '下午好',
    iconClass: 'animate-float',
    hint: '下午很长，但不需要一口气撑过去',
  },
  evening: {
    icon: Sunset,
    bgClass: 'from-warm-100/70 via-blossom-100/60 to-ink-100/50',
    bgDark: 'dark:from-[#1c1814] dark:via-[#1a1416] dark:to-[#121915]',
    accent: 'text-warm-600',
    accentDark: 'dark:text-warm-300',
    label: '傍晚好',
    iconClass: 'animate-float',
    hint: '把节奏放慢一点，今天你已经做得很好了',
  },
  night: {
    icon: Moon,
    bgClass: 'from-ink-100/80 via-ink-100/60 to-ink-200/50',
    bgDark: 'dark:from-[#111a16] dark:via-[#0f1714] dark:to-[#0d1512]',
    accent: 'text-ink-400',
    accentDark: 'dark:text-ink-200',
    label: '夜深了',
    iconClass: 'animate-float',
    hint: '今晚先不用解决所有问题，明天的事明天再说',
  },
};

interface GreetingCardProps {
  nickname?: string;
}

export default function GreetingCard({ nickname }: GreetingCardProps) {
  const tone = useTone();
  const { code: weatherCode } = useWeather();

  const weatherHint = useMemo(() => {
    if (!weatherCode && weatherCode !== 0) return null;
    if (weatherCode >= 51 && weatherCode <= 67) return '窗外在下雨，先喝杯温水暖暖自己吧。';
    if (weatherCode >= 71 && weatherCode <= 77) return '外面飘着雪，捧一杯热茶再开始今天。';
    if (weatherCode >= 95) return '外面天气有点烈，待在屋里好好照顾自己。';
    if (weatherCode >= 45 && weatherCode <= 48) return '雾蒙蒙的日子，适合慢一点对待自己。';
    if (weatherCode === 0) return '今天阳光正好，去窗边站一会儿吧。';
    return null;
  }, [weatherCode]);

  const { greeting: fallbackGreeting, microAction: fallbackAction, period } = useMemo(
    () => getTodayGreeting(nickname, tone),
    [nickname, tone],
  );

  const [poolGreeting, setPoolGreeting] = useState<string | null>(null);
  const [poolAction, setPoolAction] = useState<string | null>(null);
  const [aiGreeting, setAiGreeting] = useState<string | null>(null);
  const [aiAction, setAiAction] = useState<string | null>(null);

  // S73: Check today's special dates
  const [specialLabel, setSpecialLabel] = useState<string | null>(null);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    db.specialDate.where('date').equals(today).first().then((match) => {
      setSpecialLabel(match?.label ?? null);
    });
  }, []);

  const weatherDesc = useMemo(() => {
    if (weatherCode == null) return null;
    if (weatherCode >= 51 && weatherCode <= 67) return '雨';
    if (weatherCode >= 71 && weatherCode <= 77) return '雪';
    if (weatherCode >= 45 && weatherCode <= 48) return '雾';
    if (weatherCode >= 95) return '雷雨';
    if (weatherCode === 0 || weatherCode === 1) return '晴';
    if (weatherCode === 2) return '多云';
    if (weatherCode === 3) return '阴';
    return null;
  }, [weatherCode]);

  const weekdayLabel = useMemo(() => {
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    return labels[new Date().getDay()];
  }, []);

  const recentMoods = useMemo(() => {
    const records = useMoodStore.getState().records;
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const recent = records.filter((r) => r.createdAt > threeDaysAgo);
    if (recent.length === 0) return null;
    const tagCounts = new Map<string, number>();
    recent.forEach((r) => {
      r.emotionTags.forEach((t) => {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      });
    });
    const tagLabels: Record<string, string> = {
      tired: '疲惫', anxious: '焦虑', bored: '无趣', sad: '低落',
      stressed: '压力', angry: '生气', lonely: '孤单', hungry: '想吃东西',
    };
    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 2).map(([tag]) => tagLabels[tag] || tag).join('、');
  }, []);

  useEffect(() => {
    let cancelled = false;
    getTodayGreetingAsync(nickname, tone).then((g) => {
      if (!cancelled) {
        setPoolGreeting(g.greeting);
        setPoolAction(g.microAction);
      }
    });
    return () => { cancelled = true; };
  }, [nickname, tone]);

  useEffect(() => {
    let cancelled = false;
    setAiGreeting(null);
    setAiAction(null);
    const periodLabels: Record<string, string> = {
      morning: '上午', noon: '中午', afternoon: '下午', evening: '傍晚', night: '深夜',
    };
    // S74: Fetch last night's sleep quality for AI context
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    db.sleep.where('date').equals(yesterdayKey).first().then((rec) => {
      if (cancelled) return;
      getGreetingSuggestion({
        period: periodLabels[period] ?? '当前',
        tone,
        nickname,
        sleepQuality: rec?.quality,
      }).then((res) => {
        if (!cancelled && res.source === 'ai' && res.message) {
          setAiGreeting(res.message);
          setAiAction(res.microAction);
        }
      });
    }).catch(() => {
      // Fallback: call without sleepQuality
      getGreetingSuggestion({
      period: periodLabels[period] ?? '当前',
      tone,
      nickname,
    }).then((res) => {
      if (!cancelled && res.source === 'ai' && res.message) {
        setAiGreeting(res.message);
        setAiAction(res.microAction);
      }
    });
    });
    return () => { cancelled = true; };
  }, [period, tone, nickname]);

  useEffect(() => {
    let cancelled = false;
    getDailyPoem({
      weather: weatherDesc ?? '未知',
      weekday: weekdayLabel,
      recentMoods: recentMoods ?? '无明显情绪',
    }).then((res) => {
      if (!cancelled && res.source === 'ai' && res.poem) {
        window.dispatchEvent(new CustomEvent('poem-cached', { detail: res.poem }));
      }
    });
    return () => { cancelled = true; };
  }, [weatherDesc, weekdayLabel, recentMoods]);

  useEffect(() => {
    const titles: Record<string, string> = {
      morning: '☀️ 轻养伴侣 · 上午好',
      noon: '☕ 轻养伴侣 · 中午好',
      afternoon: '🌸 轻养伴侣 · 下午好',
      evening: '🌅 轻养伴侣 · 傍晚好',
      night: '🌙 轻养伴侣 · 该休息了',
    };
    document.title = titles[period] ?? '轻养伴侣';
  }, [period]);

  const greeting = poolGreeting ?? aiGreeting ?? fallbackGreeting;
  const microAction = poolAction ?? aiAction ?? fallbackAction;

  const config = periodConfig[period];
  const Icon = config.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.bgClass} ${config.bgDark} p-6 sm:p-8 md:p-10 card-paper animate-breath-glow dark:animate-breath-glow-dark transition-colors duration-500`}
    >
      <div className="relative z-10 flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <span className={`${config.accent} ${config.accentDark} ${config.iconClass} inline-block transition-colors duration-300`}>
            <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium tracking-wide text-ink-600 dark:text-ink-100/80 transition-colors duration-300">
            {config.label}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-5 text-xl sm:text-2xl md:text-3xl font-light leading-relaxed tracking-wide text-ink-900 dark:text-ink-50 transition-colors duration-300"
        >
          {greeting}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 mb-5 divider-paper w-24 origin-left"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex items-start gap-3"
        >
          <span
            className="mt-0.5 flex-none w-1 h-6 rounded-full bg-ink-400 dark:bg-ink-500 animate-bar-breathe transition-colors duration-300"
            aria-hidden="true"
          />
          <p className="text-base sm:text-lg text-ink-600 dark:text-ink-100/80 font-normal leading-relaxed transition-colors duration-300">
            {microAction}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-5 text-xs text-ink-500/70 dark:text-ink-100/70 font-light tracking-wider transition-colors duration-300"
        >
          {weatherHint ?? config.hint}
        </motion.p>

        {/* S73: Special date blessing */}
        {specialLabel && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-3 text-sm text-blossom-600/80 dark:text-blossom-300/80 font-medium"
          >
            🌸 今天是你的{specialLabel}，愿你被温柔包围。
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}
