import { Hono } from 'hono';
import { buildBMIPrompt } from '../_shared/promptBuilder';
import { callModel } from '../_shared/modelClient';

// BMI专用系统提示词
const BMI_SYSTEM_PROMPT = `你是一位专业的健康管理师和营养师。请根据用户的身体数据，提供个性化、可执行的健康调养方案。语气专业但温和，像一位贴心的健康顾问。`;

const bmi = new Hono();

bmi.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const {
      height,
      weight,
      bmi: bmiValue,
      category,
      age,
      gender,
      activityLevel,
      sleepHours,
      dietPreference,
      specialConditions,
    } = body;

    const userMessage = buildBMIPrompt({
      height,
      weight,
      bmi: bmiValue,
      category,
      age,
      gender,
      activityLevel,
      sleepHours,
      dietPreference,
      specialConditions,
    });

    const raw = await callModel(BMI_SYSTEM_PROMPT, userMessage);

    // BMI场景直接返回完整AI输出，不经过标准guardOutput解析
    return c.json({
      message: raw,
      microAction: '',
      safetyLevel: 'safe' as const,
      source: 'ai' as const,
      rawText: raw,
    });
  } catch {
    return c.json({
      message: '',
      microAction: '',
      safetyLevel: 'safe' as const,
      source: 'fallback' as const,
      error: 'unavailable',
      rawText: '',
    });
  }
});

export default bmi;
