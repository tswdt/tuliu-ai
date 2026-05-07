import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

const CREDIT_COSTS: Record<string, number> = {
  recognition: 1,
  image_generation: 2,
  image_generation_4k: 4,
  copy_generation: 1,
  layout: 1,
  export_single: 1,
  export_batch: 3,
  export_long_image: 2,
  export_hd: 3,
  full_pipeline: 5,
};

const ROLE_MONTHLY_CREDITS: Record<string, number> = {
  INDIVIDUAL: 10,
  PROFESSIONAL: 100,
  TEAM: 500,
  ADMIN: 99999,
};

export interface CreditEstimate {
  recognition: number;
  imageCount: number;
  imageCost: number;
  fourKExtra: number;
  copyCost: number;
  total: number;
}

export function estimateCredits(config: {
  mainImageCount?: string;
  subImageCount?: string;
  detailImageCount?: string;
  detailModuleCount?: string;
  outputTypes?: string[];
  quality?: string;
}): CreditEstimate {
  const mainCount = parseInt(config.mainImageCount || '0');
  const subCount = parseInt(config.subImageCount || '0');
  const detailCount = parseInt(config.detailImageCount || '0');
  const moduleCount = parseInt(config.detailModuleCount || '0');

  let imageCount = mainCount + subCount + detailCount;
  if (config.outputTypes?.includes('detail-long')) {
    imageCount += moduleCount;
  }

  const is4K = config.quality === '4k';
  const recognition = CREDIT_COSTS.recognition;
  const imageCost = imageCount * CREDIT_COSTS.image_generation;
  const fourKExtra = is4K ? imageCount * 2 : 0;
  const copyCost = CREDIT_COSTS.copy_generation;
  const total = recognition + imageCost + fourKExtra + copyCost;

  return { recognition, imageCount, imageCost, fourKExtra, copyCost, total };
}

export function getCreditCost(action: string): number {
  return CREDIT_COSTS[action] ?? 1;
}

export function getMonthlyCredits(role: string): number {
  return ROLE_MONTHLY_CREDITS[role] ?? 10;
}

export async function checkCredits(userId: string, amount: number): Promise<{ sufficient: boolean; balance: number; cost: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { sufficient: false, balance: 0, cost: amount };
  return { sufficient: user.credits >= amount, balance: user.credits, cost: amount };
}

export async function deductCredits(userId: string, amount: number, options?: { taskId?: string; projectId?: string; description?: string }): Promise<{ success: boolean; balance: number; error?: string }> {
  if (amount <= 0) {
    return { success: true, balance: 0 };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, balance: 0, error: '用户不存在' };
    if (user.credits < amount) return { success: false, balance: user.credits, error: '积分不足' };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits - amount },
    });

    await prisma.creditLog.create({
      data: {
        userId,
        amount: -amount,
        balance: updated.credits,
        type: 'full_pipeline',
        description: options?.description || `消耗${amount}积分`,
        taskId: options?.taskId,
        projectId: options?.projectId,
      },
    });

    logger.info('[积分系统] 扣除积分', { userId, amount, balance: updated.credits });
    return { success: true, balance: updated.credits };
  } catch (error) {
    logger.error('[积分系统] 扣除失败', { error: (error as Error).message });
    return { success: false, balance: 0, error: '积分扣除失败' };
  }
}

export async function refundCredits(userId: string, amount: number, options?: { taskId?: string; projectId?: string; description?: string }): Promise<{ success: boolean; balance: number }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, balance: 0 };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits + amount },
    });

    await prisma.creditLog.create({
      data: {
        userId,
        amount,
        balance: updated.credits,
        type: 'refund',
        description: options?.description || `退回${amount}积分`,
        taskId: options?.taskId,
        projectId: options?.projectId,
      },
    });

    logger.info('[积分系统] 退回积分', { userId, amount, balance: updated.credits });
    return { success: true, balance: updated.credits };
  } catch (error) {
    logger.error('[积分系统] 退回失败', { error: (error as Error).message });
    return { success: false, balance: 0 };
  }
}

export async function addCredits(userId: string, amount: number, type: string, description?: string): Promise<{ success: boolean; balance: number }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, balance: 0 };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { credits: user.credits + amount },
    });

    await prisma.creditLog.create({
      data: {
        userId,
        amount,
        balance: updated.credits,
        type,
        description: description || `增加${amount}积分 - ${type}`,
      },
    });

    logger.info('[积分系统] 增加积分', { userId, amount, balance: updated.credits });
    return { success: true, balance: updated.credits };
  } catch (error) {
    logger.error('[积分系统] 增加失败', { error: (error as Error).message });
    return { success: false, balance: 0 };
  }
}

export async function getCreditLogs(userId: string, options?: { limit?: number; offset?: number }) {
  try {
    const [logs, total] = await Promise.all([
      prisma.creditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }),
      prisma.creditLog.count({ where: { userId } }),
    ]);

    return { success: true, logs, total };
  } catch (error) {
    return { success: false, error: '获取积分记录失败' };
  }
}

export async function getCreditSummary(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: '用户不存在' };

    const totalUsed = await prisma.creditLog.aggregate({
      where: { userId, amount: { lt: 0 } },
      _sum: { amount: true },
    });

    const totalEarned = await prisma.creditLog.aggregate({
      where: { userId, amount: { gt: 0 } },
      _sum: { amount: true },
    });

    const monthlyCredits = getMonthlyCredits(user.role);

    return {
      success: true,
      summary: {
        balance: user.credits,
        totalUsed: Math.abs(totalUsed._sum.amount || 0),
        totalEarned: totalEarned._sum.amount || 0,
        monthlyCredits,
        role: user.role,
      },
    };
  } catch (error) {
    return { success: false, error: '获取积分概览失败' };
  }
}
