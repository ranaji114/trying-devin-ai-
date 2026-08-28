"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const TRAVEL_STYLES = [
  { value: "road-trip", label: "Road trip" },
  { value: "trek", label: "Trek" },
  { value: "backpacking", label: "Backpacking" },
  { value: "family", label: "Family" },
  { value: "solo", label: "Solo" },
  { value: "weekend", label: "Weekend" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
];

const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "monsoon", label: "Monsoon" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
];

const DURATIONS = [
  { value: "3", label: "Up to 3 days" },
  { value: "7", label: "Up to 7 days" },
  { value: "14", label: "Up to 14 days" },
];

export function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/explore?${params.toString()}`);
  }

  const hasFilters = ["style", "difficulty", "season", "duration", "destination"].some((key) =>
    searchParams.get(key),
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        label="Travel style"
        value={searchParams.get("style") ?? ""}
        onChange={(event) => update("style", event.target.value)}
        className="w-44"
      >
        <option value="">All styles</option>
        {TRAVEL_STYLES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        label="Difficulty"
        value={searchParams.get("difficulty") ?? ""}
        onChange={(event) => update("difficulty", event.target.value)}
        className="w-40"
      >
        <option value="">Any difficulty</option>
        {DIFFICULTIES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        label="Season"
        value={searchParams.get("season") ?? ""}
        onChange={(event) => update("season", event.target.value)}
        className="w-40"
      >
        <option value="">Any season</option>
        {SEASONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        label="Duration"
        value={searchParams.get("duration") ?? ""}
        onChange={(event) => update("duration", event.target.value)}
        className="w-44"
      >
        <option value="">Any duration</option>
        {DURATIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          className="mb-[2px]"
          onClick={() => {
            const query = searchParams.get("q");
            router.push(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
          }}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
