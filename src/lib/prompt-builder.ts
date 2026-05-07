import { ProductAnalysisResult } from '@/app/utils/ai/qwen-vl';
import { getPlatformRule, getCategoryRule } from '@/lib/platform-rules';

export interface WorkflowConfig {
  productImageUrls: string[];
  competitorImageUrls: string[];
  competitorReferenceModes: string[];
  platform: string;
  language: string;
  model: string;
  outputTypes: string[];
  mainImageCount: string;
  subImageCount: string;
  detailImageCount: string;
  detailModuleCount: string;
  sizePreset: string;
  quality: string;
  visualStyle: string;
  pricePositioning: string;
  postProcessingOptions: string[];
  copyIntensity: string;
  targetAudiences: string[];
  usageScenarios: string[];
  subjectConsistency: string;
  subjectLockRules: string[];
  detailDesc: string;
}

const VISUAL_STYLE_MAP: Record<string, string> = {
  minimal: '高级简约风格，极简构图，留白充足，干净利落，突出产品本身',
  tech: '科技感风格，蓝色调光线，未来感，赛博朋克元素，金属质感',
  'luxury-beauty': '轻奢美妆风格，高级质感，柔和光线，精致优雅，ins风',
  luxury: '轻奢美妆风格，高级质感，柔和光线，精致优雅，ins风',
  guochao: '国潮风格，中国传统元素与现代设计融合，文化底蕴，潮流感',
  fresh: '清新自然风格，自然光线，绿植元素，温暖色调，舒适氛围',
  nature: '清新自然风格，自然光线，绿植元素，温暖色调，舒适氛围',
  'baby-gentle': '母婴温柔风格，柔和光线，温馨色调，安全舒适感，可爱元素',
  baby: '母婴温柔风格，柔和光线，温馨色调，安全舒适感，可爱元素',
  'food-appetite': '食品食欲感风格，暖色调，诱人质感，新鲜食材感，美味氛围',
  food: '食品食欲感风格，暖色调，诱人质感，新鲜食材感，美味氛围',
  'jd-quality': '京东品质风格，清晰专业，质感突出，克制不花哨，品质感强',
  'taobao-convert': '淘宝转化风格，色彩饱满，卖点突出，转化导向，视觉冲击',
  'pdd-sale': '拼多多促销风格，亲民实惠，色彩鲜艳，促销感强，利益点醒目',
  'pdd-promo': '拼多多促销风格，亲民实惠，色彩鲜艳，促销感强，利益点醒目',
  'amazon-a': '亚马逊A+简洁风格，白底为主，简约专业，规范统一，国际化',
  'a-plus-clean': '亚马逊A+简洁风格，白底为主，简约专业，规范统一，国际化',
};

const PRICE_POSITIONING_MAP: Record<string, string> = {
  premium: '高端品质定位，突出材质、工艺、品牌价值，营造轻奢氛围',
  'mid-range': '中端实用定位，品质与价格平衡，突出实用性和性价比',
  value: '性价比定位，突出价格优势和实惠感，强调物超所值',
  promo: '促销爆款定位，强促销氛围，限时优惠感，冲动消费引导',
  gift: '礼品款定位，精致包装感，送礼场景，仪式感和档次感',
};

const COPY_INTENSITY_MAP: Record<string, string> = {
  restrained: '文案风格：克制专业，简洁有力，不堆砌辞藻，用数据和事实说话',
  'clear-sp': '文案风格：卖点清晰，层次分明，每个卖点独立突出，便于快速浏览',
  'hard-sell': '文案风格：强转化导向，紧迫感强，行动号召明确，促进下单决策',
  'high-convert': '文案风格：强转化导向，紧迫感强，行动号召明确，促进下单决策',
  'promo-driven': '文案风格：促销导向，价格优势突出，优惠信息醒目，限时抢购氛围',
  promo: '文案风格：促销导向，价格优势突出，优惠信息醒目，限时抢购氛围',
  'spec-heavy': '文案风格：参数说明型，规格详尽，数据清晰，适合理性消费决策',
  'param-desc': '文案风格：参数说明型，规格详尽，数据清晰，适合理性消费决策',
  'xhs-style': '文案风格：小红书种草型，真实体验感，生活化表达，颜值和质感优先',
  xiaohongshu: '文案风格：小红书种草型，真实体验感，生活化表达，颜值和质感优先',
  'amazon-clean': '文案风格：亚马逊简洁型，英文规范表达，功能描述清晰，少营销化',
};

