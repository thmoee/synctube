'use client';

import { ArrowLeft, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/message';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';

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
      <header className="fixed top-0 left-0 right-0 z-10 px-4 lg:px-6 h-16 flex items-center border-b bg-background">
        <Link className="flex items-center justify-center" href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="font-medium">Back to Home</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-red-400" />
            <span className="text-sm text-red-400">{participants}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Room link copied to clipboard!');
            }}
          >
            Invite
          </Button>
        </div>
      </header>
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
              <p className="text-sm text-gray-500">Hosted by Alex</p>
              <span className="text-sm text-gray-500">•</span>
              <p className="text-sm text-gray-500">Started 10 minutes ago</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm">Add to Queue</Button>
              <Button size="sm" variant="outline">
                Share Room
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex flex-col fixed top-16 right-0 bottom-0 w-[300px] border-l bg-background">
          <div className="p-3 border-b shrink-0">
            <h2 className="font-semibold">Live Chat</h2>
          </div>
          <ScrollArea className="flex-1 p-4 h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.time}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
          <div ref={messagesEndRef} />
        </div>
        {/* Mobile chat view */}
        <div className="lg:hidden flex flex-col border-t">
          <div className="p-3 border-b shrink-0">
            <h2 className="font-semibold">Live Chat</h2>
          </div>
          <ScrollArea className="flex-1 p-4 h-[calc(100vh-10rem)]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.time}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
