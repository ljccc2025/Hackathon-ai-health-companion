import type { BodyPart, MicroExercise } from '../types/health';

/* ── 15 micro-exercise cards per 模块 13 spec ── */

const EXERCISE_DB: MicroExercise[] = [
  {
    id: 'shoulder-roll',
    bodyPart: 'neck',
    title: '肩膀绕圈',
    instruction: '慢慢绕 5 圈，不用做到标准，身体舒服就好。',
    durationSeconds: 30,
  },
  {
    id: 'distance-gaze',
    bodyPart: 'eyes',
    title: '20 秒远眺',
    instruction: '看向窗外或远处，让眼睛离开屏幕一会儿。',
    durationSeconds: 20,
  },
  {
    id: 'wrist-stretch',
    bodyPart: 'wrist',
    title: '手腕伸展',
    instruction: '手掌轻轻向外推，感到一点拉伸就停。',
    durationSeconds: 30,
  },
  {
    id: 'stand-up',
    bodyPart: 'wholeBody',
    title: '原地站立',
    instruction: '站起来，让脚底重新稳稳踩住地面。',
    durationSeconds: 30,
  },
  {
    id: 'neck-side-tilt',
    bodyPart: 'neck',
    title: '颈部侧拉',
    instruction: '头轻轻偏向一侧，感到拉伸感就停，不用勉强。',
    durationSeconds: 30,
  },
  {
    id: 'seated-twist',
    bodyPart: 'back',
    title: '坐姿转体',
    instruction: '坐稳后慢慢转动上半身，左右各 3 次就好。',
    durationSeconds: 30,
  },
  {
    id: 'heel-raise',
    bodyPart: 'wholeBody',
    title: '踮脚起落',
    instruction: '轻轻踮起脚尖再缓慢落下，重复几次放松双腿。',
    durationSeconds: 30,
  },
  {
    id: 'deep-breath',
    bodyPart: 'wholeBody',
    title: '匀速深呼吸',
    instruction: '用鼻子慢慢吸气，再用嘴巴缓缓吐气，重复 3 次。',
    durationSeconds: 30,
  },
  {
    id: 'finger-flex',
    bodyPart: 'wrist',
    title: '手指张合',
    instruction: '用力握拳再完全张开，重复几次活动手指关节。',
    durationSeconds: 30,
  },
  {
    id: 'brow-massage',
    bodyPart: 'eyes',
    title: '眉心轻揉',
    instruction: '用指腹轻轻打圈揉按眉心，缓解头部疲惫感。',
    durationSeconds: 30,
  },
  {
    id: 'calf-stretch',
    bodyPart: 'wholeBody',
    title: '小腿拉伸',
    instruction: '坐姿伸直一条腿，脚尖轻轻往回勾，感受小腿拉伸。',
    durationSeconds: 30,
  },
  {
    id: 'chest-open',
    bodyPart: 'back',
    title: '扩胸舒展',
    instruction: '双手向后打开轻轻挺胸，让胸腔舒展一下。',
    durationSeconds: 30,
  },
  {
    id: 'eye-rest',
    bodyPart: 'eyes',
    title: '闭目小憩',
    instruction: '轻轻闭上眼睛放空，哪怕只休息 10 秒也可以。',
    durationSeconds: 20,
  },
  {
    id: 'ankle-rotate',
    bodyPart: 'wholeBody',
    title: '脚踝转动',
    instruction: '脚踝轻轻画圈转动，左右各 5 圈，不用刻意用力。',
    durationSeconds: 30,
  },
  {
    id: 'back-lean',
    bodyPart: 'back',
    title: '腰背轻后仰',
    instruction: '上半身小幅向后舒展，减轻腰背持续负重感。',
    durationSeconds: 30,
  },
];

/* ── Body part labels ── */

const BODY_PART_LABELS: Record<BodyPart, string> = {
  neck: '肩颈',
  eyes: '眼睛',
  wrist: '手腕',
  back: '腰背',
  wholeBody: '全身',
};

const BODY_PART_HINTS: Record<BodyPart, string> = {
  neck: '低头伏案 / 颈肩僵硬',
  eyes: '眼睛干涩 / 屏幕疲劳',
  wrist: '打字 / 用鼠标 / 手部酸胀',
  back: '腰背酸胀 / 久坐含胸',
  wholeBody: '久坐不动 / 下肢乏力',
};

/* ── Public API ── */

export function getLabel(part: BodyPart): string {
  return BODY_PART_LABELS[part];
}

export function getHint(part: BodyPart): string {
  return BODY_PART_HINTS[part];
}

export function getBodyParts(): BodyPart[] {
  return ['neck', 'eyes', 'wrist', 'back', 'wholeBody'];
}

/** Pick a random exercise for the given body part */
export function pickExercise(part: BodyPart): MicroExercise {
  const candidates = EXERCISE_DB.filter((e) => e.bodyPart === part);
  if (candidates.length === 0) return EXERCISE_DB[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** All exercises for a body part */
export function getExercisesFor(part: BodyPart): MicroExercise[] {
  return EXERCISE_DB.filter((e) => e.bodyPart === part);
}
