import { Hono } from 'hono';
import { callModel } from '../_shared/modelClient';

const DIET_PATTERN_SYSTEM = `你是一位温柔的饮食与情绪观察伙伴。你的任务不是分析、不是诊断、不是给建议——而是轻轻地指出来访者自己可能没注意到的模式。

规则：
1. 基于用户提供的14天以上数据，识别情绪与进食之间的关系模式
2. 只说一个最明显的模式，用1-2句话表达，总字数不超过80个汉字
3. 语气像朋友聊天时不经意的一个观察："诶你有没有发现……"
4. 不使用"你应该""你总是""建议""必须"等词汇
5. 不涉及任何医学诊断、疾病名称、治疗方案
6. 如果数据看不出明显模式，就温柔地说一句"有时候吃东西就是一种安慰，这也是OK的"
7. 绝不说教、不评判、不制造愧疚感

参考示例：
"最近下午3点左右，当你觉得无聊的时候，好像更容易想找点东西吃。这个模式很多人都有。下次可以试试先喝半杯水，或者站起来伸个懒腰。"
"注意到晚上9点后，当你感到疲惫时，会想翻翻零食。其实有时候不是饿，是身体在说'该休息了'。"
"你似乎每次压力大的时候都会想吃甜的，这是身体很聪明的本能。不过你已经在注意到了，这是很了不起的第一步。"`;

interface DietPatternInput {
  totalRecords: number;
  dayCount: number;
  topEmotion: string;
  topEmotionCount: number;
  topHour: number;
  topHourCount: number;
  avgHungerLevel: number;
  secondEmotion?: string;
}

const dietPattern = new Hono();

dietPattern.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const {
      totalRecords,
      dayCount,
      topEmotion,
      topEmotionCount,
      topHour,
      topHourCount,
      avgHungerLevel,
      secondEmotion,
    } = body as DietPatternInput;

    // Require at least 14 days of data for meaningful pattern
    if (dayCount < 14) {
      return c.json({ insight: '', source: 'ai' as const, reason: 'insufficient-data' });
    }

    const emotionLabels: Record<string, string> = {
      tired: '疲惫', anxious: '焦虑', bored: '无聊', sad: '难过',
      stressed: '压力', hungry: '饿',
    };

    const topEmotionLabel = emotionLabels[topEmotion] ?? topEmotion;
    const secondEmotionLabel = secondEmotion ? (emotionLabels[secondEmotion] ?? secondEmotion) : '';
    const hourLabel = topHour < 12 ? `上午${topHour}点` : topHour < 18 ? `下午${topHour - 12}点` : `晚上${topHour - 12}点`;

    const userMessage = [
      `请分析以下14天以上的饮食-情绪记录，识别最明显的模式：`,
      `- 总共记录了 ${totalRecords} 次情绪性进食`,
      `- 跨越 ${dayCount} 天`,
      `- 最常见的进食触发情绪：${topEmotionLabel}（出现了 ${topEmotionCount} 次）`,
      secondEmotionLabel ? `- 第二常见的触发情绪：${secondEmotionLabel}` : '',
      `- 最容易触发进食的时段：${hourLabel}（出现了 ${topHourCount} 次）`,
      `- 平均饥饿程度：${avgHungerLevel.toFixed(1)}/5`,
      ``,
      `请温柔地指出这个模式，用1-2句话。`,
    ]
      .filter(Boolean)
      .join('\n');

    const raw = await callModel(DIET_PATTERN_SYSTEM, userMessage);
    const insight = raw.trim().slice(0, 100);

    return c.json({ insight: insight || '', source: 'ai' as const });
  } catch {
    return c.json({ insight: '', source: 'fallback' as const, error: 'unavailable' });
  }
});

export default dietPattern;
