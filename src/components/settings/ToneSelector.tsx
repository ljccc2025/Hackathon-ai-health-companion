import { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Heart, Leaf, Sparkles, Cloud, Cat, Volume2, VolumeX, Moon, BellOff } from 'lucide-react';
import type { ReminderTone } from '../../types/health';
import useTone from '../../hooks/useTone';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useHydrationStore } from '../../store/hydrationStore';

interface ToneOption {
  tone: ReminderTone;
  label: string;
  icon: LucideIcon;
  hint: string;
  example: string;
}

const toneOptions: ToneOption[] = [
  {
    tone: 'friend',
    label: '朋友式',
    icon: Heart,
    hint: '像朋友一样轻松聊天',
    example: '「先别硬撑，喝两口水再继续也不迟。」',
  },
  {
    tone: 'quiet',
    label: '安静式',
    icon: Leaf,
    hint: '极简、轻柔、不打扰',
    example: '「可以停一下，给身体一点水分。」',
  },
  {
    tone: 'encouraging',
    label: '鼓励式',
    icon: Sparkles,
    hint: '正向肯定，给你力量',
    example: '「你已经照顾自己一次了，再来一点点就好。」',
  },
  {
    tone: 'poetic',
    label: '诗意式',
    icon: Cloud,
    hint: '用美好的意象陪伴日常',
    example: '「窗外的光已经等了你很久，去接一杯水吧。」',
  },
  {
    tone: 'companion',
    label: '陪伴式',
    icon: Cat,
    hint: '像小动物一样安静窝在旁边',
    example: '「我在旁边数着你喝了几口水，这是第 1 次啦。」',
  },
];

export default function ToneSelector() {
  const tone = useTone();
  const setTone = usePreferenceStore((s) => s.setTone);
  const muted = usePreferenceStore((s) => s.muted);
  const setMuted = usePreferenceStore((s) => s.setMuted);
  const quietHoursEnabled = usePreferenceStore((s) => s.quietHoursEnabled);
  const setQuietHours = usePreferenceStore((s) => s.setQuietHours);
  const setHydrationConfig = useHydrationStore((s) => s.setConfig);

  const handleSelect = useCallback(
    (t: ReminderTone) => {
      setTone(t);
    },
    [setTone],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_12px_32px_-20px_rgba(28,58,44,0.22)] dark:bg-[#10241f]/94 dark:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.5)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-4">
        <p className="text-xs font-medium tracking-[0.26em] text-gentle-600/70 dark:text-gentle-100">
          个性化语气
        </p>

        <div className="flex flex-wrap gap-2.5">
          {toneOptions.map((opt) => {
            const isActive = opt.tone === tone;
            const Icon = opt.icon;

            return (
              <motion.button
                key={opt.tone}
                type="button"
                onClick={() => handleSelect(opt.tone)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                layout
                className={`group relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111815] ${
                  isActive
                    ? 'border-gentle-400/60 bg-gentle-200/75 shadow-[0_4px_16px_-8px_rgba(28,58,44,0.25)] ring-1 ring-gentle-300/40 dark:border-gentle-500/40 dark:bg-[#214238]/94 dark:ring-gentle-400/12'
                    : 'border-gentle-300/60 bg-gentle-200/88 hover:border-gentle-300/80 hover:bg-gentle-300/65 dark:border-gentle-700/30 dark:bg-[#173329]/84 dark:hover:border-gentle-600/35 dark:hover:bg-[#214238]/92'
                }`}
                aria-pressed={isActive}
              >
                <span
                  className={`flex-none transition-colors duration-300 ${
                    isActive
                      ? 'text-gentle-600 dark:text-gentle-100'
                      : 'text-gentle-500/90 dark:text-gentle-300 group-hover:text-gentle-600 dark:group-hover:text-gentle-200'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-gentle-800 dark:text-gentle-100'
                        : 'text-gentle-700/85 dark:text-gentle-200'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] leading-relaxed text-gentle-600/80 dark:text-gentle-400 truncate max-w-[180px]">
                    {opt.hint}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Preview of selected tone */}
        <motion.div
          key={tone}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-gentle-300/60 bg-gentle-200/78 px-4 py-3 dark:border-gentle-700/25 dark:bg-gentle-800/50"
        >
          <p className="text-xs text-gentle-600/85 dark:text-gentle-300 mb-1.5">
            语气预览
          </p>
          <p className="text-sm text-gentle-700/85 dark:text-gentle-200 leading-relaxed italic">
            {toneOptions.find((o) => o.tone === tone)?.example ?? ''}
          </p>
        </motion.div>

        {/* #17: Mute toggle */}
        <motion.button
          type="button"
          onClick={() => setMuted(!muted)}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 cursor-pointer ${
            muted
              ? 'border-gentle-200/40 bg-paper-50/50 text-gentle-400 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300'
              : 'border-gentle-200/50 bg-paper-50/60 text-gentle-600 hover:bg-gentle-100/60 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300 dark:hover:bg-paper-50/5'
          }`}
        >
          {muted ? <VolumeX size={14} strokeWidth={1.6} /> : <Volume2 size={14} strokeWidth={1.6} />}
          {muted ? '静音陪伴中' : '温柔提示音'}
        </motion.button>

        {/* #39: Quiet hours toggle */}
        <motion.button
          type="button"
          onClick={() => {
            const next = !quietHoursEnabled;
            setQuietHours(next);
            setHydrationConfig({ quietHoursEnabled: next });
          }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 cursor-pointer ${
            quietHoursEnabled
              ? 'border-gentle-200/50 bg-paper-50/60 text-gentle-600 hover:bg-gentle-100/60 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300 dark:hover:bg-paper-50/5'
              : 'border-gentle-200/40 bg-paper-50/50 text-gentle-400 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300'
          }`}
        >
          {quietHoursEnabled ? <Moon size={14} strokeWidth={1.6} /> : <BellOff size={14} strokeWidth={1.6} />}
          {quietHoursEnabled ? '22:30 - 8:30 勿扰中' : '勿扰时段已关闭'}
        </motion.button>
      </div>
    </motion.section>
  );
}
