import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  ChevronDown,
  Calculator,
  Loader2,
  Save,
  History,
  Trash2,
  X,
  Activity,
  Moon,
  Utensils,
  Dumbbell,
  Brain,
  Calendar,
  Heart,
} from 'lucide-react';
import { useBMIStore, calculateBMI, getBMICategory, getBMIPosition } from '../../store/bmiStore';
import { getBMISuggestion } from '../../services/aiClient';
import type {
  BMIFormData,
  BMIResult,
  BMIRecord,
  BMICategory,
  ActivityLevel,
  Gender,
} from '../../types/health';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: '久坐不动', description: '办公室工作，很少运动' },
  { value: 'light', label: '轻度活动', description: '每周运动 1-3 次' },
  { value: 'moderate', label: '中度活动', description: '每周运动 3-5 次' },
  { value: 'active', label: '重度活动', description: '每周运动 6-7 次' },
  { value: 'very_active', label: '极高活动', description: '体力劳动或专业运动员' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

const SUGGESTION_TABS = [
  { key: 'overview', label: '评估', icon: Activity },
  { key: 'diet', label: '饮食', icon: Utensils },
  { key: 'exercise', label: '运动', icon: Dumbbell },
  { key: 'sleep', label: '睡眠', icon: Moon },
  { key: 'mental', label: '心理', icon: Brain },
  { key: 'plan', label: '计划', icon: Calendar },
];

// Fallback suggestion when AI is unavailable
function getFallbackSuggestion(result: BMIResult, formData: BMIFormData): string {
  const { category } = result;
  const age = formData.age || 25;

  const suggestions: Record<BMICategory, string> = {
    underweight: `## 📊 健康状况评估
您的 BMI 为 ${result.bmi.toFixed(1)}，属于偏瘦范围。体重偏低可能导致免疫力下降、容易疲劳等问题。

## 🍽️ 饮食调养方案
**每日营养目标：**
- 热量：${age < 30 ? '2200-2500' : '2000-2300'} 千卡
- 蛋白质：${Math.round(formData.weight * 1.5)}克

**饮食建议：**
- 🥚 早餐：鸡蛋2个 + 全麦面包 + 牛奶 + 坚果
- 🥩 午餐：米饭 + 瘦肉/鱼 + 蔬菜 + 豆制品
- 🍲 晚餐：杂粮饭 + 鸡胸肉 + 绿叶蔬菜
- 🥜 加餐：酸奶、坚果、水果

**注意事项：**
- 少食多餐，每天可安排 5-6 餐
- 增加优质蛋白摄入
- 不要靠吃零食增重

## 🏃 运动建议
- 以力量训练为主，促进肌肉增长
- 每周 3-4 次，每次 45-60 分钟
- 推荐：深蹲、硬拉、卧推等复合动作
- 配合适量有氧，避免过度消耗

## 😴 睡眠建议
- 保证每晚 7-8 小时睡眠
- 尽量在 23:00 前入睡
- 睡前避免使用电子设备

## 🧘 心理健康
- 增重过程需要耐心，不要因体重变化缓慢而焦虑
- 建立积极的身体意象，关注健康而非数字
- 适当社交活动，保持愉悦心情
- 如有进食障碍倾向，建议寻求专业帮助

## 📅 一周调养计划
**周一/三/五：** 力量训练 + 高蛋白饮食
**周二/四：** 轻度有氧 + 正常饮食
**周六：** 户外活动 + 补充营养
**周日：** 休息 + 饮食调整

## ⚠️ 重要提醒
增重要循序渐进，建议每周增重 0.5-1 斤。如有持续体重下降，请及时就医检查。`,

    normal: `## 📊 健康状况评估
您的 BMI 为 ${result.bmi.toFixed(1)}，属于正常范围。请继续保持良好的生活习惯！

## 🍽️ 饮食调养方案
**每日营养目标：**
- 热量：${age < 30 ? '2000-2200' : '1800-2000'} 千卡
- 蛋白质：${Math.round(formData.weight * 1.2)}克

**饮食建议：**
- 🥣 早餐：燕麦 + 鸡蛋 + 水果
- 🥗 午餐：主食 + 荤素搭配 + 蔬菜
- 🍜 晚餐：清淡为主，七分饱
- 🍎 加餐：水果、酸奶

**注意事项：**
- 保持三餐规律
- 营养均衡，不偏食
- 控制油盐糖摄入

## 🏃 运动建议
- 有氧 + 力量训练结合
- 每周 3-5 次，每次 30-60 分钟
- 推荐：跑步、游泳、瑜伽、健身
- 保持运动多样性

## 😴 睡眠建议
- 保证每晚 7-8 小时睡眠
- 建立规律的作息时间
- 创造良好的睡眠环境

## 🧘 心理健康
- 保持积极乐观的生活态度
- 适当进行冥想或深呼吸放松
- 培养兴趣爱好，丰富精神生活
- 维持良好的社交关系

## 📅 一周调养计划
**周一/三/五：** 有氧运动 30-45 分钟
**周二/四：** 力量训练 45 分钟
**周六：** 户外活动/瑜伽
**周日：** 休息放松

## ⚠️ 重要提醒
继续保持！定期体检，关注身体变化。`,

    overweight: `## 📊 健康状况评估
您的 BMI 为 ${result.bmi.toFixed(1)}，属于超重范围。建议适当控制体重，降低健康风险。

## 🍽️ 饮食调养方案
**每日营养目标：**
- 热量：${age < 30 ? '1600-1800' : '1400-1600'} 千卡
- 蛋白质：${Math.round(formData.weight * 1.2)}克

**饮食建议：**
- 🥗 早餐：全麦面包 + 鸡蛋 + 蔬菜
- 🥦 午餐：减少主食 + 增加蔬菜 + 瘦肉
- 🥒 晚餐：清淡为主，少油少盐
- 🫖 加餐：水果、坚果（少量）

**注意事项：**
- 控制总热量摄入
- 减少高糖高脂食物
- 细嚼慢咽，每餐 20 分钟以上
- 晚餐尽量在 19:00 前完成

## 🏃 运动建议
- 以有氧运动为主，帮助燃脂
- 每周 4-5 次，每次 40-60 分钟
- 推荐：快走、慢跑、游泳、骑车
- 配合力量训练提高基础代谢

## 😴 睡眠建议
- 保证每晚 7-8 小时睡眠
- 睡前 2 小时避免进食
- 睡眠不足会影响代谢

## 🧘 心理健康
- 减重过程保持平和心态，不要急于求成
- 避免因体重波动产生焦虑情绪
- 寻找健康的减压方式，避免情绪性进食
- 记录进步，肯定自己的努力

## 📅 一周调养计划
**周一/三/五：** 有氧运动 40-60 分钟
**周二/四：** 力量训练 + 轻度有氧
**周六：** 长时间有氧/户外活动
**周日：** 休息 + 饮食调整

## ⚠️ 重要提醒
减重要循序渐进，建议每周减重 0.5-1 斤。不要节食，要健康减重！`,

    obese: `## 📊 健康状况评估
您的 BMI 为 ${result.bmi.toFixed(1)}，属于肥胖范围。建议积极调整生活方式，必要时咨询医生。

## 🍽️ 饮食调养方案
**每日营养目标：**
- 热量：${age < 30 ? '1400-1600' : '1200-1400'} 千卡
- 蛋白质：${Math.round(formData.weight * 1.2)}克

**饮食建议：**
- 🥗 早餐：燕麦 + 鸡蛋 + 蔬菜
- 🥦 午餐：减少主食 + 大量蔬菜 + 瘦肉
- 🥒 晚餐：蔬菜为主，少量主食
- 🫖 加餐：黄瓜、西红柿等低热量食物

**注意事项：**
- 严格控制热量摄入
- 避免油炸、高糖食物
- 增加膳食纤维摄入
- 多喝水，每天 2000ml 以上

## 🏃 运动建议
- 从低强度有氧开始
- 每周 5-6 次，每次 30-60 分钟
- 推荐：快走、游泳、骑车（保护关节）
- 逐渐增加运动强度

## 😴 睡眠建议
- 保证每晚 7-8 小时睡眠
- 睡前避免进食
- 良好的睡眠有助于控制体重

## 🧘 心理健康
- 减重是长期过程，保持耐心和信心
- 不要因体重反弹而自我否定
- 寻求家人朋友的支持和鼓励
- 如有情绪困扰，建议咨询心理咨询师

## 📅 一周调养计划
**周一-六：** 有氧运动 30-60 分钟
**周二/四：** 增加力量训练
**周日：** 休息 + 轻度活动

## ⚠️ 重要提醒
建议咨询医生或营养师，制定个性化的减重计划。如有高血压、糖尿病等基础疾病，请在医生指导下进行体重管理。`,
  };

  return suggestions[category] || suggestions.normal;
}

// Parse suggestion text into sections
function parseSuggestionSections(suggestion: string): Record<string, string> {
  if (!suggestion) return {};

  const sections: Record<string, string> = {};
  const lines = suggestion.split('\n');
  let currentKey = 'overview';
  let currentContent: string[] = [];

  for (const line of lines) {
    // Support ## and ### heading formats
    const isHeading = line.startsWith('## ') || line.startsWith('### ');

    if (isHeading) {
      // Save current section content
      if (currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
          sections[currentKey] = (sections[currentKey] || '') + (sections[currentKey] ? '\n\n' : '') + content;
        }
      }
      currentContent = [];

      // Classify by heading content (match more specific keywords first)
      if (line.includes('评估') || line.includes('状况') || line.includes('健康状况') || line.includes('📊')) {
        currentKey = 'overview';
      } else if (line.includes('饮食') || line.includes('营养') || line.includes('🍽️')) {
        currentKey = 'diet';
      } else if (line.includes('运动') || line.includes('锻炼') || line.includes('处方') || line.includes('🏃')) {
        currentKey = 'exercise';
      } else if (line.includes('睡眠') || line.includes('作息') || line.includes('😴') || line.includes('优化')) {
        currentKey = 'sleep';
      } else if (line.includes('心理') || line.includes('情绪') || line.includes('压力') || line.includes('🧘') || line.includes('冥想')) {
        currentKey = 'mental';
      } else if (line.includes('计划') || line.includes('一周') || line.includes('📅') || line.includes('安排')) {
        currentKey = 'plan';
      } else if (line.includes('目标') || line.includes('阶段') || line.includes('🎯')) {
        currentKey = 'plan';
      } else if (line.includes('提醒') || line.includes('注意') || line.includes('⚠️')) {
        currentKey = 'overview';
      }
      // Unmatched headings keep current currentKey, content appended to current section
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    const content = currentContent.join('\n').trim();
    if (content) {
      sections[currentKey] = (sections[currentKey] || '') + (sections[currentKey] ? '\n\n' : '') + content;
    }
  }

  return sections;
}

// Render markdown line
function renderMarkdownLine(line: string, index: number) {
  if (line.startsWith('### ')) {
    return (
      <h3
        key={index}
        className="text-base font-medium text-gentle-800 dark:text-gentle-100 mt-4 mb-2"
      >
        {line.replace('### ', '')}
      </h3>
    );
  }
  if (line.startsWith('**')) {
    return (
      <p
        key={index}
        className="font-medium text-gentle-700 dark:text-gentle-200 mt-2 mb-1"
      >
        {line.replace(/\*\*/g, '')}
      </p>
    );
  }
  if (line.startsWith('- ')) {
    return (
      <p
        key={index}
        className="text-sm text-gentle-600 dark:text-gentle-300 ml-4 mb-1"
      >
        {line}
      </p>
    );
  }
  if (line.trim() === '') {
    return <br key={index} />;
  }
  return (
    <p
      key={index}
      className="text-sm text-gentle-600 dark:text-gentle-300 mb-1"
    >
      {line}
    </p>
  );
}

export default function BMICard() {
  const { addRecord, records, deleteRecord } = useBMIStore();

  // Form state
  const [collapsed, setCollapsed] = useState(true);
  const [formData, setFormData] = useState<BMIFormData>({
    height: 170,
    weight: 65,
    age: undefined,
    gender: undefined,
    activityLevel: undefined,
    sleepHours: undefined,
    dietPreference: '',
    specialConditions: '',
  });

  // Result state
  const [result, setResult] = useState<BMIResult | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHistory, setShowHistory] = useState(false);
  const [showExtended, setShowExtended] = useState(false);

  // 禁止背景滚动
  useEffect(() => {
    if (showHistory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showHistory]);

  // Calculate BMI
  const bmiResult = useMemo(() => {
    if (formData.height > 0 && formData.weight > 0) {
      const bmi = calculateBMI(formData.height, formData.weight);
      return getBMICategory(bmi);
    }
    return null;
  }, [formData.height, formData.weight]);

  // Handle form input
  const handleInputChange = useCallback(
    (field: keyof BMIFormData, value: string | number | undefined) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Generate suggestion
  const handleGenerate = useCallback(async () => {
    if (!bmiResult) return;

    setLoading(true);
    setResult(bmiResult);
    setActiveTab('overview');

    try {
      const response = await getBMISuggestion({
        height: formData.height,
        weight: formData.weight,
        bmi: bmiResult.bmi,
        category: bmiResult.categoryLabel,
        age: formData.age,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        sleepHours: formData.sleepHours,
        dietPreference: formData.dietPreference,
        specialConditions: formData.specialConditions,
      });

      // Use AI response only if source is 'ai' AND message is non-empty
      if (response.source === 'ai' && response.message && response.message.trim()) {
        setSuggestion(response.message);
      } else {
        // Always use fallback if AI response is empty or source is fallback
        setSuggestion(getFallbackSuggestion(bmiResult, formData));
      }
    } catch {
      // On any error, use fallback
      setSuggestion(getFallbackSuggestion(bmiResult, formData));
    } finally {
      setLoading(false);
    }
  }, [bmiResult, formData]);

  // Save record
  const handleSave = useCallback(() => {
    if (!result || !suggestion) return;

    const record: BMIRecord = {
      id: crypto.randomUUID(),
      formData,
      result,
      suggestion,
      createdAt: Date.now(),
    };

    addRecord(record);
  }, [formData, result, suggestion, addRecord]);

  // Format date
  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Parse suggestion into sections
  const suggestionSections = useMemo(() => {
    return parseSuggestionSections(suggestion);
  }, [suggestion]);

  // Get content for active tab, with fallback to full suggestion for overview
  const activeTabContent = useMemo(() => {
    if (suggestionSections[activeTab]) {
      return suggestionSections[activeTab];
    }
    // For overview tab, if no parsed sections, show full suggestion
    if (activeTab === 'overview' && suggestion) {
      return suggestion;
    }
    return '';
  }, [suggestionSections, activeTab, suggestion]);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-[#0e1f1b]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500"
    >
      <div className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setCollapsed(!collapsed)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setCollapsed(!collapsed);
            }
          }}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-50">
              <Scale size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
              BMI 健康指数
            </span>
            {result && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${result.bgColor} ${result.color}`}
              >
                {result.categoryLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistory(!showHistory);
                }}
                className="p-1.5 rounded-lg text-gentle-500 hover:text-gentle-700 dark:text-gentle-400 dark:hover:text-gentle-200 transition-colors"
              >
                <History size={16} />
              </button>
            )}
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-gentle-600/70 dark:text-gentle-300"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.span>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 26, mass: 0.8 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-5 pt-2">
                {/* Input Form */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gentle-600 dark:text-gentle-400 mb-1.5">
                      身高 (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) =>
                        handleInputChange('height', parseFloat(e.target.value) || 0)
                      }
                      placeholder="170"
                      className="w-full px-3 py-2 rounded-xl border border-gentle-200/60 bg-paper-50/60 text-sm text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gentle-600 dark:text-gentle-400 mb-1.5">
                      体重 (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) =>
                        handleInputChange('weight', parseFloat(e.target.value) || 0)
                      }
                      placeholder="65"
                      className="w-full px-3 py-2 rounded-xl border border-gentle-200/60 bg-paper-50/60 text-sm text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
                    />
                  </div>
                </div>

                {/* Extended inputs toggle */}
                <button
                  type="button"
                  onClick={() => setShowExtended(!showExtended)}
                  className="text-xs text-gentle-500 hover:text-gentle-700 dark:text-gentle-400 dark:hover:text-gentle-200 transition-colors"
                >
                  {showExtended ? '收起' : '展开'}更多信息（可选）
                </button>

                {/* Extended inputs */}
                <AnimatePresence>
                  {showExtended && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gentle-600 dark:text-gentle-400 mb-1.5">
                            年龄
                          </label>
                          <input
                            type="number"
                            value={formData.age || ''}
                            onChange={(e) =>
                              handleInputChange('age', parseInt(e.target.value) || undefined)
                            }
                            placeholder="25"
                            className="w-full px-3 py-2 rounded-xl border border-gentle-200/60 bg-paper-50/60 text-sm text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gentle-600 dark:text-gentle-400 mb-1.5">
                            性别
                          </label>
                          <select
                            value={formData.gender || ''}
                            onChange={(e) =>
                              handleInputChange('gender', (e.target.value as Gender) || undefined)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gentle-200/60 bg-paper-50/60 text-sm text-gentle-800 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
                          >
                            <option value="">选择性别</option>
                            {GENDER_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gentle-600 dark:text-gentle-400 mb-1.5">
                            活动量
                          </label>
                          <select
                            value={formData.activityLevel || ''}
                            onChange={(e) =>
                              handleInputChange(
                                'activityLevel',
                                (e.target.value as ActivityLevel) || undefined,
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gentle-200/60 bg-paper-50/60 text-sm text-gentle-800 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
                          >
                            <option value="">选择活动量</option>
                            {ACTIVITY_LEVELS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gentle-600 dark:text-gentle-400 mb-1.5">
                            睡眠 (小时)
                          </label>
                          <input
                            type="number"
                            value={formData.sleepHours || ''}
                            onChange={(e) =>
                              handleInputChange('sleepHours', parseInt(e.target.value) || undefined)
                            }
                            placeholder="7"
                            className="w-full px-3 py-2 rounded-xl border border-gentle-200/60 bg-paper-50/60 text-sm text-gentle-800 placeholder:text-gentle-400/70 outline-none transition-all duration-200 focus:border-gentle-400/80 focus:ring-2 focus:ring-gentle-300/40 dark:border-gentle-700/40 dark:bg-[#0a1714]/60 dark:text-gentle-50 dark:placeholder:text-gentle-600/60 dark:focus:border-gentle-500/60 dark:focus:ring-gentle-600/20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Calculate Button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!bmiResult || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/12 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/22 text-gentle-800 dark:text-gentle-100 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                      正在生成调养方案...
                    </>
                  ) : (
                    <>
                      <Calculator size={16} strokeWidth={1.5} />
                      生成调养方案
                    </>
                  )}
                </button>

                {/* BMI Result */}
                {bmiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gentle-200/50 bg-paper-50/45 p-4 dark:border-gentle-700/30 dark:bg-[#0a1411]/70"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-gentle-500 dark:text-gentle-400">
                          BMI 指数
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-2xl font-semibold text-gentle-800 dark:text-gentle-100">
                            {bmiResult.bmi.toFixed(1)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${bmiResult.bgColor} ${bmiResult.color}`}
                          >
                            {bmiResult.categoryLabel}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gentle-500 dark:text-gentle-400">
                          {bmiResult.description}
                        </span>
                      </div>
                    </div>

                    {/* BMI Scale */}
                    <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 overflow-hidden">
                      <div
                        className="absolute top-0 w-3 h-3 -mt-0.5 rounded-full bg-white shadow-md border-2 border-gentle-600 dark:border-gentle-300 transition-all duration-500"
                        style={{ left: `${getBMIPosition(bmiResult.bmi)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-gentle-500 dark:text-gentle-400">
                      <span>偏瘦</span>
                      <span>正常</span>
                      <span>超重</span>
                      <span>肥胖</span>
                    </div>
                  </motion.div>
                )}

                {/* AI Suggestion */}
                {suggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gentle-200/50 bg-paper-50/45 dark:border-gentle-700/30 dark:bg-[#0a1411]/70 overflow-hidden"
                  >
                    {/* Tabs */}
                    <div className="flex border-b border-gentle-200/50 dark:border-gentle-700/30 overflow-x-auto">
                      {SUGGESTION_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const hasContent = !!suggestionSections[tab.key] || (tab.key === 'overview' && suggestion);
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                              activeTab === tab.key
                                ? 'text-gentle-800 dark:text-gentle-100 border-b-2 border-gentle-500'
                                : 'text-gentle-500 hover:text-gentle-700 dark:text-gentle-400 dark:hover:text-gentle-200'
                            } ${!hasContent ? 'opacity-50' : ''}`}
                          >
                            <Icon size={14} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab content */}
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {activeTabContent ? (
                          activeTabContent.split('\n').map((line, i) => renderMarkdownLine(line, i))
                        ) : (
                          <p className="text-sm text-gentle-500 dark:text-gentle-400 text-center py-8">
                            暂无{SUGGESTION_TABS.find(t => t.key === activeTab)?.label || ''}相关建议
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Save button */}
                    <div className="flex items-center justify-between p-4 border-t border-gentle-200/50 dark:border-gentle-700/30">
                      <span className="text-xs text-gentle-500 dark:text-gentle-400">
                        <Heart size={12} className="inline mr-1" />
                        以上建议仅供参考
                      </span>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gentle-200/80 text-gentle-700 hover:bg-gentle-300/80 dark:bg-gentle-700/60 dark:text-gentle-100 dark:hover:bg-gentle-600/60 text-xs font-medium transition-colors"
                      >
                        <Save size={14} />
                        保存记录
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Modal - 使用 Portal 渲染到 body，避免被父元素 transform 影响 */}
        {createPortal(
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowHistory(false);
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-[420px] w-full max-h-[80vh] bg-white dark:bg-[#1a2320] rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gentle-200/50 dark:border-gentle-700/30">
                    <h3 className="text-base font-medium text-gentle-800 dark:text-gentle-100">
                      历史记录
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowHistory(false)}
                      className="p-1.5 rounded-lg text-gentle-500 hover:text-gentle-700 dark:text-gentle-400 dark:hover:text-gentle-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {records.length === 0 ? (
                      <p className="text-center text-gentle-500 dark:text-gentle-400 py-8">
                        暂无记录
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {records.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gentle-200/50 dark:border-gentle-700/30 bg-paper-50/45 dark:bg-[#0a1411]/70"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gentle-800 dark:text-gentle-100">
                                  {record.result.bmi.toFixed(1)}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${record.result.bgColor} ${record.result.color}`}
                                >
                                  {record.result.categoryLabel}
                                </span>
                              </div>
                              <span className="text-xs text-gentle-500 dark:text-gentle-400">
                                {formatDate(record.createdAt)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteRecord(record.id)}
                              className="p-1.5 rounded-lg text-gentle-400 hover:text-red-500 dark:text-gentle-500 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </motion.section>
  );
}
