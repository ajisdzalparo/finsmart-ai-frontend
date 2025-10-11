/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface AIRequest {
  type:
    | 'insights'
    | 'recommendations'
    | 'dashboard'
    | 'overspend'
    | 'goals'
    | 'anomaly'
    | 'subscriptions'
    | 'financial-summary'
    | 'investment-summary'
    | 'investment-recommendations'
    | 'custom-financial-advice';
  model?: 'deepseek' | 'gemini';
  userId: string;
  message?: string;
}

interface AIResponse {
  type:
    | 'insights'
    | 'recommendations'
    | 'dashboard'
    | 'overspend'
    | 'goals'
    | 'anomaly'
    | 'subscriptions'
    | 'financial-summary'
    | 'investment-summary'
    | 'investment-recommendations'
    | 'custom-financial-advice';
  data: any[];
  status: 'success' | 'error';
  message?: string;
  model?: string;
}

interface AIProgress {
  type:
    | 'insights'
    | 'recommendations'
    | 'dashboard'
    | 'overspend'
    | 'goals'
    | 'anomaly'
    | 'subscriptions'
    | 'financial-summary'
    | 'investment-summary'
    | 'investment-recommendations'
    | 'custom-financial-advice';
  status: 'processing' | 'complete' | 'error';
  message?: string;
  model?: string;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentModel, setCurrentModel] = useState<'deepseek' | 'gemini'>(
    'deepseek',
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, Socket.IO connection skipped');
      return;
    }

    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:4000',
      {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      },
    );

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const requestAI = (
    request: Omit<AIRequest, 'userId'>,
  ): Promise<AIResponse> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        reject(new Error('No authentication token'));
        return;
      }

      // Decode token to get userId (simple approach)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;

        const fullRequest: AIRequest = {
          ...request,
          userId,
          model: currentModel,
        };

        // Set up response handler
        const handleResponse = (response: AIResponse) => {
          if (response.type === request.type) {
            socket.off('ai:response', handleResponse);
            socket.off('ai:progress', handleProgress);

            if (response.status === 'success') {
              resolve(response);
            } else {
              reject(new Error(response.message || 'AI request failed'));
            }
          }
        };

        const handleProgress = (progress: AIProgress) => {
          console.log('📊 AI Progress:', progress);
        };

        socket.on('ai:response', handleResponse);
        socket.on('ai:progress', handleProgress);

        // Send request
        socket.emit('ai:request', fullRequest);

        // Timeout after 30 seconds
        setTimeout(() => {
          socket.off('ai:response', handleResponse);
          socket.off('ai:progress', handleProgress);
          reject(new Error('AI request timeout'));
        }, 30000);
      } catch (error) {
        reject(new Error('Invalid authentication token'));
      }
    });
  };

  const switchModel = (model: 'deepseek' | 'gemini') => {
    if (socket && isConnected) {
      setCurrentModel(model);
      socket.emit('ai:switch-model', model);
    }
  };

  return {
    socket,
    isConnected,
    currentModel,
    requestAI,
    switchModel,
  };
};
