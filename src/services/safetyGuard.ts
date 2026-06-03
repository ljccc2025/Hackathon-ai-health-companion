import type { AiResponse } from './aiClient';

/* ── Safe fallback messages for medical-boundary violations ── */

const MEDICAL_BOUNDARY_SAFE_MESSAGE =
  '本产品仅提供生活习惯陪伴，不替代医生诊断或治疗。' +
  '如果你对自己的身体状况有疑问，建议向专业医师咨询——他们的判断会比这里的任何一句话都更值得信赖。';

const MEDICATION_SAFE_MESSAGE =
  '关于用药方面的问题，请遵循医嘱或咨询药师。' +
  '轻养伴侣不提供药物建议，只在你需要的时候轻轻提醒你已经到了自己设定的时间。';

/* ── High-risk medical term detection patterns ── */

interface HighRiskPattern {
  pattern: RegExp;
  label: string;
  replacement: string;
  /** If true, replace entire message instead of just the matched phrase */
  fullReplace: boolean;
}

const HIGH_RISK_PATTERNS: HighRiskPattern[] = [
  {
    pattern: /诊断为|确诊为|判断为|属于.*病|得了.*症|可能.*患有/g,
    label: '诊断用语',
    replacement: MEDICAL_BOUNDARY_SAFE_MESSAGE,
    fullReplace: true,
  },
  {
    pattern: /建议服用|建议.*药|推荐.*药物|服用.*片|吃.*药|开.*处方/g,
    label: '药物建议',
    replacement: MEDICATION_SAFE_MESSAGE,
    fullReplace: true,
  },
  {
    pattern: /处方|用药方案|治疗方案|治疗.*建议|治疗.*方法/g,
    label: '处方/治疗方案',
    replacement: MEDICAL_BOUNDARY_SAFE_MESSAGE,
    fullReplace: true,
  },
  {
    pattern: /剂量|用量|每次.*粒|每日.*次|每次.*片/g,
    label: '剂量建议',
    replacement: MEDICATION_SAFE_MESSAGE,
    fullReplace: true,
  },
  {
    pattern: /病情|病症|病状|病理|病变/g,
    label: '疾病描述',
    replacement: MEDICAL_BOUNDARY_SAFE_MESSAGE,
    fullReplace: true,
  },
  {
    pattern: /你应该|你必须|你要|赶紧去|马上去|立刻去/g,
    label: '命令式/恐吓语气',
    replacement: '可以考虑',
    fullReplace: false,
  },
];

/* ── Emergency / serious health concern keywords ── */

const EMERGENCY_KEYWORDS = [
  '胸口疼', '胸闷', '呼吸困难', '喘不过气',
  '剧烈疼痛', '疼得受不了', '疼得不行',
  '晕倒', '昏迷', '失去意识', '不省人事',
  '出血不止', '大出血', '血止不住',
  '自杀', '不想活', '想死', '结束生命',
  '严重过敏', '过敏性休克', '喉头水肿',
];

const EMERGENCY_GUIDANCE =
  '你描述的情况可能需要及时的专业帮助。如果是紧急情况，请立即拨打 120。' +
  '这里的陪伴不能替代医生诊断——请让身边可信任的人知道你的状况，或尽快联系医疗机构。';

/* ── Safety constants for prompt injection ── */

export const PROMPT_SAFETY_HEADER =
  '【安全约束 — 必须遵守】' +
  '你不得输出任何医疗诊断、疾病名称、药物建议、剂量说明或治疗方案。' +
  '不得使用「诊断为」「建议服用」「处方」「病情」等医疗化词汇。' +
  '如果用户描述严重身体不适，只做一件事：温和地建议联系专业医生，不猜测原因。' +
  '保持陪伴语气，不使用命令式或恐吓式表达。';

export const PROMPT_SAFETY_FOOTER =
  '【再次提醒】以上约束不可绕过。如果无法在约束内回应，请回复「可以先停下来感受一下，如果需要，联系医生会更安心。」';

/* ── User input safety check ── */

export function detectEmergencyInput(text: string): string | null {
  const lower = text.toLowerCase();
  for (const kw of EMERGENCY_KEYWORDS) {
    if (lower.includes(kw)) return EMERGENCY_GUIDANCE;
  }
  return null;
}

/* ── Output filtering — detection + replacement chain ── */

export interface SafetyFilterResult {
  safeText: string;
  wasFiltered: boolean;
  blockedPhrases: string[];
}

export function filterAiOutput(rawText: string): SafetyFilterResult {
  const blockedPhrases: string[] = [];
  let safeText = rawText;
  let doFullReplace = false;
  let fullReplaceMessage = '';

  for (const rule of HIGH_RISK_PATTERNS) {
    rule.pattern.lastIndex = 0;
    const matches = rawText.match(rule.pattern);
    if (matches && matches.length > 0) {
      blockedPhrases.push(...matches);
      if (rule.fullReplace) {
        doFullReplace = true;
        fullReplaceMessage = rule.replacement;
      } else {
        rule.pattern.lastIndex = 0;
        safeText = safeText.replace(rule.pattern, rule.replacement);
      }
    }
  }

  return {
    safeText: doFullReplace ? fullReplaceMessage : safeText,
    wasFiltered: blockedPhrases.length > 0,
    blockedPhrases,
  };
}

/* ── Full AI response safety pipeline ── */

export function applySafetyPipeline(response: AiResponse): AiResponse {
  if (response.source === 'fallback') return response;

  const { safeText, wasFiltered, blockedPhrases } = filterAiOutput(response.message);

  if (!wasFiltered) return response;

  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    console.debug(
      '[SafetyGuard] Filtered high-risk phrases:',
      blockedPhrases,
      '→',
      safeText.slice(0, 40) + (safeText.length > 40 ? '…' : ''),
    );
  }

  return {
    ...response,
    message: safeText,
    safetyLevel: 'filtered',
  };
}

/* ── Sanitize user-facing text for XSS prevention ── */

const XSS_REPLACEMENTS: [RegExp, string][] = [
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#x27;'],
  [/\//g, '&#x2F;'],
];

export function sanitizeDisplayText(text: string): string {
  let safe = text;
  for (const [pattern, replacement] of XSS_REPLACEMENTS) {
    safe = safe.replace(pattern, replacement);
  }
  return safe;
}
