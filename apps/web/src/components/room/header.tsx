import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';
import { useState } from 'react';

interface RoomHeaderProps {
  participants: number;
  roomId: string;
}

export default function RoomHeader({ participants, roomId }: RoomHeaderProps) {
  const { setVideo } = useSocket();
  const [videoUrl, setVideoUrl] = useState('');

  const handleSetVideo = () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a valid video URL');
      return;
    }

    let videoId = '';
    try {
      const url = new URL(videoUrl);
      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      } else if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.substring(1);
      }
    } catch (error) {
      // If not a valid URL, check if it's just a video ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(videoUrl)) {
        videoId = videoUrl;
      }
    }

    if (!videoId) {
      toast.error('Invalid YouTube URL or video ID');
      return;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    setVideo(roomId, embedUrl);
    toast.success('Video updated!');
    setVideoUrl('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-background">
      <Link className="flex items-center justify-center" href="/">
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="font-medium">Back to Home</span>
      </Link>
      <div>
        <Input
          className="bg-muted/50 min-w-96"
          placeholder="Enter Video Url here"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSetVideo()}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-red-400" />
          <span className="text-sm text-red-400">{participants}</span>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Room link copied to clipboard!');
          }}
        >
          Invite
        </Button>
      </div>
    </header>
  );
}
