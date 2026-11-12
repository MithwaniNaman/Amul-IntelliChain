"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main
      role="alert"
      className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center gap-4"
    >
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          This view could not be loaded
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Try the view again. If it continues, return to the Overview. No
          underlying error details are shown in this public demo.
        </p>
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
