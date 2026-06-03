import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ChevronDown,
  Trash2,
  HardDrive,
  Brain,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { DATA_POLICIES, clearAllLocalData, estimateLocalStorageUsage } from '../../utils/privacy';
import { usePrivacyStore } from '../../store/privacyStore';
import CustomTagEditor from './CustomTagEditor';
import SpecialDateEditor from './SpecialDateEditor';
import type { DataCategory } from '../../utils/privacy';

/* ── Local-storage estimate ── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── AI upload toggle icon ── */

function AiToggle({
  category,
  defaultAllowed,
  userOverride,
}: {
  category: DataCategory;
  defaultAllowed: boolean;
  userOverride: boolean;
}) {
  const override = usePrivacyStore((s) => s.overrides[category]);
  const setOverride = usePrivacyStore((s) => s.setOverride);

  if (!userOverride) {
    return (
      <span className="flex items-center gap-1 text-xs text-gentle-400/80 dark:text-gentle-300/80">
        {defaultAllowed ? (
          <Brain size={13} strokeWidth={1.5} className="text-gentle-500" />
        ) : (
          <HardDrive size={13} strokeWidth={1.5} />
        )}
        {defaultAllowed ? '会上传' : '不共享'}
      </span>
    );
  }

  const effective = override !== undefined ? override : defaultAllowed;

  return (
    <button
      type="button"
      onClick={() =>
        effective ? setOverride(category, false) : setOverride(category, true)
      }
      className="flex items-center gap-1.5 rounded-full border border-gentle-200/50 bg-paper-50/50 dark:bg-paper-50/3 px-2.5 py-1 text-xs font-medium transition-all duration-200 hover:bg-gentle-100/70 dark:hover:bg-paper-50/5 cursor-pointer"
      title={effective ? '点击关闭上传' : '点击开启上传'}
    >
      {effective ? (
        <>
          <Eye size={12} strokeWidth={1.6} className="text-gentle-500" />
          <span className="text-gentle-600 dark:text-gentle-300">可上传</span>
        </>
      ) : (
        <>
          <EyeOff size={12} strokeWidth={1.6} className="text-gentle-400" />
          <span className="text-gentle-400 dark:text-gentle-300/90">不上传</span>
        </>
      )}
    </button>
  );
}

