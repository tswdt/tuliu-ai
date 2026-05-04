export interface PlatformRule {
  id: string;
  name: string;
  mainImageSize: { w: number; h: number };
  detailImageSize: { w: number; h: number };
  detailPageWidth: number;
  stylePreference: string;
  promptModifiers: string[];
  negativePrompts: string[];
  copyStyle: string;
  mainImageRules: string[];
  maxMainImages: number;
  maxSceneImages: number;
  maxDetailImages: number;
  maxSellingPointImages: number;
  allowedSizes: string[];
  visualStyle: string;
  contentDensity: string;
  emphasis: string[];
  defaultContentTypes: string[];
  copyStrategy: string;
  recommendedStyle: string;
}

export const PLATFORM_RULES: Record<string, PlatformRule> = {
  TAOBAO: {
    id: 'TAOBAO',
    name: '淘宝',
    mainImageSize: { w: 800, h: 800 },
    detailImageSize: { w: 750, h: 1000 },
    detailPageWidth: 750,
    stylePreference: '色彩鲜艳饱满，突出商品质感，淘宝首页风格',
    promptModifiers: ['淘宝首页风格', '色彩饱满', '商品质感突出', '转化导向'],
    negativePrompts: ['暗淡', '模糊', '低质'],
    copyStyle: '感性描述+卖点堆叠，突出性价比和品质',
    mainImageRules: ['白底或浅色背景', '商品占比≥60%', '无水印无文字', '正方形800x800'],
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    allowedSizes: ['1024*1024'],
    visualStyle: '转化导向',
    contentDensity: '中等',
    emphasis: ['产品优势', '使用场景', '细节展示', '卖点清晰'],
    defaultContentTypes: ['main', 'sub', 'selling', 'detail', 'params', 'long'],
    copyStrategy: '卖点清晰堆叠，突出产品优势、使用场景和细节，引导下单转化',
    recommendedStyle: 'taobao-convert',
  },
  TMALL: {
    id: 'TMALL',
    name: '天猫',
    mainImageSize: { w: 800, h: 800 },
    detailImageSize: { w: 750, h: 1000 },
    detailPageWidth: 750,
    stylePreference: '高端品质感，品牌调性，天猫旗舰店风格',
    promptModifiers: ['天猫旗舰店风格', '高端品质感', '品牌调性'],
    negativePrompts: ['廉价感', '模糊', '低质'],
    copyStyle: '品牌故事+品质保证，突出高端和正品',
    mainImageRules: ['白底', '品牌logo可展示', '商品占比≥60%', '正方形800x800'],
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    allowedSizes: ['1024*1024'],
    visualStyle: '品牌品质',
    contentDensity: '中等',
    emphasis: ['品牌形象', '品质保证', '产品优势', '使用场景'],
    defaultContentTypes: ['main', 'sub', 'selling', 'detail', 'params', 'long'],
    copyStrategy: '品牌故事+品质保证，突出高端和正品，兼顾转化',
    recommendedStyle: 'taobao-convert',
  },
  JD: {
    id: 'JD',
    name: '京东',
    mainImageSize: { w: 800, h: 800 },
    detailImageSize: { w: 750, h: 1000 },
    detailPageWidth: 750,
    stylePreference: '清晰专业，质感突出，京东自营风格',
    promptModifiers: ['京东自营风格', '清晰专业', '质感突出', '品质克制'],
    negativePrompts: ['模糊', '色差', '低质', '花哨'],
    copyStyle: '参数详实+品质保障，突出正品和售后',
    mainImageRules: ['白底', '商品完整展示', '无文字', '正方形800x800'],
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    allowedSizes: ['1024*1024'],
    visualStyle: '品质专业',
    contentDensity: '克制',
    emphasis: ['品牌', '规格参数', '品质', '售后保障'],
    defaultContentTypes: ['main', 'params', 'detail', 'scene'],
    copyStrategy: '参数详实+品质保障，页面克制不堆砌，突出品牌、规格、品质、售后',
    recommendedStyle: 'jd-quality',
  },
  PINDUODUO: {
    id: 'PINDUODUO',
    name: '拼多多',
    mainImageSize: { w: 750, h: 1000 },
    detailImageSize: { w: 750, h: 1000 },
    detailPageWidth: 750,
    stylePreference: '亲民实惠，价格醒目，拼多多风格',
    promptModifiers: ['拼多多风格', '亲民实惠', '色彩鲜艳', '促销感强'],
    negativePrompts: ['高端奢华', '模糊', '低质'],
    copyStyle: '价格优势+实惠感，突出性价比和优惠',
    mainImageRules: ['竖版750x1000', '商品突出', '可带促销标签'],
    maxMainImages: 5,
    maxSceneImages: 3,
    maxDetailImages: 3,
    maxSellingPointImages: 3,
    allowedSizes: ['768*1152'],
    visualStyle: '直接促销',
    contentDensity: '高',
    emphasis: ['价格', '优惠', '卖点强刺激', '利益点突出'],
    defaultContentTypes: ['main', 'selling', 'scene', 'sub'],
    copyStrategy: '利益点更突出，文案更醒目，适合价格、优惠、卖点强刺激',
    recommendedStyle: 'pdd-sale',
  },
  DOUYIN: {
    id: 'DOUYIN',
    name: '抖音',
    mainImageSize: { w: 1080, h: 1920 },
    detailImageSize: { w: 1080, h: 1440 },
    detailPageWidth: 1080,
    stylePreference: '时尚潮流，竖版全屏，抖音电商风格',
    promptModifiers: ['抖音电商风格', '时尚潮流', '竖版全屏', '视觉冲击'],
    negativePrompts: ['传统电商', '模糊', '低质'],
    copyStyle: '种草风+短视频文案感，突出潮流和体验',
    mainImageRules: ['竖版1080x1920', '视觉冲击力强', '适合短视频封面'],
    maxMainImages: 3,
    maxSceneImages: 4,
    maxDetailImages: 2,
    maxSellingPointImages: 3,
    allowedSizes: ['720*1280'],
    visualStyle: '视觉冲击',
    contentDensity: '低',
    emphasis: ['视觉冲击', '短视频封面', '商品卡片', '强记忆点'],
    defaultContentTypes: ['main', 'scene', 'sub', 'selling'],
    copyStrategy: '文案短、强记忆点，适合短视频封面和商品卡片，视觉冲击优先',
    recommendedStyle: 'taobao-convert',
  },
  XIAOHONGSHU: {
    id: 'XIAOHONGSHU',
    name: '小红书',
    mainImageSize: { w: 1080, h: 1440 },
    detailImageSize: { w: 1080, h: 1440 },
    detailPageWidth: 1080,
    stylePreference: 'ins风，质感高级，小红书种草风格',
    promptModifiers: ['小红书种草风格', 'ins风', '质感高级'],
    negativePrompts: ['廉价感', '广告感太强', '模糊'],
    copyStyle: '种草笔记风，真实体验感，突出颜值和质感',
    mainImageRules: ['竖版3:4', 'ins风构图', '生活化场景'],
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 3,
    allowedSizes: ['768*1152'],
    visualStyle: '种草质感',
    contentDensity: '低',
    emphasis: ['颜值', '质感', '真实体验', '生活化'],
    defaultContentTypes: ['main', 'scene', 'detail', 'selling'],
    copyStrategy: '种草笔记风，真实体验感，突出颜值和质感',
    recommendedStyle: 'fresh',
  },
  AMAZON: {
    id: 'AMAZON',
    name: '亚马逊',
    mainImageSize: { w: 1000, h: 1000 },
    detailImageSize: { w: 1000, h: 1000 },
    detailPageWidth: 1000,
    stylePreference: '简约专业，白底为主，亚马逊规范',
    promptModifiers: ['亚马逊规范', '白底', '简约专业', 'A+页面'],
    negativePrompts: ['花哨', '中文文字', '水印', '营销文字'],
    copyStyle: '英文描述+参数列表，突出功能和专业性',
    mainImageRules: ['纯白底', '商品占比85%以上', '无文字无水印', '正方形1000x1000'],
    maxMainImages: 7,
    maxSceneImages: 4,
    maxDetailImages: 4,
    maxSellingPointImages: 3,
    allowedSizes: ['1024*1024'],
    visualStyle: '简洁规范',
    contentDensity: '低',
    emphasis: ['白底图', '功能展示', '尺寸规范', 'A+页面模块'],
    defaultContentTypes: ['white', 'sub', 'params', 'scene', 'long'],
    copyStrategy: '画面简洁，参数规范，少营销化文字，强调白底图、场景图、尺寸图、A+页面模块',
    recommendedStyle: 'amazon-a',
  },
  TEMU: {
    id: 'TEMU',
    name: 'Temu',
    mainImageSize: { w: 800, h: 800 },
    detailImageSize: { w: 750, h: 1000 },
    detailPageWidth: 750,
    stylePreference: '简洁明了，白底为主，Temu规范',
    promptModifiers: ['Temu规范', '白底', '简洁明了'],
    negativePrompts: ['花哨', '中文文字', '水印'],
    copyStyle: '简洁英文描述，突出价格优势',
    mainImageRules: ['白底', '商品居中', '无文字', '正方形800x800'],
    maxMainImages: 5,
    maxSceneImages: 3,
    maxDetailImages: 3,
    maxSellingPointImages: 3,
    allowedSizes: ['1024*1024'],
    visualStyle: '简洁规范',
    contentDensity: '低',
    emphasis: ['白底图', '功能展示', '价格优势'],
    defaultContentTypes: ['white', 'main', 'sub', 'params'],
    copyStrategy: '简洁英文描述，突出价格优势',
    recommendedStyle: 'amazon-a',
  },
  SHOPIFY: {
    id: 'SHOPIFY',
    name: 'Shopify',
    mainImageSize: { w: 1000, h: 1000 },
    detailImageSize: { w: 1000, h: 1000 },
    detailPageWidth: 1000,
    stylePreference: '品牌调性，专业品质，独立站风格',
    promptModifiers: ['独立站风格', '品牌调性', '专业品质'],
    negativePrompts: ['廉价感', '模糊', '水印'],
    copyStyle: '品牌故事+产品特性，突出独特性和品质',
    mainImageRules: ['白底或场景图', '品牌调性', '正方形1000x1000'],
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 3,
    allowedSizes: ['1024*1024'],
    visualStyle: '品牌调性',
    contentDensity: '中等',
    emphasis: ['品牌形象', '产品特性', '品质感', '独特性'],
    defaultContentTypes: ['main', 'scene', 'detail', 'selling', 'long'],
    copyStrategy: '品牌故事+产品特性，突出独特性和品质',
    recommendedStyle: 'minimal',
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: '自定义',
    mainImageSize: { w: 800, h: 800 },
    detailImageSize: { w: 750, h: 1000 },
    detailPageWidth: 750,
    stylePreference: '通用风格',
    promptModifiers: ['通用电商风格'],
    negativePrompts: ['模糊', '低质'],
    copyStyle: '通用电商文案风格',
    mainImageRules: ['正方形800x800'],
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    allowedSizes: ['1024*1024'],
    visualStyle: '通用',
    contentDensity: '中等',
    emphasis: ['产品展示', '核心卖点'],
    defaultContentTypes: ['main', 'scene', 'detail', 'selling', 'long'],
    copyStrategy: '通用电商文案风格',
    recommendedStyle: 'minimal',
  },
};

