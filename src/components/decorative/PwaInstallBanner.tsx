import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(true);

  const handleInstall = useCallback(async () => {
    const accepted = await promptInstall();
    if (accepted) setVisible(false);
  }, [promptInstall]);

  const handleDismiss = useCallback(() => setVisible(false), []);

  if (!canInstall || !visible || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-install-banner"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md sm:bottom-6"
        aria-label="安装应用到桌面"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-gentle-200/60 bg-gradient-to-r from-gentle-50/95 via-white/90 to-gentle-100/85 px-4 py-3 shadow-[0_16px_44px_-24px_rgba(28,58,44,0.32)]  dark:border-gentle-700/30 dark:from-gentle-800/90 dark:via-[#17211d]/90 dark:to-gentle-900/85 dark:shadow-[0_16px_44px_-24px_rgba(0,0,0,0.45)]">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gentle-200/80 dark:bg-gentle-700/50">
            <Download size={16} strokeWidth={1.8} className="text-gentle-600 dark:text-gentle-300" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gentle-800 dark:text-gentle-100 truncate">
              添加到桌面
            </p>
            <p className="text-[0.68rem] text-gentle-500/80 dark:text-gentle-200/80 truncate">
              像小工具一样随手打开
            </p>
          </div>

          <motion.button
            type="button"
            onClick={handleInstall}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 rounded-full bg-gentle-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-gentle-600 cursor-pointer dark:bg-gentle-600 dark:hover:bg-gentle-500"
          >
            安装
          </motion.button>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-gentle-200/60 bg-gentle-100/60 text-gentle-400 hover:text-gentle-600 transition-colors duration-200 cursor-pointer dark:border-gentle-600/30 dark:bg-gentle-700/40 dark:text-gentle-400 dark:hover:text-gentle-200"
            aria-label="关闭安装提示"
          >
            <X size={11} strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
