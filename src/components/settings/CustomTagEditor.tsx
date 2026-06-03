import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, X } from 'lucide-react';
import { usePreferenceStore } from '../../store/preferenceStore';

const COLOR_PRESETS = [
  { color: '#d85c7e', label: '桃红' },
  { color: '#f5973b', label: '暖橙' },
  { color: '#4b9e80', label: '墨绿' },
  { color: '#6baed6', label: '浅蓝' },
  { color: '#9b8ec4', label: '淡紫' },
  { color: '#e8c84c', label: '鹅黄' },
];

const MAX_TAGS = 3;

export default function CustomTagEditor() {
  const customTags = usePreferenceStore((s) => s.customTags);
  const setCustomTags = usePreferenceStore((s) => s.setCustomTags);
  const [name, setName] = useState('');
  const [pickedColor, setPickedColor] = useState(COLOR_PRESETS[0].color);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || customTags.length >= MAX_TAGS) return;
    setCustomTags([...customTags, { name: trimmed, color: pickedColor }]);
    setName('');
  };

  const handleRemove = (index: number) => {
    setCustomTags(customTags.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 rounded-xl border border-gentle-200/40 dark:border-gentle-700/25 bg-gentle-100/60 dark:bg-gentle-800/50 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={14} strokeWidth={1.6} className="text-gentle-500 dark:text-gentle-400" />
        <span className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
          自定义情绪标签
        </span>
        <span className="text-[10px] text-gentle-400/60 dark:text-gentle-500/50">
          （最多 {MAX_TAGS} 个）
        </span>
      </div>

      {/* Existing tags */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {customTags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border"
              style={{
                backgroundColor: tag.color + '18',
                borderColor: tag.color + '40',
                color: tag.color,
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="ml-0.5 hover:opacity-70 cursor-pointer"
              >
                <X size={10} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new tag */}
      {customTags.length < MAX_TAGS && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="标签名（如：烦躁）"
              maxLength={6}
              className="flex-1 px-3 py-1.5 rounded-lg bg-paper-50/60 dark:bg-gentle-900/50 border border-gentle-200/50 dark:border-gentle-700/30 text-xs text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 dark:placeholder:text-gentle-500/60 outline-none focus:border-gentle-400/50"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleAdd}
              disabled={!name.trim()}
              className="flex items-center gap-1 rounded-lg bg-gentle-400/25 dark:bg-gentle-400/15 px-3 py-1.5 text-xs font-medium text-gentle-600 dark:text-gentle-300 disabled:opacity-30 cursor-pointer"
            >
              <Plus size={12} strokeWidth={2} />
              添加
            </motion.button>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-1.5">
            {COLOR_PRESETS.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => setPickedColor(color)}
                title={label}
                className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                  pickedColor === color ? 'ring-2 ring-offset-1 ring-gentle-400 dark:ring-offset-gentle-900 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
