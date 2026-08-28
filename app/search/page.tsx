import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, User } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { TripGrid } from "@/components/trips/TripGrid";
import { EmptyState, ErrorState, TripGridSkeleton } from "@/components/ui/States";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { search } from "@/lib/database/search";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Search",
  description: "Search destinations, journeys and travelers on TrekLog.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

async function Results({ term }: { term: string }) {
  let results;
  try {
    results = await search(term);
  } catch {
    return <ErrorState description="We could not run that search. Please try again." />;
  }

  const total =
    results.destinations.length + results.journeys.length + results.travelers.length;

  if (total === 0) {
    return (
      <EmptyState
        title={`Nothing found for “${term}”.`}
        description="Try another destination, traveler or journey title."
        actionLabel="Browse all journeys"
        actionHref="/explore"
      />
    );
  }

  return (
    <>
      {results.destinations.length > 0 ? (
        <Section title="Destinations">
          <ul className="flex flex-wrap gap-2">
            {results.destinations.map((destination) => (
              <li key={destination.name}>
                <Link
                  href={`/explore?q=${encodeURIComponent(destination.name)}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  <MapPin className="h-4 w-4 text-accent" aria-hidden />
                  {destination.name}
                  {destination.tripCount > 0 ? (
                    <span className="text-xs text-muted">{destination.tripCount}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {results.journeys.length > 0 ? (
        <Section title="Journeys">
          <TripGrid trips={results.journeys} />
        </Section>
      ) : null}

      {results.travelers.length > 0 ? (
        <Section title="Travelers">
          <ul className="flex flex-wrap gap-2">
            {results.travelers.map((traveler) => (
              <li key={traveler.username}>
                <Link
                  href={`/profile/${traveler.username}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  <User className="h-4 w-4 text-muted" aria-hidden />
                  {traveler.full_name ?? traveler.username}
                  <span className="text-xs text-muted">@{traveler.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const term = (searchParams.q ?? "").trim();

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {term ? `Search results for “${term}”` : "Search TrekLog"}
      </h1>

      <div className="mt-6 max-w-xl">
        <SearchBar defaultValue={term} autoFocus={!term} />
      </div>

      {!isSupabaseConfigured() ? (
        <div className="mt-10">
          <SetupNotice />
        </div>
      ) : term ? (
        <Suspense key={term} fallback={<div className="mt-10"><TripGridSkeleton count={3} /></div>}>
          <Results term={term} />
        </Suspense>
      ) : (
        <p className="mt-10 text-sm text-muted">
          Search for a destination, a journey title or a traveler.
        </p>
      )}
    </div>
  );
}
