import { useSocket } from '@/hooks/useSocket';
import React, { useRef, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Message } from '@/types/message';
import ChatInput from './chat-input';

interface RoomChatProps {
  messages: Message[];
  roomId: string;
}

export default function RoomChat({ messages, roomId }: RoomChatProps) {
  const { sendMessage } = useSocket();

  const [inputValue, setInputValue] = useState('');
  const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // e: React.FormEvent<HTMLFormElement>
  const handleSendMessage = (e: string) => {
    sendMessage(roomId, username, e);
    // if (inputValue.trim()) {
    //   sendMessage(roomId, username, e);
    //   setInputValue('');
    // }
  };

  return (
    <React.Fragment>
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
                    <span className="font-medium text-sm">{message.user}</span>
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
          <ChatInput onSend={handleSendMessage} />
          {/* <form onSubmit={handleSendMessage} className="flex gap-2">
            <div>
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form> */}
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
                    <span className="font-medium text-sm">{message.user}</span>
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
          <ChatInput onSend={handleSendMessage} />
          {/* <form onSubmit={handleSendMessage} className="flex gap-2">
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
          </form> */}
        </div>
      </div>
    </React.Fragment>
  );
}
