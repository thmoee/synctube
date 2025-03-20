'use client';

import { Send, Smile } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { EmojiResponse } from '@/types/emoji';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emojiObject: EmojiResponse) => {
    const emoji = emojiObject.native;
    const input = inputRef.current;

    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newMessage =
        message.substring(0, start) + emoji + message.substring(end);

      setMessage(newMessage);

      // Set cursor position after the inserted emoji
      setTimeout(() => {
        input.selectionStart = start + emoji.length;
        input.selectionEnd = start + emoji.length;
        input.focus();
      }, 0);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                skinTonePosition="none"
                previewPosition="none"
                onClickOutside={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>
        <Button onClick={handleSendMessage} size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
