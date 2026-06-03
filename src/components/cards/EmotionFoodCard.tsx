import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ChevronDown, Heart, Loader2 } from 'lucide-react';
import { db } from '../../store/db';
import { useEmotionStore } from '../../store/emotionStore';
import { getEmotionFoodSuggestion } from '../../services/aiClient';
import { getEmotionFoodFallback } from '../../services/templateFallback';
import useTone from '../../hooks/useTone';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useAchievementStore } from '../../store/achievementStore';
import type { EmotionTag, EmotionFoodRecord } from '../../types/health';

const emotionOptions: { tag: EmotionTag; label: string; color: string; colorDark: string; dot: string }[] = [
  { tag: 'hungry', label: '饿', color: 'bg-warm-200/70 text-warm-800 border-warm-300/60', colorDark: 'dark:bg-warm-800/30 dark:text-warm-300 dark:border-warm-700/40', dot: 'bg-warm-400' },
  { tag: 'tired', label: '累', color: 'bg-gentle-200/70 text-gentle-800 border-gentle-300/60', colorDark: 'dark:bg-gentle-800/65 dark:text-gentle-100 dark:border-gentle-700/40', dot: 'bg-gentle-400' },
  { tag: 'anxious', label: '焦虑', color: 'bg-blossom-200/70 text-blossom-800 border-blossom-300/60', colorDark: 'dark:bg-blossom-800/30 dark:text-blossom-300 dark:border-blossom-700/40', dot: 'bg-blossom-400' },
  { tag: 'stressed', label: '压力', color: 'bg-warm-300/60 text-warm-900 border-warm-400/50', colorDark: 'dark:bg-warm-800/30 dark:text-warm-300 dark:border-warm-700/40', dot: 'bg-warm-500' },
  { tag: 'bored', label: '无聊', color: 'bg-gentle-100/70 text-gentle-700 border-gentle-300/50', colorDark: 'dark:bg-gentle-800/65 dark:text-gentle-100 dark:border-gentle-700/40', dot: 'bg-gentle-300' },
  { tag: 'sad', label: '难过', color: 'bg-blossom-100/70 text-blossom-700 border-blossom-300/50', colorDark: 'dark:bg-blossom-800/30 dark:text-blossom-300 dark:border-blossom-700/40', dot: 'bg-blossom-300' },
];

const hungerLabels = ['不饿', '有点', '一般', '挺饿', '很饿'];
const dropletSizes = ['w-1.5 h-2.5', 'w-2 h-3.5', 'w-2.5 h-4', 'w-3 h-5', 'w-3.5 h-5.5'];

