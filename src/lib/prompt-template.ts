import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export interface CreatePromptTemplateInput {
  name: string;
  platform: string;
  category?: string;
  imageType: string;
  style?: string;
  promptText: string;
  negativePrompt?: string;
  variables?: string[];
  isDefault?: boolean;
}

export async function createPromptTemplate(input: CreatePromptTemplateInput) {
  try {
    const latest = await prisma.promptTemplate.findFirst({
      where: { name: input.name, platform: input.platform, imageType: input.imageType },
      orderBy: { version: 'desc' },
    });

    const template = await prisma.promptTemplate.create({
      data: {
        name: input.name,
        platform: input.platform,
        category: input.category,
        imageType: input.imageType,
        style: input.style,
        promptText: input.promptText,
        negativePrompt: input.negativePrompt,
        variables: JSON.stringify(input.variables || []),
        version: (latest?.version || 0) + 1,
        isDefault: input.isDefault ?? false,
      },
    });

    logger.info('[提示词模板] 创建', { id: template.id, name: input.name, version: template.version });
    return { success: true, template };
  } catch (error) {
    logger.error('[提示词模板] 创建失败', { error: (error as Error).message });
    return { success: false, error: '创建提示词模板失败' };
  }
}

export async function getPromptTemplate(options: {
  platform: string;
  imageType: string;
  category?: string;
  style?: string;
}) {
  try {
    const template = await prisma.promptTemplate.findFirst({
      where: {
        platform: options.platform,
        imageType: options.imageType,
        isActive: true,
        ...(options.category ? { category: options.category } : {}),
        ...(options.style ? { style: options.style } : {}),
      },
      orderBy: [{ isDefault: 'desc' }, { version: 'desc' }],
    });

    if (!template) {
      const fallback = await prisma.promptTemplate.findFirst({
        where: { platform: options.platform, imageType: options.imageType, isActive: true, isDefault: true },
        orderBy: { version: 'desc' },
      });
      return { success: true, template: fallback };
    }

    return { success: true, template };
  } catch (error) {
    logger.error('[提示词模板] 获取失败', { error: (error as Error).message });
    return { success: false, error: '获取提示词模板失败' };
  }
}

export async function listPromptTemplates(options?: {
  platform?: string;
  category?: string;
  imageType?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};
    if (options?.platform) where.platform = options.platform;
    if (options?.category) where.category = options.category;
    if (options?.imageType) where.imageType = options.imageType;
    if (options?.isActive !== undefined) where.isActive = options.isActive;

    const [templates, total] = await Promise.all([
      prisma.promptTemplate.findMany({
        where,
        orderBy: [{ platform: 'asc' }, { imageType: 'asc' }, { version: 'desc' }],
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.promptTemplate.count({ where }),
    ]);

    return { success: true, templates, total };
  } catch (error) {
    logger.error('[提示词模板] 列表失败', { error: (error as Error).message });
    return { success: false, error: '获取提示词模板列表失败' };
  }
}

export async function updatePromptTemplate(templateId: string, data: {
  promptText?: string;
  negativePrompt?: string;
  variables?: string[];
  isActive?: boolean;
  isDefault?: boolean;
}) {
  try {
    const existing = await prisma.promptTemplate.findUnique({ where: { id: templateId } });
    if (!existing) return { success: false, error: '模板不存在' };

    const template = await prisma.promptTemplate.create({
      data: {
        name: existing.name,
        platform: existing.platform,
        category: existing.category,
        imageType: existing.imageType,
        style: existing.style,
        promptText: data.promptText ?? existing.promptText,
        negativePrompt: data.negativePrompt ?? existing.negativePrompt,
        variables: JSON.stringify(data.variables || JSON.parse(existing.variables)),
        version: existing.version + 1,
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? existing.isDefault,
      },
    });

    await prisma.promptTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });

    logger.info('[提示词模板] 更新版本', { oldId: templateId, newId: template.id, version: template.version });
    return { success: true, template };
  } catch (error) {
    logger.error('[提示词模板] 更新失败', { error: (error as Error).message });
    return { success: false, error: '更新提示词模板失败' };
  }
}

export async function deletePromptTemplate(templateId: string) {
  try {
    await prisma.promptTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除提示词模板失败' };
  }
}

export async function seedDefaultPromptTemplates() {
  const defaults: CreatePromptTemplateInput[] = [
    {
      name: '淘宝主图通用',
      platform: 'TAOBAO',
      imageType: 'MAIN_IMAGE',
      promptText: '电商商品主图，白底或浅色背景，商品居中占比60%以上，高清质感，淘宝首页风格，{{productName}}，{{color}}，{{material}}',
      negativePrompt: '模糊,变形,水印,文字,低质',
      isDefault: true,
    },
    {
      name: '淘宝场景图通用',
      platform: 'TAOBAO',
      imageType: 'SCENE_IMAGE',
      promptText: '商品使用场景图，{{usageScenario}}，自然光线，生活化场景，突出商品使用效果，{{productName}}',
      negativePrompt: '模糊,变形,水印,低质',
      isDefault: true,
    },
    {
      name: '京东主图通用',
      platform: 'JD',
      imageType: 'MAIN_IMAGE',
      promptText: '京东品质风格商品主图，简洁专业，白底，商品清晰展示，参数信息规范，{{productName}}，{{material}}',
      negativePrompt: '模糊,花哨,水印,文字',
      isDefault: true,
    },
    {
      name: '拼多多主图通用',
      platform: 'PDD',
      imageType: 'MAIN_IMAGE',
      promptText: '拼多多促销风格商品主图，色彩鲜明，利益点突出，促销氛围，{{productName}}，{{sellingPoint}}',
      negativePrompt: '模糊,低调,水印',
      isDefault: true,
    },
    {
      name: '抖音主图通用',
      platform: 'DOUYIN',
      imageType: 'MAIN_IMAGE',
      promptText: '抖音电商商品图，视觉冲击力强，短文案强记忆点，年轻化设计，{{productName}}',
      negativePrompt: '模糊,传统,水印',
      isDefault: true,
    },
    {
      name: '亚马逊主图通用',
      platform: 'AMAZON',
      imageType: 'MAIN_IMAGE',
      promptText: 'Amazon product main image, pure white background, product centered, professional studio lighting, clean composition, {{productName}}',
      negativePrompt: 'blurry,watermark,text,colorful background',
      isDefault: true,
    },
  ];

  for (const tmpl of defaults) {
    const existing = await prisma.promptTemplate.findFirst({
      where: { name: tmpl.name, platform: tmpl.platform, imageType: tmpl.imageType },
    });
    if (!existing) {
      await createPromptTemplate(tmpl);
    }
  }

  logger.info('[提示词模板] 默认模板初始化完成');
}
