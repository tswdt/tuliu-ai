import { prisma } from '@/lib/prisma';
import { logger } from '@/app/utils/logger';

export interface CreateProjectInput {
  userId: string;
  name: string;
  description?: string;
  platform?: string;
  category?: string;
  style?: string;
  productData?: any;
  recognitionData?: any;
  sourceProjectId?: string;
}

export async function createProject(input: CreateProjectInput) {
  try {
    const project = await prisma.project.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description,
        platform: input.platform || 'TAOBAO',
        category: input.category,
        style: input.style,
        productData: JSON.stringify(input.productData || {}),
        recognitionData: JSON.stringify(input.recognitionData || {}),
        sourceProjectId: input.sourceProjectId,
      },
    });

    logger.info('[项目系统] 创建项目', { projectId: project.id, name: input.name });
    return { success: true, project };
  } catch (error) {
    logger.error('[项目系统] 创建失败', { error: (error as Error).message });
    return { success: false, error: '创建项目失败' };
  }
}

export async function getProject(projectId: string, userId: string) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { projectImages: { orderBy: { sortOrder: 'asc' } }, tasks: { orderBy: { createdAt: 'desc' } } },
    });
    if (!project) {
      return { success: false, error: '项目不存在' };
    }
    return { success: true, project };
  } catch (error) {
    logger.error('[项目系统] 获取失败', { error: (error as Error).message });
    return { success: false, error: '获取项目失败' };
  }
}

export async function listProjects(userId: string, options?: { status?: string; platform?: string; limit?: number; offset?: number }) {
  try {
    const where: any = { userId };
    if (options?.status) where.status = options.status;
    if (options?.platform) where.platform = options.platform;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
        include: { _count: { select: { projectImages: true, tasks: true } } },
      }),
      prisma.project.count({ where }),
    ]);

    return { success: true, projects, total };
  } catch (error) {
    logger.error('[项目系统] 列表失败', { error: (error as Error).message });
    return { success: false, error: '获取项目列表失败' };
  }
}

export async function updateProject(projectId: string, userId: string, data: {
  name?: string;
  description?: string;
  status?: string;
  platform?: string;
  category?: string;
  style?: string;
  productData?: any;
  recognitionData?: any;
  layoutData?: any;
  copyData?: any;
  thumbnailUrl?: string;
}) {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.style !== undefined) updateData.style = data.style;
    if (data.productData !== undefined) updateData.productData = JSON.stringify(data.productData);
    if (data.recognitionData !== undefined) updateData.recognitionData = JSON.stringify(data.recognitionData);
    if (data.layoutData !== undefined) updateData.layoutData = JSON.stringify(data.layoutData);
    if (data.copyData !== undefined) updateData.copyData = JSON.stringify(data.copyData);
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;

    const project = await prisma.project.update({
      where: { id: projectId, userId },
      data: updateData,
    });

    logger.info('[项目系统] 更新项目', { projectId });
    return { success: true, project };
  } catch (error) {
    logger.error('[项目系统] 更新失败', { error: (error as Error).message });
    return { success: false, error: '更新项目失败' };
  }
}

export async function duplicateProject(projectId: string, userId: string) {
  try {
    const source = await prisma.project.findFirst({ where: { id: projectId, userId }, include: { projectImages: true } });
    if (!source) {
      return { success: false, error: '源项目不存在' };
    }

    const newProject = await prisma.project.create({
      data: {
        userId,
        name: `${source.name} (副本)`,
        description: source.description,
        platform: source.platform,
        category: source.category,
        style: source.style,
        productData: source.productData,
        recognitionData: source.recognitionData,
        layoutData: source.layoutData,
        copyData: source.copyData,
        sourceProjectId: source.id,
        thumbnailUrl: source.thumbnailUrl,
      },
    });

    for (const img of source.projectImages) {
      await prisma.projectImage.create({
        data: {
          projectId: newProject.id,
          imageUrl: img.imageUrl,
          imageType: img.imageType,
          label: img.label,
          sortOrder: img.sortOrder,
          prompt: img.prompt,
          size: img.size,
          width: img.width,
          height: img.height,
        },
      });
    }

    logger.info('[项目系统] 复制项目', { sourceId: projectId, newId: newProject.id });
    return { success: true, project: newProject };
  } catch (error) {
    logger.error('[项目系统] 复制失败', { error: (error as Error).message });
    return { success: false, error: '复制项目失败' };
  }
}

export async function deleteProject(projectId: string, userId: string) {
  try {
    await prisma.project.delete({ where: { id: projectId, userId } });
    logger.info('[项目系统] 删除项目', { projectId });
    return { success: true };
  } catch (error) {
    logger.error('[项目系统] 删除失败', { error: (error as Error).message });
    return { success: false, error: '删除项目失败' };
  }
}

export async function addProjectImage(projectId: string, data: {
  imageUrl: string;
  imageType: string;
  label?: string;
  sortOrder?: number;
  prompt?: string;
  size?: string;
  width?: number;
  height?: number;
}) {
  try {
    const image = await prisma.projectImage.create({
      data: { projectId, ...data },
    });
    return { success: true, image };
  } catch (error) {
    logger.error('[项目系统] 添加图片失败', { error: (error as Error).message });
    return { success: false, error: '添加图片失败' };
  }
}