const SIZE_PRESET_MAP: Record<string, { ratio: string; desc: string }> = {
  '1:1': { ratio: '1:1', desc: '正方形构图，适合商品主图，产品居中展示' },
  '3:4': { ratio: '3:4', desc: '竖版构图，适合详情页展示，纵向信息丰富' },
  '4:5': { ratio: '4:5', desc: '电商常用比例，兼顾横竖信息展示' },
  '9:16': { ratio: '9:16', desc: '抖音竖屏比例，全屏视觉冲击，适合短视频封面' },
  '750-taobao': { ratio: '750px宽', desc: '淘宝详情页标准宽度750px，纵向自由延伸' },
  '800-jd': { ratio: '800px宽', desc: '京东详情页标准宽度800px，纵向自由延伸' },
  'amazon-a-plus': { ratio: 'A+模块', desc: '亚马逊A+页面模块化布局，规范统一' },
  '750px': { ratio: '750px宽', desc: '淘宝详情页标准宽度750px，纵向自由延伸' },
  '800px': { ratio: '800px宽', desc: '京东详情页标准宽度800px，纵向自由延伸' },
  'a-plus': { ratio: 'A+模块', desc: '亚马逊A+页面模块化布局，规范统一' },
};

const SUBJECT_CONSISTENCY_MAP: Record<string, string> = {
  normal: '普通保持：产品主体大致保持一致，允许适度的光影和角度变化',
  strong: '较强保持：产品主体需明显一致，颜色、形状、比例保持稳定',
  strict: '严格保持：产品主体必须完全一致，不允许任何变形、变色或细节偏差',
};

const OUTPUT_TYPE_MAP: Record<string, { label: string; promptMod: string }> = {
  main: { label: '商品主图', promptMod: '商品主体居中，完整展示商品全貌，正面视角，白底或浅色背景' },
  sub: { label: '商品附图', promptMod: '多角度展示商品，不同视角，辅助展示商品特点' },
  white: { label: '白底图', promptMod: '纯白背景，商品居中，无阴影或柔和阴影，适合平台规范' },
  'white-bg': { label: '白底图', promptMod: '纯白背景，商品居中，无阴影或柔和阴影，适合平台规范' },
  scene: { label: '场景图', promptMod: '场景化展示，有氛围感，生活化，自然使用状态，环境融入' },
  detail: { label: '细节图', promptMod: '局部特写，细节展示，材质纹理清晰，微距摄影效果' },
  'selling-point': { label: '卖点图', promptMod: '突出核心卖点，视觉冲击力强，信息图风格，重点展示' },
  params: { label: '参数图', promptMod: '规格参数展示，数据可视化，清晰标注尺寸和参数信息' },
  size: { label: '尺寸图', promptMod: '尺寸对比展示，标注具体尺寸数据，比例参考物对照' },
  compare: { label: '对比图', promptMod: '对比展示，突出产品优势，前后对比或竞品对比效果' },
  'detail-long': { label: '详情页长图', promptMod: '详情页排版，商品展示+图文结合，信息层次分明，适合长页面' },
  'amazon-a-plus': { label: '亚马逊A+模块', promptMod: '亚马逊A+页面模块，品牌展示+产品特点，模块化布局，专业规范' },
  'a-plus': { label: '亚马逊A+模块', promptMod: '亚马逊A+页面模块，品牌展示+产品特点，模块化布局，专业规范' },
  'video-cover': { label: '短视频封面', promptMod: '短视频封面风格，视觉冲击力强，适合作为视频首帧，吸引点击' },
};

const LANGUAGE_MAP: Record<string, string> = {
  none: '不添加任何文字',
  'zh-CN': '中文简体',
  'zh-TW': '中文繁体',
  'zh-cn': '中文简体',
  'zh-tw': '中文繁体',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
};

const QUALITY_MAP: Record<string, string> = {
  '1k': '1K高清',
  '2k': '2K超清',
  '4k': '4K极清',
};

