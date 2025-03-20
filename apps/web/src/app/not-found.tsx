'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Home, Search, XCircle } from 'lucide-react';

export default function RoomNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-6">
        <div>
          <XCircle
            className="w-24 h-24 text-destructive mx-auto"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-4xl font-bold">404: Page Not Found</h1>

        <p className="text-lg text-muted-foreground max-w-md">
          The page or room doesn&apos;t exist. It might have been closed or
          never existed.
        </p>

        <div>
          <Button
            onClick={() => router.push('/')}
            className="mt-4"
            variant="default"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
