import { Message } from '@/types/message';
import { CreateRoom, RoomData } from '@/types/room';
import { useEffect, useState, useCallback } from 'react';

let globalSocket: WebSocket | null = null;
let isConnecting = false;
let messageListeners: ((event: MessageEvent) => void)[] = [];

type VideoEvent =
  | { type: 'video-play'; timestamp: number }
  | { type: 'video-pause'; timestamp: number }
  | { type: 'video-seek'; timestamp: number };

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

  const joinRoom = useCallback((roomId: string): Promise<RoomData> => {
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
            resolve({
              messages: data.messages || [],
              videoUrl: data.videoUrl,
              createdAt: data.createdAt,
              playlist: data.playlist,
              currentVideoIndex: data.currentVideoIndex,
            });
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
            resolve({
              messages: data.messages || [],
              videoUrl: data.videoUrl,
              createdAt: data.createdAt,
              playlist: data.playlist,
              currentVideoIndex: data.currentVideoIndex,
            });
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

  const setVideo = useCallback((roomId: string, videoUrl: string) => {
    const socket = globalSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'set-video',
        roomId,
        videoUrl,
      });
      socket.send(message);
    }
  }, []);

  const syncVideoState = useCallback((roomId: string, event: VideoEvent) => {
    const socket = globalSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'video-sync',
        roomId,
        event,
      });
      socket.send(message);
    }
  }, []);

  const subscribeToMessages = useCallback(
    (callback: (message: Message) => void) => {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new-message') {
          callback(data.message as Message);
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

  const subscribeToVideoUpdates = useCallback(
    (callback: (videoUrl: string) => void) => {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'video-update') {
          callback(data.videoUrl);
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

  const subscribeToVideoSync = useCallback(
    (callback: (event: VideoEvent) => void) => {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'video-sync') {
          callback(data.event);
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

  const addToPlaylist = useCallback((roomId: string, videoUrl: string) => {
    const socket = globalSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'add-to-playlist',
        roomId,
        videoUrl,
      });
      socket.send(message);
    }
  }, []);

  const subscribeToPlaylistUpdates = useCallback(
    (
      callback: (data: {
        playlist: string[];
        currentVideoIndex: number;
      }) => void
    ) => {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'playlist-update') {
          callback({
            playlist: data.playlist,
            currentVideoIndex: data.currentVideoIndex,
          });
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

  const nextVideo = useCallback((roomId: string) => {
    const socket = globalSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'next-video',
        roomId,
      });
      socket.send(message);
    }
  }, []);

  const videoEnded = useCallback((roomId: string) => {
    const socket = globalSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'video-ended',
        roomId,
      });
      socket.send(message);
    }
  }, []);

  return {
    isConnected,
    createRoom,
    joinRoom,
    sendMessage,
    subscribeToMessages,
    subscribeToParticipants,
    setVideo,
    syncVideoState,
    subscribeToVideoUpdates,
    subscribeToVideoSync,
    addToPlaylist,
    subscribeToPlaylistUpdates,
    nextVideo,
    videoEnded,
  };
}
