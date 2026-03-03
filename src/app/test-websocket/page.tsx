'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStatus } from '@/app/hooks/useTaskStatus';
import { TaskType } from '@/types/task-queue';

export default function TestWebSocketPage() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [userId] = useState('test-user-123');
  const { status, progress, message, result, error, isConnected, reset } = useTaskStatus(taskId);

  const createTestTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: TaskType.IMAGE_GENERATION,
          userId,
          payload: { test: 'data' }
        })
      });
      const data = await response.json();
      if (data.success) {
        setTaskId(data.task.id);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const simulateProgress = async () => {
    if (!taskId) return;
    
    await fetch(`/api/test-task-progress?taskId=${taskId}`, {
      method: 'POST'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WebSocket / SSE 实时推送测试</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>任务控制</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={createTestTask} disabled={!!taskId}>
                创建测试任务
              </Button>
              <Button onClick={simulateProgress} disabled={!taskId} variant="outline">
                模拟进度更新
              </Button>
              <Button onClick={reset} variant="ghost">
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {taskId && (
          <Card>
            <CardHeader>
              <CardTitle>任务状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
            <strong>任务 ID:</strong> {taskId}
              </div>
              <div>
            <strong>连接状态:</strong> {isConnected ? '已连接' : '未连接'}
              </div>
              <div>
            <strong>状态:</strong> {status || '等待中...'}
              </div>
              <div>
            <strong>进度:</strong> {progress}%
              </div>
              {message && (
                <div>
                  <strong>消息:</strong> {message}
                </div>
              )}
              {error && (
                <div className="text-red-600">
                  <strong>错误:</strong> {error}
                </div>
              )}
              {result && (
                <div>
                  <strong>结果:</strong>
                  <pre className="mt-2 p-2 bg-gray-100 rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
