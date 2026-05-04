import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export interface CreateMediaInput {
  userId: string;
  folderId?: string;
  name: string;
  url: string;
  type: string;
  imageType?: string;
  source?: string;
  tags?: string[];
  size?: number;
  width?: number;
  height?: number;
  generationId?: string;
}

export async function createMediaItem(input: CreateMediaInput) {
  try {
    const item = await prisma.mediaItem.create({
      data: {
        userId: input.userId,
        folderId: input.folderId,
        name: input.name,
        url: input.url,
        type: input.type,
        imageType: input.imageType,
        source: input.source || 'upload',
        tags: JSON.stringify(input.tags || []),
        size: input.size,
        width: input.width,
        height: input.height,
        generationId: input.generationId,
      },
    });

    logger.info('[素材库] 添加素材', { itemId: item.id, source: input.source });
    return { success: true, item };
  } catch (error) {
    logger.error('[素材库] 添加失败', { error: (error as Error).message });
    return { success: false, error: '添加素材失败' };
  }
}

export async function listMediaItems(userId: string, options?: {
  folderId?: string;
  type?: string;
  source?: string;
  imageType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = { userId };
    if (options?.folderId) where.folderId = options.folderId;
    if (options?.type) where.type = options.type;
    if (options?.source) where.source = options.source;
    if (options?.imageType) where.imageType = options.imageType;
    if (options?.search) where.name = { contains: options.search };

    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.mediaItem.count({ where }),
    ]);

    return { success: true, items, total };
  } catch (error) {
    logger.error('[素材库] 列表失败', { error: (error as Error).message });
    return { success: false, error: '获取素材列表失败' };
  }
}

export async function deleteMediaItem(itemId: string, userId: string) {
  try {
    await prisma.mediaItem.delete({ where: { id: itemId, userId } });
    return { success: true };
  } catch (error) {
    logger.error('[素材库] 删除失败', { error: (error as Error).message });
    return { success: false, error: '删除素材失败' };
  }
}

export async function createFolder(userId: string, name: string, parentId?: string) {
  try {
    const folder = await prisma.mediaFolder.create({
      data: { userId, name, parentId },
    });
    return { success: true, folder };
  } catch (error) {
    logger.error('[素材库] 创建文件夹失败', { error: (error as Error).message });
    return { success: false, error: '创建文件夹失败' };
  }
}

export async function listFolders(userId: string, parentId?: string) {
  try {
    const folders = await prisma.mediaFolder.findMany({
      where: { userId, parentId: parentId || null },
      include: { _count: { select: { items: true, children: true } } },
      orderBy: { name: 'asc' },
    });
    return { success: true, folders };
  } catch (error) {
    logger.error('[素材库] 文件夹列表失败', { error: (error as Error).message });
    return { success: false, error: '获取文件夹失败' };
  }
}

export async function saveGeneratedImages(userId: string, projectId: string, images: Array<{ url: string; imageType: string; label?: string }>) {
  try {
    const results = [];
    for (const img of images) {
      const item = await prisma.mediaItem.create({
        data: {
          userId,
          name: `${img.label || img.imageType}_${Date.now()}`,
          url: img.url,
          type: 'image',
          imageType: img.imageType,
          source: 'generated',
          tags: JSON.stringify([img.imageType]),
        },
      });
      results.push(item);
    }
    logger.info('[素材库] 批量保存生成图片', { count: results.length, userId });
    return { success: true, items: results };
  } catch (error) {
    logger.error('[素材库] 批量保存失败', { error: (error as Error).message });
    return { success: false, error: '保存生成图片失败' };
  }
}
