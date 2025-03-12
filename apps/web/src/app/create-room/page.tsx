'use client';

import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function CreateRoomPage() {
  const router = useRouter();

  const { createRoom, isConnected } = useSocket();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Not connected to the server');
      return;
    }

    const roomId = await createRoom({
      roomName: 'testRoomname',
      hostName: 'testHostName',
      videoUrl: '',
    });

    router.push(`/room/${roomId}`);
  };

  return (
    <div>
      <h1>Create Room</h1>
      <form onSubmit={handleCreateRoom}>
        <Button type="submit">room creation</Button>
      </form>
    </div>
  );
}
