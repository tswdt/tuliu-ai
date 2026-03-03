'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { TaskStatus, WebSocketMessage } from '@/types/task-queue';

interface UseTaskStatusOptions {
  onUpdate?: (data: any) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function useTaskStatus(taskId: string | null, options?: UseTaskStatusOptions) {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    if (!taskId) return;

    eventSourceRef.current?.close();

    const eventSource = new EventSource(`/api/tasks/${taskId}/events`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) {
        console.error('Failed to parse SSE message:', e);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    eventSourceRef.current = eventSource;
  }, [taskId]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'task_update':
        if (message.data?.status) {
          setStatus(message.data.status);
        }
        if (message.data?.progress) {
          setProgress(message.data.progress.progress || 0);
          setMessage(message.data.progress.message || '');
        }
        optionsRef.current?.onUpdate?.(message.data);
        break;
      case 'task_complete':
        setStatus(TaskStatus.COMPLETED);
        setProgress(100);
        setResult(message.data?.result);
        optionsRef.current?.onComplete?.(message.data?.result);
        eventSourceRef.current?.close();
        setIsConnected(false);
        break;
      case 'task_error':
        setStatus(TaskStatus.FAILED);
        setError(message.data?.error || 'Unknown error');
        optionsRef.current?.onError?.(message.data?.error || 'Unknown error');
        eventSourceRef.current?.close();
        setIsConnected(false);
        break;
    }
  }, []);

  useEffect(() => {
    if (taskId) {
      connect();
    }

    return () => {
      eventSourceRef.current?.close();
      setIsConnected(false);
    };
  }, [taskId, connect]);

  const reset = useCallback(() => {
    setStatus(null);
    setProgress(0);
    setMessage('');
    setResult(null);
    setError(null);
    eventSourceRef.current?.close();
    setIsConnected(false);
  }, []);

  return {
    status,
    progress,
    message,
    result,
    error,
    isConnected,
    reset,
    reconnect: connect
  };
}
