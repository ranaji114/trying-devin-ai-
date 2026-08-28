"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import type { DestinationSuggestion } from "@/types";

interface DestinationSearchProps {
  label: string;
  placeholder?: string;
  hint?: string;
  onSelect: (suggestion: DestinationSuggestion) => void;
}

/** Short label for a Nominatim display name: "Kaza, Lahaul and Spiti". */
export function shortPlaceName(displayName: string): string {
  const parts = displayName.split(",").map((part) => part.trim());
  return parts.slice(0, 2).join(", ");
}

export function DestinationSearch({ label, placeholder, hint, onSelect }: DestinationSearchProps) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("lookup failed");
        const data = (await response.json()) as DestinationSuggestion[];
        setSuggestions(data);
        setOpen(true);
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") {
          setError("Could not look up destinations. Check your connection and try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [term]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={term}
          placeholder={placeholder ?? "Search a place"}
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-9 text-sm placeholder:text-muted/80 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {loading ? (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted"
            aria-hidden
          />
        ) : null}

        {open && suggestions.length > 0 ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Destination suggestions"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface py-1 shadow-sm"
          >
            {suggestions.map((suggestion) => (
              <li key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.name}`} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect({ ...suggestion, name: shortPlaceName(suggestion.name) });
                    setTerm("");
                    setSuggestions([]);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-background"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <span className="min-w-0">
                    <span className="block font-medium">{shortPlaceName(suggestion.name)}</span>
                    <span className="block truncate text-xs text-muted">{suggestion.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
