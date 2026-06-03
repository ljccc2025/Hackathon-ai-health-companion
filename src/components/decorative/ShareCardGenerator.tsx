import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, X } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareCardGeneratorProps {
  /** Content to render inside the share card (JSX) */
  children: React.ReactNode;
  /** Download filename without extension */
  filename?: string;
  /** Button label */
  label?: string;
}

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

/**
 * S71: Share card generator using html-to-image.
 * Renders a modal preview card, captures it as PNG, triggers download.
 * Card design follows paper-ink style — warm background, no numeric data exposed.
 */
export default function ShareCardGenerator({
  children,
  filename = '轻养伴侣',
  label = '生成卡片',
}: ShareCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!cardRef.current || generating) return;
    setGenerating(true);

    // Small delay to ensure the preview is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Temporarily disable cross-origin stylesheets to prevent CORS errors
    const disabledLinks = disableCrossOriginStylesheets();

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#fdfcf9',
        cacheBust: true,
        skipAutoScale: true,
        // Filter out unnecessary elements
        filter: (node) => {
          // Skip link elements that load external stylesheets
          if (node.tagName === 'LINK') {
            const rel = node.getAttribute('rel');
            if (rel === 'stylesheet') return false;
          }
          // Skip script elements
          if (node.tagName === 'SCRIPT') return false;
          // Skip style elements with cross-origin content
          if (node.tagName === 'STYLE') {
            const textContent = node.textContent || '';
            if (textContent.includes('fonts.googleapis.com')) return false;
          }
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close preview after successful download
      setTimeout(() => setShowPreview(false), 500);
    } catch (err) {
      console.warn('Failed to generate share card:', err);
      // Fallback: try with minimal options
      try {
        const dataUrl = await toPng(cardRef.current, {
          pixelRatio: 1,
          backgroundColor: '#fdfcf9',
          filter: (node) => {
            if (node.tagName === 'LINK') return false;
            if (node.tagName === 'SCRIPT') return false;
            if (node.tagName === 'STYLE') return false;
            return true;
          },
        });
        const link = document.createElement('a');
        link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
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
      setGenerating(false);
    }
  }, [filename, generating]);

  return (
    <>
      {/* Trigger button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowPreview(true)}
        disabled={generating}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gentle-200/60 dark:bg-gentle-700/40 hover:bg-gentle-300/60 dark:hover:bg-gentle-600/40 text-gentle-600 dark:text-gentle-300 text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
      >
        {generating ? (
          <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
        ) : (
          <Download size={14} strokeWidth={1.5} />
        )}
        {generating ? '生成中…' : label}
      </motion.button>

      {/* Preview Modal */}
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
                style={{ width: 400 }}
              >
                <div
                  className="p-8 flex flex-col items-center text-center"
                  style={{
                    backgroundColor: '#fdfcf9',
                    fontFamily: '"Noto Sans SC", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                    minHeight: 300,
                  }}
                >
                  {/* Brand */}
                  <p
                    className="text-xs tracking-[0.35em] mb-6"
                    style={{ color: '#6d9c83' }}
                  >
                    轻 养 伴 侣
                  </p>

                  {/* Divider */}
                  <div
                    style={{
                      width: 60,
                      height: 1,
                      background: 'linear-gradient(90deg, transparent, rgba(28,58,44,0.15), transparent)',
                      marginBottom: 20,
                    }}
                  />

                  {/* Content */}
                  <div className="w-full">{children}</div>

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
                onClick={handleGenerate}
                disabled={generating}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gentle-500 hover:bg-gentle-600 text-white text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {generating ? (
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
