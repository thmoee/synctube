import { Message } from './message';

export interface CreateRoom {
  roomName: string;
  hostName: string;
  videoUrl: string;
}

export interface RoomData {
  messages: Message[];
  videoUrl?: string;
  createdAt: string;
}

export interface VideoMetadata {
  title: string;
  creator: string;
}
