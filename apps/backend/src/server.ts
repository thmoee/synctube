import WebSocket, { WebSocketServer } from 'ws';

interface Room {
  clients: Set<WebSocket>;
  messages: Message[];
  videoUrl?: string;
  createdAt: string;
  playlist: string[];
  currentVideoIndex: number;
}

interface Message {
  id: number;
  user: string;
  content: string;
  time: string;
}
type SocketTypes =
  | 'create-room'
  | 'join-room'
  | 'send-message'
  | 'set-video'
  | 'video-sync'
  | 'add-to-playlist'
  | 'next-video'
  | 'video-ended';

interface WebSocketData {
  type: SocketTypes;
  roomId?: string;
  user?: string;
  content?: string;
  videoUrl?: string;
  event?: string;
}

const wss = new WebSocketServer({ port: 8080 });

const rooms: Map<string, Room> = new Map();

let isShuttingDown = false;

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  if (isShuttingDown) {
    ws.close(1001, 'Server is shutting down');
    return;
  }

  ws.on('message', (message: string) => {
    const data: WebSocketData = JSON.parse(message);

    switch (data.type) {
      case 'create-room':
        const roomId = generateRoomId();
        rooms.set(roomId, {
          clients: new Set([ws]),
          messages: [],
          createdAt: new Date().toISOString(),
          playlist: [],
          currentVideoIndex: -1,
        });
        ws.send(JSON.stringify({ type: 'room-created', roomId }));
        console.log('Room created:', roomId);
        break;

      case 'join-room':
        const room = rooms.get(data.roomId!);
        if (room) {
          room.clients.add(ws);
          ws.send(
            JSON.stringify({
              type: 'room-data',
              messages: room.messages,
              videoUrl: room.videoUrl,
              createdAt: room.createdAt,
              playlist: room.playlist,
              currentVideoIndex: room.currentVideoIndex,
            })
          );
          broadcast(room.clients, {
            type: 'participant-count',
            count: room.clients.size,
          });
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        }
        break;

      case 'send-message':
        const targetRoom = rooms.get(data.roomId!);
        if (targetRoom) {
          const newMessage: Message = {
            id: Math.floor(Math.random() * 1000000),
            user: data.user!,
            content: data.content!,
            time: new Date().toISOString(),
          };
          targetRoom.messages.push(newMessage);
          broadcast(targetRoom.clients, {
            type: 'new-message',
            message: newMessage,
          });
        }
        break;

      case 'set-video':
        const videoRoom = rooms.get(data.roomId!);
        if (videoRoom) {
          videoRoom.videoUrl = data.videoUrl;
          broadcast(videoRoom.clients, {
            type: 'video-update',
            videoUrl: data.videoUrl,
          });
        }
        break;

      case 'video-sync':
        const syncRoom = rooms.get(data.roomId!);
        if (syncRoom) {
          syncRoom.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'video-sync',
                  event: data.event,
                })
              );
            }
          });
        }
        break;

      case 'add-to-playlist':
        const playlistRoom = rooms.get(data.roomId!);
        if (playlistRoom) {
          // If there's no video playing currently, set it as the current video
          if (!playlistRoom.videoUrl) {
            playlistRoom.videoUrl = data.videoUrl;
            // Don't add to playlist, just set as current video
            broadcast(playlistRoom.clients, {
              type: 'video-update',
              videoUrl: data.videoUrl,
              currentVideoIndex: -1, // -1 indicates no playlist video is playing
            });
          } else {
            // If there's already a video playing, add to playlist
            playlistRoom.playlist.push(data.videoUrl!);
            broadcast(playlistRoom.clients, {
              type: 'playlist-update',
              playlist: playlistRoom.playlist,
              currentVideoIndex: playlistRoom.currentVideoIndex,
            });
          }
        }
        break;

      case 'next-video':
        const nextVideoRoom = rooms.get(data.roomId!);
        if (
          nextVideoRoom &&
          nextVideoRoom.playlist.length > nextVideoRoom.currentVideoIndex + 1
        ) {
          nextVideoRoom.currentVideoIndex++;
          nextVideoRoom.videoUrl =
            nextVideoRoom.playlist[nextVideoRoom.currentVideoIndex];
          broadcast(nextVideoRoom.clients, {
            type: 'video-update',
            videoUrl: nextVideoRoom.videoUrl,
            currentVideoIndex: nextVideoRoom.currentVideoIndex,
          });
        }
        break;

      case 'video-ended':
        const endedVideoRoom = rooms.get(data.roomId!);
        if (endedVideoRoom) {
          if (endedVideoRoom.playlist.length === 0) {
            endedVideoRoom.videoUrl = undefined;
            broadcast(endedVideoRoom.clients, {
              type: 'video-update',
              videoUrl: undefined,
              currentVideoIndex: -1,
            });
          } else {
            endedVideoRoom.videoUrl = endedVideoRoom.playlist[0];
            endedVideoRoom.playlist.shift();
            endedVideoRoom.currentVideoIndex = -1;

            broadcast(endedVideoRoom.clients, {
              type: 'video-update',
              videoUrl: endedVideoRoom.videoUrl,
              currentVideoIndex: -1,
            });

            broadcast(endedVideoRoom.clients, {
              type: 'playlist-update',
              playlist: endedVideoRoom.playlist,
              currentVideoIndex: -1,
            });
          }
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    rooms.forEach((room, roomId) => {
      if (room.clients.has(ws)) {
        room.clients.delete(ws);
        broadcast(room.clients, {
          type: 'participant-count',
          count: room.clients.size,
        });
        if (room.clients.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

function broadcast(clients: Set<WebSocket>, message: any) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  isShuttingDown = true;

  const shutdownPromise = new Promise<void>((resolve) => {
    let clientCount = 0;

    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        clientCount++;
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: 'server-shutdown',
              message: 'Server is shutting down. Please reconnect later.',
            })
          );
        }
      });
    });

    console.log(`Notifying ${clientCount} clients about shutdown...`);

    setTimeout(() => {
      wss.close(() => {
        console.log('WebSocket server closed.');
        resolve();
      });
    }, 1000);
  });

  shutdownPromise
    .then(() => {
      console.log('Graceful shutdown completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });

  setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
}

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

console.log('WebSocket server is running on ws://localhost:8080');
