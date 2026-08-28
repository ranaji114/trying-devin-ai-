"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  action?: "/search" | "/explore";
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search destinations, routes, or journeys...",
  action = "/search",
  className,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = value.trim();
    router.push(term ? `${action}?q=${encodeURIComponent(term)}` : action);
  }

  return (
    <form role="search" onSubmit={onSubmit} className={cn("flex w-full gap-2", className)}>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <label htmlFor="treklog-search" className="sr-only">
          Search TrekLog
        </label>
        <input
          id="treklog-search"
          name="q"
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted/80 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-lg bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Search
      </button>
    </form>
  );
}
