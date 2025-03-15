'use client';

import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Play, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import FeaturesSection from '@/components/landing-page/features';
import GuideSection from '@/components/landing-page/guide';

export default function Home() {
  const router = useRouter();
  const { isConnected, createRoom } = useSocket();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!isConnected) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsCreating(true);

    try {
      const roomId = await createRoom({
        roomName: 'testRoomname',
        hostName: 'testHostName',
        videoUrl: '',
      });

      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
      setIsCreating(false);
    }
  };

  const handleHowItWorks = () => {
    router.push('#howItWorks');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <Play className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">WatchParty</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#howItWorks"
          >
            How It Works
          </Link>
          <div className="mr-1">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mr-auto ml-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Watch YouTube Videos Together, Anywhere
                  </h1>
                  <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Create a room, invite friends, and enjoy synchronized
                    YouTube videos with real-time chat. Perfect for movie
                    nights, study groups, or just hanging out.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="px-8" onClick={handleCreateRoom}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create A Room'
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8"
                    onClick={handleHowItWorks}
                  >
                    How It Works
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none relative">
                <div className="aspect-video overflow-hidden rounded-xl border bg-muted/50 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1280"
                    alt="Watch party interface showing a YouTube video and chat"
                    width={1280}
                    height={720}
                    className="object-cover w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />

        <GuideSection />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mr-auto ml-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Watch Together?
                </h2>
                <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                  Create your first room now and invite friends to join the fun.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="px-8" onClick={handleCreateRoom}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create A Room'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 WatchParty. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
