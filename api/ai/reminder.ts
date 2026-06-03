import { Hono } from 'hono';
import { buildPrompt, SYSTEM_PROMPT } from '../_shared/promptBuilder';
import { callModel } from '../_shared/modelClient';
import { guardOutput } from '../_shared/outputGuard';

const reminder = new Hono();

reminder.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { scene = 'general', context } = body;
    const { user } = buildPrompt(scene, context);

    const raw = await callModel(SYSTEM_PROMPT, user);
    const result = guardOutput(raw);

    return c.json(result);
  } catch {
    return c.json(
      {
        message: '',
        microAction: '',
        safetyLevel: 'safe' as const,
        source: 'ai' as const,
        error: 'unavailable',
      },
    );
  }
});

export default reminder;
