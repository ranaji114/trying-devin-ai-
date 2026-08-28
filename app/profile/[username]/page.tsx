import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { RouteMap } from "@/components/map/RouteMap";
import { TripGrid } from "@/components/trips/TripGrid";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { getProfileByUsername, getProfileStats, isFollowing } from "@/lib/database/profiles";
import { listProfileStops, listTripsByUsername } from "@/lib/database/trips";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const revalidate = 0;

interface ProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Traveler" };
  try {
    const profile = await getProfileByUsername(params.username);
    if (!profile) return { title: "Traveler not found" };
    const name = profile.full_name ?? profile.username;
    return {
      title: `${name} (@${profile.username})`,
      description: profile.bio ?? `Journeys documented by ${name} on TrekLog.`,
    };
  } catch {
    return { title: "Traveler" };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  if (!isSupabaseConfigured()) notFound();

  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();

  const user = await getCurrentUser();
  const isOwnProfile = user?.id === profile.id;

  const [stats, trips, stops, following] = await Promise.all([
    getProfileStats(profile.id),
    listTripsByUsername(params.username, { includeDrafts: isOwnProfile }),
    listProfileStops(params.username),
    user && !isOwnProfile ? isFollowing(user.id, profile.id) : Promise.resolve(false),
  ]);

  const uniqueStops = Array.from(new Map(stops.map((stop) => [stop.name, stop])).values());

  return (
    <div className="container-page space-y-10 py-12">
      <ProfileHeader
        profile={profile}
        stats={stats}
        isOwnProfile={isOwnProfile}
        isFollowing={following}
      />

      <section>
        <h2 className="text-xl font-semibold">Travel map</h2>
        {uniqueStops.length > 0 ? (
          <>
            <RouteMap
              points={uniqueStops}
              showRoute={false}
              className="mt-4 h-[340px] w-full"
              ariaLabel={`Places visited by ${profile.username}`}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {uniqueStops.map((stop) => (
                <Badge key={stop.name}>{stop.name}</Badge>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No mapped places yet — published journeys with stops appear here.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          {isOwnProfile ? "Your journeys" : "Published journeys"}
        </h2>
        <div className="mt-6">
          {trips.length === 0 ? (
            <EmptyState
              title="No journeys yet."
              description={
                isOwnProfile
                  ? "Document your first trip and it will appear on your profile."
                  : "This traveler has not published a journey yet."
              }
              actionLabel={isOwnProfile ? "Create Journey" : undefined}
              actionHref={isOwnProfile ? "/create" : undefined}
            />
          ) : (
            <TripGrid trips={trips} />
          )}
        </div>
      </section>
    </div>
  );
}
