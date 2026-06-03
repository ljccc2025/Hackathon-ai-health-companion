import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareText, Check } from 'lucide-react';
import { useCompanionStore } from '../../store/companionStore';

export default function CustomReminderCard() {
  const hydrationPhrase = useCompanionStore((s) => s.hydrationPhrase);
  const standupPhrase = useCompanionStore((s) => s.standupPhrase);
  const setHydrationPhrase = useCompanionStore((s) => s.setHydrationPhrase);
  const setStandupPhrase = useCompanionStore((s) => s.setStandupPhrase);

  const [waterDraft, setWaterDraft] = useState(hydrationPhrase);
  const [standDraft, setStandDraft] = useState(standupPhrase);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setHydrationPhrase(waterDraft);
    setStandupPhrase(standDraft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-[#0e1f1b]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-gentle-500 dark:text-gentle-50">
            <MessageSquareText size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
            自定义提醒短语
          </span>
        </div>

        <p className="text-xs leading-relaxed text-gentle-600/65 dark:text-gentle-300">
          写下你想听到的提醒语，让它代替默认提醒。留空则使用系统默认。
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gentle-600/80 dark:text-gentle-200">
              喝水提醒
            </span>
            <input
              type="text"
              value={waterDraft}
              onChange={(e) => setWaterDraft(e.target.value)}
              placeholder="如：妈妈喊你喝水了"
              maxLength={50}
              className="w-full rounded-xl border border-gentle-200/60 bg-paper-50/60 px-4 py-2.5 text-sm text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gentle-600/80 dark:text-gentle-200">
              起身提醒
            </span>
            <input
              type="text"
              value={standDraft}
              onChange={(e) => setStandDraft(e.target.value)}
              placeholder="如：起来走走，腿要麻了"
              maxLength={50}
              className="w-full rounded-xl border border-gentle-200/60 bg-paper-50/60 px-4 py-2.5 text-sm text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
            />
          </label>
        </div>

        <motion.button
          type="button"
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          className={`inline-flex items-center gap-1.5 self-end rounded-full px-5 py-2 text-xs font-medium transition-colors ${
            saved
              ? 'bg-gentle-500/90 text-white'
              : 'bg-gentle-200/80 text-gentle-700 hover:bg-gentle-300/80 dark:bg-gentle-700/60 dark:text-gentle-100 dark:hover:bg-gentle-600/60'
          }`}
        >
          {saved ? (
            <>
              <Check size={14} strokeWidth={2} />
              已保存
            </>
          ) : (
            '保存'
          )}
        </motion.button>
      </div>
    </motion.section>
  );
}
