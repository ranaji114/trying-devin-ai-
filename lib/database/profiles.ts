import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export interface ProfileStats {
  journeys: number;
  places: number;
  followers: number;
  following: number;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getProfileStats(profileId: string): Promise<ProfileStats> {
  const supabase = createClient();

  const [journeys, stops, followers, following] = await Promise.all([
    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profileId)
      .eq("status", "published"),
    supabase
      .from("trips")
      .select("trip_stops (name)")
      .eq("user_id", profileId)
      .eq("status", "published")
      .returns<Array<{ trip_stops: Array<{ name: string }> }>>(),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profileId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profileId),
  ]);

  const uniquePlaces = new Set(
    (stops.data ?? []).flatMap((trip) => trip.trip_stops.map((stop) => stop.name)),
  );

  return {
    journeys: journeys.count ?? 0,
    places: uniquePlaces.size,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}