export function buildImagePrompt(
  analysis: ProductAnalysisResult,
  config: WorkflowConfig,
  imageType: string,
  imageIndex: number
): { prompt: string; negativePrompt: string; aspectRatio: string } {
  const platformRule = getPlatformRule(config.platform);
  const categoryRule = getCategoryRule(analysis.category);
  const typeInfo = OUTPUT_TYPE_MAP[imageType] || OUTPUT_TYPE_MAP.main;
  const styleDesc = VISUAL_STYLE_MAP[config.visualStyle] || VISUAL_STYLE_MAP.minimal;
  const priceDesc = PRICE_POSITIONING_MAP[config.pricePositioning] || PRICE_POSITIONING_MAP['mid-range'];
  const sizeInfo = SIZE_PRESET_MAP[config.sizePreset] || SIZE_PRESET_MAP['3:4'];
  const qualityDesc = QUALITY_MAP[config.quality] || QUALITY_MAP['2k'];
  const consistencyDesc = SUBJECT_CONSISTENCY_MAP[config.subjectConsistency] || SUBJECT_CONSISTENCY_MAP.normal;

  const parts: string[] = [
    '电商商品摄影',
    `商品：${analysis.productName}`,
    `品类：${categoryRule.name}`,
    `材质：${analysis.material}`,
    `颜色：${analysis.color.join('/')}`,
    `风格：${analysis.style}`,
    '',
    `【目标平台】${platformRule.name} - ${platformRule.stylePreference}`,
    `【视觉风格】${styleDesc}`,
    `【价格定位】${priceDesc}`,
    `【图片类型】${typeInfo.label} - ${typeInfo.promptMod}`,
    `【尺寸比例】${sizeInfo.desc}`,
    `【清晰度】${qualityDesc}`,
    `【主体一致性】${consistencyDesc}`,
    `【语言要求】${LANGUAGE_MAP[config.language] || '不添加文字'}`,
  ];

  if (config.targetAudiences.length > 0) {
    parts.push(`【目标人群】${config.targetAudiences.join('、')}`);
  }

  if (config.usageScenarios.length > 0) {
    parts.push(`【使用场景】${config.usageScenarios.join('、')}`);
  }

  if (config.detailDesc) {
    parts.push(`【补充要求】${config.detailDesc}`);
  }

  if (config.subjectLockRules.length > 0) {
    parts.push(`【主体锁定规则】${config.subjectLockRules.join('、')}`);
  }

  if (platformRule.mainImageRules.length > 0) {
    parts.push(`【平台规范】${platformRule.mainImageRules.join('；')}`);
  }

  if (config.competitorReferenceModes.length > 0) {
    const refModeLabelMap: Record<string, string> = {
      layout: '排版布局',
      color: '配色方案',
      mood: '氛围感觉',
      'detail-structure': '详情页结构',
      'no-copy-text': '不复制竞品文案',
      'no-copy-logo': '不复制品牌Logo',
      'no-copy-image': '不照搬竞品图片',
    };
    const modeLabels = config.competitorReferenceModes
      .map(m => refModeLabelMap[m] || m);
    parts.push(`【竞品参考方式】仅参考：${modeLabels.join('、')}`);
  }

  if (config.postProcessingOptions.length > 0) {
    parts.push(`【后期要求】${config.postProcessingOptions.join('、')}`);
  }

  parts.push(
    '',
    '【质量标准】',
    '4K超清，真实质感，光影自然，商用级品质',
    '构图专业，产品突出，背景干净',
    '无水印，无杂乱文字，无低质元素'
  );

  const prompt = parts.filter(Boolean).join('，');

  const negativeParts: string[] = [
    '模糊', '变形', '商品残缺', '色差严重',
    '水印', '低分辨率', '模糊边缘',
    '人物面部特写', '竞品logo', '竞品品牌元素',
    '复制竞品文案', '复制竞品设计',
    ...platformRule.negativePrompts,
    ...categoryRule.negativeKeywords,
  ];

  if (config.competitorImageUrls && config.competitorImageUrls.length > 0) {
    parts.push('');
    parts.push('【竞品参考严格规则】');
    parts.push('竞品图片仅作为风格/排版/氛围参考，绝对禁止：');
    parts.push('- 禁止复制竞品文案、广告语、标语、任何文字内容');
    parts.push('- 禁止复制竞品Logo、品牌标识、商标、品牌元素');
    parts.push('- 禁止照搬竞品图片内容、构图、设计布局');
    parts.push('- 禁止模仿竞品的视觉识别系统');
    parts.push('只能参考以下方面：');
    if (config.competitorReferenceModes.length > 0) {
      const refModeMap: Record<string, string> = {
        layout: '排版布局',
        color: '配色方案',
        mood: '氛围感觉',
        'detail-structure': '详情页结构',
      };
      const allowedRefs = config.competitorReferenceModes
        .map(m => refModeMap[m] || m)
        .filter(Boolean);
      if (allowedRefs.length > 0) {
        parts.push(`允许参考：${allowedRefs.join('、')}`);
      } else {
        parts.push('允许参考：整体风格氛围（不复制具体内容）');
      }
    } else {
      parts.push('允许参考：整体风格氛围（不复制具体内容）');
    }
  }

  if (config.competitorReferenceModes.includes('no-copy-text') || config.competitorReferenceModes.includes('不复制竞品文案')) {
    negativeParts.push('任何文字内容', '文案', '标语', '广告语');
  }
  if (config.competitorReferenceModes.includes('no-copy-logo') || config.competitorReferenceModes.includes('不复制品牌Logo')) {
    negativeParts.push('品牌logo', '商标', '品牌标识', '品牌元素');
  }
  if (config.competitorReferenceModes.includes('no-copy-image') || config.competitorReferenceModes.includes('不照搬竞品图片')) {
    negativeParts.push('直接复制构图', '照搬设计', '抄袭布局', '复制图片内容');
  }

  const uniqueNegatives = [...new Set(negativeParts)];
  const negativePrompt = uniqueNegatives.join('，');

  const aspectRatio = sizeInfo.ratio === 'A+模块' ? '1:1' : sizeInfo.ratio.replace('px宽', '').includes('750') ? '3:4' : sizeInfo.ratio.includes('800') ? '3:4' : sizeInfo.ratio;

  return { prompt, negativePrompt, aspectRatio };
}

