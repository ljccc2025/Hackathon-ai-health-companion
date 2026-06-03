import { Hono } from 'hono';
import { callModel } from '../_shared/modelClient';
import { guardOutput } from '../_shared/outputGuard';

const WEEKLY_SYSTEM_PROMPT = `你是一位温柔的每周健康回顾助手。你的任务是：根据用户过去一周的轻养数据，生成一段温暖的周报总结。

请严格遵循以下规则：
1. 总字数控制在150个汉字以内
2. 分为三段：一段总结本周亮点（2-3句），一段温柔地指出可以更多关注的地方（1-2句，不说教），一段送上一句下周的小祝福（1句）
3. 绝不使用命令式语气（不说"你应该""你必须""你要"）
4. 绝不制造愧疚感（不说"你总是忘记""你做得不够"）
5. 用"我注意到""我看到""你已经有"这类温柔观察的语气
6. 不要提到任何具体数字或评分，只说趋势和感受
7. 整体语调像一位了解你但从不催促你的朋友

输出格式（纯文本，不要markdown）：

[第一段：小亮点]
[第二段：温柔关注]
[第三段：下周小祝福]`;

const weeklyReport = new Hono();

weeklyReport.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { hydrationCount, standupCount, emotionCount, topEmotion, bestDay, breathingCount } = body;

    const userMessage = `请根据以下一周轻养数据，生成一段温柔的周报总结：

本周数据概览：
- 喝水记录：${hydrationCount} 次
- 起身活动：${standupCount} 次
- 呼吸练习：${breathingCount} 次
- 情绪记录：${emotionCount} 次
- 最常记录的情绪：${topEmotion || '没有特别明显的情绪'}
- 照顾自己最多的一天：${bestDay || '每一天都差不多'}`;

    const raw = await callModel(WEEKLY_SYSTEM_PROMPT, userMessage);
    const result = guardOutput(raw);

    return c.json({
      ...result,
      rawText: raw,
    });
  } catch {
    return c.json({
      message: '',
      microAction: '',
      safetyLevel: 'safe' as const,
      source: 'ai' as const,
      error: 'unavailable',
    });
  }
});

export default weeklyReport;
