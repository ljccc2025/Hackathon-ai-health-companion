import { Hono } from 'hono';
import { buildGreetingPrompt, SYSTEM_PROMPT } from '../_shared/promptBuilder';
import { callModel } from '../_shared/modelClient';
import { guardOutput } from '../_shared/outputGuard';

const greeting = new Hono();

greeting.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { period, tone, nickname, sleepQuality } = body;
    const { user } = buildGreetingPrompt(period, tone, nickname, sleepQuality);

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

export default greeting;
