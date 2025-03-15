'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/message';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import RoomHeader from '@/components/room/header';
import RoomChat from '@/components/room/chat';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const {
    isConnected,
    joinRoom,
    sendMessage,
    subscribeToMessages,
    subscribeToParticipants,
  } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const fetchRoomData = async () => {
      try {
        const roomMessages = await joinRoom(roomId);
        if (Array.isArray(roomMessages)) {
          setMessages(roomMessages);
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    };

    fetchRoomData();
  }, [isConnected, joinRoom, roomId]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToMessages((message) => {
      setMessages((prev) => [...prev, message as Message]);
    });

    return unsubscribe;
  }, [isConnected, subscribeToMessages]);

  // Subscribe to participant count updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToParticipants((count) => {
      setParticipants(count);
    });

    return unsubscribe;
  }, [isConnected, subscribeToParticipants]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(roomId, username, inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <RoomHeader participants={participants} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 relative mt-16">
        <div className="flex flex-col overflow-y-auto">
          <div className="relative w-full bg-black aspect-[16/9] md:aspect-[16/7] lg:aspect-[16/8] xl:aspect-[16/7.5]">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1"
              className="absolute inset-0 w-full h-full"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-4 border-t lg:border-r">
            <h1 className="text-2xl font-bold">Movie Night Room</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-gray-500">Started 10 minutes ago</p>
            </div>
          </div>
        </div>
        <RoomChat messages={messages} roomId={roomId} />
      </main>
    </div>
  );
}
