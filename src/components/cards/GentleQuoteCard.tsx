import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, RefreshCw, Trash2, Plus } from 'lucide-react';
import { useGentleQuoteStore } from '../../store/gentleQuoteStore';

export default function GentleQuoteCard() {
  const { quotes, loaded, load, add, remove, getRandom } = useGentleQuoteStore();
  const [current, setCurrent] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  const pickRandom = useCallback(() => {
    const q = getRandom();
    setCurrent(q?.text ?? null);
  }, [getRandom]);

  useEffect(() => {
    if (loaded && quotes.length > 0 && !current) pickRandom();
  }, [loaded, quotes.length, current, pickRandom]);

  const handleSave = useCallback(async () => {
    if (!inputText.trim()) return;
    await add(inputText, 'manual');
    setInputText('');
    setShowInput(false);
    if (!current) pickRandom();
  }, [inputText, add, current, pickRandom]);

  const handleRemove = useCallback(async () => {
    const q = getRandom();
    if (!q) return;
    await remove(q.id);
    pickRandom();
  }, [getRandom, remove, pickRandom]);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-blossom-200/90 via-gentle-100/88 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.22)] dark:from-[#1a1520] dark:via-[#0d1e19] dark:to-[#10211d] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blossom-300/70 text-blossom-700 dark:bg-blossom-600/40 dark:text-blossom-200">
            <Bookmark size={18} strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gentle-900 dark:text-gentle-50">我的温柔匣子</h3>
            <p className="text-xs text-gentle-600/80 dark:text-gentle-100/70">
              {quotes.length > 0 ? `收藏了 ${quotes.length} 句温柔` : '还没有收藏'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {quotes.length > 0 && (
            <>
              <button
                type="button"
                onClick={pickRandom}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gentle-300/60 bg-paper-50/40 text-gentle-600 hover:bg-gentle-200/60 transition-colors dark:border-gentle-600/30 dark:bg-gentle-800/40 dark:text-gentle-100/80"
                aria-label="换一句"
              >
                <RefreshCw size={13} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gentle-300/60 bg-paper-50/40 text-gentle-600 hover:bg-rose-200/60 hover:text-rose-600 transition-colors dark:border-gentle-600/30 dark:bg-gentle-800/40 dark:text-gentle-100/80"
                aria-label="删除当前"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gentle-300/60 bg-paper-50/40 text-gentle-600 hover:bg-gentle-200/60 transition-colors dark:border-gentle-600/30 dark:bg-gentle-800/40 dark:text-gentle-100/80"
            aria-label="添加一句"
          >
            <Plus size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Quote display */}
      {quotes.length === 0 && !showInput ? (
        <div className="rounded-2xl border border-dashed border-gentle-300/50 bg-paper-50/30 dark:bg-[#0a1411]/50 dark:border-gentle-700/30 p-5 text-center">
          <p className="text-sm text-gentle-500/70 dark:text-gentle-400/60 leading-7">
            这里还是空的。收藏一句 AI 的温柔回应，或者自己写点什么放进来。
          </p>
        </div>
      ) : (
        current && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-gentle-200/50 bg-paper-50/45 dark:bg-[#0a1411]/70 dark:border-gentle-700/30 p-4 "
          >
            <p className="text-sm leading-7 text-gentle-800 dark:text-gentle-100/92 italic">
              "{current}"
            </p>
          </motion.div>
        )
      )}

      {/* Add input */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="写下一句你想收藏的温柔话…"
            maxLength={200}
            rows={3}
            className="w-full rounded-xl border border-gentle-300/60 bg-paper-50/50 p-3 text-sm text-gentle-800 placeholder:text-gentle-400/60 resize-none focus:outline-none focus:ring-2 focus:ring-gentle-400/40 dark:border-gentle-700/40 dark:bg-[#0a1411]/70 dark:text-gentle-100 dark:placeholder:text-gentle-500/50"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gentle-400/70">{inputText.length}/200</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowInput(false); setInputText(''); }}
                className="text-xs text-gentle-500/70 hover:text-gentle-700 transition-colors px-2 py-1"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!inputText.trim()}
                className="text-xs font-medium text-white bg-gentle-500 hover:bg-gentle-600 disabled:bg-gentle-300 transition-colors rounded-lg px-3 py-1"
              >
                收藏
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
