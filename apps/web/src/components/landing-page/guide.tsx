export default function GuideSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="howItWorks">
      <div className="container px-4 md:px-6 mr-auto ml-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              How It Works
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Get started in three simple steps
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          <div className="flex flex-col items-center space-y-2 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="text-xl font-bold">Create a Room</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Click &quot;Create a Room&quot; and get a unique room link
              instantly.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="text-xl font-bold">Invite Friends</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Share your room link with friends via text, email, or social
              media.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="text-xl font-bold">Watch Together</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Paste a YouTube URL and enjoy synchronized viewing with chat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
