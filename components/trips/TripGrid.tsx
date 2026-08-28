import type { TripSummary } from "@/types";
import { TripCard } from "./TripCard";

interface TripGridProps {
  trips: TripSummary[];
  showSave?: boolean;
}

export function TripGrid({ trips, showSave = true }: TripGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip, index) => (
        <TripCard key={trip.id} trip={trip} showSave={showSave} priority={index < 3} />
      ))}
    </div>
  );
}
