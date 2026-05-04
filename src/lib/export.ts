import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';
import { getCreditCost, deductCredits } from './credits';
import { getPlatformRule } from './platform-rules';

export interface CreateExportInput {
  projectId: string;
  userId: string;
  format: 'png' | 'jpg' | 'long-image' | 'zip';
  platform?: string;
  scale?: number;
  imageIds?: string[];
}

export async function createExport(input: CreateExportInput) {
  try {
    const action = input.format === 'zip' ? 'export_batch' : input.format === 'long-image' ? 'export_long_image' : 'export_single';
    const cost = getCreditCost(action);

    const creditCheck = await deductCredits(input.userId, action, {
      projectId: input.projectId,
      description: `导出 ${input.format}`,
    });

    if (!creditCheck.success) {
      return { success: false, error: creditCheck.error || '积分不足' };
    }

    const platformRule = input.platform ? getPlatformRule(input.platform.toUpperCase()) : null;

    const exportRecord = await prisma.export.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        format: input.format,
        status: 'pending',
        width: platformRule?.detailPageWidth,
        height: null,
        creditCost: cost,
      },
    });

    logger.info('[导出系统] 创建导出任务', { exportId: exportRecord.id, format: input.format });
    return { success: true, export: exportRecord };
  } catch (error) {
    logger.error('[导出系统] 创建失败', { error: (error as Error).message });
    return { success: false, error: '创建导出任务失败' };
  }
}

export async function updateExport(exportId: string, data: {
  status?: string;
  fileUrl?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}) {
  try {
    const exportRecord = await prisma.export.update({
      where: { id: exportId },
      data,
    });
    return { success: true, export: exportRecord };
  } catch (error) {
    logger.error('[导出系统] 更新失败', { error: (error as Error).message });
    return { success: false, error: '更新导出任务失败' };
  }
}

export async function listExports(projectId: string) {
  try {
    const exports = await prisma.export.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, exports };
  } catch (error) {
    return { success: false, error: '获取导出列表失败' };
  }
}

export function getPlatformExportSizes(platformId: string): Array<{ label: string; width: number; height: number; format: string }> {
  const rule = getPlatformRule(platformId.toUpperCase());
  return [
    { label: `${rule.name}主图 (${rule.mainImageSize.w}x${rule.mainImageSize.h})`, width: rule.mainImageSize.w, height: rule.mainImageSize.h, format: 'jpg' },
    { label: `${rule.name}详情图 (${rule.detailImageSize.w}x${rule.detailImageSize.h})`, width: rule.detailImageSize.w, height: rule.detailImageSize.h, format: 'jpg' },
    { label: `${rule.name}详情页长图 (${rule.detailPageWidth}宽)`, width: rule.detailPageWidth, height: 0, format: 'long-image' },
    { label: '高清2x导出', width: rule.detailPageWidth * 2, height: 0, format: 'png' },
  ];
}
