import { useRef, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, Droplets, StretchHorizontal, Sparkles, Moon, Heart, X, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useHydrationStore } from '../../store/hydrationStore';
import { useStandupStore } from '../../store/standupStore';
import { useEmotionStore } from '../../store/emotionStore';
import { useBreathingStore } from '../../store/breathingStore';
import { useAchievementStore } from '../../store/achievementStore';

/**
 * Temporarily disable cross-origin stylesheets to prevent CORS errors
 * during html-to-image capture
 */
function disableCrossOriginStylesheets(): HTMLLinkElement[] {
  const disabledLinks: HTMLLinkElement[] = [];
  const links = document.querySelectorAll('link[rel="stylesheet"]');

  links.forEach((link) => {
    const linkEl = link as HTMLLinkElement;
    const href = linkEl.getAttribute('href') || '';

    // Check if it's a cross-origin stylesheet (Google Fonts, etc.)
    if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
      linkEl.disabled = true;
      disabledLinks.push(linkEl);
    }
  });

  return disabledLinks;
}

/**
 * Re-enable previously disabled stylesheets
 */
function enableCrossOriginStylesheets(disabledLinks: HTMLLinkElement[]) {
  disabledLinks.forEach((link) => {
    link.disabled = false;
  });
}

function todayDate(): string {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export default function HealthSnapshotCard() {
  const hydrationCount = useHydrationStore((s) => s.todayCount);
  const standupCount = useStandupStore((s) => s.todayCount);
  const emotionCount = useEmotionStore((s) => s.todayCount);
  const breathingCount = useBreathingStore((s) => s.todayCount);
  const stickerCount = useAchievementStore((s) => s.todayStickers.length);

  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const total = hydrationCount + standupCount + emotionCount + breathingCount;

  const encouragements = useMemo(() => {
    if (total === 0) return '今天刚开始，慢慢来';
    if (total <= 3) return '轻轻照顾了自己';
    if (total <= 6) return '今天很温柔地对待了自己';
    if (total <= 10) return '认真地照顾了自己一整天';
    return '今天的你，已经很棒了';
  }, [total]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || capturing) return;
    setCapturing(true);

    // Small delay to ensure the preview is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Temporarily disable cross-origin stylesheets to prevent CORS errors
    const disabledLinks = disableCrossOriginStylesheets();

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#f6fbf9',
        cacheBust: true,
        skipAutoScale: true,
        filter: (node) => {
          if (node.tagName === 'LINK') {
            const rel = node.getAttribute('rel');
            if (rel === 'stylesheet') return false;
          }
          if (node.tagName === 'SCRIPT') return false;
          if (node.tagName === 'STYLE') {
            const textContent = node.textContent || '';
            if (textContent.includes('fonts.googleapis.com')) return false;
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `健康快照_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close preview after successful download
      setTimeout(() => setShowPreview(false), 500);
    } catch (err) {
      console.warn('Failed to generate health snapshot:', err);
      // Fallback: try with minimal options
      try {
        const dataUrl = await toPng(cardRef.current, {
          pixelRatio: 1,
          backgroundColor: '#f6fbf9',
          filter: (node) => {
            if (node.tagName === 'LINK') return false;
            if (node.tagName === 'SCRIPT') return false;
            if (node.tagName === 'STYLE') return false;
            return true;
          },
        });
        const link = document.createElement('a');
        link.download = `健康快照_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => setShowPreview(false), 500);
      } catch (fallbackErr) {
        console.error('Fallback generation also failed:', fallbackErr);
      }
    } finally {
      // Re-enable cross-origin stylesheets
      enableCrossOriginStylesheets(disabledLinks);
      setCapturing(false);
    }
  }, [capturing]);

  return (
    <>
      <motion.section
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        }}
        className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-warm-200/70 dark:bg-[#0f1717]/98 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.58)] transition-colors duration-500 "
      >
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-gentle-500 dark:text-gentle-50">
                <Camera size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
                健康快照
              </span>
              <span className="text-xs text-gentle-600/70 dark:text-gentle-300">
                · 今日汇总
              </span>
            </div>
          </div>

          {/* Snapshot card preview (visible in page) */}
          <div className="rounded-2xl bg-gradient-to-br from-gentle-50 via-white to-gentle-100/80 p-6 shadow-inner dark:from-[#15201d] dark:via-[#17211d] dark:to-[#1a231f]">
            {/* Header */}
            <div className="text-center mb-5">
              <p className="text-xs tracking-[0.3em] text-gentle-500/70 dark:text-gentle-300/80">
                轻 养 伴 侣
              </p>
              <p className="mt-2 text-lg font-light text-gentle-800 dark:text-gentle-50">
                今日健康快照
              </p>
              <p className="mt-0.5 text-xs text-gentle-500/60 dark:text-gentle-300/80">
                {todayDate()}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {([
                { icon: Droplets, label: '喝水', count: hydrationCount, unit: '次', color: 'text-gentle-500 dark:text-gentle-300' },
                { icon: StretchHorizontal, label: '起身', count: standupCount, unit: '次', color: 'text-warm-500 dark:text-warm-300' },
                { icon: Sparkles, label: '情绪停顿', count: emotionCount, unit: '次', color: 'text-blossom-500 dark:text-blossom-300' },
                { icon: Moon, label: '呼吸放松', count: breathingCount, unit: '次', color: 'text-gentle-500 dark:text-gentle-300' },
              ]).map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-paper-50/70 dark:bg-[#1a2420]/90 px-3.5 py-3 border border-gentle-200/50 dark:border-gentle-700/20"
                >
                  <span className={item.color}>
                    <item.icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-gentle-500/70 dark:text-gentle-400">{item.label}</p>
                    <p className="text-lg font-semibold text-gentle-800 dark:text-gentle-100 tabular-nums">
                      {item.count}
                      <span className="text-xs font-normal text-gentle-500/60 dark:text-gentle-400 ml-0.5">{item.unit}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticker count */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gentle-100/60 dark:bg-[#1a2420]/80 px-4 py-2.5 mb-4">
              <Heart size={14} strokeWidth={1.5} className="text-gentle-500 dark:text-gentle-300" />
              <span className="text-xs text-gentle-600/80 dark:text-gentle-300">
                今日收集了 {stickerCount} 枚小贴纸
              </span>
            </div>

            {/* Encouragement */}
            <p className="text-center text-sm font-light text-gentle-600/80 dark:text-gentle-300 italic leading-relaxed">
              {encouragements}
            </p>
          </div>

          {/* Download button */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={capturing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/12 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/22 text-gentle-800 dark:text-gentle-50 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} strokeWidth={1.5} className={capturing ? 'animate-pulse' : ''} />
            {capturing ? '正在生成…' : '保存为图片'}
          </button>
        </div>
      </motion.section>

      {/* Preview Modal for capture */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPreview(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[420px] w-full"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-ink-600 hover:text-ink-800 transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>

              {/* Card for capture */}
              <div
                ref={cardRef}
                className="rounded-2xl overflow-hidden shadow-2xl"
              >
                <div
                  className="p-8 flex flex-col items-center text-center"
                  style={{
                    backgroundColor: '#f6fbf9',
                    fontFamily: '"Noto Sans SC", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                  }}
                >
                  {/* Header */}
                  <div className="text-center mb-5">
                    <p
                      className="text-xs tracking-[0.3em]"
                      style={{ color: '#6d9c83' }}
                    >
                      轻 养 伴 侣
                    </p>
                    <p
                      className="mt-2 text-lg font-light"
                      style={{ color: '#1c3a2c' }}
                    >
                      今日健康快照
                    </p>
                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: 'rgba(28,58,44,0.6)' }}
                    >
                      {todayDate()}
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5 w-full">
                    {([
                      { icon: Droplets, label: '喝水', count: hydrationCount, unit: '次', iconColor: '#4b9e80' },
                      { icon: StretchHorizontal, label: '起身', count: standupCount, unit: '次', iconColor: '#f5973b' },
                      { icon: Sparkles, label: '情绪停顿', count: emotionCount, unit: '次', iconColor: '#d85c7e' },
                      { icon: Moon, label: '呼吸放松', count: breathingCount, unit: '次', iconColor: '#4b9e80' },
                    ]).map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-3"
                        style={{
                          backgroundColor: 'rgba(246,251,249,0.7)',
                          border: '1px solid rgba(28,58,44,0.1)',
                        }}
                      >
                        <span style={{ color: item.iconColor }}>
                          <item.icon size={18} strokeWidth={1.5} aria-hidden="true" />
                        </span>
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: 'rgba(28,58,44,0.5)' }}
                          >
                            {item.label}
                          </p>
                          <p
                            className="text-lg font-semibold tabular-nums"
                            style={{ color: '#1c3a2c' }}
                          >
                            {item.count}
                            <span
                              className="text-xs font-normal ml-0.5"
                              style={{ color: 'rgba(28,58,44,0.4)' }}
                            >
                              {item.unit}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sticker count */}
                  <div
                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 mb-4"
                    style={{
                      backgroundColor: 'rgba(28,58,44,0.06)',
                    }}
                  >
                    <Heart size={14} strokeWidth={1.5} style={{ color: '#4b9e80' }} />
                    <span
                      className="text-xs"
                      style={{ color: 'rgba(28,58,44,0.6)' }}
                    >
                      今日收集了 {stickerCount} 枚小贴纸
                    </span>
                  </div>

                  {/* Encouragement */}
                  <p
                    className="text-center text-sm font-light italic leading-relaxed"
                    style={{ color: 'rgba(28,58,44,0.6)' }}
                  >
                    {encouragements}
                  </p>

                  {/* Footer */}
                  <p
                    className="mt-6 text-[10px]"
                    style={{ color: 'rgba(28,58,44,0.35)' }}
                  >
                    温柔地照顾自己 · 轻养伴侣
                  </p>
                </div>
              </div>

              {/* Download button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleDownload}
                disabled={capturing}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gentle-500 hover:bg-gentle-600 text-white text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {capturing ? (
                  <>
                    <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                    正在生成…
                  </>
                ) : (
                  <>
                    <Download size={16} strokeWidth={1.5} />
                    下载图片
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
