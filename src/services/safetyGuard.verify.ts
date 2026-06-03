/**
 * 安全守卫验证脚本
 * 运行方式：npx tsx src/services/safetyGuard.verify.ts
 */
import { filterAiOutput, detectEmergencyInput, sanitizeDisplayText, applySafetyPipeline } from './safetyGuard';
import type { AiResponse } from './aiClient';

function assert(condition: boolean, label: string): void {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status} | ${label}`);
  if (!condition) process.exitCode = 1;
}

const SEP = '─'.repeat(60);

/* ════════════════════════════════════════════════════════════════
   测试 1：高风险医疗词汇检测与替换
   ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log('测试 1｜高风险词检测与替换');
console.log(SEP);

{
  // 诊断用语
  const r = filterAiOutput('根据你的描述，你可能被诊断为轻度焦虑症');
  assert(r.wasFiltered, '检测到「诊断为」并触发过滤');
  assert(!r.safeText.includes('轻度焦虑症'), '输出不含原疾病名称');
  assert(r.safeText.includes('生活习惯陪伴'), '替换为安全边界说明');
  console.log(`    原始: 根据你的描述，你可能被诊断为轻度焦虑症`);
  console.log(`    过滤: ${r.safeText}`);
}

console.log();

{
  // 药物建议
  const r = filterAiOutput('我建议服用药片来缓解');
  assert(r.wasFiltered, '检测到「建议服用」模式并触发过滤');
  assert(!r.safeText.includes('服用'), '输出不含「服用」');
  assert(r.safeText.includes('医嘱'), '替换为「遵循医嘱」文案');
  console.log(`    原始: 我建议服用药片来缓解`);
  console.log(`    过滤: ${r.safeText}`);
}

console.log();

{
  // 处方/治疗方案
  const r = filterAiOutput('你的治疗方案应该是每天运动30分钟');
  assert(r.wasFiltered, '检测到「治疗方案」并触发过滤');
  assert(!r.safeText.includes('治疗方案'), '输出不含「治疗方案」');
  console.log(`    原始: 你的治疗方案应该是每天运动30分钟`);
  console.log(`    过滤: ${r.safeText}`);
}

console.log();

{
  // 剂量建议
  const r = filterAiOutput('建议每次2粒，每日3次');
  assert(r.wasFiltered, '检测到「剂量」模式并触发过滤');
  console.log(`    原始: 建议每次2粒，每日3次`);
  console.log(`    过滤: ${r.safeText}`);
}

console.log();

{
  // 命令式/恐吓语气
  const r = filterAiOutput('你必须马上停止吃这些！');
  assert(r.wasFiltered, '检测到「你必须」命令式并触发过滤');
  assert(r.safeText.includes('可以考虑'), '替换为「可以考虑」柔性表达');
  console.log(`    原始: 你必须马上停止吃这些！`);
  console.log(`    过滤: ${r.safeText}`);
}

/* ════════════════════════════════════════════════════════════════
   测试 2：正常文本不误伤
   ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log('测试 2｜正常温柔文案不应被误过滤');
console.log(SEP);

{
  const safeTexts = [
    '如果杯子就在旁边，可以顺手喝两口水。',
    '先不用停下工作，肩膀放松 10 秒也可以。',
    '你已经照顾自己一次了，再来一点点就好。',
    '可以停一下，给身体一点水分。',
  ];

  for (const text of safeTexts) {
    const r = filterAiOutput(text);
    assert(!r.wasFiltered, `「${text.slice(0, 25)}…」 不被误过滤`);
  }
}

/* ════════════════════════════════════════════════════════════════
   测试 3：紧急健康关键词检测
   ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log('测试 3｜紧急/高风险用户输入检测');
console.log(SEP);

{
  const r = detectEmergencyInput('我最近胸口疼得受不了');
  assert(r !== null, '「胸口疼」被识别为紧急输入');
  assert(r!.includes('120'), '紧急引导包含"120"');
  console.log(`    输入: 我最近胸口疼得受不了`);
  console.log(`    引导: ${r?.slice(0, 60)}…`);
}

console.log();

{
  const r = detectEmergencyInput('最近压力好大，有点不想活了');
  assert(r !== null, '「不想活」被识别为高风险输入');
  console.log(`    输入: 最近压力好大，有点不想活了`);
  console.log(`    引导: ${r?.slice(0, 60)}…`);
}

console.log();

{
  const r = detectEmergencyInput('今天水喝得有点少');
  assert(r === null, '普通文本不触发紧急检测');
}

/* ════════════════════════════════════════════════════════════════
   测试 4：AI 响应安全管道
   ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log('测试 4｜完整 AI 响应安全管道');
console.log(SEP);

{
  const aiRes: AiResponse = {
    message: '你可能是患有慢性疲劳综合征，建议服用复合维生素',
    microAction: '吃点药',
    safetyLevel: 'safe',
    source: 'ai',
  };
  const result = applySafetyPipeline(aiRes);
  assert(result.safetyLevel === 'filtered', 'safetyLevel 被标记为 filtered');
  assert(result.message !== aiRes.message, '消息已被过滤修改');
  console.log(`    AI原始: ${aiRes.message}`);
  console.log(`    过滤后: ${result.message}`);
}

console.log();

{
  const fallbackRes: AiResponse = {
    message: '如果杯子就在旁边，可以顺手喝两口水。',
    microAction: '拿起杯子喝两口',
    safetyLevel: 'safe',
    source: 'fallback',
  };
  const result = applySafetyPipeline(fallbackRes);
  assert(result === fallbackRes, 'fallback 来源直接透传不经过滤');
  console.log(`    本地方案直接透传: ${result.message}`);
}

/* ════════════════════════════════════════════════════════════════
   测试 5：XSS 防护
   ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log('测试 5｜XSS 文本脱敏');
console.log(SEP);

{
  const safe = sanitizeDisplayText('<script>alert("xss")</script>');
  assert(!safe.includes('<script>'), 'script 标签被转义');
  assert(safe.includes('&lt;'), '尖括号被编码');
  console.log(`    输入: <script>alert("xss")</script>`);
  console.log(`    输出: ${safe}`);
}

/* ════════════════════════════════════════════════════════════════
   测试 6：多重高风险词同时出现
   ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log('测试 6｜多重高风险词同时过滤');
console.log(SEP);

{
  const r = filterAiOutput('诊断为严重脱水，建议服用口服补液盐，每次10ml每日3次');
  assert(r.wasFiltered, '多重高风险词同时被检测');
  assert(r.blockedPhrases.length >= 3, '至少3个高风险短语被拦截');
  console.log(`    原始: 诊断为严重脱水，建议服用口服补液盐，每次10ml每日3次`);
  console.log(`    拦截: ${r.blockedPhrases.join(' | ')}`);
  console.log(`    过滤: ${r.safeText}`);
}

/* ════════════════════════════════════════════════════════════════ */
console.log(`\n${SEP}`);
console.log(process.exitCode ? '❌ 部分测试未通过' : '✅ 全部测试通过 — 安全守卫正常工作');
console.log(SEP);
