import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export interface CreateTemplateInput {
  name: string;
  description?: string;
  platform: string;
  category?: string;
  style?: string;
  type?: string;
  thumbnailUrl?: string;
  layoutData?: any;
  copyData?: any;
  promptData?: any;
  isPublic?: boolean;
  isPremium?: boolean;
  sortOrder?: number;
}

export async function createTemplate(input: CreateTemplateInput) {
  try {
    const template = await prisma.template.create({
      data: {
        name: input.name,
        description: input.description,
        platform: input.platform,
        category: input.category,
        style: input.style,
        type: input.type || 'detail_page',
        thumbnailUrl: input.thumbnailUrl,
        layoutData: JSON.stringify(input.layoutData || {}),
        copyData: JSON.stringify(input.copyData || {}),
        promptData: JSON.stringify(input.promptData || {}),
        isPublic: input.isPublic ?? true,
        isPremium: input.isPremium ?? false,
        sortOrder: input.sortOrder || 0,
      },
    });

    logger.info('[模板系统] 创建模板', { templateId: template.id, name: input.name });
    return { success: true, template };
  } catch (error) {
    logger.error('[模板系统] 创建失败', { error: (error as Error).message });
    return { success: false, error: '创建模板失败' };
  }
}

export async function listTemplates(options?: {
  platform?: string;
  category?: string;
  style?: string;
  type?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};
    if (options?.platform) where.platform = options.platform;
    if (options?.category) where.category = options.category;
    if (options?.style) where.style = options.style;
    if (options?.type) where.type = options.type;
    if (options?.isPublic !== undefined) where.isPublic = options.isPublic;

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { useCount: 'desc' }],
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }),
      prisma.template.count({ where }),
    ]);

    return { success: true, templates, total };
  } catch (error) {
    logger.error('[模板系统] 列表失败', { error: (error as Error).message });
    return { success: false, error: '获取模板列表失败' };
  }
}

export async function getTemplate(templateId: string) {
  try {
    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (!template) return { success: false, error: '模板不存在' };
    return { success: true, template };
  } catch (error) {
    return { success: false, error: '获取模板失败' };
  }
}

export async function incrementTemplateUse(templateId: string) {
  try {
    await prisma.template.update({
      where: { id: templateId },
      data: { useCount: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: '更新使用次数失败' };
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    await prisma.template.delete({ where: { id: templateId } });
    return { success: true };
  } catch (error) {
    return { success: false, error: '删除模板失败' };
  }
}

export async function seedDefaultTemplates() {
  const defaults: CreateTemplateInput[] = [
    { name: '淘宝转化风', platform: 'TAOBAO', category: 'GENERAL', style: 'taobao-convert', type: 'detail_page', sortOrder: 1 },
    { name: '京东品质风', platform: 'JD', category: 'GENERAL', style: 'jd-quality', type: 'detail_page', sortOrder: 2 },
    { name: '拼多多促销风', platform: 'PDD', category: 'GENERAL', style: 'pdd-promo', type: 'detail_page', sortOrder: 3 },
    { name: '抖音冲击风', platform: 'DOUYIN', category: 'GENERAL', style: 'douyin-impact', type: 'detail_page', sortOrder: 4 },
    { name: '亚马逊A+简洁风', platform: 'AMAZON', category: 'GENERAL', style: 'amazon-clean', type: 'detail_page', sortOrder: 5 },
    { name: '食品详情页', platform: 'TAOBAO', category: 'FOOD', style: 'taobao-convert', type: 'detail_page', sortOrder: 10 },
    { name: '美妆详情页', platform: 'TAOBAO', category: 'BEAUTY', style: 'taobao-convert', type: 'detail_page', sortOrder: 11 },
    { name: '3C数码详情页', platform: 'JD', category: 'ELECTRONICS', style: 'jd-quality', type: 'detail_page', sortOrder: 12 },
    { name: '家居详情页', platform: 'TAOBAO', category: 'HOME', style: 'taobao-convert', type: 'detail_page', sortOrder: 13 },
    { name: '服装详情页', platform: 'TAOBAO', category: 'CLOTHING', style: 'taobao-convert', type: 'detail_page', sortOrder: 14 },
  ];

  for (const tmpl of defaults) {
    const existing = await prisma.template.findFirst({
      where: { name: tmpl.name, platform: tmpl.platform },
    });
    if (!existing) {
      await createTemplate(tmpl);
    }
  }

  logger.info('[模板系统] 默认模板初始化完成');
}
