import { MessageSquare, Play, Users } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
      id="features"
    >
      <div className="container px-4 md:px-6 mr-auto ml-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Features That Connect
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Everything you need for the perfect shared viewing experience
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Synchronized Playback</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Everyone sees the same content at the same time, perfectly in
              sync.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Live Chat</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Share reactions and comments in real-time with everyone in your
              room.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Private Rooms</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Create invite-only rooms for just you and your friends.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">No Account Required</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Get started instantly - no sign-up needed to join a room.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">YouTube Integration</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Easily search and add any YouTube video to your watch party.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
