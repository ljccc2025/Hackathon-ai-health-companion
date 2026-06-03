import { Hono } from 'hono';
import { SYSTEM_PROMPT } from '../_shared/promptBuilder';
import { callModel } from '../_shared/modelClient';
import { guardOutput } from '../_shared/outputGuard';

const moodTreeHole = new Hono();

moodTreeHole.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { rawText, emotionTags, intensityLevel, contextCategory } = body as {
      rawText?: string;
      emotionTags?: string[];
      intensityLevel?: number;
      contextCategory?: string;
    };

    const userWords = rawText?.trim();
    if (!userWords) {
      return c.json({
        message: '',
        microAction: '',
        safetyLevel: 'safe' as const,
        source: 'ai' as const,
        error: 'empty-input',
      });
    }

    const tagInfo = emotionTags?.length
      ? `（系统检测到情绪类型：${emotionTags.join('、')}，强度约 ${intensityLevel ?? '?'}/5）`
      : '';
    const contextInfo = contextCategory
      ? `涉及情境：${contextCategory}。`
      : '';

    const userMessage = `这个人对你说了下面这段话：

"${userWords}"

${tagInfo}${contextInfo}

请按照你的回应结构，先给出"## 我看到"，再给出"## 也许可以"。`;

    const raw = await callModel(SYSTEM_PROMPT, userMessage);
    const result = guardOutput(raw);

    return c.json(result);
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

export default moodTreeHole;
