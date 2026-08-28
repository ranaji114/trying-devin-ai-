import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchBar } from "@/components/ui/SearchBar";
import { ExploreFilters } from "@/components/trips/ExploreFilters";
import { TripGrid } from "@/components/trips/TripGrid";
import { EmptyState, ErrorState, TripGridSkeleton } from "@/components/ui/States";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { listPublishedTrips } from "@/lib/database/trips";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Explore Journeys",
  description: "Discover real travel journeys, routes and destinations documented by travelers.",
};

interface ExplorePageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

async function Results({ searchParams }: ExplorePageProps) {
  const duration = single(searchParams.duration);

  let trips;
  try {
    trips = await listPublishedTrips({
      query: single(searchParams.q),
      travelStyle: single(searchParams.style),
      difficulty: single(searchParams.difficulty),
      season: single(searchParams.season),
      maxDuration: duration ? Number(duration) : undefined,
    });
  } catch {
    return <ErrorState description="We could not load journeys. Please try again." />;
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        title="No journeys match your search."
        description="Try a different destination or clear the filters — or be the first traveler to document this route."
        actionLabel="Create Journey"
        actionHref="/create"
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted">
        {trips.length} {trips.length === 1 ? "journey" : "journeys"}
      </p>
      <TripGrid trips={trips} />
    </>
  );
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  const query = single(searchParams.q) ?? "";

  return (
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Explore Journeys</h1>
        <p className="mt-2 text-sm text-muted">
          Real routes, real stops and real notes from travelers who have already been there.
        </p>
      </header>

      <div className="mt-8 max-w-xl">
        <SearchBar action="/explore" defaultValue={query} />
      </div>

      <div className="mt-6">
        <Suspense fallback={null}>
          <ExploreFilters />
        </Suspense>
      </div>

      <div className="mt-10">
        {isSupabaseConfigured() ? (
          <Suspense key={JSON.stringify(searchParams)} fallback={<TripGridSkeleton />}>
            <Results searchParams={searchParams} />
          </Suspense>
        ) : (
          <SetupNotice />
        )}
      </div>
    </div>
  );
}
