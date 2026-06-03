import { Hono } from 'hono';
import { callModel } from '../_shared/modelClient';

const SNACK_SYSTEM_PROMPT = `你是一位温柔的饮食陪伴助手。当用户告诉你今天吃了某种食物时，用一句话（不超过40个汉字）轻轻地告诉用户这个食物对身体有什么温暖的小好处。

规则：
1. 只说一句，不超过40个汉字
2. 语气像朋友聊天，不说教
3. 不涉及任何医学诊断、治疗建议、营养成分数据
4. 可以提到"滋润"、"温暖"、"舒服"、"轻盈"这类感受性词汇
5. 绝不说"你应该""你必须"`;

const snackInsight = new Hono();

snackInsight.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { emoji, label } = body;

    const raw = await callModel(
      SNACK_SYSTEM_PROMPT,
      `用户刚刚吃了${label}${emoji}，请给一句温柔的饮食陪伴回应。`,
    );

    return c.json({ insight: raw.trim().slice(0, 60) });
  } catch {
    return c.json({ insight: '' });
  }
});

export default snackInsight;
