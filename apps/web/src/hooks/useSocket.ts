import { useEffect, useState, useRef, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const initSocket = () => {
      // TODO: change to a process.env variable
      const socket = new WebSocket('ws://localhost:8080');

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current = socket;
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const createRoom = useCallback(
    (roomData: { roomName: string; hostName: string; videoUrl: string }) => {
      return new Promise<string>((resolve) => {
        if (socketRef.current && isConnected) {
          const message = JSON.stringify({ type: 'create-room', ...roomData });
          socketRef.current.send(message);

          const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'room-created') {
              resolve(data.roomId);
              socketRef.current?.removeEventListener('message', handleMessage);
            }
          };

          socketRef.current.addEventListener('message', handleMessage);
        }
      });
    },
    [isConnected]
  );

  return {
    socket: socketRef.current,
    isConnected,
    createRoom,
  };
}
