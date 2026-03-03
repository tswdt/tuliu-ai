import { NextRequest } from 'next/server';
import { getRedisClient } from '@/app/utils/redis';
import { logger } from '@/app/utils/logger';
import { WebSocketMessage } from '@/types/task-queue';

const TASK_CHANNEL = 'task_updates';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const taskId = params.taskId;

  const encoder = new TextEncoder();
  const redis = getRedisClient();
  const subscriber = redis.duplicate();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await subscriber.subscribe(TASK_CHANNEL);

        subscriber.on('message', (channel, message) => {
          if (channel === TASK_CHANNEL) {
            try {
              const data: WebSocketMessage = JSON.parse(message);
              if (data.taskId === taskId) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                );

                if (data.type === 'task_complete' || data.type === 'task_error') {
                  controller.close();
                }
              }
            } catch (e) {
              logger.error('Failed to parse message', e);
            }
          }
        });

        controller.enqueue(
          encoder.encode(`: connected\n\n`)
        );

      } catch (error) {
        logger.error('SSE connection error', { error: (error as Error).message });
        controller.error(error);
      }
    },
    cancel() {
      subscriber.unsubscribe(TASK_CHANNEL);
      subscriber.quit();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
