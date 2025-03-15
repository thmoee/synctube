import { CreateRoom } from '@/types/room';
import { useEffect, useState, useCallback } from 'react';

let globalSocket: WebSocket | null = null;
let isConnecting = false;
let messageListeners: ((event: MessageEvent) => void)[] = [];

const initializeSocket = () => {
  if (
    globalSocket &&
    (globalSocket.readyState === WebSocket.OPEN ||
      globalSocket.readyState === WebSocket.CONNECTING)
  ) {
    return globalSocket;
  }

  if (isConnecting) return null;

  isConnecting = true;
  const socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);

  socket.onopen = () => {
    console.log('WebSocket connected');
    isConnecting = false;
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    globalSocket = null;
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    isConnecting = false;
  };

  socket.onmessage = (event) => {
    messageListeners.forEach((listener) => listener(event));
  };

  globalSocket = socket;
  return socket;
};

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = initializeSocket();

    const handleOpen = () => setIsConnected(true);
    const handleClose = () => setIsConnected(false);

    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        setIsConnected(true);
      }

      socket.addEventListener('open', handleOpen);
      socket.addEventListener('close', handleClose);
    }

    return () => {
      if (socket) {
        socket.removeEventListener('open', handleOpen);
        socket.removeEventListener('close', handleClose);
      }
    };
  }, []);

  const createRoom = useCallback((roomData: CreateRoom): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const socket = globalSocket || initializeSocket();

      if (!socket) {
        reject(new Error('Unable to initialize WebSocket connection'));
        return;
      }

      if (socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type: 'create-room', ...roomData });
        socket.send(message);

        const handleMessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === 'room-created') {
            resolve(data.roomId);
            messageListeners = messageListeners.filter(
              (listener) => listener !== handleMessage
            );
          }
        };

        messageListeners.push(handleMessage);
      } else {
        const handleOpen = () => {
          const message = JSON.stringify({ type: 'create-room', ...roomData });
          socket.send(message);
          socket.removeEventListener('open', handleOpen);
        };

        socket.addEventListener('open', handleOpen);

        const handleMessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === 'room-created') {
            resolve(data.roomId);
            messageListeners = messageListeners.filter(
              (listener) => listener !== handleMessage
            );
          }
        };

        messageListeners.push(handleMessage);
      }
    });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    return new Promise((resolve, reject) => {
      const socket = globalSocket || initializeSocket();

      if (!socket) {
        reject(new Error('Unable to initialize WebSocket connection'));
        return;
      }

      if (socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type: 'join-room', roomId });
        socket.send(message);

        const handleMessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === 'room-data') {
            resolve(data.messages);
            messageListeners = messageListeners.filter(
              (listener) => listener !== handleMessage
            );
          } else if (data.type === 'error') {
            reject(new Error(data.message));
            messageListeners = messageListeners.filter(
              (listener) => listener !== handleMessage
            );
          }
        };

        messageListeners.push(handleMessage);
      } else {
        const handleOpen = () => {
          const message = JSON.stringify({ type: 'join-room', roomId });
          socket.send(message);
          socket.removeEventListener('open', handleOpen);
        };

        socket.addEventListener('open', handleOpen);

        const handleMessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === 'room-data') {
            resolve(data.messages);
            messageListeners = messageListeners.filter(
              (listener) => listener !== handleMessage
            );
          } else if (data.type === 'error') {
            reject(new Error(data.message));
            messageListeners = messageListeners.filter(
              (listener) => listener !== handleMessage
            );
          }
        };

        messageListeners.push(handleMessage);
      }
    });
  }, []);

  const sendMessage = useCallback(
    (roomId: string, user: string, content: string) => {
      const socket = globalSocket;
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          type: 'send-message',
          roomId,
          user,
          content,
        });
        socket.send(message);
      }
    },
    []
  );

  const subscribeToMessages = useCallback(
    (callback: (message: unknown) => void) => {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new-message') {
          callback(data.message);
        }
      };

      messageListeners.push(handleMessage);

      return () => {
        messageListeners = messageListeners.filter(
          (listener) => listener !== handleMessage
        );
      };
    },
    []
  );

  const subscribeToParticipants = useCallback(
    (callback: (count: number) => void) => {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'participant-count') {
          callback(data.count);
        }
      };

      messageListeners.push(handleMessage);

      return () => {
        messageListeners = messageListeners.filter(
          (listener) => listener !== handleMessage
        );
      };
    },
    []
  );

  return {
    isConnected,
    createRoom,
    joinRoom,
    sendMessage,
    subscribeToMessages,
    subscribeToParticipants,
  };
}
