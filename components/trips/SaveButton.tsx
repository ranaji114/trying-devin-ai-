"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleSaveTrip } from "@/lib/actions/saved";
import { cn } from "@/lib/utils/cn";

interface SaveButtonProps {
  tripId: string;
  initialSaved: boolean;
  compact?: boolean;
}

export function SaveButton({ tripId, initialSaved, compact = false }: SaveButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    const optimistic = !saved;
    setSaved(optimistic);

    startTransition(async () => {
      const result = await toggleSaveTrip(tripId);
      setSaved(result.saved);
      if (result.error) {
        setError(result.error);
        if (result.error.startsWith("Log in")) router.push("/login?next=/explore");
      } else {
        router.refresh();
      }
    });
  }

  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = saved ? "Remove from saved journeys" : "Save this journey";

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface/95 text-muted shadow-sm transition-colors hover:text-accent disabled:opacity-60",
          saved && "text-accent",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-60",
          saved
            ? "border-accent bg-accent text-white hover:bg-accent-hover"
            : "border-line bg-surface text-ink hover:bg-background",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {saved ? "Saved" : "Save Journey"}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
