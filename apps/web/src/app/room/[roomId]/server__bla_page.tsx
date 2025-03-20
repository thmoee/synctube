import { notFound, redirect } from 'next/navigation';
import ClientPage from './page';

async function checkRoomExists(roomId: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'check-room', roomId }));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.type === 'room-check-result') {
            ws.close();
            resolve(response.exists);
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          ws.close();
          resolve(false);
        }
      };

      ws.onerror = () => {
        ws.close();
        resolve(false);
      };

      setTimeout(() => {
        ws.close();
        resolve(false);
      }, 5000);
    } catch (error) {
      console.error('Error checking room:', error);
      resolve(false);
    }
  });
}

export default async function RoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = await params;
  const roomExists = await checkRoomExists(roomId);

  if (!roomExists) {
    notFound();
  }
  return <ClientPage />;
}