export function buildCopyPrompt(
  analysis: ProductAnalysisResult,
  config: WorkflowConfig
): string {
  const platformRule = getPlatformRule(config.platform);
  const categoryRule = getCategoryRule(analysis.category);
  const copyStyle = COPY_INTENSITY_MAP[config.copyIntensity] || COPY_INTENSITY_MAP['clear-sp'];
  const langLabel = LANGUAGE_MAP[config.language] || '不添加文字';

  const parts: string[] = [
    '你是专业的电商详情页文案专家。请为以下商品生成一套高转化详情页文案。',
    '',
    '【商品信息】',
    `- 商品名称：${analysis.productName}`,
    `- 品类：${categoryRule.name}`,
    `- 材质：${analysis.material}`,
    `- 颜色：${analysis.color.join('/')}`,
    `- 风格：${analysis.style}`,
    `- 品牌：${analysis.brandName}`,
    `- AI识别卖点：${analysis.suggestedSellingPoints.join('、')}`,
    `- AI识别场景：${analysis.usageScenarios.join('、')}`,
    `- AI识别人群：${analysis.targetAudience}`,
    '',
    '【用户配置】',
    `- 目标平台：${platformRule.name}`,
    `- 输出语言：${langLabel}`,
    copyStyle,
  ];

  if (config.targetAudiences.length > 0) {
    parts.push(`- 目标人群：${config.targetAudiences.join('、')}`);
  }
  if (config.usageScenarios.length > 0) {
    parts.push(`- 使用场景：${config.usageScenarios.join('、')}`);
  }
  if (config.detailDesc) {
    parts.push(`- 补充说明：${config.detailDesc}`);
  }

  parts.push(
    '',
    `【平台文案规范】`,
    `- 文案风格：${platformRule.copyStyle}`,
    `- 品类调性：${categoryRule.copyTone}`,
    `- 内容密度：${platformRule.contentDensity}`,
    `- 重点突出：${platformRule.emphasis.join('、')}`,
    '',
    '【输出要求】',
    '请严格以JSON格式输出，不要包含任何markdown标记：',
    '{',
    '  "mainTitle": "主标题（15-20字，突出核心卖点，吸引点击）",',
    '  "subTitle": "副标题（30-40字，补充主标题，强化购买理由）",',
    '  "coreSellingPoints": ["卖点1（20字以内）", "卖点2", "卖点3", "卖点4", "卖点5"],',
    '  "productDetails": "产品详情（200-300字，介绍产品功能、材质、使用场景、优势）",',
    '  "usageScenarios": ["场景描述1", "场景描述2", "场景描述3"],',
    '  "specHighlights": ["规格亮点1", "规格亮点2", "规格亮点3"],',
    '  "faq": [',
    '    {"question": "常见问题1", "answer": "专业回答1"},',
    '    {"question": "常见问题2", "answer": "专业回答2"},',
    '    {"question": "常见问题3", "answer": "专业回答3"}',
    '  ]',
    '}'
  );

  return parts.join('\n');
}