export function getPlatformRule(platformId: string): PlatformRule {
  return PLATFORM_RULES[platformId] || PLATFORM_RULES.CUSTOM;
}

export function getImageSizeForPlatform(platformId: string, imageType: 'main' | 'detail'): string {
  const rule = getPlatformRule(platformId);
  const size = imageType === 'main' ? rule.mainImageSize : rule.detailImageSize;
  const ratio = size.w / size.h;

  if (ratio >= 1.2) {
    return '1280*720';
  } else if (ratio <= 0.8) {
    return '720*1280';
  } else {
    return '1024*1024';
  }
}

export interface CategoryRule {
  id: string;
  name: string;
  sceneKeywords: string[];
  detailKeywords: string[];
  styleKeywords: string[];
  negativeKeywords: string[];
  copyTone: string;
}

export const CATEGORY_RULES: Record<string, CategoryRule> = {
  CLOTHING: {
    id: 'CLOTHING',
    name: '服饰',
    sceneKeywords: ['模特上身展示', '街头穿搭', '室内穿搭', '户外场景'],
    detailKeywords: ['面料特写', '缝线细节', '纽扣拉链', '标签展示'],
    styleKeywords: ['时尚', '穿搭', '质感'],
    negativeKeywords: ['变形', '褶皱过多', '色差'],
    copyTone: '时尚感+穿着体验，突出面料和版型',
  },
  BEAUTY: {
    id: 'BEAUTY',
    name: '美妆',
    sceneKeywords: ['ins风化妆台', '浴室场景', '手持展示', '上脸效果'],
    detailKeywords: ['质地特写', '成分展示', '包装细节', '色号展示'],
    styleKeywords: ['ins风', '高级质感', '柔和光线'],
    negativeKeywords: ['油腻感', '廉价感'],
    copyTone: '种草风+成分党，突出效果和安全性',
  },
  ELECTRONICS: {
    id: 'ELECTRONICS',
    name: '3C数码',
    sceneKeywords: ['科技感桌面', '办公场景', '手持使用', '产品组合展示'],
    detailKeywords: ['接口特写', '屏幕显示', '按键细节', '材质纹理'],
    styleKeywords: ['科技感', '简约', '专业'],
    negativeKeywords: ['过时', '廉价感'],
    copyTone: '参数党+体验感，突出性能和品质',
  },
  FOOD: {
    id: 'FOOD',
    name: '食品',
    sceneKeywords: ['餐桌摆盘', '厨房场景', '手持展示', '食材搭配'],
    detailKeywords: ['食材特写', '切面展示', '包装细节', '分量展示'],
    styleKeywords: ['食欲感', '新鲜', '健康'],
    negativeKeywords: ['不新鲜', '油腻'],
    copyTone: '食欲感+健康安全，突出口感和品质',
  },
  HOME: {
    id: 'HOME',
    name: '家居',
    sceneKeywords: ['客厅场景', '卧室场景', '厨房场景', '整体搭配'],
    detailKeywords: ['材质特写', '工艺细节', '尺寸对比', '功能展示'],
    styleKeywords: ['温馨', '家居氛围', '质感'],
    negativeKeywords: ['廉价感', '色差'],
    copyTone: '生活感+品质感，突出设计和实用性',
  },
  BABY: {
    id: 'BABY',
    name: '母婴',
    sceneKeywords: ['婴儿房场景', '亲子互动', '安全使用', '温馨家庭'],
    detailKeywords: ['材质特写', '安全标识', '尺寸展示', '功能细节'],
    styleKeywords: ['温馨', '安全', '可爱'],
    negativeKeywords: ['危险', '粗糙'],
    copyTone: '安全感+温馨感，突出材质安全和品质',
  },
  SPORTS: {
    id: 'SPORTS',
    name: '运动',
    sceneKeywords: ['健身房', '户外运动', '运动场景', '穿着展示'],
    detailKeywords: ['面料特写', '功能细节', '透气展示', '弹性展示'],
    styleKeywords: ['动感', '活力', '专业'],
    negativeKeywords: ['静态', '无活力'],
    copyTone: '专业感+运动体验，突出功能性和舒适度',
  },
  JEWELRY: {
    id: 'JEWELRY',
    name: '珠宝',
    sceneKeywords: ['佩戴展示', '首饰盒', '优雅场景', '搭配展示'],
    detailKeywords: ['宝石特写', '工艺细节', '光泽展示', '证书展示'],
    styleKeywords: ['奢华', '精致', '光泽'],
    negativeKeywords: ['廉价感', '暗淡'],
    copyTone: '高级感+品质保证，突出工艺和价值',
  },
  OTHER: {
    id: 'OTHER',
    name: '其他',
    sceneKeywords: ['使用场景', '生活场景', '产品展示'],
    detailKeywords: ['细节特写', '功能展示', '材质展示'],
    styleKeywords: ['通用', '清晰', '专业'],
    negativeKeywords: ['模糊', '低质'],
    copyTone: '通用电商文案风格，突出产品特点',
  },
};

