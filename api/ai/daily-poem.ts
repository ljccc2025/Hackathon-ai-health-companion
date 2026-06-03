import { Hono } from 'hono';
import { callModel } from '../_shared/modelClient';

const POEM_SYSTEM_PROMPT = `你是一位温柔的生活诗人，你的诗像清晨的露珠，轻而透明。

你的任务：根据当日的天气、星期几、用户近几天的情绪基调，写一首4行现代白话微诗。

规则：
1. 共4行，全诗不超过60个汉字
2. 用朴素、安静的自然意象（光、水、风、叶、雨、云、星、花等）
3. 不直说情绪，而是通过意象自然流露
4. 不评价、不说教、不试图"治愈"——只写诗
5. 现代白话，不模仿古诗词
6. 纯文本输出，不要标题、引号或任何解释
7. 每行用换行分隔
8. 如果没有合适的灵感，就写一个安静、简单的片刻`;

const dailyPoem = new Hono();

dailyPoem.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { weather, weekday, recentMoods } = body as {
      weather?: string;
      weekday?: string;
      recentMoods?: string;
    };

    const userMessage = [
      '请写一首4行微诗：',
      weather ? `今天的天气：${weather}` : '',
      weekday ? `今天是星期${weekday}` : '',
      recentMoods ? `最近几天的情绪基调：${recentMoods}` : '',
      '',
      '只输出诗句，不要任何其他内容。',
    ]
      .filter(Boolean)
      .join('\n');

    const raw = await callModel(POEM_SYSTEM_PROMPT, userMessage);

    // Extract poem lines — take first 4, strip any non-poem text
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('【') && !l.startsWith('第'))
      .slice(0, 4);

    const poem = lines.join('\n') || '窗外的光\n等了你很久\n不用急\n它一直都在';

    return c.json({
      poem,
      safetyLevel: 'safe' as const,
      source: 'ai' as const,
    });
  } catch {
    return c.json({
      poem: '',
      safetyLevel: 'safe' as const,
      source: 'fallback' as const,
      error: 'unavailable',
    });
  }
});

export default dailyPoem;
