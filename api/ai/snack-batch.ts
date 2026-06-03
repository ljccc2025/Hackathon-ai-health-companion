import { Hono } from 'hono';
import { callModel } from '../_shared/modelClient';

const BATCH_SYSTEM_PROMPT = `你是一位温柔的饮食陪伴助手。用户今天吃了一些食物，请你用一句话告诉ta，这些食物对ta的身体有什么具体的好处。

输出格式（严格遵循）：
"您今天吃的这些食物，对您的身体有xxx好处，xxx。"

要求：
1. 一句话，30-50个汉字
2. 重点说对身体的益处（补充水分、提供能量、帮助消化、滋润肠胃、让皮肤更好、缓解疲劳、让心情轻快等），不要只是罗列食物名字
3. 语气自然温柔，像朋友聊天
4. 绝不说"你应该""你必须""建议你"
5. 不涉及任何医学诊断或治疗`;

const snackBatch = new Hono();

snackBatch.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { items } = body as { items: { emoji: string; label: string }[] };

    if (!items || items.length === 0) {
      return c.json({ insight: '' });
    }

    const list = items.map((it) => `${it.label}`).join('、');

    const raw = await callModel(
      BATCH_SYSTEM_PROMPT,
      `用户今天吃了：${list}。请用一句话告诉ta这些食物对身体的益处，格式为"您今天吃的这些食物，对您的身体有xxx好处"。`,
    );

    const insight = raw.trim().slice(0, 80);
    return c.json({ insight: insight || defaultInsight(items) });
  } catch {
    return c.json({ insight: '' });
  }
});

function defaultInsight(items: { emoji: string; label: string }[]): string {
  const list = items.map((it) => `${it.label}`).join('、');
  return `您今天吃的${list}，给身体补充了丰富的水分和营养，让肠胃感到舒服，也给今天带来了一份温柔的滋养。`;
}

export default snackBatch;