export function getCategoryRule(categoryId: string): CategoryRule {
  return CATEGORY_RULES[categoryId] || CATEGORY_RULES.OTHER;
}

export const PLATFORM_CONTENT_MAP: Record<string, { label: string; defaultTypes: string[]; style: string; desc: string }> = {
  taobao: {
    label: '淘宝',
    defaultTypes: ['main', 'sub', 'selling', 'detail', 'params', 'long'],
    style: 'taobao-convert',
    desc: '转化导向，卖点清晰，信息密度中等',
  },
  jd: {
    label: '京东',
    defaultTypes: ['main', 'params', 'detail', 'scene'],
    style: 'jd-quality',
    desc: '品质专业，参数清晰，页面克制',
  },
  pdd: {
    label: '拼多多',
    defaultTypes: ['main', 'selling', 'scene', 'sub'],
    style: 'pdd-sale',
    desc: '直接促销，利益点突出，文案醒目',
  },
  douyin: {
    label: '抖音',
    defaultTypes: ['main', 'scene', 'sub', 'selling'],
    style: 'taobao-convert',
    desc: '视觉冲击，文案短强，适合短视频',
  },
  amazon: {
    label: '亚马逊',
    defaultTypes: ['white', 'sub', 'params', 'scene', 'long'],
    style: 'amazon-a',
    desc: '简洁规范，少营销文字，A+页面',
  },
  shopify: {
    label: 'Shopify',
    defaultTypes: ['main', 'scene', 'detail', 'selling', 'long'],
    style: 'minimal',
    desc: '品牌调性，专业品质，独立站风格',
  },
};
