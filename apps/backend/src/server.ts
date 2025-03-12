import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'create-room':
        console.log('trying to create room');
        ws.send(JSON.stringify({ type: 'room-created', roomId: 12413 }));
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
