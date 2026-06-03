/* ── 24 safety boundary rules per 模块 12 spec ──
   The product may be asked medicine-related questions.
   Every response must redirect to professional medical advice. */

export interface SafetyBoundaryRule {
  /** Keyword patterns that trigger this rule */
  triggers: RegExp[];
  /** Safe canned response */
  response: string;
}

const BASE_REMINDER = '请遵循医嘱或咨询医生/药师。轻养伴侣不提供药物建议，只在你设定的时间轻轻提醒。';

export const MEDICINE_SAFETY_RULES: SafetyBoundaryRule[] = [
  {
    triggers: [/加量|多吃.*片|增加.*剂量|加.*药量/],
    response: '不给出任何增减药建议，请咨询专业医生或药师确定用量。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/减量|少吃.*片|减少.*剂量|减.*药量/],
    response: '不私自给出调整方案，请务必咨询医生或药师确认。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/停药|不想吃了|不.*继续服用/],
    response: '不建议自行停药，请前往咨询专业医护人员确认是否可以调整。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/错过.*药|忘.*吃药|漏服|忘记.*服用/],
    response: '请查看原有医嘱内容确认如何处理，不建议擅自补服药物。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/补救|补服|补吃|能不能补/],
    response: '不提供补救服用方法，请查看个人留存的医嘱或咨询医生。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/多种药|搭配服用|一起吃|冲突|相克/],
    response: '不自行判断药物冲突风险，请遵从专业用药建议。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/每天.*次|一天.*次|频次|频率|改成.*次/],
    response: '不协助更改服药节奏，请勿私自调整服用次数。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/换.*药|替代.*药|换成|换一种/],
    response: '不随意推荐更换药物，建议就医问诊后再做决定。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/保健品|营养品|维生素.*一起吃/],
    response: '不判定同食安全与否，建议咨询专业药师核实。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/老人|小孩|儿童|宝宝.*吃药|孩子.*药/],
    response: '不提供专属用药指导，请直接前往专科门诊问诊。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/怀孕|孕期|哺乳|孕妇|产妇/],
    response: '不做任何安全判定，请务必就医确认后方可使用任何药物。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/不适|难受|副作用|反应|不舒服.*药/],
    response: '不分析不适原因也不提供缓解办法，建议及时就医诊治。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/疗程|吃多久|还要吃.*多久|用药.*时间/],
    response: '不随意更改用药疗程，一切严格按照医嘱执行。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/副作用.*怎么办|副作用.*处理|不良反应/],
    response: '不解答副作用处理方式，建议及时联系主治医生沟通。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/额外.*加|临时.*加|再.*加.*片|多吃.*一次/],
    response: '不认可私自加药行为，请遵从既定用药安排。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/忌口|不能吃.*什么|饮食.*禁忌|什么.*不能吃/],
    response: '不私自划定各类禁忌事项，全部以专业医嘱为准。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/规格|剂量.*换|毫克.*换|片数.*换/],
    response: '不进行药量换算比对，建议找医生重新核定服用量。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/空腹|饭前|饭后|什么.*时候吃|几点.*吃/],
    response: '仅保存用户记录的用药信息，不主动指导具体服用时间段。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/过敏.*药|过敏体质.*药|会不会过敏/],
    response: '不主动排查用药过敏风险，请主动告知医师过敏史。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/好转.*停|快好了.*不吃了|症状.*消失.*停/],
    response: '不支持提前结束用药，请完成完整用药疗程。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/喝酒.*药|酒.*吃药|酒精.*药/],
    response: '不判定当下能否用药，严格遵循医嘱相关用药禁忌。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/家人|替.*问|帮.*问|别人.*药|我妈|我爸/],
    response: '仅为记录者提供提醒服务，不为他人提供任何用药相关指导。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/短缺|买不到|没.*卖|替代.*药品|买.*什么药/],
    response: '不推荐任何替代药品，建议前往医院开具正规处方。' + ' ' + BASE_REMINDER,
  },
  {
    triggers: [/空腹.*吃|饭.*吃|能不能.*吃.*药|可以.*吃.*药.*吗/],
    response: '仅保存用户记录的用药信息，不主动指导具体服用时间段。' + ' ' + BASE_REMINDER,
  },
];

/** Check if user input triggers a safety boundary. Returns safe response or null if safe to proceed. */
export function checkMedicineSafety(input: string): string | null {
  for (const rule of MEDICINE_SAFETY_RULES) {
    for (const trigger of rule.triggers) {
      trigger.lastIndex = 0;
      if (trigger.test(input)) return rule.response;
    }
  }
  return null;
}

/** Validate medicine form fields */
export interface MedicineFormErrors {
  medicineName?: string;
  dosageText?: string;
  remindAt?: string;
}

export function validateMedicineForm(fields: {
  medicineName: string;
  dosageText: string;
  remindAt: string;
}): MedicineFormErrors | null {
  const errors: MedicineFormErrors = {};
  if (!fields.medicineName.trim()) errors.medicineName = '请填写药品名称';
  else if (fields.medicineName.trim().length > 40) errors.medicineName = '药品名称不超过 40 个字';
  if (!fields.dosageText.trim()) errors.dosageText = '请填写每次用量';
  else if (fields.dosageText.trim().length > 40) errors.dosageText = '用量说明不超过 40 个字';
  if (!fields.remindAt) errors.remindAt = '请设置提醒时间';

  return Object.keys(errors).length > 0 ? errors : null;
}
