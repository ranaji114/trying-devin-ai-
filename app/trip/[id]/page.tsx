import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { RouteMap } from "@/components/map/RouteMap";
import { RouteTimeline } from "@/components/map/RouteTimeline";
import { PhotoGrid } from "@/components/trips/PhotoGrid";
import { SaveButton } from "@/components/trips/SaveButton";
import { TripOwnerActions } from "@/components/trips/TripOwnerActions";
import { Badge } from "@/components/ui/Badge";
import { getTripDetail } from "@/lib/database/trips";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDateRange, formatDuration, formatFullDate, label } from "@/lib/utils/format";

export const revalidate = 0;

interface TripPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Journey" };

  try {
    const trip = await getTripDetail(params.id);
    if (!trip) return { title: "Journey not found" };

    const duration = formatDuration(trip.startDate, trip.endDate);
    const title = duration ? `${trip.title} — ${duration}` : trip.title;
    const description =
      trip.description?.slice(0, 155) ??
      `A journey through ${trip.location ?? "the road"} documented on TrekLog.`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | TrekLog`,
        description,
        type: "article",
        images: trip.coverImage ? [{ url: trip.coverImage }] : undefined,
      },
    };
  } catch {
    return { title: "Journey" };
  }
}

export default async function TripPage({ params }: TripPageProps) {
  if (!isSupabaseConfigured()) notFound();

  const trip = await getTripDetail(params.id);
  if (!trip) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === trip.authorId;
  const range = formatDateRange(trip.startDate, trip.endDate);
  const points = trip.stops.map((stop) => ({
    name: stop.name,
    latitude: stop.latitude,
    longitude: stop.longitude,
  }));
  const galleryMedia = trip.media.filter((item) => !item.day_id);
  const tags = [label(trip.travelStyle), label(trip.difficulty), label(trip.season)].filter(
    Boolean,
  ) as string[];

  return (
    <article className="container-page py-10">
      <header className="max-w-3xl">
        {trip.status === "draft" ? (
          <Badge className="mb-3 border-amber-200 bg-amber-50 text-amber-700">Draft</Badge>
        ) : null}
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{trip.title}</h1>
        <p className="mt-4 text-sm text-muted">
          By{" "}
          <Link href={`/profile/${trip.author.username}`} className="font-medium text-ink hover:text-accent">
            {trip.author.full_name ?? trip.author.username}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          {range ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {range}
            </span>
          ) : null}
          {trip.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" aria-hidden />
              {trip.location}
            </span>
          ) : null}
        </div>
        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}
      </header>

      {trip.coverImage ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-line bg-surface">
          <Image
            src={trip.coverImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1120px) 1120px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-12">
          {trip.description ? (
            <section>
              <h2 className="text-xl font-semibold">Journey</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-ink/90">
                {trip.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="text-xl font-semibold">Route</h2>
            <RouteMap points={points} className="mt-4 h-[360px] w-full" ariaLabel={`Route map for ${trip.title}`} />
            <div className="mt-6">
              <RouteTimeline stops={trip.stops} />
            </div>
          </section>

          {trip.days.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold">Day by day</h2>
              <div className="mt-4 space-y-8">
                {trip.days.map((day) => (
                  <div key={day.id} className="card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                      Day {day.day_number}
                      {day.date ? ` · ${formatFullDate(day.date)}` : ""}
                    </p>
                    {day.title ? <h3 className="mt-2 text-base font-semibold">{day.title}</h3> : null}
                    {day.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted">{day.description}</p>
                    ) : null}
                    {day.media.length > 0 ? (
                      <div className="mt-4">
                        <PhotoGrid media={day.media} title={trip.title} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {galleryMedia.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold">Photos</h2>
              <div className="mt-4">
                <PhotoGrid media={galleryMedia} title={trip.title} />
              </div>
            </section>
          ) : null}

          {trip.tips ? (
            <section>
              <h2 className="text-xl font-semibold">Travel notes &amp; tips</h2>
              <div className="mt-4 space-y-3 text-[15px] leading-7 text-ink/90">
                {trip.tips.split(/\n+/).map((tip, index) => (
                  <p key={index}>{tip}</p>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">This journey</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Stops</dt>
                  <dd className="font-medium">{trip.stops.length}</dd>
                </div>
                {formatDuration(trip.startDate, trip.endDate) ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Duration</dt>
                    <dd className="font-medium">{formatDuration(trip.startDate, trip.endDate)}</dd>
                  </div>
                ) : null}
                {trip.location ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Region</dt>
                    <dd className="truncate font-medium">{trip.location}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <SaveButton tripId={trip.id} initialSaved={trip.isSaved ?? false} />
            {isOwner ? (
              <div className="border-t border-line pt-4">
                <TripOwnerActions tripId={trip.id} status={trip.status} />
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  );
}
