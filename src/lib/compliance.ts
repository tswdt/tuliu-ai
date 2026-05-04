import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export interface ComplianceCheckResult {
  passed: boolean;
  warnings: ComplianceWarning[];
  blocked: boolean;
  requiresConfirmation: string[];
}

export interface ComplianceWarning {
  category: string;
  ruleType: string;
  message: string;
  action: 'block' | 'warn' | 'confirm';
}

const SENSITIVE_CATEGORIES = ['FOOD', 'BEAUTY', 'HEALTH', 'ALCOHOL', 'MEDICAL', 'SUPPLEMENT'];

const CATEGORY_COMPLIANCE_RULES: Record<string, {
  ruleType: string;
  description: string;
  keywords: string[];
  action: 'block' | 'warn' | 'confirm';
}[]> = {
  FOOD: [
    { ruleType: 'no_false_claims', description: '食品不得宣传治疗功效', keywords: ['治疗', '治愈', '疗效', '药用', '处方'], action: 'block' },
    { ruleType: 'no_medical_terms', description: '食品不得使用医疗术语', keywords: ['临床验证', '医学认证', '医生推荐', '医院'], action: 'block' },
    { ruleType: 'nutrition_accuracy', description: '营养成分需准确标注', keywords: ['0卡', '零卡', '无糖', '低脂', '脱脂'], action: 'confirm' },
    { ruleType: 'origin_claim', description: '产地声称需可证实', keywords: ['有机', '天然', '野生', '原产地'], action: 'confirm' },
  ],
  BEAUTY: [
    { ruleType: 'no_medical_claims', description: '化妆品不得宣传医疗功效', keywords: ['治疗', '治愈', '药用', '处方', '医疗'], action: 'block' },
    { ruleType: 'no_exaggerated_effects', description: '不得夸大功效', keywords: ['立即', '永久', '彻底', '100%', '绝对'], action: 'block' },
    { ruleType: 'ingredient_accuracy', description: '成分声称需准确', keywords: ['纯天然', '无添加', '零添加', '无防腐剂'], action: 'confirm' },
    { ruleType: 'before_after', description: '使用前后对比需真实', keywords: ['对比', '前后', '效果对比'], action: 'warn' },
  ],
  ALCOHOL: [
    { ruleType: 'no_health_claims', description: '酒类不得宣传健康功效', keywords: ['健康', '养生', '保健', '益寿', '长寿'], action: 'block' },
    { ruleType: 'no_driving', description: '不得暗示酒后驾驶', keywords: ['开车', '驾驶', '酒后驾车'], action: 'block' },
    { ruleType: 'age_restriction', description: '需标注未成年人禁止饮酒', keywords: [], action: 'confirm' },
    { ruleType: 'no_excessive', description: '不得鼓励过量饮酒', keywords: ['畅饮', '豪饮', '干杯', '不醉不归'], action: 'warn' },
  ],
  MEDICAL: [
    { ruleType: 'no_false_cure', description: '不得承诺治愈效果', keywords: ['包治', '根治', '治愈率', '100%有效'], action: 'block' },
    { ruleType: 'no_unverified', description: '不得使用未经证实的医疗声称', keywords: ['最新技术', '独家秘方', '祖传秘方'], action: 'block' },
    { ruleType: 'requires_disclaimer', description: '需添加医疗免责声明', keywords: [], action: 'confirm' },
  ],
  HEALTH: [
    { ruleType: 'no_drug_claims', description: '保健品不得宣传药品功效', keywords: ['治疗', '治愈', '替代药物', '处方'], action: 'block' },
    { ruleType: 'no_exaggerated', description: '不得夸大保健效果', keywords: ['包治', '根治', '万能', '神效'], action: 'block' },
    { ruleType: 'ingredient_confirm', description: '成分和功效需用户确认', keywords: ['改善', '增强', '提高免疫力'], action: 'confirm' },
  ],
  SUPPLEMENT: [
    { ruleType: 'no_drug_replacement', description: '膳食补充剂不得替代药物', keywords: ['替代药物', '替代治疗', '停药'], action: 'block' },
    { ruleType: 'dosage_accuracy', description: '剂量声称需准确', keywords: ['每日所需', '推荐摄入', '足量'], action: 'confirm' },
  ],
};

const FABRICATED_PARAM_KEYWORDS = [
  '临床验证', '实验证明', '权威认证', '国际认证',
  '99%有效', '100%纯', '零添加', '无副作用',
  '国家专利', '独家配方', '军工品质',
];

export async function checkCompliance(data: {
  category: string;
  productName: string;
  sellingPoints: string[];
  copyText?: string;
  specs?: string;
}): Promise<ComplianceCheckResult> {
  const warnings: ComplianceWarning[] = [];
  const requiresConfirmation: string[] = [];
  let blocked = false;

  const allText = [data.productName, ...data.sellingPoints, data.copyText || '', data.specs || ''].join(' ');

  const categoryRules = CATEGORY_COMPLIANCE_RULES[data.category] || [];

  for (const rule of categoryRules) {
    const matchedKeywords = rule.keywords.filter(kw => allText.includes(kw));
    if (matchedKeywords.length > 0) {
      const warning: ComplianceWarning = {
        category: data.category,
        ruleType: rule.ruleType,
        message: `${rule.description}（发现：${matchedKeywords.join('、')}）`,
        action: rule.action,
      };
      warnings.push(warning);

      if (rule.action === 'block') blocked = true;
      if (rule.action === 'confirm') requiresConfirmation.push(rule.description);
    }
  }

  if (SENSITIVE_CATEGORIES.includes(data.category)) {
    if (categoryRules.length > 0 && warnings.length === 0) {
      warnings.push({
        category: data.category,
        ruleType: 'sensitive_category',
        message: `该品类（${data.category}）属于敏感品类，请确保所有信息真实准确`,
        action: 'warn',
      });
    }
  }

  for (const keyword of FABRICATED_PARAM_KEYWORDS) {
    if (allText.includes(keyword)) {
      const alreadyWarned = warnings.some(w => w.message.includes(keyword));
      if (!alreadyWarned) {
        warnings.push({
          category: data.category,
          ruleType: 'fabricated_param',
          message: `可能包含编造参数：${keyword}，请确认该信息真实有效`,
          action: 'confirm',
        });
        requiresConfirmation.push(`"${keyword}" 声称需确认真实性`);
      }
    }
  }

  logger.info('[合规检查] 检查完成', { category: data.category, warningCount: warnings.length, blocked });
  return { passed: !blocked, warnings, blocked, requiresConfirmation };
}

export async function seedComplianceRules() {
  const rules: Array<{ category: string; ruleType: string; description: string; keywords: string[]; action: string }> = [];

  for (const [category, categoryRules] of Object.entries(CATEGORY_COMPLIANCE_RULES)) {
    for (const rule of categoryRules) {
      rules.push({
        category,
        ruleType: rule.ruleType,
        description: rule.description,
        keywords: rule.keywords,
        action: rule.action,
      });
    }
  }

  for (const rule of rules) {
    const existing = await prisma.complianceRule.findFirst({
      where: { category: rule.category, ruleType: rule.ruleType },
    });
    if (!existing) {
      await prisma.complianceRule.create({
        data: {
          category: rule.category,
          ruleType: rule.ruleType,
          description: rule.description,
          keywords: JSON.stringify(rule.keywords),
          action: rule.action,
        },
      });
    }
  }

  logger.info('[合规检查] 默认规则初始化完成');
}
