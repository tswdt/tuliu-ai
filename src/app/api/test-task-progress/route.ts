import { NextResponse, NextRequest } from 'next/server';
import { taskQueue } from '@/app/utils/task-queue';
import { TaskStatus } from '@/types/task-queue';
import { logger } from '@/app/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Missing taskId' },
        { status: 400 }
      );
    }

    await taskQueue.initPubSub();

    const simulateAsync = async () => {
      try {
        await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
          stage: '开始处理',
          progress: 10,
          message: '任务已开始处理'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
          stage: '上传图片',
          progress: 30,
          message: '正在上传图片到 OSS'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
          stage: 'AI 生成',
          progress: 60,
          message: 'AI 正在生成图片'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await taskQueue.updateTaskStatus(taskId, TaskStatus.PROCESSING, {
          stage: '完成处理',
          progress: 90,
          message: '正在完成最终处理'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await taskQueue.updateTaskStatus(taskId, TaskStatus.COMPLETED, {
          stage: '完成',
          progress: 100,
          message: '任务完成!'
        }, {
          imageUrl: 'https://example.com/generated-image.jpg',
          thumbnails: ['https://example.com/thumb1.jpg', 'https://example.com/thumb2.jpg']
        });
      } catch (error) {
        logger.error('Simulation error', { error: (error as Error).message });
        await taskQueue.updateTaskStatus(
          taskId, 
          TaskStatus.FAILED, 
          undefined, 
          undefined, 
          (error as Error).message
        );
      }
    };

    simulateAsync();

    return NextResponse.json({
      success: true,
      message: 'Simulation started'
    });

  } catch (error) {
    logger.error('Test progress error', { error: (error as Error).message });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
