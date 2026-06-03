import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, ChevronDown, Feather, ShieldAlert, Loader2, Heart, Bookmark, Mic, MicOff } from 'lucide-react';
import { useMoodStore } from '../../store/moodStore';
import {
  detectHighRisk,
  extractContextCategory,
  extractEmotionTags,
  getFallbackResponse,
  sanitizeMoodForAi,
} from '../../services/moodSafetyGuard';
import { useGentleQuoteStore } from '../../store/gentleQuoteStore';
import { getMoodTreeHoleSuggestion } from '../../services/aiClient';
import type { MoodIntensity } from '../../types/health';

const MAX_MOOD_LENGTH = 120;

export default function MoodTreeHoleCard() {
  const { todayCount, loaded, load, add } = useMoodStore();
  const [collapsed, setCollapsed] = useState(true);
  const [moodText, setMoodText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    message: string;
    microAction: string;
    isHighRisk: boolean;
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // S61: Voice input — SpeechRecognition state machine
  const [micState, setMicState] = useState<'idle' | 'listening' | 'disabled' | 'error'>('idle');
  const recognitionRef = useRef<any>(null);
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!speechSupported) {
      setMicState('disabled');
    }
  }, [speechSupported]);

  const handleMicClick = useCallback(() => {
    if (micState === 'listening') {
      recognitionRef.current?.stop();
      setMicState('idle');
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setMoodText((prev) => {
        const combined = prev ? `${prev} ${transcript}` : transcript;
        return combined.slice(0, MAX_MOOD_LENGTH);
      });
    };

    recognition.onerror = () => {
      setMicState('error');
      setTimeout(() => setMicState('idle'), 2000);
    };

    recognition.onend = () => {
      setMicState('idle');
    };

    recognition.start();
    recognitionRef.current = recognition;
    setMicState('listening');
  }, [micState]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [moodText]);

  const handleSubmit = useCallback(async () => {
    const trimmed = moodText.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);

    // Step 1: Crisis detection
    const highRisk = detectHighRisk(trimmed);
    if (highRisk) {
      setResponse({ message: highRisk, microAction: '', isHighRisk: true });
      setSubmitting(false);
      await add({
        moodText: trimmed,
        emotionTags: extractEmotionTags(trimmed),
        intensityLevel: 1 as MoodIntensity,
        aiResponse: highRisk,
      });
      setMoodText('');
      setFeedback('你的感受很重要，请务必照顾好自己的安全。');
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // Step 2: Extract context and sanitize
    const contextCategory = extractContextCategory(trimmed);
    const sanitized = sanitizeMoodForAi(trimmed);

    let aiMessage = '';
    let aiAction = '';

    try {
      const aiResult = await getMoodTreeHoleSuggestion({
        rawText: sanitized.rawText,
        emotionTags: sanitized.emotionTags,
        intensityLevel: sanitized.intensityLevel,
        contextCategory: contextCategory ?? undefined,
      });

      if (aiResult.source === 'ai' && aiResult.message) {
        aiMessage = aiResult.message;
        aiAction = aiResult.microAction;
      }
    } catch {
      // AI failed silently — use fallback
    }

    if (!aiMessage) {
      const fb = getFallbackResponse();
      aiMessage = fb.message;
      aiAction = fb.microAction;
    }

    const fullResponse = aiAction
      ? `${aiMessage}\n\n${aiAction}`
      : aiMessage;

    setResponse({ message: aiMessage, microAction: aiAction, isHighRisk: false });

    // Step 5: Save to local DB (full text stays local, per Module 11)
    await add({
      moodText: trimmed,
      emotionTags: sanitized.emotionTags,
      intensityLevel: sanitized.intensityLevel,
      aiResponse: fullResponse,
    });

    setMoodText('');
    setSubmitting(false);
    setFeedback('已经轻轻放进树洞里了。');
    setTimeout(() => setFeedback(null), 3000);
  }, [moodText, submitting, add]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-blossom-200/70 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-gentle-900/75 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.45)] transition-colors duration-500 "
    >
      {/* Glass highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px w-20 h-20 rounded-full bg-paper-50/30 dark:bg-paper-50/3 blur-xl transition-colors duration-500"
      />

      <div className="relative z-10 flex flex-col">
        {/* === Collapsed summary row === */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-100">
              <TreePine size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
              情绪树洞
            </span>
            <span className="text-xs text-gentle-600/70 dark:text-gentle-300">
              {todayCount > 0
                ? `· 今天放下了 ${todayCount} 次`
                : '· 一个可以轻轻放下情绪的地方'}
            </span>
            {todayCount > 0 && (
              <span className="flex-none w-2 h-2 rounded-full bg-blossom-400 animate-bar-breathe" aria-hidden="true" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gentle-700/60 dark:text-gentle-300">
              {todayCount > 0 ? `${todayCount}` : ''}
            </span>
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
              <div className="flex flex-col gap-4 pt-5">
                {/* Gentle intro */}
                <p className="text-xs leading-relaxed text-gentle-600/80 dark:text-gentle-300/80">
                  这里是一个树洞。你可以把想说的轻轻放在这里，不用组织语言，不用想太多。
                  没有人会评价你，没有人会急着给建议。
                </p>

                {/* Feedback banner */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <p className="text-sm text-gentle-600 dark:text-gentle-200 bg-gentle-100/70 dark:bg-gentle-800/55 rounded-xl px-4 py-2.5 text-center">
                        {feedback}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Response display */}
                <AnimatePresence>
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl border px-4 py-4 ${
                        response.isHighRisk
                          ? 'border-red-200/60 bg-red-50/70 dark:border-red-800/25 dark:bg-red-950/20'
                          : 'border-blossom-200/50 bg-blossom-50/70 dark:border-blossom-700/20 dark:bg-blossom-900/15'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {response.isHighRisk ? (
                          <ShieldAlert size={16} strokeWidth={1.6} className="mt-0.5 flex-none text-red-400 dark:text-red-400/80" />
                        ) : (
                          <Heart size={16} strokeWidth={1.6} className="mt-0.5 flex-none text-blossom-400 dark:text-blossom-400/80" />
                        )}
                        <div>
                          <p className="text-sm leading-relaxed text-gentle-700 dark:text-gentle-200">
                            {response.message}
                          </p>
                          {response.microAction && (
                            <p className="mt-1.5 text-xs text-gentle-500/80 dark:text-gentle-400 italic">
                              {response.microAction}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setResponse(null)}
                          className="text-xs text-gentle-500/60 dark:text-gentle-400 hover:text-gentle-600 dark:hover:text-gentle-300 transition-colors cursor-pointer"
                        >
                          {response.isHighRisk ? '我知道了' : '好的'}
                        </button>
                        {!response.isHighRisk && (
                          <button
                            type="button"
                            onClick={() => {
                              useGentleQuoteStore.getState().add(
                                response.microAction
                                  ? `${response.message} ${response.microAction}`
                                  : response.message,
                                'tree-hole',
                              );
                            }}
                            className="flex items-center gap-1 text-xs text-blossom-500/70 hover:text-blossom-600 dark:text-blossom-400/70 dark:hover:text-blossom-300 transition-colors cursor-pointer"
                          >
                            <Bookmark size={11} strokeWidth={1.8} />
                            收藏
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Text input */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="我现在有点……"
                    maxLength={MAX_MOOD_LENGTH}
                    rows={2}
                    className="w-full px-4 py-3.5 rounded-2xl bg-paper-50/60 dark:bg-gentle-800/65 border border-gentle-200/50 dark:border-gentle-700/30 text-sm text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 dark:placeholder:text-gentle-500/60 outline-none focus:border-gentle-400/50 dark:focus:border-gentle-400/40 transition-colors resize-none"
                  />
                  {/* S61: Mic button */}
                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={micState === 'disabled'}
                    title={
                      micState === 'disabled' ? '您的浏览器不支持语音输入'
                      : micState === 'error' ? '麦克风权限未开启'
                      : micState === 'listening' ? '点击停止录音'
                      : '点击开始语音输入'
                    }
                    className={`absolute bottom-2 right-10 p-1 rounded-md transition-all ${
                      micState === 'listening'
                        ? 'text-blossom-500 animate-pulse'
                        : micState === 'disabled'
                          ? 'text-gentle-300/40 cursor-not-allowed'
                          : micState === 'error'
                            ? 'text-warm-400'
                            : 'text-gentle-400/60 hover:text-gentle-600 dark:hover:text-gentle-300'
                    }`}
                    aria-label={micState === 'listening' ? '停止录音' : '开始语音输入'}
                  >
                    {micState === 'disabled' || micState === 'error' ? (
                      <MicOff size={14} strokeWidth={1.5} />
                    ) : (
                      <Mic size={14} strokeWidth={1.5} />
                    )}
                  </button>

                  <span className="absolute bottom-2 right-3 text-[0.6rem] text-gentle-300/70 dark:text-gentle-300/90">
                    {moodText.length}/{MAX_MOOD_LENGTH}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!moodText.trim() || submitting}
                  className="btn-glow w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blossom-300/25 dark:bg-blossom-400/10 hover:bg-blossom-300/35 dark:hover:bg-blossom-400/18 text-gentle-700 dark:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {submitting ? (
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <Feather size={16} strokeWidth={1.5} />
                  )}
                  {submitting ? '正在轻轻放下…' : '轻轻放下'}
                </button>

                {/* Privacy note */}
                <p className="text-[0.65rem] leading-relaxed text-gentle-400/60 dark:text-gentle-400 text-center">
                  你的文字会发送给 AI 以生成回应，同时保存在本地。
                  <br />
                  AI 不会存储你的个人信息。如需专业心理支持，请拨打心理援助热线。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