export default function EmotionFoodCard() {
  const todayCount = useEmotionStore((s) => s.todayCount);
  const incrementCount = useEmotionStore((s) => s.incrementCount);
  const tone = useTone();
  // S70: merge custom tags into emotion options
  const customTags = usePreferenceStore((s) => s.customTags);
  const allEmotionOptions = useMemo(
    () => [
      ...emotionOptions,
      ...customTags.map((t) => ({
        tag: t.name as EmotionTag,
        label: t.name,
        color: 'bg-paper-50/70 text-gentle-700 border-gentle-300/50',
        colorDark: 'dark:bg-gentle-800/65 dark:text-gentle-100 dark:border-gentle-700/40',
        dot: 'bg-gentle-400',
        _colorHex: t.color,
      })),
    ],
    [customTags],
  );
  const triggerAchievement = useAchievementStore((s) => s.trigger);

  const [collapsed, setCollapsed] = useState(true);
  const [selectedTags, setSelectedTags] = useState<EmotionTag[]>([]);
  const [hungerLevel, setHungerLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [cravingText, setCravingText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastTags, setLastTags] = useState<EmotionTag[]>([]);
  const [cookieBounce, setCookieBounce] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  // S68: Emoji feedback state
  const [emojiFeedback, setEmojiFeedback] = useState<string | null>(null);
  const [lastRecordId, setLastRecordId] = useState<string | null>(null);

  const toggleTag = useCallback((tag: EmotionTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedTags.length === 0) return;

    setAiLoading(true);

    const aiResult = await getEmotionFoodSuggestion({
      emotionTags: selectedTags,
      hungerLevel,
      tone,
    });

    let suggestion: string;
    if (aiResult.source === 'ai' && aiResult.message) {
      suggestion = `${aiResult.message} ${aiResult.microAction}`;
    } else {
      const fb = getEmotionFoodFallback(selectedTags);
      suggestion = `${fb.message} ${fb.microAction}`;
    }

    setAiLoading(false);

    const record: EmotionFoodRecord = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      emotionTags: selectedTags,
      hungerLevel,
      cravingText: cravingText.trim() || undefined,
      aiSuggestion: suggestion,
    };

    await db.emotionFood.add(record);
    setLastRecordId(record.id);
    setEmojiFeedback(null);
    incrementCount();
    triggerAchievement('emotion');
    setFeedback(suggestion);
    setLastTags([...selectedTags]);
    setSelectedTags([]);
    setCravingText('');
    setHungerLevel(3);

    setCookieBounce(true);
    setTimeout(() => setCookieBounce(false), 600);
  }, [selectedTags, hungerLevel, cravingText, incrementCount]);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 dark:bg-gentle-900/75 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.45)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col">
        {/* === Collapsed summary row === */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <motion.span
              className="text-gentle-500 dark:text-gentle-100"
              animate={cookieBounce ? { scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Cookie size={20} strokeWidth={1.5} aria-hidden="true" />
            </motion.span>
            <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
              情绪进食
            </span>
            <span className="text-xs text-gentle-600/70 dark:text-gentle-300">
              {todayCount > 0
                ? `· 今天记录了 ${todayCount} 次`
                : '· 想吃东西的时候点开看看'}
            </span>
            {/* Last emotion dots */}
            {lastTags.length > 0 && (
              <span className="flex items-center gap-0.5 ml-1">
                {lastTags.map((tag) => {
                  const opt = emotionOptions.find((o) => o.tag === tag);
                  return (
                    <span
                      key={tag}
                      className={`w-1.5 h-1.5 rounded-full ${opt?.dot ?? 'bg-gentle-400'} opacity-70`}
                      aria-hidden="true"
                    />
                  );
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {todayCount > 0 && (
              <span className="text-xs text-gentle-700/60 dark:text-gentle-300">
                {todayCount}次
              </span>
            )}
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-gentle-600/70 dark:text-gentle-300"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.span>
          </div>
        </button>

        {/* === Expanded content === */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-5 pt-5">
                {/* AI suggestion feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-gentle-100/70 dark:bg-gentle-800/55 rounded-xl px-4 py-3"
                    >
                      <p className="text-sm text-gentle-700 dark:text-gentle-200 leading-relaxed">
                        {feedback}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        className="mt-2 text-xs text-gentle-700/60 dark:text-gentle-300 hover:text-gentle-600 dark:hover:text-gentle-200 transition-colors cursor-pointer"
                      >
                        好的
                      </button>

                      {/* S68: Emoji feedback buttons */}
                      {!emojiFeedback && (
                        <div className="mt-2 flex items-center gap-2">
                          {([
                            { emoji: '😊', label: '有用' },
                            { emoji: '🫂', label: '温暖' },
                            { emoji: '🤔', label: '再想想' },
                            { emoji: '🙏', label: '谢谢' },
                          ] as const).map(({ emoji, label }) => (
                            <motion.button
                              key={label}
                              type="button"
                              whileTap={{ scale: 1.4 }}
                              onClick={async () => {
                                setEmojiFeedback(emoji);
                                if (lastRecordId) {
                                  await db.emotionFood.update(lastRecordId, { emojiFeedback: emoji } as any);
                                }
                              }}
                              className="text-lg leading-none px-1.5 py-0.5 rounded-lg hover:bg-gentle-200/60 dark:hover:bg-gentle-700/40 transition-colors cursor-pointer"
                              title={label}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      )}
                      {emojiFeedback && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 text-xs text-gentle-500/60 dark:text-gentle-400/60"
                        >
                          谢谢你的回应 ✨
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Q: What are you feeling? */}
                <div>
                  <p className="text-xs text-gentle-600/80 dark:text-gentle-300 mb-3">
                    我现在是…
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allEmotionOptions.map((opt) => {
                      const active = selectedTags.includes(opt.tag);
                      const isCustom = '_colorHex' in opt;
                      const baseClasses = 'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer';
                      const activeClasses = active
                        ? `${opt.color} ${opt.colorDark} ring-2 ring-gentle-400/30 dark:ring-gentle-300/25`
                        : 'bg-paper-50/50 dark:bg-gentle-800/65 text-gentle-600/80 dark:text-gentle-100/90 border-gentle-200/40 dark:border-gentle-700/30 hover:bg-gentle-100/60 dark:hover:bg-gentle-700/40';
                      const customStyle = isCustom && active
                        ? { backgroundColor: (opt as any)._colorHex + '25', borderColor: (opt as any)._colorHex + '50', color: (opt as any)._colorHex }
                        : undefined;

                      return (
                        <button
                          key={opt.tag}
                          type="button"
                          onClick={() => toggleTag(opt.tag as EmotionTag)}
                          className={`${baseClasses} ${activeClasses}`}
                          style={customStyle}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q: What are you craving? */}
                <div>
                  <p className="text-xs text-gentle-600/80 dark:text-gentle-300 mb-2">
                    想吃点什么…
                  </p>
                  <input
                    type="text"
                    value={cravingText}
                    onChange={(e) => setCravingText(e.target.value)}
                    placeholder="比如：薯片、巧克力、奶茶…"
                    maxLength={30}
                    className="w-full px-3.5 py-2 rounded-xl bg-paper-50/50 dark:bg-gentle-800/65 border border-gentle-200/40 dark:border-gentle-700/30 text-sm text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 dark:placeholder:text-gentle-500/60 outline-none focus:border-gentle-400/50 dark:focus:border-gentle-400/40 transition-colors"
                  />
                </div>

                {/* Q: Hunger level */}
                <div>
                  <p className="text-xs text-gentle-600/80 dark:text-gentle-300 mb-3">
                    饥饿程度
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setHungerLevel(level as 1 | 2 | 3 | 4 | 5)}
                        className={`flex-1 flex flex-col items-center gap-2 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                          hungerLevel === level
                            ? 'bg-gentle-400/20 dark:bg-gentle-400/15 text-gentle-700 dark:text-gentle-100'
                            : 'bg-paper-50/40 dark:bg-gentle-800/60 text-gentle-500/80 dark:text-gentle-300 hover:bg-gentle-100/40 dark:hover:bg-gentle-800/30'
                        }`}
                      >
                        <span
                          className={`${dropletSizes[level - 1]} rounded-full ${
                            hungerLevel >= level
                              ? 'bg-gentle-500 dark:bg-gentle-400'
                              : 'bg-gentle-300/40 dark:bg-gentle-600/30'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="text-[10px]">{hungerLabels[level - 1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedTags.length === 0}
                  className="btn-glow w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/10 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/20 text-gentle-700 dark:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {aiLoading ? (
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <Heart size={16} strokeWidth={1.5} />
                  )}
                  {aiLoading ? '正在生成温柔建议…' : '停下来感受一下'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