export function getOutputTypeLabel(type: string): string {
  return OUTPUT_TYPE_MAP[type]?.label || type;
}

export function getVisualStyleLabel(style: string): string {
  const map: Record<string, string> = {
    minimal: '高级简约', tech: '科技感', 'luxury-beauty': '轻奢美妆', luxury: '轻奢美妆',
    guochao: '国潮风', fresh: '清新自然', nature: '清新自然', 'baby-gentle': '母婴温柔', baby: '母婴温柔',
    'food-appetite': '食品食欲感', food: '食品食欲感', 'jd-quality': '京东品质风',
    'taobao-convert': '淘宝转化风', 'pdd-sale': '拼多多促销风', 'pdd-promo': '拼多多促销风', 'amazon-a': '亚马逊A+简洁风', 'a-plus-clean': '亚马逊A+简洁风',
  };
  return map[style] || style;
}

export function getPriceLabel(pos: string): string {
  const map: Record<string, string> = {
    premium: '高端品质', 'mid-range': '中端实用', value: '性价比', promo: '促销爆款', gift: '礼品款',
  };
  return map[pos] || pos;
}

export function getCopyLabel(intensity: string): string {
  const map: Record<string, string> = {
    restrained: '克制专业', 'clear-sp': '卖点清晰', 'hard-sell': '强转化', 'high-convert': '强转化',
    'promo-driven': '促销导向', promo: '促销导向', 'spec-heavy': '参数说明型', 'param-desc': '参数说明型',
    'xhs-style': '小红书种草型', xiaohongshu: '小红书种草型', 'amazon-clean': '亚马逊简洁型',
  };
  return map[intensity] || intensity;
}

export function getSizeLabel(preset: string): string {
  const map: Record<string, string> = {
    '1:1': '1:1 商品主图', '3:4': '3:4 竖版详情图', '4:5': '4:5 电商图',
    '9:16': '9:16 抖音竖图', '750-taobao': '750px 淘宝详情页', '800-jd': '800px 京东详情页', 'amazon-a-plus': '亚马逊A+模块',
    '750px': '750px 淘宝详情页', '800px': '800px 京东详情页', 'a-plus': '亚马逊A+模块',
  };
  return map[preset] || preset;
}

export function getConsistencyLabel(level: string): string {
  const map: Record<string, string> = { normal: '普通保持', strong: '较强保持', strict: '严格保持' };
  return map[level] || level;
}

export function getQualityLabel(q: string): string {
  const map: Record<string, string> = { '1k': '1K', '2k': '2K', '4k': '4K' };
  return map[q] || q;
}

export function getLanguageLabel(lang: string): string {
  return LANGUAGE_MAP[lang] || lang;
}

export function getPlatformLabel(platform: string): string {
  const rule = getPlatformRule(platform);
  return rule?.name || platform;
}

export function calculateEstimatedCredits(config: WorkflowConfig): number {
  const totalImages =
    parseInt(config.mainImageCount || '0') +
    parseInt(config.subImageCount || '0') +
    parseInt(config.detailImageCount || '0') +
    parseInt(config.detailModuleCount || '0');
  return totalImages * 2 + 1;
}
