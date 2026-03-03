import { taskQueue } from './task-queue';
import { TaskStatus, TaskType } from '@/types/task-queue';
import { logger } from './logger';
import { buildStructuredPrompt } from './ai/apiyi-llm';
import { generateImageWithApiYi, ImageMode } from './ai/apiyi-image';
import { uploadMultipleImagesToOSS } from './oss/upload-image';

export class TaskProcessor {
  private static instance: TaskProcessor;
  private isProcessing: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): TaskProcessor {
    if (!TaskProcessor.instance) {
      TaskProcessor.instance = new TaskProcessor();
    }
    return TaskProcessor.instance;
  }

  public start(): void {
    if (this.processInterval) {
      logger.warn('TaskProcessor already started');
      return;
    }

    logger.info('TaskProcessor starting...');
    this.processInterval = setInterval(() => this.processQueue(), 2000);
    this.processQueue();
  }

  public stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
      logger.info('TaskProcessor stopped');
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      await taskQueue.initPubSub();

      const task = await taskQueue.getNextTask();
      if (!task) {
        return;
      }

      logger.info('Processing task', { taskId: task.id, type: task.type });

      await taskQueue.updateTaskStatus(task.id, TaskStatus.PROCESSING, {
        stage: '开始处理',
        progress: 5,
        message: '任务已开始处理'
      });

      switch (task.type) {
        case TaskType.IMAGE_GENERATION:
          await this.processImageGeneration(task.id, task.userId, task.payload);
          break;
        case TaskType.COPY_GENERATION:
          await this.processCopyGeneration(task.id, task.userId, task.payload);
          break;
        case TaskType.DETAIL_PAGE:
          await this.processDetailPage(task.id, task.userId, task.payload);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

    } catch (error) {
      logger.error('Task processing failed', { error: (error as Error).message });
    } finally {
      this.isProcessing = false;
    }
  }

  private async processImageGeneration(
    taskId: string,
    userId: string,
    payload: any
  ): Promise<void> {
    try {
      const {
        productName,
        productInfo,
        style,
        platform,
        imageCount = 1,
        referenceImageUrl,
        maskImageUrl,
        mode = 'text_to_image'
      } = payload;

      await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
        stage: '构建提示词',
        progress: 15,
        message: '正在使用AI构建专业提示词'
      });

      const structuredPrompt = await buildStructuredPrompt(
        productInfo || {},
        style,
        platform
      );

      await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
        stage: 'AI生成图片',
        progress: 40,
        message: 'AI正在生成商品图片'
      });

      const imageMode = mode === 'image_to_image' 
        ? ImageMode.IMAGE_TO_IMAGE 
        : mode === 'inpainting' 
        ? ImageMode.INPAINTING 
        : ImageMode.TEXT_TO_IMAGE;

      const imageUrls = await generateImageWithApiYi({
        prompt: structuredPrompt.finalPrompt,
        negativePrompt: '模糊,变形,商品残缺,色差严重,水印,文字,色情,暴力,低分辨率,模糊边缘',
        imageSize: platform === 'DOUYIN' ? '1080x1920' : '800x800',
        mode: imageMode,
        referenceImageUrl,
        maskImageUrl,
        imageCount
      });

      await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
        stage: '上传到存储',
        progress: 75,
        message: '正在上传图片到云存储'
      });

      const uploadedImages = await uploadMultipleImagesToOSS(
        imageUrls,
        `product-images/${productName || 'unknown'}`
      );

      await taskQueue.updateTaskStatus(taskId, TaskStatus.COMPLETED, {
        stage: '完成',
        progress: 100,
        message: '任务完成!'
      }, {
        imageUrls: uploadedImages,
        structuredPrompt
      });

    } catch (error) {
      await taskQueue.updateTaskStatus(
        taskId,
        TaskStatus.FAILED,
        undefined,
        undefined,
        (error as Error).message
      );
      throw error;
    }
  }

  private async processCopyGeneration(
    taskId: string,
    userId: string,
    payload: any
  ): Promise<void> {
    await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
      stage: '生成文案',
      progress: 50,
      message: '正在生成商品文案'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await taskQueue.updateTaskStatus(taskId, TaskStatus.COMPLETED, {
      stage: '完成',
      progress: 100,
      message: '文案生成完成!'
    }, {
      copy: '这是一段示例商品文案...'
    });
  }

  private async processDetailPage(
    taskId: string,
    userId: string,
    payload: any
  ): Promise<void> {
    await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
      stage: '生成详情页',
      progress: 50,
      message: '正在生成商品详情页'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await taskQueue.updateTaskStatus(taskId, TaskStatus.COMPLETED, {
      stage: '完成',
      progress: 100,
      message: '详情页生成完成!'
    }, {
      detailPageUrl: 'https://example.com/detail-page'
    });
  }
}

export const taskProcessor = TaskProcessor.getInstance();
