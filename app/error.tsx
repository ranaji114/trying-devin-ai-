"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
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
    <div className="container-page flex flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-semibold sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        We could not load this page. Try again — if it keeps failing, the Supabase connection may be
        misconfigured.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
