import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useState } from 'react';

interface RoomHeaderProps {
  participants: number;
  onAddVideo: (url: string) => void;
}

export default function RoomHeader({
  participants,
  onAddVideo,
}: RoomHeaderProps) {
  const [videoUrl, setVideoUrl] = useState('');

  const handleSetVideo = () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a valid video URL');
      return;
    }

    onAddVideo(videoUrl);
    toast.success('Video added to playlist!');
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
          placeholder="Enter Video URL here"
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
