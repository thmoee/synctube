'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from '@/types/message';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import RoomHeader from '@/components/room/header';
import RoomChat from '@/components/room/chat';
import { RoomData, VideoMetadata } from '@/types/room';
import { formatDistanceToNow } from 'date-fns';
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
}

type VideoEvent =
  | { type: 'video-play'; timestamp: number }
  | { type: 'video-pause'; timestamp: number }
  | { type: 'video-seek'; timestamp: number };

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const {
    isConnected,
    joinRoom,
    subscribeToMessages,
    subscribeToParticipants,
    subscribeToVideoUpdates,
    subscribeToVideoSync,
    syncVideoState,
  } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    title: '',
    creator: '',
  });
  const [createdAt, setCreatedAt] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');

  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerInitializedRef = useRef(false);
  const isSyncingRef = useRef(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const handlePlayerStateChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      if (isSyncingRef.current || !playerRef.current) return;

      const player = event.target;
      const playerState = player.getPlayerState();
      const currentTime = player.getCurrentTime();

      if (playerState === 1) {
        syncVideoState(roomId, {
          type: 'video-play',
          timestamp: currentTime,
        });
      } else if (playerState === 2) {
        syncVideoState(roomId, {
          type: 'video-pause',
          timestamp: currentTime,
        });
      }
    },
    [roomId, syncVideoState]
  );

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const fetchRoomData = async () => {
      try {
        const roomData = (await joinRoom(roomId)) as RoomData;
        if (roomData) {
          setMessages(roomData.messages || []);
          if (roomData.videoUrl) {
            setVideoUrl(roomData.videoUrl);
          }
          if (roomData.createdAt) {
            setCreatedAt(roomData.createdAt);
          }
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

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToParticipants((count) => {
      setParticipants(count);
    });

    return unsubscribe;
  }, [isConnected, subscribeToParticipants]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubscribe = subscribeToVideoUpdates((url) => {
      if (url && typeof url === 'string') {
        setVideoUrl(url);
        playerInitializedRef.current = false;
      }
    });

    return unsubscribe;
  }, [isConnected, subscribeToVideoUpdates]);

  useEffect(() => {
    if (!videoUrl) return;

    const initializeYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = initializePlayer;
      } else {
        initializePlayer();
      }
    };

    function initializePlayer() {
      if (!playerContainerRef.current || playerInitializedRef.current) return;

      try {
        playerContainerRef.current.innerHTML = '';
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        playerContainerRef.current.appendChild(playerDiv);

        const videoId =
          new URL(videoUrl).searchParams.get('v') ||
          videoUrl.split('/').pop()?.split('?')[0] ||
          '';

        fetch(`/api/youtube?videoId=${videoId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.error('Error: ', data.error);
              return;
            }
            setVideoMetadata({
              title: data.title,
              creator: data.creator,
            });
          })
          .catch((error) => {
            console.error('Error fetching video metadata:', error);
          });

        new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (event: any) => {
              playerRef.current = event.target;
              playerInitializedRef.current = true;
            },
            onStateChange: handlePlayerStateChange,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (event: any) => {
              console.error('YouTube Player Error:', event.data);
              playerInitializedRef.current = false;
            },
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        playerInitializedRef.current = false;
      }
    }

    initializeYouTubeAPI();

    return () => {
      playerInitializedRef.current = false;
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoUrl, handlePlayerStateChange]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToVideoSync((event) => {
      if (!playerRef.current) return;

      isSyncingRef.current = true;

      switch (event.type) {
        case 'video-play':
          playerRef.current.seekTo(event.timestamp, true);
          playerRef.current.playVideo();
          break;
        case 'video-pause':
          playerRef.current.seekTo(event.timestamp, true);
          playerRef.current.pauseVideo();
          break;
        case 'video-seek':
          playerRef.current.seekTo(event.timestamp, true);
          break;
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 500);
    });

    return unsubscribe;
  }, [isConnected, subscribeToVideoSync]);

  useEffect(() => {
    if (!createdAt) return;

    const updateElapsedTime = () => {
      setElapsedTime(
        formatDistanceToNow(new Date(createdAt), { addSuffix: true })
      );
    };

    // Update immediately
    updateElapsedTime();

    // Update every minute
    const interval = setInterval(updateElapsedTime, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="flex flex-col min-h-screen">
      <RoomHeader participants={participants} roomId={roomId} />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 relative mt-16">
        <div className="flex flex-col overflow-y-auto">
          <div
            ref={playerContainerRef}
            className="relative w-full bg-black aspect-[16/9] md:aspect-[16/7] lg:aspect-[16/8] xl:aspect-[16/7.5]"
          >
            {!videoUrl && (
              <div className="w-full flex items-center justify-center h-full text-white">
                <p>No Video selected.</p>
              </div>
            )}
          </div>

          {videoUrl && (
            <div className="p-4 border-t lg:border-r">
              <h1 className="text-2xl font-bold">{videoMetadata.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-500">{videoMetadata.creator}</p>
                <span className="text-sm text-gray-500">•</span>
                <p className="text-sm text-gray-500">{elapsedTime}</p>
              </div>
            </div>
          )}
        </div>
        <RoomChat messages={messages} roomId={roomId} />
      </main>
    </div>
  );
}
