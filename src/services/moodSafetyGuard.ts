/* ── Module 14: Mood Tree Hole Safety Guard ── */

/* ── High-risk keyword detection ── */

const HIGH_RISK_KEYWORDS = [
  '自杀', '想死', '不想活', '结束生命', '死了算了',
  '自伤', '自残', '伤害自己', '割腕', '跳楼',
  '绝望到极点', '活不下去', '没有意义', '生无可恋',
  '想消失', '不想存在', '离开这个世界',
  '想不开', '走投无路', '无路可走',
];

const HIGH_RISK_REFERRAL =
  '听到你这样说，我想认真地告诉你：你此刻的感受很重要，也值得被认真对待。' +
  '如果你有伤害自己的想法，请先联系身边你信任的人，或拨打心理援助热线（如 12320 转心理援助、或当地 24 小时心理危机干预热线）。' +
  '这里的陪伴不能替代专业支持——请让身边的人知道你的状况。';

/** Returns referral message if high-risk content detected, null otherwise */
export function detectHighRisk(text: string): string | null {
  const lower = text.toLowerCase();
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (lower.includes(kw)) return HIGH_RISK_REFERRAL;
  }
  return null;
}

/* ── Emotion tag extraction from free text ── */

const EMOTION_PATTERNS: { keywords: string[]; tag: string }[] = [
  { keywords: ['累', '疲惫', '无力', '没力气', '乏', '好累', '太累了', '累死'], tag: 'tired' },
  { keywords: ['焦虑', '不安', '担心', '紧张', '慌', '不知所措', '六神无主'], tag: 'anxious' },
  { keywords: ['烦', '无聊', '没意思', '闷', '好烦', '烦死', '厌倦'], tag: 'bored' },
  { keywords: ['难过', '难受', '伤心', '低落', '哭', '悲伤', '抑郁', '失望', '委屈', '无助', '心碎', '心痛', '沮丧', '心累', '心寒', '心酸', '好难'], tag: 'sad' },
  { keywords: ['压力', '崩溃', '撑不住', '受不了', '喘不过气', '好大压力', '扛不住', '吃不消', '好重', '透不过气'], tag: 'stressed' },
  { keywords: ['生气', '愤怒', '恼火', '烦躁', '火大', '气死', '好气', '可恨'], tag: 'angry' },
  { keywords: ['孤单', '孤独', '寂寞', '一个人', '没人理解', '没人懂', '被忽略', '被遗忘', '孤立'], tag: 'lonely' },
  { keywords: ['迷茫', '不知道怎么办', '没方向', '困惑', '不知所措', '迷路'], tag: 'lost' },
  { keywords: ['后悔', '愧疚', '内疚', '对不起', '亏欠', '遗憾'], tag: 'guilty' },
];

export function extractEmotionTags(text: string): string[] {
  const tags = new Set<string>();
  for (const pattern of EMOTION_PATTERNS) {
    for (const kw of pattern.keywords) {
      if (text.includes(kw)) {
        tags.add(pattern.tag);
        break;
      }
    }
  }
  return tags.size > 0 ? [...tags] : ['sad']; // default to sad if nothing detected
}

export function estimateIntensity(text: string): 1 | 2 | 3 | 4 | 5 {
  const highIntensityWords = ['崩溃', '撑不住', '绝望', '受不了', '想死', '活不下去', '极致'];
  const mediumHighWords = ['很', '非常', '特别', '一直', '总是', '每天', '受不了'];
  const mediumWords = ['比较', '有点', '有些', '经常', '好多'];

  let score = 1;
  for (const w of highIntensityWords) {
    if (text.includes(w)) { score = 5; break; }
  }
  if (score < 5) {
    for (const w of mediumHighWords) {
      if (text.includes(w)) { score = Math.max(score, 4); }
    }
  }
  if (score < 4) {
    for (const w of mediumWords) {
      if (text.includes(w)) { score = Math.max(score, 3); }
    }
  }
  if (text.length > 30) score = Math.max(score, 2);
  return score as 1 | 2 | 3 | 4 | 5;
}

/* ── Local fallback responses (when AI unavailable or privacy blocked) ── */

interface FallbackResponse {
  message: string;
  microAction: string;
}

