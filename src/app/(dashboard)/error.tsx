"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground max-w-[500px]">
        We encountered an unexpected error. Our team has been notified.
        {error.message && (
          <span className="block mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
            {error.message}
          </span>
        )}
      </p>
      <Button onClick={() => reset()} variant="default">
        Try again
      </Button>
    </div>
  );
}
