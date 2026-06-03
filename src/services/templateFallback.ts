import type { EmotionTag, ReminderTone } from '../types/health';

/* ── Emotion food templates (per emotion tag, tone-independent) ── */

const EMOTION_FOOD_TEMPLATES: Record<EmotionTag, { message: string; microAction: string }> = {
  tired: {
    message: '听起来你可能更像是累了，而不是真的饿。可以先喝点水，离开屏幕站 1 分钟。如果之后还想吃，就认真吃一点也没关系。',
    microAction: '离开屏幕站 1 分钟',
  },
  anxious: {
    message: '焦虑的时候想吃东西很正常，这是身体在找安慰。先把手放在胸口慢慢呼一口气，再决定要不要吃。',
    microAction: '把手放在胸口，慢慢呼一口气',
  },
  stressed: {
    message: '压力大的时候嘴巴想动一动，这不是意志力的问题。先喝两口水，让身体换个节奏。',
    microAction: '喝两口水',
  },
  bored: {
    message: '也许在找的不是食物，而是一个切换状态的小动作。站起来伸个懒腰，看看窗外 20 秒。',
    microAction: '站起来，看看窗外 20 秒',
  },
  sad: {
    message: '难过的时候想吃甜的，这是身体很聪明的本能。先给自己倒杯温水，暖暖手，再决定。',
    microAction: '倒杯温水，暖暖手',
  },
  hungry: {
    message: '如果真的饿了，就好好吃一点。不用评判自己，身体需要能量是很正常的事。',
    microAction: '认真吃一点，不评判自己',
  },
};

export function getEmotionFoodFallback(tags: EmotionTag[]): { message: string; microAction: string } {
  for (const tag of tags) {
    if (EMOTION_FOOD_TEMPLATES[tag]) return EMOTION_FOOD_TEMPLATES[tag];
  }
  return {
    message: '先停 10 秒感受一下，是身体饿了还是心里需要一点安慰？不管答案是什么，都没关系。',
    microAction: '停 10 秒，感受一下自己的身体',
  };
}

/* ── Hydration templates (per tone) ── */

const HYDRATION_BY_TONE: Record<ReminderTone, { message: string; microAction: string }[]> = {
  friend: [
    { message: '如果杯子就在旁边，可以顺手喝两口水。', microAction: '拿起杯子喝两口' },
    { message: '身体可能需要一点水分，喝两口就好。', microAction: '喝两口水' },
    { message: '不用多，一两口温水就能让身体舒服很多。', microAction: '喝一两口温水' },
  ],
  quiet: [
    { message: '可以停一下，给身体一点水分。', microAction: '喝两口水' },
    { message: '水在旁边，喝两口。', microAction: '喝两口' },
    { message: '一口温水就够了。', microAction: '喝一口水' },
  ],
  encouraging: [
    { message: '你已经照顾自己一次了，再来一点点就好。', microAction: '喝两口水' },
    { message: '做得很好，再喝一口水奖励身体一下吧。', microAction: '喝一口水' },
    { message: '已经很棒了，顺手喝两口水继续。', microAction: '拿起杯子喝两口' },
  ],
  poetic: [
    { message: '窗外的光已经等了你很久，去接一杯水吧。', microAction: '接一杯水' },
    { message: '杯子里的水像清晨的露珠，等着被你发现。', microAction: '喝两口水' },
    { message: '水在杯子里安静了很久，它想被你轻轻喝掉。', microAction: '喝一口温水' },
  ],
  companion: [
    { message: '我在旁边数着你喝了几口水，该加一次了。', microAction: '喝两口水' },
    { message: '你的杯子里还有水吗？没有的话，我陪你一起去接。', microAction: '接一杯水' },
    { message: '悄悄把杯子推到你手边，喝一口吧。', microAction: '喝一口温水' },
  ],
};

export function getHydrationFallback(tone?: ReminderTone): { message: string; microAction: string } {
  const pool = HYDRATION_BY_TONE[tone ?? 'friend'] ?? HYDRATION_BY_TONE.friend;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Standup templates (per tone) ── */

const STANDUP_BY_TONE: Record<ReminderTone, { message: string; microAction: string }[]> = {
  friend: [
    { message: '如果刚好有空，站起来伸一下肩颈，30 秒就好。', microAction: '站起来伸一下肩颈' },
    { message: '你已经坐了好一会儿了，站起来让身体换个姿势吧。', microAction: '站起来换个姿势' },
  ],
  quiet: [
    { message: '可以站起来。不用做什么，站一下就好。', microAction: '站起来站一下' },
    { message: '让身体换一个角度。', microAction: '起身站一会儿' },
  ],
  encouraging: [
    { message: '你已经专注了很久，起来活动一下会更好。', microAction: '站起来伸一下' },
    { message: '离开椅子 30 秒，你值得这个小小的休息。', microAction: '离开椅子 30 秒' },
  ],
  poetic: [
    { message: '肩膀上的云朵该飘走了，站起来让它们散开吧。', microAction: '站起来伸展一下' },
    { message: '椅子舍不得你，但它也知道你需要离开一小会儿。', microAction: '起身活动' },
  ],
  companion: [
    { message: '我替你的肩膀感到有点紧，咱们起来绕两圈吧。', microAction: '站起来绕一绕肩' },
    { message: '像猫一样伸个懒腰，不用很标准，舒服就好。', microAction: '像猫一样伸懒腰' },
  ],
};

export function getStandupFallback(tone?: ReminderTone): { message: string; microAction: string } {
  const pool = STANDUP_BY_TONE[tone ?? 'friend'] ?? STANDUP_BY_TONE.friend;
  return pool[Math.floor(Math.random() * pool.length)];
}
