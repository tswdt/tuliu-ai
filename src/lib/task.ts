import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export type TaskStatus = 'pending' | 'processing' | 'success' | 'failed';
export type TaskType = 'recognition' | 'image_generation' | 'copy_generation' | 'layout' | 'export' | 'full_pipeline';

export interface CreateTaskInput {
  userId: string;
  projectId?: string;
  type: TaskType;
  payload?: any;
  creditCost?: number;
  maxRetries?: number;
}

export async function createTask(input: CreateTaskInput) {
  try {
    const task = await prisma.task.create({
      data: {
        userId: input.userId,
        projectId: input.projectId,
        type: input.type,
        status: 'pending',
        payload: JSON.stringify(input.payload || {}),
        creditCost: input.creditCost || 0,
        maxRetries: input.maxRetries ?? 3,
      },
    });

    logger.info('[任务系统] 创建任务', { taskId: task.id, type: input.type });
    return { success: true, task };
  } catch (error) {
    logger.error('[任务系统] 创建失败', { error: (error as Error).message });
    return { success: false, error: '创建任务失败' };
  }
}

export async function updateTask(taskId: string, data: {
  status?: TaskStatus;
  progress?: number;
  stage?: string;
  message?: string;
  result?: any;
  error?: string;
}) {
  try {
    const updateData: any = { ...data };
    if (data.result) updateData.result = JSON.stringify(data.result);
    if (data.status === 'processing' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }
    if (data.status === 'success' || data.status === 'failed') {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return { success: true, task };
  } catch (error) {
    logger.error('[任务系统] 更新失败', { error: (error as Error).message });
    return { success: false, error: '更新任务失败' };
  }
}

export async function getTask(taskId: string) {
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { success: false, error: '任务不存在' };
    return { success: true, task };
  } catch (error) {
    return { success: false, error: '获取任务失败' };
  }
}

export async function listTasks(userId: string, options?: {
  status?: TaskStatus;
  type?: TaskType;
  projectId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = { userId };
    if (options?.status) where.status = options.status;
    if (options?.type) where.type = options.type;
    if (options?.projectId) where.projectId = options.projectId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }),
      prisma.task.count({ where }),
    ]);

    return { success: true, tasks, total };
  } catch (error) {
    logger.error('[任务系统] 列表失败', { error: (error as Error).message });
    return { success: false, error: '获取任务列表失败' };
  }
}

export async function retryTask(taskId: string, userId: string) {
  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return { success: false, error: '任务不存在' };
    if (task.status !== 'failed') return { success: false, error: '只能重试失败的任务' };
    if (task.retryCount >= task.maxRetries) return { success: false, error: '已达到最大重试次数' };

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'pending',
        progress: 0,
        stage: null,
        message: null,
        error: null,
        retryCount: task.retryCount + 1,
        startedAt: null,
        completedAt: null,
      },
    });

    logger.info('[任务系统] 重试任务', { taskId, retryCount: updated.retryCount });
    return { success: true, task: updated };
  } catch (error) {
    logger.error('[任务系统] 重试失败', { error: (error as Error).message });
    return { success: false, error: '重试任务失败' };
  }
}

export async function getPendingTasks(limit: number = 5) {
  try {
    const tasks = await prisma.task.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: '获取待处理任务失败' };
  }
}

export async function getTaskStats(userId: string) {
  try {
    const [pending, processing, success, failed] = await Promise.all([
      prisma.task.count({ where: { userId, status: 'pending' } }),
      prisma.task.count({ where: { userId, status: 'processing' } }),
      prisma.task.count({ where: { userId, status: 'success' } }),
      prisma.task.count({ where: { userId, status: 'failed' } }),
    ]);

    return { success: true, stats: { pending, processing, success, failed, total: pending + processing + success + failed } };
  } catch (error) {
    return { success: false, error: '获取统计失败' };
  }
}
