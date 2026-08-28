import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { TripGrid } from "@/components/trips/TripGrid";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { listSavedTrips } from "@/lib/database/trips";
import { getCurrentUser } from "@/lib/supabase/server";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Saved Journeys",
  description: "Journeys you saved to follow later.",
};

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/saved");

  let trips;
  try {
    trips = await listSavedTrips(user.id);
  } catch {
    return (
      <div className="container-page py-12">
        <ErrorState description="We could not load your saved journeys. Please try again." />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">Saved Journeys</h1>
      <p className="mt-2 text-sm text-muted">Routes you want to follow on your next trip.</p>

      <div className="mt-10">
        {trips.length === 0 ? (
          <EmptyState
            title="Nothing saved yet."
            description="Save a journey while exploring and it will show up here."
            actionLabel="Explore journeys"
            actionHref="/explore"
          />
        ) : (
          <TripGrid trips={trips} />
        )}
      </div>
    </div>
  );
}
