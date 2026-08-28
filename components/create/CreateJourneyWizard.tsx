"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { RouteMap } from "@/components/map/RouteMap";
import { DestinationSearch } from "./DestinationSearch";
import { StopsEditor } from "./StopsEditor";
import { ImageUploader } from "./ImageUploader";
import { saveJourney } from "@/lib/actions/trips";
import { journeySchema, type JourneyInput, type PhotoInput, type StopInput } from "@/lib/validations/trip";
import { formatDateRange, formatDuration } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Difficulty, Season, TravelStyle } from "@/types/database";

const STEPS = ["Destination", "Route", "Story", "Photos", "Preview"] as const;

const TRAVEL_STYLES: TravelStyle[] = [
  "road-trip",
  "trek",
  "backpacking",
  "family",
  "solo",
  "weekend",
];
const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard"];
const SEASONS: Season[] = ["spring", "summer", "monsoon", "autumn", "winter"];

interface DraftJourney {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  travelStyle: TravelStyle | "";
  difficulty: Difficulty | "";
  season: Season | "";
  description: string;
  tips: string;
  stops: StopInput[];
  photos: PhotoInput[];
}

const EMPTY_DRAFT: DraftJourney = {
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  travelStyle: "",
  difficulty: "",
  season: "",
  description: "",
  tips: "",
  stops: [],
  photos: [],
};

function toInput(draft: DraftJourney): JourneyInput {
  return {
    title: draft.title,
    description: draft.description,
    tips: draft.tips.trim() ? draft.tips : null,
    location: draft.location,
    startDate: draft.startDate,
    endDate: draft.endDate,
    travelStyle: draft.travelStyle || null,
    difficulty: draft.difficulty || null,
    season: draft.season || null,
    stops: draft.stops,
    photos: draft.photos,
  };
}

export function CreateJourneyWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftJourney>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const mapPoints = useMemo(
    () =>
      draft.stops.map((stop) => ({
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
    [draft.stops],
  );

  function update(patch: Partial<DraftJourney>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function validateStep(target: number): string | null {
    if (target === 0) {
      if (draft.title.trim().length < 3) return "Give your journey a title.";
      if (draft.location.trim().length < 2) return "Add the destination.";
      if (!draft.startDate || !draft.endDate) return "Add both start and end dates.";
      if (new Date(draft.endDate) < new Date(draft.startDate)) {
        return "End date must be on or after the start date.";
      }
    }
    if (target === 1 && draft.stops.length < 2) {
      return "Add at least two stops to draw a route.";
    }
    if (target === 2 && draft.description.trim().length < 20) {
      return "Describe your journey in at least 20 characters.";
    }
    return null;
  }

  function goNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function submit(status: "draft" | "published") {
    const parsed = journeySchema.safeParse(toInput(draft));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Some details are missing.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveJourney(parsed.data, status);
      if (result.error || !result.tripId) {
        setError(result.error ?? "Could not save your journey.");
        return;
      }
      router.push(`/trip/${result.tripId}`);
      router.refresh();
    });
  }

  return (
    <div>
      <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-4" aria-label="Progress">
        {STEPS.map((name, index) => (
          <li key={name} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                index < step && "border-accent bg-accent text-white",
                index === step && "border-accent text-accent",
                index > step && "border-line text-muted",
              )}
            >
              {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              aria-current={index === step ? "step" : undefined}
              className={index === step ? "font-medium text-ink" : "text-muted"}
            >
              {name}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-6">
        {step === 0 ? (
          <div className="space-y-5">
            <Input
              label="Journey title"
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder="Eight days across Spiti Valley"
              required
            />
            <Input
              label="Destination"
              value={draft.location}
              onChange={(event) => update({ location: event.target.value })}
              placeholder="Spiti Valley, Himachal Pradesh"
              hint="Shown on cards and used for search."
              required
            />
            <DestinationSearch
              label="Or search a destination"
              placeholder="Search for a region or city"
              onSelect={(suggestion) => update({ location: suggestion.name })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start date"
                type="date"
                value={draft.startDate}
                onChange={(event) => update({ startDate: event.target.value })}
                required
              />
              <Input
                label="End date"
                type="date"
                value={draft.endDate}
                onChange={(event) => update({ endDate: event.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Travel style"
                value={draft.travelStyle}
                onChange={(event) => update({ travelStyle: event.target.value as TravelStyle | "" })}
              >
                <option value="">Not set</option>
                {TRAVEL_STYLES.map((value) => (
                  <option key={value} value={value}>
                    {value.replace("-", " ")}
                  </option>
                ))}
              </Select>
              <Select
                label="Difficulty"
                value={draft.difficulty}
                onChange={(event) => update({ difficulty: event.target.value as Difficulty | "" })}
              >
                <option value="">Not set</option>
                {DIFFICULTIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
              <Select
                label="Season"
                value={draft.season}
                onChange={(event) => update({ season: event.target.value as Season | "" })}
              >
                <option value="">Not set</option>
                {SEASONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <StopsEditor stops={draft.stops} onChange={(stops) => update({ stops })} />
            {mapPoints.length > 0 ? (
              <RouteMap points={mapPoints} className="h-[320px] w-full" ariaLabel="Route preview" />
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <Textarea
              label="Your story"
              rows={10}
              value={draft.description}
              onChange={(event) => update({ description: event.target.value })}
              hint="What the road was like, where you stayed, what surprised you."
              required
            />
            <Textarea
              label="Travel notes & tips (optional)"
              rows={5}
              value={draft.tips}
              onChange={(event) => update({ tips: event.target.value })}
              hint="Permits, fuel stops, altitude advice — one tip per line."
            />
          </div>
        ) : null}

        {step === 3 ? (
          <ImageUploader
            userId={userId}
            photos={draft.photos}
            onChange={(photos) => update({ photos })}
          />
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              {draft.photos.length > 0 ? (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={(draft.photos.find((photo) => photo.isCover) ?? draft.photos[0]).publicUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 720px, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="space-y-3 p-6">
                <h2 className="text-xl font-semibold">{draft.title}</h2>
                <p className="text-sm text-muted">
                  {[draft.location, formatDateRange(draft.startDate, draft.endDate), formatDuration(draft.startDate, draft.endDate)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="whitespace-pre-line text-sm leading-6 text-ink/90">
                  {draft.description}
                </p>
              </div>
            </div>
            <RouteMap points={mapPoints} className="h-[320px] w-full" ariaLabel="Route preview" />
            <p className="text-sm text-muted">
              {draft.stops.length} stops · {draft.photos.length} photos
            </p>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <Button variant="ghost" onClick={goBack} disabled={step === 0 || pending}>
            Back
          </Button>
          <div className="flex flex-wrap gap-3">
            {step === STEPS.length - 1 ? (
              <>
                <Button variant="secondary" onClick={() => submit("draft")} disabled={pending}>
                  Save as draft
                </Button>
                <Button onClick={() => submit("published")} disabled={pending}>
                  {pending ? "Publishing…" : "Publish journey"}
                </Button>
              </>
            ) : (
              <Button onClick={goNext} disabled={pending}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
