import Image from "next/image";
import type { Profile } from "@/types";
import type { ProfileStats } from "@/lib/database/profiles";
import { FollowButton } from "./FollowButton";

interface ProfileHeaderProps {
  profile: Profile;
  stats: ProfileStats;
  isOwnProfile: boolean;
  isFollowing: boolean;
}

export function ProfileHeader({ profile, stats, isOwnProfile, isFollowing }: ProfileHeaderProps) {
  const displayName = profile.full_name ?? profile.username;

  return (
    <header className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-background">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xl font-semibold text-muted">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
          {profile.bio ? <p className="mt-3 max-w-xl text-sm leading-6 text-ink/90">{profile.bio}</p> : null}

          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Journeys</dt>
              <dd className="text-lg font-semibold">{stats.journeys}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Places</dt>
              <dd className="text-lg font-semibold">{stats.places}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Followers</dt>
              <dd className="text-lg font-semibold">{stats.followers}</dd>
            </div>
          </dl>
        </div>
      </div>

      {!isOwnProfile ? (
        <FollowButton
          profileId={profile.id}
          username={profile.username}
          initialFollowing={isFollowing}
        />
      ) : null}
    </header>
  );
}
