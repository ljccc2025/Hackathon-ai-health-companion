const BLOCKED_PATTERNS = [
  /诊断为/,
  /建议服用/,
  /处方/,
  /药物剂量/,
  /你的病情/,
  /患者/,
  /病症/,
  /你这是.*症/,
  /你有.*症/,
  /属于.*障碍/,
];

function containsBlocked(text: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(text));
}

export interface GuardResult {
  message: string;
  microAction: string;
  safetyLevel: 'safe' | 'filtered' | 'blocked';
  source: 'ai';
}

export function guardOutput(raw: string): GuardResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      message: '我听到了你说的，这些感受是真实的。',
      microAction: '也许可以先做一次长长的深呼吸，让自己从这一刻开始慢慢安顿下来。',
      safetyLevel: 'safe',
      source: 'ai',
    };
  }

  if (containsBlocked(trimmed)) {
    return {
      message: '我听到了你的困扰。每个人的情绪都值得被认真对待。',
      microAction: '如果你觉得这些感受持续困扰你，也许可以考虑找一位真正的心理咨询师聊一聊。',
      safetyLevel: 'filtered',
      source: 'ai',
    };
  }

  // Extract the two sections: "## 我看到" and "## 也许可以"
  const insightMatch = trimmed.match(/##\s*我看到\s*\n?([\s\S]*?)(?=##\s*也许可以|$)/);
  const suggestMatch = trimmed.match(/##\s*也许可以\s*\n?([\s\S]*)/);

  const insight = insightMatch?.[1]?.trim() || trimmed.split('\n')[0]?.replace(/^##\s*我看到\s*/, '').trim() || '我听到了你说的。';
  const suggestion = suggestMatch?.[1]?.trim() || trimmed.split('\n').slice(1).join('\n').trim() || '也许可以先做一次长长的深呼吸。';

  return {
    message: insight.slice(0, 200),
    microAction: suggestion.slice(0, 300),
    safetyLevel: 'safe',
    source: 'ai',
  };
}
