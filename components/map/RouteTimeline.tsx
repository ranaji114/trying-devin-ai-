import { MapPin } from "lucide-react";
import type { TripStop } from "@/types";
import { formatFullDate } from "@/lib/utils/format";

export function RouteTimeline({ stops }: { stops: TripStop[] }) {
  if (stops.length === 0) {
    return <p className="text-sm text-muted">No stops were added to this route.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-line pl-6">
      {stops.map((stop, index) => (
        <li key={stop.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-semibold text-accent"
          >
            {index + 1}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[15px] font-semibold">{stop.name}</h3>
            {stop.arrival_date ? (
              <span className="text-xs text-muted">{formatFullDate(stop.arrival_date)}</span>
            ) : null}
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {stop.latitude.toFixed(3)}, {stop.longitude.toFixed(3)}
          </p>
          {stop.notes ? <p className="mt-2 text-sm text-muted">{stop.notes}</p> : null}
        </li>
      ))}
    </ol>
  );
}
