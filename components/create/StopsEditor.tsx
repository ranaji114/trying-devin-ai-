"use client";

import { ArrowDown, ArrowUp, MapPin, Trash2 } from "lucide-react";
import { DestinationSearch } from "./DestinationSearch";
import type { StopInput } from "@/lib/validations/trip";
import type { DestinationSuggestion } from "@/types";

interface StopsEditorProps {
  stops: StopInput[];
  onChange: (stops: StopInput[]) => void;
}

export function StopsEditor({ stops, onChange }: StopsEditorProps) {
  function addStop(suggestion: DestinationSuggestion) {
    if (
      stops.some(
        (stop) =>
          stop.latitude === suggestion.latitude && stop.longitude === suggestion.longitude,
      )
    ) {
      return;
    }
    onChange([
      ...stops,
      {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        arrivalDate: null,
        notes: null,
      },
    ]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    const next = [...stops];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(stops.filter((_, position) => position !== index));
  }

  function updateStop(index: number, patch: Partial<StopInput>) {
    onChange(stops.map((stop, position) => (position === index ? { ...stop, ...patch } : stop)));
  }

  return (
    <div className="space-y-6">
      {stops.length > 0 ? (
        <ol className="space-y-3">
          {stops.map((stop, index) => (
            <li key={`${stop.name}-${stop.latitude}-${stop.longitude}`} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold text-accent"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{stop.name}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {stop.latitude.toFixed(3)}, {stop.longitude.toFixed(3)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${stop.name} earlier`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === stops.length - 1}
                    aria-label={`Move ${stop.name} later`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${stop.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`arrival-${index}`}
                    className="block text-xs font-medium text-muted"
                  >
                    Arrival date (optional)
                  </label>
                  <input
                    id={`arrival-${index}`}
                    type="date"
                    value={stop.arrivalDate ?? ""}
                    onChange={(event) =>
                      updateStop(index, { arrivalDate: event.target.value || null })
                    }
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={`notes-${index}`} className="block text-xs font-medium text-muted">
                    Notes (optional)
                  </label>
                  <input
                    id={`notes-${index}`}
                    type="text"
                    value={stop.notes ?? ""}
                    placeholder="Stayed overnight, fuel stop…"
                    onChange={(event) => updateStop(index, { notes: event.target.value || null })}
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm placeholder:text-muted/80 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">
          Add at least two stops so TrekLog can draw your route on the map.
        </p>
      )}

      <DestinationSearch
        label="Add stop"
        placeholder="Search a town, pass or monastery"
        hint="Powered by OpenStreetMap. Stops are stored with real coordinates."
        onSelect={addStop}
      />
    </div>
  );
}
