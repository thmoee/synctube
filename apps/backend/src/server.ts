import WebSocket, { WebSocketServer } from 'ws';

interface Room {
  clients: Set<WebSocket>;
  messages: Message[];
}

interface Message {
  user: string;
  content: string;
  time: string;
}

const wss = new WebSocketServer({ port: 8080 });

const rooms: Map<string, Room> = new Map();

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'create-room':
        const roomId = generateRoomId();
        rooms.set(roomId, { clients: new Set([ws]), messages: [] });
        ws.send(JSON.stringify({ type: 'room-created', roomId }));
        console.log('Room created:', roomId);
        rooms.forEach((room) => {
          console.log('room: ', room);
        });
        break;

      case 'join-room':
        const room = rooms.get(data.roomId);
        if (room) {
          room.clients.add(ws);
          ws.send(
            JSON.stringify({ type: 'room-data', messages: room.messages })
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
        const targetRoom = rooms.get(data.roomId);
        if (targetRoom) {
          const newMessage: Message = {
            user: data.user,
            content: data.content,
            time: new Date().toISOString(),
          };
          targetRoom.messages.push(newMessage);
          broadcast(targetRoom.clients, {
            type: 'new-message',
            message: newMessage,
          });
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

console.log('WebSocket server is running on ws://localhost:8080');