const FALLBACK_RESPONSES: FallbackResponse[] = [
  { message: '听起来你承受了不少东西。', microAction: '把手放在胸口，慢慢呼吸 3 次。' },
  { message: '现在不需要马上好起来，先让感受待一会儿。', microAction: '喝一小口温水，感受它慢慢流过。' },
  { message: '你已经撑了很久了，辛苦了。', microAction: '轻轻闭上眼睛，数 5 次呼吸。' },
  { message: '有些日子就是比较重，不是你的错。', microAction: '把视线移到窗外，哪怕只看 10 秒。' },
  { message: '谢谢你愿意把这些放在这里。', microAction: '让肩膀从耳朵旁边慢慢沉下来。' },
  { message: '我听到你了，不需要急着解决什么。', microAction: '慢慢转动手腕，感受当下的身体。' },
  { message: '这一刻可以先不处理所有事情。', microAction: '把脚稳稳踩在地面上，感受一下支撑。' },
  { message: '你的感受是合理的，不需要为此道歉。', microAction: '给自己一个轻轻的拥抱，或者揉揉眉心。' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getFallbackResponse(): FallbackResponse {
  return pick(FALLBACK_RESPONSES);
}

/* ── Self-criticism detection (cognitive reframing trigger) ── */

/** Keywords indicating the user is being harsh on themselves — warrants a gentle reframe */
const SELF_CRITICISM_KEYWORDS = [
  '我太差劲', '我真差劲', '太差劲', '我好差劲',
  '又失败了', '又没做到', '又搞砸了', '又没坚持',
  '坚持不了', '坚持不下去', '做不到', '做不好',
  '我就是不行', '我什么都不行', '我什么都做不好', '我真没用',
  '我好没用', '太没用了', '我没用',
  '又偷懒了', '又懒了', '我太懒了', '我好懒',
  '控制不了', '管不住自己', '管不住', '控制不住',
  '我真笨', '好笨', '太笨了', '笨死了',
  '讨厌自己', '恨自己', '不喜欢自己',
  '不够好', '做得不够', '还差很多', '差太远',
  '对自己失望', '太让人失望', '让人失望',
  '比不上', '不如别人', '别人都行',
  '废物', '没出息', '不争气',
  '自责', '怪我', '是我的错', '都怪我',
  '考砸', '没考好', '考差了', '挂科', '失败', '我真失败', '我很失败', '好失败',
  '搞砸', '全搞砸', '全毁了', '被我毁了',
  '我真没用', '一无是处', '什么都不会',
  '又拖延', '又浪费', '浪费时间', '虚度',
];

export function detectSelfCriticism(text: string): boolean {
  for (const kw of SELF_CRITICISM_KEYWORDS) {
    if (text.includes(kw)) return true;
  }
  return false;
}

/* ── Body signal detection (non-medical gentle interpretation trigger) ── */

/** Common body discomfort phrases — triggers AI to give a gentle, non-medical comfort response */
const BODY_SIGNAL_KEYWORDS = [
  '头疼', '头痛', '脑袋疼', '偏头痛', '头好疼', '头很疼', '头有点疼', '头好痛', '头很痛', '头有点痛',
  '眼睛干', '眼睛酸', '眼睛累', '眼干', '干眼', '眼睛好干', '眼睛很干', '眼睛有点干', '眼睛涩', '眼睛痛', '眼睛疼',
  '脖子酸', '脖子疼', '脖子痛', '颈椎', '落枕', '脖子僵硬', '脖子不舒服',
  '肩膀酸', '肩膀疼', '肩膀痛', '肩膀紧', '肩颈', '肩膀不舒服',
  '腰酸', '腰疼', '腰痛', '腰不舒服',
  '背疼', '背酸', '背痛', '后背', '背不舒服',
  '手腕疼', '手腕酸', '手腕痛', '手酸', '手疼', '手痛',
  '腿酸', '腿疼', '腿痛', '膝盖疼', '膝盖痛', '脚酸', '腿不舒服',
  '胃疼', '胃痛', '胃不舒服', '胃胀', '肚子疼', '肚子痛', '肚子不舒服', '消化不良',
  '头晕', '眩晕', '眼花', '发昏', '头昏', '头好晕', '头好昏',
  '嗓子疼', '嗓子痛', '喉咙痛', '喉咙疼', '喉咙不舒服', '嗓子干', '喉咙干',
  '鼻塞', '流鼻涕', '打喷嚏',
  '牙疼', '牙痛', '牙龈', '口腔溃疡',
  '皮肤干', '起皮', '过敏', '痒', '皮肤痒',
  '感冒', '发烧', '发热', '发冷',
  '胸闷', '心慌', '心跳快', '喘不过气',
  '失眠', '睡不好', '睡不着', '熬夜',
  '累得不行', '浑身没劲', '全身酸', '全身累', '浑身酸', '浑身疼', '浑身痛',
];

export function detectBodySignal(text: string): boolean {
  for (const kw of BODY_SIGNAL_KEYWORDS) {
    if (text.includes(kw)) return true;
  }
  return false;
}

/* ── Body part category extraction (privacy-safe: only category labels go to AI) ── */

interface BodyPartPattern {
  keywords: string[];
  category: string;
}

const BODY_PART_PATTERNS: BodyPartPattern[] = [
  { keywords: ['头疼', '头痛', '脑袋疼', '偏头痛', '头好疼', '头很疼', '头有点疼', '头好痛', '头很痛', '头有点痛', '头晕', '眩晕', '眼花', '发昏', '头昏', '头好晕', '头好昏'], category: '头部不适' },
  { keywords: ['眼睛干', '眼睛酸', '眼睛累', '眼干', '干眼', '眼睛好干', '眼睛很干', '眼睛有点干', '眼睛涩', '眼睛痛', '眼睛疼'], category: '眼睛不适' },
  { keywords: ['脖子酸', '脖子疼', '脖子痛', '颈椎', '落枕', '脖子僵硬', '脖子不舒服'], category: '脖子不适' },
  { keywords: ['肩膀酸', '肩膀疼', '肩膀痛', '肩膀紧', '肩颈', '肩膀不舒服'], category: '肩膀不适' },
  { keywords: ['腰酸', '腰疼', '腰痛', '腰不舒服'], category: '腰部不适' },
  { keywords: ['背疼', '背酸', '背痛', '后背', '背不舒服'], category: '背部不适' },
  { keywords: ['手腕疼', '手腕酸', '手腕痛', '手酸', '手疼', '手痛'], category: '手腕不适' },
  { keywords: ['腿酸', '腿疼', '腿痛', '膝盖疼', '膝盖痛', '脚酸', '腿不舒服'], category: '腿部不适' },
  { keywords: ['胃疼', '胃痛', '胃不舒服', '胃胀', '肚子疼', '肚子痛', '肚子不舒服', '消化不良'], category: '胃部不适' },
  { keywords: ['嗓子疼', '嗓子痛', '喉咙痛', '喉咙疼', '喉咙不舒服', '嗓子干', '喉咙干'], category: '喉咙不适' },
  { keywords: ['鼻塞', '流鼻涕', '打喷嚏'], category: '鼻子不适' },
  { keywords: ['牙疼', '牙痛', '牙龈', '口腔溃疡'], category: '口腔不适' },
  { keywords: ['皮肤干', '起皮', '过敏', '痒', '皮肤痒'], category: '皮肤不适' },
  { keywords: ['胸闷', '心慌', '心跳快', '喘不过气'], category: '胸口不适' },
  { keywords: ['失眠', '睡不好', '睡不着', '熬夜'], category: '睡眠不好' },
  { keywords: ['感冒', '发烧', '发热', '发冷'], category: '身体不适' },
  { keywords: ['累得不行', '浑身没劲', '全身酸', '全身累', '浑身酸', '浑身疼', '浑身痛'], category: '全身疲劳' },
];

/** Extract a privacy-safe body part category from free text. Returns null if no body signal detected. */
export function extractBodyPartCategory(text: string): string | null {
  for (const pattern of BODY_PART_PATTERNS) {
    for (const kw of pattern.keywords) {
      if (text.includes(kw)) return pattern.category;
    }
  }
  return null;
}

/* ── Sanitize for AI upload ── */

export interface SanitizedMoodInput {
  emotionTags: string[];
  intensityLevel: 1 | 2 | 3 | 4 | 5;
  rawText: string;
}

export function sanitizeMoodForAi(
  moodText: string,
): SanitizedMoodInput {
  return {
    emotionTags: extractEmotionTags(moodText),
    intensityLevel: estimateIntensity(moodText),
    rawText: moodText,
  };
}

/* ── Life event context extraction (privacy-safe: only category labels go to AI) ── */

interface ContextPattern {
  keywords: string[];
  category: string;
}

const CONTEXT_PATTERNS: ContextPattern[] = [
  { keywords: ['考试', '考砸', '考差', '没考好', '挂科', '成绩', '分数', '期末', '期中', '高考', '考研', '复习', '备考', '作业', '论文', '毕业', '升学', '补考', '刷题', '卷子'], category: '学业挫折' },
  { keywords: ['工作', '加班', '老板', '上司', '同事', '辞职', '离职', '面试', '求职', '失业', '职场', '996', '项目', '汇报', '业绩', 'KPI', 'OKR', '裁员', '跳槽', '入职'], category: '工作压力' },
  { keywords: ['分手', '失恋', '吵架', '冷战', '暗恋', '表白', '前任', '前女友', '前男友', '异地', '相亲', '离婚', '出轨', '劈腿', '感情'], category: '感情困扰' },
  { keywords: ['爸妈', '父母', '妈妈', '爸爸', '家人', '家里', '亲戚', '催婚', '逼婚', '回家', '家庭', '重男轻女'], category: '家庭压力' },
  { keywords: ['朋友', '闺蜜', '兄弟', '社交', '被孤立', '人际关系', '矛盾', '误会', '不合群', '人缘', '被排挤', '社恐'], category: '人际困扰' },
  { keywords: ['没钱', '穷', '房租', '还贷', '欠款', '花呗', '借钱', '经济', '省吃俭用', '入不敷出', '月光'], category: '经济压力' },
  { keywords: ['迷茫', '不知道怎么办', '没方向', '未来', '前途', '出路', '人生', '活着', '意义', '目标'], category: '人生迷茫' },
  { keywords: ['胖', '身材', '体重', '减肥', '长痘', '变丑', '变老', '外貌', '容貌', '长相', '形象'], category: '外貌焦虑' },
];

/** Extract a privacy-safe life context category from free text. Returns null if nothing detected. */
export function extractContextCategory(text: string): string | null {
  for (const pattern of CONTEXT_PATTERNS) {
    for (const kw of pattern.keywords) {
      if (text.includes(kw)) return pattern.category;
    }
  }
  return null;
}
