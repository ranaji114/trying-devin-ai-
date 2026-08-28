import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { TripSummary } from "@/types";
import { formatDuration, formatMonthYear } from "@/lib/utils/format";
import { SaveButton } from "./SaveButton";

interface TripCardProps {
  trip: TripSummary;
  showSave?: boolean;
  priority?: boolean;
}

export function TripCard({ trip, showSave = true, priority = false }: TripCardProps) {
  const duration = formatDuration(trip.startDate, trip.endDate);
  const month = formatMonthYear(trip.startDate);
  const traveler = trip.author.full_name ?? trip.author.username;

  return (
    <article className="group card overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-background">
        <Link href={`/trip/${trip.id}`} tabIndex={-1} aria-hidden={trip.coverImage ? undefined : true}>
          {trip.coverImage ? (
            <Image
              src={trip.coverImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No cover photo
            </div>
          )}
        </Link>
        {showSave ? (
          <div className="absolute right-3 top-3">
            <SaveButton tripId={trip.id} initialSaved={trip.isSaved ?? false} compact />
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="truncate text-[15px] font-semibold leading-6">
          <Link href={`/trip/${trip.id}`} className="hover:text-accent">
            {trip.title}
          </Link>
        </h3>

        <p className="truncate text-sm text-muted">
          <Link href={`/profile/${trip.author.username}`} className="hover:text-ink">
            {traveler}
          </Link>
          {month ? ` · ${month}` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {trip.location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span className="truncate">{trip.location}</span>
            </span>
          ) : null}
          {duration ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              {duration}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
