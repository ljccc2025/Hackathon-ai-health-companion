import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, ChevronDown, Stethoscope, Database, Pill } from 'lucide-react';

const STORAGE_KEY = 'light-nurture-safety-seen';

interface SafetyItem {
  icon: typeof Shield;
  title: string;
  body: string;
}

const safetyItems: SafetyItem[] = [
  {
    icon: Stethoscope,
    title: '不替代医生建议',
    body: '本产品仅提供生活习惯陪伴与提醒，不能替代医生诊断、治疗或处方。如有身体不适，请优先咨询专业医师。',
  },
  {
    icon: Database,
    title: '数据默认本地保存',
    body: '喝水记录、情绪标签、起身次数等健康数据默认保存在你的浏览器本地。我们不会上传你的个人健康记录。',
  },
  {
    icon: Pill,
    title: 'AI 不做诊断',
    body: 'AI 只生成温柔提醒和微行动建议，不会输出疾病名称、药物剂量或治疗方案。所有 AI 建议都经过安全过滤。',
  },
];

export function isSafetyNoticeSeen(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export default function SafetyNotice() {
  const [expanded, setExpanded] = useState(!isSafetyNoticeSeen());

  const handleCollapse = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setExpanded(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (!expanded) {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    setExpanded((prev) => !prev);
  }, [expanded]);

  return (
    <section className="mt-4 sm:mt-5" aria-label="安全与健康边界说明">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="safety-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-gentle-200/50 bg-gradient-to-br from-gentle-50/90 via-white/85 to-gentle-100/70 p-5 shadow-[0_12px_40px_-24px_rgba(28,58,44,0.22)] backdrop-blur-lg dark:border-gentle-700/30 dark:from-gentle-900/80 dark:via-[#17211d]/85 dark:to-gentle-800/70 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.40)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gentle-200/80 dark:bg-gentle-700/50">
                    <Shield size={16} strokeWidth={1.8} className="text-gentle-600 dark:text-gentle-300" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
                      安全与健康边界
                    </h3>
                    <p className="text-xs text-gentle-500/80 dark:text-gentle-200/80">
                      轻养伴侣的承诺与边界
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gentle-200/60 bg-gentle-100/60 text-gentle-400 hover:bg-gentle-200/70 hover:text-gentle-600 transition-colors duration-200 cursor-pointer dark:border-gentle-600/30 dark:bg-gentle-700/40 dark:text-gentle-400 dark:hover:bg-gentle-600/40 dark:hover:text-gentle-200"
                  aria-label="收起安全说明"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>

              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3">
                {safetyItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Icon size={15} strokeWidth={1.6} className="text-gentle-500 dark:text-gentle-400" aria-hidden="true" />
                        <span className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-gentle-600/80 dark:text-gentle-200/85">
                        {item.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-[0.68rem] leading-relaxed text-gentle-400/70 dark:text-gentle-200/80">
                轻养伴侣不做医疗诊断、不提供药物建议、不替代医生。如需医疗帮助，请及时就医或联系专业机构。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleToggle}
        whileTap={{ scale: 0.97 }}
        className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111815] ${
          expanded
            ? 'border-gentle-200/40 bg-paper-50/50 text-gentle-600 shadow-none dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300'
            : 'border-gentle-200/50 bg-paper-50/60 text-gentle-500/80 shadow-[0_4px_16px_-10px_rgba(28,58,44,0.18)] hover:bg-gentle-100/60 hover:text-gentle-600 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-200/80 dark:hover:bg-paper-50/5 dark:hover:text-gentle-300'
        }`}
        aria-expanded={expanded}
        aria-label={expanded ? '收起安全说明' : '展开安全说明'}
      >
        <Shield size={14} strokeWidth={1.6} aria-hidden="true" />
        <span>健康安全边界</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown size={13} strokeWidth={2} />
        </motion.span>
      </motion.button>
    </section>
  );
}
