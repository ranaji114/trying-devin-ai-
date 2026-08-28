import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { ButtonLink } from "@/components/ui/Button";
import { TripGrid } from "@/components/trips/TripGrid";
import { EmptyState, ErrorState, TripGridSkeleton } from "@/components/ui/States";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { listPublishedTrips } from "@/lib/database/trips";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDateRange, formatDuration } from "@/lib/utils/format";

export const revalidate = 0;

const POPULAR_DESTINATIONS = ["Manali", "Spiti", "Ladakh", "Goa", "Kashmir"];

function Hero() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Document Your Journey. Guide the Next Traveler.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Record your adventures, discover real journeys, and follow routes created by travelers
            who have already been there.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchBar />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Popular:</span>
            {POPULAR_DESTINATIONS.map((destination) => (
              <Link
                key={destination}
                href={`/explore?q=${encodeURIComponent(destination)}`}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {destination}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

async function HomeContent() {
  let trips;
  try {
    trips = await listPublishedTrips({ limit: 7 });
  } catch {
    return (
      <section className="container-page py-14">
        <ErrorState description="We could not load recent journeys. Please try again." />
      </section>
    );
  }

  if (trips.length === 0) {
    return (
      <section className="container-page py-14">
        <EmptyState
          title="No journeys yet."
          description="Be the first traveler to document this route."
          actionLabel="Create Journey"
          actionHref="/create"
        />
      </section>
    );
  }

  const [featured, ...rest] = trips;
  const recent = rest.length >= 3 ? rest.slice(0, 6) : trips.slice(0, 6);
  const featuredRange = formatDateRange(featured.startDate, featured.endDate);
  const featuredDuration = formatDuration(featured.startDate, featured.endDate);

  return (
    <>
      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent Logs</h2>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <TripGrid trips={recent} />
      </section>

      <section className="border-y border-line bg-surface">
        <div className="container-page py-14">
          <h2 className="mb-6 text-xl font-semibold">Featured Journey</h2>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-background">
              {featured.coverImage ? (
                <Image
                  src={featured.coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 540px, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <h3 className="text-2xl font-semibold leading-snug">{featured.title}</h3>
              <p className="mt-3 text-sm text-muted">
                By {featured.author.full_name ?? featured.author.username}
                {featuredRange ? ` · ${featuredRange}` : ""}
              </p>
              {featured.location ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden />
                  {featured.location}
                </p>
              ) : null}
              <ButtonLink href={`/trip/${featured.id}`} className="mt-6">
                Read the journey
                {featuredDuration ? ` · ${featuredDuration}` : ""}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function CallToAction() {
  return (
    <section className="container-page py-16">
      <div className="card flex flex-col items-start gap-6 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your journey could guide someone else.</h2>
          <p className="mt-2 text-sm text-muted">Start documenting your travels.</p>
        </div>
        <ButtonLink href="/create" size="lg" className="shrink-0">
          Create Your First Journey
        </ButtonLink>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      {isSupabaseConfigured() ? (
        <Suspense
          fallback={
            <section className="container-page py-14">
              <TripGridSkeleton />
            </section>
          }
        >
          <HomeContent />
        </Suspense>
      ) : (
        <section className="container-page py-14">
          <SetupNotice />
        </section>
      )}
      <CallToAction />
    </>
  );
}