export default function PrivacyPanel() {
  const [expanded, setExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const markSeen = usePrivacyStore((s) => s.markPrivacyNoticeSeen);

  const { keyCount, estimatedBytes } = estimateLocalStorageUsage();

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
    if (!expanded) markSeen();
  }, [expanded, markSeen]);

  const handleClear = useCallback(() => {
    clearAllLocalData();
    setCleared(true);
    setShowClearConfirm(false);
    setTimeout(() => setCleared(false), 3000);
  }, []);

  return (
    <section className="mt-4 sm:mt-5" aria-label="数据脱敏与隐私设置">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="privacy-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-gentle-200/50 bg-gradient-to-br from-gentle-50/90 via-white/85 to-gentle-100/70 p-5 shadow-[0_12px_40px_-24px_rgba(28,58,44,0.22)] backdrop-blur-lg dark:border-gentle-700/30 dark:from-gentle-900/80 dark:via-[#17211d]/85 dark:to-gentle-800/70 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.40)]">

              {/* Header */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gentle-200/80 dark:bg-gentle-700/50">
                  <ShieldCheck size={16} strokeWidth={1.8} className="text-gentle-600 dark:text-gentle-300" />
                </span>
                <div>
                  <h3 className="text-sm font-medium text-gentle-800 dark:text-gentle-100">
                    数据脱敏与隐私
                  </h3>
                  <p className="text-xs text-gentle-500/80 dark:text-gentle-300/70">
                    你的健康数据如何被存储和使用
                  </p>
                </div>
              </div>

              {/* Data policy table */}
              <div className="overflow-hidden rounded-xl border border-gentle-200/40 dark:border-gentle-700/25">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gentle-200/40 bg-gentle-100/70 dark:border-gentle-700/25 dark:bg-gentle-800/50">
                        <th className="px-3 py-2.5 font-medium text-gentle-600 dark:text-gentle-300">
                          数据类型
                        </th>
                        <th className="px-3 py-2.5 font-medium text-gentle-600 dark:text-gentle-300">
                          保存位置
                        </th>
                        <th className="px-3 py-2.5 font-medium text-gentle-600 dark:text-gentle-300">
                          AI 上传
                        </th>
                        <th className="px-3 py-2.5 hidden sm:table-cell font-medium text-gentle-600 dark:text-gentle-300">
                          处理策略
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gentle-200/20 dark:divide-gentle-700/15">
                      {DATA_POLICIES.map((policy) => (
                        <tr
                          key={policy.category}
                          className="hover:bg-gentle-50/50 dark:hover:bg-gentle-800/30 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-gentle-700 dark:text-gentle-200 font-medium">
                            {policy.label}
                          </td>
                          <td className="px-3 py-2.5 text-gentle-500/80 dark:text-gentle-300/90">
                            {policy.storageLocation}
                          </td>
                          <td className="px-3 py-2.5">
                            <AiToggle
                              category={policy.category}
                              defaultAllowed={policy.aiUploadDefault}
                              userOverride={policy.aiUploadUserOverride}
                            />
                          </td>
                          <td className="px-3 py-2.5 hidden sm:table-cell text-gentle-500/70 dark:text-gentle-300/80">
                            {policy.strategy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile strategy hints */}
              <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                {DATA_POLICIES.map((p) => (
                  <span
                    key={p.category}
                    className="inline-block rounded-full bg-gentle-100/70 dark:bg-gentle-800/55 px-2.5 py-1 text-[0.65rem] text-gentle-500/80 dark:text-gentle-300/90"
                  >
                    {p.label}：{p.strategy}
                  </span>
                ))}
              </div>

              {/* Privacy principles */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex gap-2.5 rounded-xl bg-gentle-100/60 dark:bg-gentle-800/50 px-3.5 py-3">
                  <HardDrive size={15} strokeWidth={1.6} className="mt-0.5 flex-none text-gentle-500 dark:text-gentle-400" />
                  <div>
                    <p className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
                      默认本地存储
                    </p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-gentle-500/80 dark:text-gentle-300/90">
                      健康记录保存在你的浏览器中，不上传到任何服务器。
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5 rounded-xl bg-gentle-100/60 dark:bg-gentle-800/50 px-3.5 py-3">
                  <Brain size={15} strokeWidth={1.6} className="mt-0.5 flex-none text-gentle-500 dark:text-gentle-400" />
                  <div>
                    <p className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
                      最小 AI 上下文
                    </p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-gentle-500/80 dark:text-gentle-300/90">
                      调用 AI 时只上传生成提醒所需的最小信息，不含自由文本。
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5 rounded-xl bg-gentle-100/60 dark:bg-gentle-800/50 px-3.5 py-3">
                  <Trash2 size={15} strokeWidth={1.6} className="mt-0.5 flex-none text-gentle-500 dark:text-gentle-400" />
                  <div>
                    <p className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
                      随时可清除
                    </p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-gentle-500/80 dark:text-gentle-300/90">
                      你可以随时一键清除所有本地数据，不留痕迹。
                    </p>
                  </div>
                </div>
              </div>

              {/* Storage info + Clear button */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-gentle-500/80 dark:text-gentle-300/90">
                  <HardDrive size={13} strokeWidth={1.5} />
                  <span>
                    本地存储约 {formatBytes(estimatedBytes)}（{keyCount} 个键）
                  </span>
                </div>

                <AnimatePresence>
                  {cleared && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-xs text-gentle-500 dark:text-gentle-400"
                    >
                      所有本地数据已清除。
                    </motion.span>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  {!showClearConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/40 px-3 py-1.5 text-xs font-medium text-red-500/80 transition-all duration-200 hover:bg-red-100/60 hover:text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400/80 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      <Trash2 size={13} strokeWidth={1.6} />
                      清空本地数据
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-warm-600 dark:text-warm-400">
                        <AlertTriangle size={13} strokeWidth={1.6} />
                        确认清除？
                      </span>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium text-white transition-all duration-200 hover:bg-red-600 cursor-pointer"
                      >
                        确认
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="rounded-full border border-gentle-200/50 bg-paper-50/50 dark:bg-paper-50/3 px-3 py-1 text-xs font-medium text-gentle-500 transition-all duration-200 hover:bg-gentle-100/70 dark:hover:bg-paper-50/5 cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* S70: Custom emotion tags */}
              <CustomTagEditor />

              {/* S73: Special dates editor */}
              <SpecialDateEditor />

              {/* Disclaimer */}
              <p className="mt-4 text-[0.66rem] leading-relaxed text-gentle-400/60 dark:text-gentle-300/70">
                轻养伴侣遵循「默认本地 + 最小上传」原则。AI 调用不传输个人身份信息、自由文本或医疗数据。所有 AI 建议均由服务端安全过滤后再返回。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed toggle button */}
      <motion.button
        type="button"
        onClick={handleToggle}
        whileTap={{ scale: 0.97 }}
        className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111815] ${
          expanded
            ? 'border-gentle-200/40 bg-paper-50/50 text-gentle-600 shadow-none dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300'
            : 'border-gentle-200/50 bg-paper-50/60 text-gentle-500/80 shadow-[0_4px_16px_-10px_rgba(28,58,44,0.18)] hover:bg-gentle-100/60 hover:text-gentle-600 dark:border-gentle-700/30 dark:bg-paper-50/3 dark:text-gentle-300/70 dark:hover:bg-paper-50/5 dark:hover:text-gentle-300'
        }`}
        aria-expanded={expanded}
        aria-label={expanded ? '收起隐私设置' : '展开隐私设置'}
      >
        <ShieldCheck size={14} strokeWidth={1.6} aria-hidden="true" />
        <span>数据脱敏与隐私</span>
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
