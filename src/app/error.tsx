"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
